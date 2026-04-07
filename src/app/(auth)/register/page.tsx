"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkSuperAdmin, registerSuperAdmin } from "@/utils/auth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSuperAdmin, setHasSuperAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const hasSuper = await checkSuperAdmin();
        setHasSuperAdmin(hasSuper);
      } catch (error) {
        setHasSuperAdmin(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setIsLoading(true);

    try {
      await registerSuperAdmin({ name, email, phoneNumber, password });

      if (hasSuperAdmin) {
        // Registered as normal admin - show success message
        toast.success(
          "Registration successful! Your account has been created. Please contact the Super Admin to assign you a role before you can login.",
        );

        router.push("/login");
        // Clear form
        setName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setConfirmPassword("");
      } else {
        // Registered as super admin - redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred during registration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking for super admin
  if (hasSuperAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFF]">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6FAFF] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary">
            {hasSuperAdmin ? "Register as Admin" : "Create Super Admin"}
          </h1>
          <p className="mt-2 text-gray-500">
            {hasSuperAdmin
              ? "Create your admin account. You'll need role assignment from Super Admin to login."
              : "Register the first admin account for the system"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#3D63A4] focus:outline-none focus:ring-1 focus:ring-[#3D63A4]"
              placeholder="Enter your full name"
              required
            />
          </div>

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

          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setPhoneNumber(value);
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#3D63A4] focus:outline-none focus:ring-1 focus:ring-[#3D63A4]"
              placeholder="Enter your 10-digit phone number"
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#3D63A4] focus:outline-none focus:ring-1 focus:ring-[#3D63A4] pr-10"
                placeholder="min. 8 chars, 1 uppercase, 1 special char"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#3D63A4] focus:outline-none focus:ring-1 focus:ring-[#3D63A4] pr-10"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#3D63A4] px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2d4b7c] focus:outline-none focus:ring-2 focus:ring-[#3D63A4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Creating Account..."
              : hasSuperAdmin
                ? "Create Admin Account"
                : "Create Super Admin Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-secondary hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
