"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

interface UserDropdownProps {
  userName: string;
  userEmail: string;
}

export function UserDropdown({ userName, userEmail }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { createClient } = await import("@/lib/supabase/browser");
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error logging out:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center size-[43px] rounded-full overflow-hidden border border-[#DEE1E4] shrink-0 bg-[#EEF1F4] hover:bg-[#E2E6EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1566E5]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <User className="size-5 text-[#454545]" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-[#FBFCFD] border border-[#DEE1E4] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] py-2 z-50 flex flex-col"
          role="menu"
        >
          {/* User Info */}
          <div className="px-4 py-3 flex flex-col gap-0.5 border-b border-[#F6F6F6]">
            <span className="font-sans font-medium text-[14px] text-[#454545] truncate">
              {userName}
            </span>
            <span className="font-sans text-[12px] text-[#7D7F82] truncate">
              {userEmail}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-4 py-2 text-left font-sans text-[14px] text-[#454545] hover:bg-[#F6F6F6] hover:text-black transition-colors focus-visible:bg-[#F6F6F6] focus-visible:outline-none"
              role="menuitem"
            >
              Profile
            </Link>
          </div>

          <div className="h-px w-full bg-[#F6F6F6]" role="separator" />

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-2 text-left font-sans text-[14px] text-[#454545] hover:bg-[#F6F6F6] hover:text-black transition-colors disabled:opacity-60 focus-visible:bg-[#F6F6F6] focus-visible:outline-none"
              role="menuitem"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

