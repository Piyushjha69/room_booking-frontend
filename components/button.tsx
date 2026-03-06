"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-lg font-medium transition duration-200";
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "w-full px-4 py-2",
    lg: "w-full px-6 py-3 text-lg",
  };
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
