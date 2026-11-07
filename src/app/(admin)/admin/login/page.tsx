"use client";

import { adminNextPath } from "@/lib/auth/redirect";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Successful login, redirect to admin dashboard.
      // The requireAdmin() server layout will enforce role checks.
      const { data: role, error: roleError } = await supabase.from("user_roles")
        .select("role").eq("user_id", data.user.id).single();
      if (roleError || role?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }
      router.push(adminNextPath(new URLSearchParams(window.location.search).get("next")));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#FBFCFD]">
      {/* Left Pane - Branding */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#F7F9FB]">
        <div className="relative w-[357px] h-[360px]">
          <Image
            src="/images/branding-logo.png"
            alt="UX With Motion"
            fill
            sizes="357px"
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <h1 className="font-title font-bold text-[32px] sm:text-[44px] leading-[1.2] text-[#454545] tracking-[-0.02em] mb-12">
            Welcome to Admin
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-base text-[#454545] font-medium"
              >
                Email Id
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Enter your admin email id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[52px] px-5 rounded-[44px] border border-[#DEE1E4] bg-[#F7F9FB] text-[#454545] placeholder:text-[#7D7F82] focus:outline-none focus:ring-2 focus:ring-[#1566E5] transition-colors [&:not(:placeholder-shown)]:bg-[#F1F4F6]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-base text-[#454545] font-medium"
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-[52px] pl-5 pr-12 rounded-[44px] border border-[#DEE1E4] bg-[#F7F9FB] text-[#454545] placeholder:text-[#7D7F82] focus:outline-none focus:ring-2 focus:ring-[#1566E5] transition-colors [&:not(:placeholder-shown)]:bg-[#F1F4F6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D7F82] hover:text-[#454545] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-[-12px]">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-[#7D7F82] hover:text-[#454545] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium mt-[-12px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-[#1F2123] text-white rounded-[44px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

