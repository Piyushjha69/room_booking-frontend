"use client";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-[350px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="glass-card p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
