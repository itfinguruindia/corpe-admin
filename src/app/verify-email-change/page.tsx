"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailChange } from "@/utils/auth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Token is missing.");
      return;
    }

    const verify = async () => {
      try {
        const { accessToken, refreshToken, admin } =
          await verifyEmailChange(token);
        
        // Update local storage and cookies
        if (typeof window !== "undefined") {
             localStorage.setItem("accessToken", accessToken);
             localStorage.setItem("refreshToken", refreshToken);
             localStorage.setItem("adminInfo", JSON.stringify(admin));
             // Cookies are already set in verifyEmailChange utils, but double checking imports
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/");
          router.refresh(); // Ensure strict auth state refresh
        }, 2000);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.message || "Verification failed. The link may be invalid or expired."
        );
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#FF6A3D]" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Verifying...
            </h2>
            <p className="mt-2 text-gray-500">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Success!
            </h2>
            <p className="mt-2 text-gray-500">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-500">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-lg bg-[#3D63A4] px-4 py-2 text-white hover:bg-[#2c4b82] transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
