"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations";
import { resetPasswordAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setStatus("error");
      setMessage("Invalid reset link");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await resetPasswordAction(token, data);
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Password reset successfully!");
      } else {
        setStatus("error");
        setMessage(result.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {status === "form" && "Enter your new password below."}
              {status === "loading" && "Resetting your password..."}
              {status === "success" && "Password reset successfully!"}
              {status === "error" && "Password reset failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "error" && !token && (
              <div className="text-center space-y-4">
                <div className="text-red-600">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">{message}</p>
                <Link href="/auth">
                  <Button variant="outline" className="w-full">
                    Back to Auth
                  </Button>
                </Link>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4">
                <div className="text-green-600">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">{message}</p>
                <Link href="/auth">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {(status === "form" || status === "loading" || (status === "error" && token)) && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {status === "error" && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {message}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Enter your new password"
                    disabled={status === "loading"}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Confirm your new password"
                    disabled={status === "loading"}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            {status === "error" && token && (
              <div className="text-center space-y-4 mt-4">
                <Button 
                  onClick={() => {
                    setStatus("form");
                    setMessage("");
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading reset form...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
