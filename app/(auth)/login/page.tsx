"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { loginSchema, LoginFormData } from "@/lib/schemas";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { AuthCard } from "@/components/auth-card";
import { FormError } from "@/components/form-error";
import { showToast } from "@/lib/toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading, error, clearError } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  // useForm must be called unconditionally (Rules of Hooks)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if already authenticated on mount (synchronous check)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const user = apiClient.getUser();
    if (user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } else {
      setIsReady(true);
    }
  }, [router]);

  // Show nothing while checking auth
  if (!isReady) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("Login attempt for:", data.email);
      const response = await login(data.email, data.password);
      console.log("Login successful, user role:", response?.user?.role);
      
      showToast.success(`Welcome back, ${response?.user?.name || response?.user?.email}!`);
      
      setTimeout(() => {
        if (response?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 100);
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      showToast.error(errorMsg);
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

        <Button type="submit" isLoading={authLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
        </span>
        <Link href="/signup" className="font-medium text-slate-900 hover:underline dark:text-slate-50">
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}
