"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-200"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white transition-all duration-200 placeholder:text-gray-400 focus-visible:border-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}
