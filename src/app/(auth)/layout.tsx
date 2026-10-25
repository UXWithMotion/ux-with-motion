import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to uxwithmotion (UX With Motion).",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FBFCFD] px-4 py-8">
      {children}
    </div>
  );
}

