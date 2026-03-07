"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { signupSchema, SignupFormData } from "@/lib/schemas";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { AuthCard } from "@/components/auth-card";
import { FormError } from "@/components/form-error";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // redirect after signup completes
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      console.log("Signup attempt for:", data.email);
      await signup(data.email, data.password, data.name);
      // redirect happens via effect above
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

        <Button type="submit" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
