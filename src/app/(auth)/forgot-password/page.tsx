"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Button, Input } from "@/components/ui";
import { CheckCircle } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to send email",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-pitch-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-floodlight mb-2 font-display tracking-tight">
          Check your email
        </h2>
        <p className="text-mist mb-6">
          We&apos;ve sent a password reset link to your email address.
        </p>
        <Link
          href="/login"
          className="text-sm text-pitch-accent hover:text-pitch-accent/80 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-floodlight text-center mb-2 font-display tracking-tight">
        Forgot your password?
      </h2>
      <p className="text-mist text-center text-sm mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-pitch-accent hover:text-pitch-accent/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
