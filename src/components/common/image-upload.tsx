"use client";

import { useState, useCallback, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  XMarkIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxRetries?: number;
  bucketPath?: string; // Optional path within the bucket (e.g., "posts/featured")
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface UploadAttempt {
  id: string;
  timestamp: number;
  status: "pending" | "success" | "error";
  error?: string;
  fileName?: string;
  fileSize?: number;
}

interface SupabaseUploadResponse {
  data: {
    path: string;
    id: string;
    fullPath: string;
  } | null;
  error: Error | null;
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "Upload an image",
  className,
  disabled = false,
  maxRetries = 3,
  bucketPath = "posts/featured",
  maxSizeMB = 4,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageUploadProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadAttempts, setUploadAttempts] = useState<UploadAttempt[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadId = useId();

  const supabase = createClient();

  const logUploadAttempt = useCallback((attempt: Partial<UploadAttempt>) => {
    const newAttempt: UploadAttempt = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: "pending",
      ...attempt,
    };
    setUploadAttempts((prev) => [...prev.slice(-4), newAttempt]); // Keep last 5 attempts
    console.log("📊 Upload attempt logged:", newAttempt);
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`;
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedTypes, maxSizeMB]
  );

  const generateFileName = useCallback(
    (file: File): string => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      return `${bucketPath}/${timestamp}-${randomId}.${extension}`;
    },
    [bucketPath]
  );

  const uploadToSupabase = useCallback(
    async (file: File): Promise<SupabaseUploadResponse> => {
      const fileName = generateFileName(file);

      console.log("🚀 Starting Supabase upload:", {
        fileName,
        size: file.size,
        type: file.type,
      });

      const { data, error } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "blog-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ Supabase upload error:", error);
        return { data: null, error };
      }

      console.log("✅ Supabase upload successful:", data);
      return { data, error: null };
    },
    [generateFileName, supabase]
  );

  const getPublicUrl = useCallback(
    (path: string): string => {
      const { data } = supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "blog-images")
        .getPublicUrl(path);

      return data.publicUrl;
    },
    [supabase]
  );

  const removeImage = useCallback(() => {
    onChange("");
    setUploadError(null);
    setRetryCount(0);
    setUploadProgress(0);
    setDragActive(false);
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }
  }, [onChange]);

  const handleUploadTimeout = useCallback(() => {
    console.error("⏰ Upload timeout after 30 seconds");
    setUploadError("Upload timed out. Please try again.");
    setIsUploading(false);
    toast.error("Upload timed out. Please try again.");
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        logUploadAttempt({
          status: "error",
          fileName: file.name,
          fileSize: file.size,
          error: validationError,
        });
        toast.error(validationError);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      logUploadAttempt({
        status: "pending",
        fileName: file.name,
        fileSize: file.size,
      });

      // Set upload timeout
      uploadTimeoutRef.current = setTimeout(handleUploadTimeout, 30000);

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const result = await uploadToSupabase(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.error) {
          throw result.error;
        }

        if (result.data) {
          const publicUrl = getPublicUrl(result.data.path);

          logUploadAttempt({
            status: "success",
            fileName: file.name,
            fileSize: file.size,
          });

          onChange(publicUrl);
          setRetryCount(0);
          toast.success("Image uploaded successfully!");
        }
      } catch (error) {
        console.error("❌ Upload failed:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploadError(errorMessage);

        logUploadAttempt({
          status: "error",
          fileName: file.name,
          fileSize: file.size,
          error: errorMessage,
        });

        // Implement retry logic for certain errors
        if (
          retryCount < maxRetries &&
          (errorMessage.includes("network") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("fetch failed") ||
            errorMessage.includes("connection"))
        ) {
          setRetryCount((prev) => prev + 1);
          toast.error(
            `Upload failed (attempt ${
              retryCount + 1
            }/${maxRetries}). Retrying...`
          );

          // Retry after a delay
          setTimeout(() => {
            console.log(
              `🔄 Retrying upload (attempt ${retryCount + 1}/${maxRetries})`
            );
            handleFileUpload(file);
          }, 2000);
        } else {
          toast.error(`Upload failed: ${errorMessage}`);
        }
      } finally {
        setIsUploading(false);
        if (uploadTimeoutRef.current) {
          clearTimeout(uploadTimeoutRef.current);
        }
      }
    },
    [
      validateFile,
      logUploadAttempt,
      handleUploadTimeout,
      uploadToSupabase,
      getPublicUrl,
      onChange,
      retryCount,
      maxRetries,
    ]
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setDragActive(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [disabled, isUploading, handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFileUpload]
  );

  // Display uploaded image
  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-64 object-cover transition-all duration-300 group-hover:scale-105"
            onLoad={(e) => {
              // Ensure image is properly loaded
              const img = e.target as HTMLImageElement;
              img.style.opacity = "1";
            }}
            onError={(e) => {
              // Handle image load errors
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              console.error("Failed to load image:", value);
            }}
            style={{ opacity: 0, transition: "opacity 0.3s ease-in-out" }}
          />
          {/* Overlay with remove button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              disabled={disabled}
              className="bg-red-600 hover:bg-red-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Remove Image
            </Button>
          </div>
          {/* Success indicator */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full p-2 shadow-lg">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          {/* Image info overlay */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
            ✅ Image Ready
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Upload Error: {uploadError}</p>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Uploading... {uploadProgress}%
            </span>
            {retryCount > 0 && (
              <span className="text-xs text-blue-600">
                Retry {retryCount}/{maxRetries}
              </span>
            )}
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Diagnostics */}
      {uploadAttempts.length > 0 && (
        <details className="mb-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Upload Diagnostics ({uploadAttempts.length} attempts)
          </summary>
          <div className="mt-2 space-y-1">
            {uploadAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className={cn(
                  "text-xs p-2 rounded border",
                  attempt.status === "success" &&
                    "bg-green-50 border-green-200 text-green-800",
                  attempt.status === "error" &&
                    "bg-red-50 border-red-200 text-red-800",
                  attempt.status === "pending" &&
                    "bg-yellow-50 border-yellow-200 text-yellow-800"
                )}
              >
                <div className="flex justify-between">
                  <span>
                    {new Date(attempt.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="capitalize">{attempt.status}</span>
                </div>
                {attempt.fileName && <div>File: {attempt.fileName}</div>}
                {attempt.error && <div>Error: {attempt.error}</div>}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Enhanced Supabase Storage Dropzone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 transform",
          dragActive && !disabled && !isUploading
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg"
            : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50",
          disabled || isUploading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md hover:scale-102"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() =>
          !disabled && !isUploading && fileInputRef.current?.click()
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
          id={`file-upload-${uploadId}`}
        />

        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            {isUploading ? (
              <div className="relative">
                <CloudArrowUpIcon className="h-16 w-16 text-blue-500 animate-bounce" />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                  {uploadProgress}%
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </div>

          <div className="space-y-3 text-center">
            <h3 className="text-xl font-bold text-gray-900">
              {isUploading ? `Uploading... ${uploadProgress}%` : placeholder}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
              {isUploading
                ? "Please wait while your image is being uploaded to secure storage"
                : `Drag and drop an image here, or click the button below to browse your files`}
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-lg">
                {acceptedTypes
                  .map((type) => type.split("/")[1])
                  .join(", ")
                  .toUpperCase()}
              </span>
              <span>•</span>
              <span>Max {maxSizeMB}MB</span>
            </div>
          </div>

          {!isUploading && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-6 bg-white border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
              disabled={disabled}
            >
              <PhotoIcon className="h-5 w-5 mr-2" />
              Choose Image
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
