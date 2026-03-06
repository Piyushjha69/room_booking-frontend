"use client";

interface FormErrorProps {
  message: string | null;
  onDismiss?: () => void;
}

export function FormError({ message, onDismiss }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
      <p className="text-sm text-red-700">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 ml-2 font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
}
