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
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          />
          {/* Overlay with remove button */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              disabled={disabled}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          {/* Success indicator */}
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
            <CheckCircleIcon className="h-4 w-4" />
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

      {/* Supabase Storage Dropzone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive && !disabled && !isUploading
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled || isUploading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-gray-50"
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

        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <CloudArrowUpIcon className="h-12 w-12 text-blue-500 animate-pulse" />
          ) : (
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          )}

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? `Uploading... ${uploadProgress}%` : placeholder}
            </p>
            <p className="text-sm text-gray-500">
              {isUploading
                ? "Please wait while your image is being uploaded"
                : `Drag and drop an image here, or click to select`}
            </p>
            <p className="text-xs text-gray-400">
              {acceptedTypes
                .map((type) => type.split("/")[1])
                .join(", ")
                .toUpperCase()}{" "}
              up to {maxSizeMB}MB
            </p>
          </div>

          {!isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={disabled}
            >
              Choose Image
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
