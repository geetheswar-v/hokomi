"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmailAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await verifyEmailAction(token);
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email verified successfully!"}
              {status === "error" && "Verification failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Verifying your email...</p>
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
            
            {status === "error" && (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading verification...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
