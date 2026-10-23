"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconWrapper } from "@/components/ui/IconWrapper";

import { useRouter } from "next/navigation";
import { UserDropdown } from "@/components/layout/UserDropdown";


export interface NavbarProps {
  variant?: "logged-out" | "logged-in";
  userName?: string;
  userEmail?: string;
  onSearchSubmit?: (query: string) => void;
}

export function Navbar({
  variant = "logged-out",
  userName = "User",
  userEmail = "",
  onSearchSubmit,
}: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setIsVisible(false);
    } else if (latest < previous) {
      setIsVisible(true);
    }
  });

  const handleSearchSubmit = (e?: React.SubmitEvent, query?: string) => {
    if (e) e.preventDefault();
    const q = query ?? searchQuery;

    // Return search bar to default state
    setIsSearchFocused(false);
    setMobileSearchOpen(false);
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (onSearchSubmit) {
      onSearchSubmit(q);
    } else if (q.trim()) {
      router.push(`/components?search=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={(isVisible || mobileMenuOpen || mobileSearchOpen || isSearchFocused) ? "visible" : "hidden"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E7E7E7]/60"
    >
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 h-screen w-screen bg-[#090A0B]/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Desktop & Tablet Navigation */}
      <div className="hidden md:flex items-center justify-between w-full px-6 lg:px-[70px] py-[7px] min-h-[65px]">
        {/* Left: Brand Logo */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="UX With Motion Home"
          >
            <div className="relative w-[48.97px] h-[51px] shrink-0">
              <Image
                src="/icons/logo.svg"
                alt="Component Logo"
                width={49}
                height={51}
                priority
                className="size-full object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Center: Search Field */}
        <div
          className={`w-full mx-6 transition-all duration-300 ease-in-out relative z-50 ${isSearchFocused ? "max-w-[700px]" : "max-w-[397px]"
            }`}
        >
          <form onSubmit={handleSearchSubmit}>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search ui components"
              className="w-full"
            />
          </form>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[calc(100%+12px)] left-0 w-full bg-white border border-[#E7E7E7] rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 z-50 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-6">
                  {/* Type of component section */}
                  <div>
                    <h4 className="font-sans font-medium text-[12px] text-[#7D7F82] mb-3 uppercase tracking-wider px-3">
                      Type of component
                    </h4>
                    <div className="flex flex-wrap gap-2 px-3">
                      {["Buttons", "Cards", "Inputs", "Navigation", "Layouts", "Typography"].map((type) => (
                        <button
                          key={type}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchQuery(type);
                            setIsSearchFocused(false);
                            handleSearchSubmit(undefined, type);
                          }}
                          className="px-4 py-2 bg-white hover:bg-[#F7F9FB] border border-[#DEE1E4] rounded-[100px] font-sans text-[14px] text-black transition-colors"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions section */}
                  <div>
                    <h4 className="font-sans font-medium text-[12px] text-[#7D7F82] mb-2 uppercase tracking-wider px-3">
                      Suggestions
                    </h4>
                    <div className="flex flex-col gap-1">
                      {["Buttons", "Cards & Layouts", "Form Inputs", "Navigation"].map((item) => (
                        <button
                          key={item}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchQuery(item);
                            setIsSearchFocused(false);
                            handleSearchSubmit(undefined, item);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F7F9FB] rounded-xl text-left transition-colors"
                        >
                          <Image
                            src="/icons/search-mobile.svg"
                            alt="Search"
                            width={16}
                            height={16}
                            className="opacity-50"
                          />
                          <span className="font-sans font-medium text-[14px] text-black">
                            {item}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Navigation & CTA / Account */}
        <div className="flex-1 flex items-center justify-end gap-[32px] min-w-0">
          <Link
            href="/components"
            className="font-sans font-medium text-[16px] text-black hover:text-[#7D7F82] transition-colors leading-[1.2] whitespace-nowrap"
          >
            Components
          </Link>

          {variant === "logged-out" ? (
            <Button
              variant="primary"
              size="md"
              href="/login"
            >
              Sign up
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <UserDropdown userName={userName} userEmail={userEmail} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-between h-[72px] px-5 w-full">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="UX With Motion Home"
        >
          <div className="relative w-[48.97px] h-[51px] shrink-0">
            <Image
              src="/icons/logo.svg"
              alt="UX With Motion Logo"
              width={49}
              height={51}
              priority
              className="size-full object-contain"
            />
          </div>
        </Link>

        {/* Mobile Navigation Actions */}
        <div className="flex items-center gap-[8px]">
          {/* Mobile Search Toggle */}
          <IconWrapper
            size="lg"
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            aria-label="Toggle search"
          >
            <Image
              src="/icons/search-mobile.svg"
              alt="Search"
              width={24}
              height={24}
              className="size-[24px]"
            />
          </IconWrapper>

          {/* Mobile Hamburger Menu Toggle */}
          <IconWrapper
            size="md"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (mobileSearchOpen) setMobileSearchOpen(false);
            }}
            aria-label="Toggle navigation menu"
          >
            <Image
              src="/icons/menu.svg"
              alt="Menu"
              width={24}
              height={24}
              className="size-[24px]"
            />
          </IconWrapper>

          {/* Mobile Sign Up CTA */}
          {variant === "logged-out" ? (
            <Button
              variant="primary"
              size="sm"
              href="/login"
            >
              Sign up
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <UserDropdown userName={userName} userEmail={userEmail} />
              {/* Mobile menu logout is already integrated inside the UserDropdown component. */}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Expandable Bar (Full Screen Overlay) */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 h-[100dvh] w-screen bg-[#090A0B]/60 backdrop-blur-md z-[100] flex flex-col items-center pt-[11px] md:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileSearchOpen(false);
            }}
          >
            <div className="w-full max-w-[342px] flex flex-col gap-[10px]">
              {/* Search Bar Row */}
              <form onSubmit={(e) => handleSearchSubmit(e, searchQuery)} className="w-full">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery("")}
                  placeholder="Search ui components"
                  className="w-full bg-white !px-[24px] !py-[16px] h-[56px] !rounded-[32px]"
                  autoFocus
                />
              </form>

              {/* Suggestions Box */}
              <div className="bg-white w-full rounded-[24px] p-[20px] shadow-sm flex flex-col gap-[20px] max-h-[80vh] overflow-y-auto">
                {/* Type of Component */}
                <div className="flex flex-col gap-[10px]">
                  <h2 className="font-sans font-medium text-[12px] uppercase text-[#7D7F82] tracking-[0.6px]">
                    Type of Component
                  </h2>
                  <div className="flex flex-wrap gap-[8px]">
                    {/* Tags */}
                    {[
                      { label: "Button", count: "4" },
                      { label: "Input field", count: "10" },
                      { label: "Search bar", count: "6" },
                      { label: "Product cards", count: "1" },
                      { label: "filter", count: "1" },
                    ].map((tag, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-[7px] h-[34px] px-[13px] rounded-full bg-black/5 cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => {
                          setSearchQuery(tag.label);
                          handleSearchSubmit(undefined, tag.label);
                        }}
                      >
                        <span className="font-sans font-medium text-[12px] text-[#3C3B37]">
                          {tag.label}
                        </span>
                        <span className="font-mono font-medium text-[11px] text-[#85847E] uppercase tracking-[0.66px]">
                          {tag.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="flex flex-col gap-[8px]">
                  <h2 className="font-sans font-medium text-[12px] uppercase text-[#7D7F82] tracking-[0.6px] px-[12px]">
                    Suggestions
                  </h2>
                  <div className="flex flex-col">
                    {["Buttons", "Cards & Layouts", "Form Inputs", "Navigation"].map(
                      (sugg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchQuery(sugg);
                            handleSearchSubmit(undefined, sugg);
                          }}
                          className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[12px] hover:bg-black/5 transition-colors text-left"
                        >
                          <Image
                            src="/icons/search.svg"
                            alt="Search"
                            width={16}
                            height={16}
                            className="opacity-50"
                          />
                          <span className="font-sans font-medium text-[14px] text-black">
                            {sugg}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white border-t border-[#E7E7E7] shadow-lg"
          >
            <div className="flex flex-col p-6 gap-4">
              <Link
                href="/components"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans font-medium text-[18px] text-black hover:text-[#7D7F82] py-2 border-b border-[#F7F9FB]"
              >
                Components
              </Link>
              {/* Mobile Pricing link temporarily disabled */}
              <div className="pt-2">
                {variant === "logged-out" && (
                  <Button
                    variant="primary"
                    fullWidth
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


