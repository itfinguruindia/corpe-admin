"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password attempt:", { email });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6FAFF] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary">Reset Password</h1>
          <p className="mt-2 text-gray-500">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#3D63A4] focus:outline-none focus:ring-1 focus:ring-[#3D63A4]"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#3D63A4] px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2d4b7c] focus:outline-none focus:ring-2 focus:ring-[#3D63A4] focus:ring-offset-2"
          >
            Send Reset Link
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-secondary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
