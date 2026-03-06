"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { loginSchema, LoginFormData } from "@/lib/schemas";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { AuthCard } from "@/components/auth-card";
import { FormError } from "@/components/form-error";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("Login attempt for:", data.email);
      const response = await login(data.email, data.password);
      console.log("Login successful, user role:", response?.user?.role);
      // Use setTimeout to ensure state updates are processed first
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.role === "ADMIN") {
          console.log("Admin user detected, redirecting to admin panel");
          router.push("/admin");
        } else {
          console.log("Regular user, redirecting to dashboard");
          router.push("/dashboard");
        }
      }, 100);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <AuthCard title="Sign In" description="Welcome back">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={error} onDismiss={clearError} />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
