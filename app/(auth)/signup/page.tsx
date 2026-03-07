"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { signupSchema, SignupFormData } from "@/lib/schemas";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { AuthCard } from "@/components/auth-card";
import { FormError } from "@/components/form-error";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading: authLoading, error, clearError } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  // useForm must be called unconditionally (Rules of Hooks)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
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

  const onSubmit = async (data: SignupFormData) => {
    try {
      console.log("Signup attempt for:", data.email);
      const response = await signup(data.email, data.password, data.name);
      console.log("Signup successful, user role:", response?.user?.role);
      
      // Small delay to ensure state is properly set before navigation
      setTimeout(() => {
        // Redirect based on user role
        if (response?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 100);
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  return (
    <AuthCard title="Create Account" description="Get started today">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={error} onDismiss={clearError} />

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register("name")}
        />

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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" isLoading={authLoading}>
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
        </span>
        <Link href="/login" className="font-medium text-slate-900 hover:underline dark:text-slate-50">
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
