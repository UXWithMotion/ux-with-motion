"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/browser');
      const supabase = createClient();
      const nextParam = new URLSearchParams(window.location.search).get('next');
      let callbackUrl = `${window.location.origin}/auth/callback`;
      if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.includes('\\')) {
        callbackUrl += `?next=${encodeURIComponent(nextParam)}`;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) {
        console.error('Error signing in with Google:', error.message);
        setIsLoading(false);
      }
      // Note: we do not set isLoading(false) on success because the page will redirect
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Brand Artwork / Logo (Figma Node 1023:3350) */}
      <Link
        href="/"
        className="inline-block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1566E5] focus-visible:ring-offset-4 rounded-xl"
        aria-label="UX With Motion Home"
      >
        <div className="relative w-[130px] h-[108px] sm:w-[150px] sm:h-[124px] md:w-[171px] md:h-[142px]">
          <Image
            src="/images/branding-logo.png"
            alt="UX With Motion Logo"
            fill
            sizes="(max-width: 640px) 130px, (max-width: 768px) 150px, 171px"
            priority
            className="object-contain"
          />
        </div>
      </Link>

      {/* Heading (Figma Node 1023:3349) */}
      <h1 className="mt-12 sm:mt-16 md:mt-[84px] font-title font-bold text-[32px] sm:text-[44px] md:text-[61px] leading-[1.2] text-[#454545] tracking-[-0.02em] text-balance">
        Welcome to UX With Motion
      </h1>

      {/* Google Sign-in Action (Figma Node 1023:3348 / Master Component 1087:5216) */}
      <div className="mt-6 md:mt-[34px] w-full flex justify-center">
        <GoogleSignInButton
          isLoading={isLoading}
          onClick={handleGoogleSignIn}
        />
      </div>
    </div>
  );
}

