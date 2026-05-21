"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { checkSuperAdmin, loginAdmin } from "@/utils/auth";
import { redirectAfterAuth } from "@/utils/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Label,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSuperAdmin, setHasSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const hasSuper = await checkSuperAdmin();
        if (cancelled) return;
        setHasSuperAdmin(hasSuper);
        if (!hasSuper) redirectAfterAuth("/register");
      } catch {
        if (!cancelled) setHasSuperAdmin(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.danger("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await loginAdmin({ email, password });
      toast.success("Signed in successfully!");
      redirectAfterAuth("/dashboard");
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password. Please try again.";
      toast.danger(message);
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
            Welcome Back
          </Card.Title>
          <Card.Description className="mt-2">
            Please sign in to your account
          </Card.Description>
        </Card.Header>

        <Card.Content className="px-8 py-6 flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <TextField
              isRequired
              value={email}
              onChange={setEmail}
              type="email"
              name="email"
            >
              <Label className="text-black">Email Address</Label>
              <Input placeholder="Enter your email" />
            </TextField>

            {/* Password */}
            <TextField
              isRequired
              value={password}
              onChange={setPassword}
              type={showPassword ? "text" : "password"}
              name="password"
            >
              <Label className="text-black">Password</Label>
              <div className="relative">
                <Input placeholder="Enter your password" className="w-full" />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent shadow-none border-0 ring-0 min-h-0 h-auto w-auto p-0 rounded-md [background-image:none]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </TextField>

            {/* Remember me + Forgot password */}
          
            {/* <div className="flex items-center justify-between">
              <Checkbox id="remember-me">
                <Label htmlFor="remember-me" className="text-sm text-black">
                  Remember me
                </Label>
              </Checkbox>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#3D63A4] hover:underline"
              >
                Forgot Password?
              </Link>
            </div> */}
            <Button
              type="submit"
              isDisabled={isLoading}
              className="w-full bg-[#3D63A4] text-white font-semibold"
            >
              {isLoading ? <Spinner /> : "Sign In"}
            </Button>
          </form>
        </Card.Content>

        <Card.Footer className="px-8 pb-8 pt-0 justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#3D63A4] hover:underline"
            >
              Register here
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}
