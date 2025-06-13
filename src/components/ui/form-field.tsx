"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function FormLabel({ 
  required, 
  children, 
  className, 
  ...props 
}: FormLabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-semibold text-gray-700 mb-3",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
}

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FormSuccessProps {
  message?: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center space-x-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FormHelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHelpText({ children, className }: FormHelpTextProps) {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 mt-2 flex items-center",
        className
      )}
    >
      <span className="mr-1">💡</span>
      {children}
    </p>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  icon, 
  children, 
  className 
}: FormSectionProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-lg border border-gray-200 p-8",
      className
    )}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn(
      "flex space-x-3 pt-6 border-t border-gray-200",
      className
    )}>
      {children}
    </div>
  );
}

// Enhanced Input component with validation states
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: string;
  isLoading?: boolean;
}

export function EnhancedInput({ 
  error, 
  success, 
  isLoading, 
  className, 
  ...props 
}: EnhancedInputProps) {
  return (
    <div className="relative">
      <input
        className={cn(
          "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : success
            ? "border-green-300 focus:border-green-500 focus:ring-green-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={isLoading}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

// Enhanced Textarea component with validation states
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  success?: string;
  isLoading?: boolean;
}

export function EnhancedTextarea({ 
  error, 
  success, 
  isLoading, 
  className, 
  ...props 
}: EnhancedTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none",
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
          : success
          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${props.id}-error` : undefined}
      {...props}
    />
  );
}

// Enhanced Select component with validation states
interface EnhancedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  success?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function EnhancedSelect({ 
  error, 
  success, 
  isLoading, 
  className, 
  children,
  ...props 
}: EnhancedSelectProps) {
  return (
    <select
      className={cn(
        "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 bg-white",
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
          : success
          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${props.id}-error` : undefined}
      {...props}
    >
      {children}
    </select>
  );
}
