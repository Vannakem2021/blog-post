"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormLabel,
  FormError,
  EnhancedInput,
} from "@/components/ui/form-field";
import { useAuth } from "@/lib/auth/context";
import { loginSchema, LoginFormData } from "@/lib/validations";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    trigger,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn(data.email, data.password);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Login successful! Redirecting...");
        router.push(redirectTo);
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time field validation
  const handleEmailBlur = () => {
    trigger("email");
  };

  const handlePasswordBlur = () => {
    trigger("password");
  };

  const handleEmailFocus = () => {
    if (errors.email) {
      clearErrors("email");
    }
  };

  const handlePasswordFocus = () => {
    if (errors.password) {
      clearErrors("password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">🔐</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Admin access only. Contact administrator if you need access.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {error && (
              <div className="flex items-center space-x-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <FormField>
              <FormLabel htmlFor="email" required>
                Email Address
              </FormLabel>
              <EnhancedInput
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                error={errors.email?.message}
                isLoading={isLoading}
                {...register("email")}
                onBlur={handleEmailBlur}
                onFocus={handleEmailFocus}
              />
              <FormError message={errors.email?.message} />
            </FormField>

            <FormField>
              <FormLabel htmlFor="password" required>
                Password
              </FormLabel>
              <div className="relative">
                <EnhancedInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  isLoading={isLoading}
                  className="pr-12"
                  {...register("password")}
                  onBlur={handlePasswordBlur}
                  onFocus={handlePasswordFocus}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FormError message={errors.password?.message} />
            </FormField>

            <Button
              type="submit"
              disabled={isLoading || isSubmitting || !isValid}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Secure admin access • Protected by NewsHub
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
