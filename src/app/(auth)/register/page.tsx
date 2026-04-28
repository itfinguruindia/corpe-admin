"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkSuperAdmin, registerSuperAdmin } from "@/utils/auth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";

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
      } catch {
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

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      );
      return;
    }

    setIsLoading(true);

    try {
      await registerSuperAdmin({ name, email, phoneNumber, password });

      if (hasSuperAdmin) {
        toast.success(
          "Registration successful! Your account has been created. Please contact the Super Admin to assign you a role before you can login.",
        );
        router.push("/login");
        setName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setConfirmPassword("");
      } else {
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

  if (hasSuperAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFF]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6FAFF] p-4">
      <Card className="w-full max-w-md">
        <Card.Header className="flex flex-col items-center pt-8 px-8 pb-0">
          <Card.Title className="text-3xl font-bold text-[#3D63A4]">
            {hasSuperAdmin ? "Register as Admin" : "Create Super Admin"}
          </Card.Title>
          <Card.Description className="mt-2 text-center">
            {hasSuperAdmin
              ? "Create your admin account. You'll need role assignment from Super Admin to login."
              : "Register the first admin account for the system"}
          </Card.Description>
        </Card.Header>

        <Card.Content className="px-8 py-6 flex flex-col gap-5">
          {error && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <TextField isRequired value={name} onChange={setName} name="name">
              <Label>Full Name</Label>
              <Input placeholder="Enter your full name" />
            </TextField>

            {/* Email */}
            <TextField
              isRequired
              value={email}
              onChange={setEmail}
              type="email"
              name="email"
            >
              <Label>Email Address</Label>
              <Input placeholder="Enter your email" />
            </TextField>

            {/* Phone Number */}
            <TextField
              isRequired
              value={phoneNumber}
              onChange={(val) => {
                const digits = val.replace(/\D/g, "");
                if (digits.length <= 10) setPhoneNumber(digits);
              }}
              name="phoneNumber"
            >
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter your 10-digit phone number"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </TextField>

            {/* Password */}
            <TextField
              isRequired
              value={password}
              onChange={setPassword}
              type={showPassword ? "text" : "password"}
              name="password"
            >
              <Label>Password</Label>
              <div className="relative">
                <Input
                  placeholder="min. 8 chars, 1 uppercase, 1 special char"
                  className="w-full"
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
            </TextField>

            {/* Confirm Password */}
            <TextField
              isRequired
              value={confirmPassword}
              onChange={setConfirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
            >
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  placeholder="Confirm your password"
                  className="w-full"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </TextField>

            <Button
              type="submit"
              isDisabled={isLoading}
              className="w-full bg-[#3D63A4] text-white font-semibold"
            >
              {isLoading ? (
                <Spinner />
              ) : hasSuperAdmin ? (
                "Create Admin Account"
              ) : (
                "Create Super Admin Account"
              )}
            </Button>
          </form>
        </Card.Content>

        <Card.Footer className="px-8 pb-8 pt-0 justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#3D63A4] hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}
