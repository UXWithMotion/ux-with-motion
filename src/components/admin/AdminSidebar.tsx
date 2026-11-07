"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("Loading...");
  const [adminName, setAdminName] = useState("Loading...");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || "Admin User");
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Admin";
        setAdminName(fullName);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out:", error.message);
      return;
    }
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    {
      label: "Components",
      href: "/admin/components",
      icon: <LayoutGrid className="w-[24px] h-[24px]" />,
    },
    {
      label: "Price edit",
      href: "/admin/payment",
      icon: <CreditCard className="w-[24px] h-[24px]" />,
    }
  ];

  return (
    <div className="bg-[#FBFCFD] border-[#DEE1E4] border-r border-solid flex flex-col justify-between items-start relative w-[240px] h-screen shrink-0">
      <div className="flex flex-col gap-[28px] items-start relative shrink-0 w-full">
        {/* Logo Section */}
        <div className="flex flex-col gap-[12px] items-start pt-[24px] px-[24px] relative shrink-0 w-full">
          <Link href="/admin" className="h-[74px] relative shrink-0 w-[111px] block">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img 
                alt="UX With Motion" 
                className="absolute h-[196.4%] left-[-15.45%] max-w-none top-[-48.2%] w-[130.89%]" 
                src="/icons/admin-logo.png" 
              />
            </div>
          </Link>
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <img alt="divider" className="block max-w-none size-full" src="/icons/admin-line.svg" />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col w-full">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[12px] px-[24px] py-[12px] w-full transition-colors ${
                  isActive ? "bg-[#ffcea2]" : "bg-[#FBFCFD] hover:bg-[#ffcea2]/30"
                }`}
              >
                <div className={`flex items-center justify-center shrink-0 ${isActive ? 'text-[#c05d00]' : 'text-[#454545]'}`}>
                  {item.icon}
                </div>
                <p className={`font-sans font-medium text-[16px] leading-[1.2] whitespace-nowrap ${
                  isActive ? "text-[#c05d00]" : "text-[#454545]"
                }`}>
                  {item.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-[24px] items-start pb-[24px] px-[24px] relative shrink-0 w-full">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-[#FBFCFD] flex flex-col items-start justify-center overflow-clip py-[12px] relative shrink-0 w-full hover:opacity-70 transition-opacity"
        >
          <div className="flex gap-[12px] items-center justify-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[24px]">
              <div className="absolute inset-[12.5%]">
                <div className="absolute inset-[-4.17%]">
                  <img alt="logout" className="block max-w-none size-full" src="/icons/admin-logout.svg" />
                </div>
              </div>
            </div>
            <p className="[word-break:break-word] font-sans font-medium leading-[1.2] relative shrink-0 text-[#454545] text-[16px] text-center whitespace-nowrap">
              Logout
            </p>
          </div>
        </button>

        {/* Divider */}
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="divider" className="block max-w-none size-full" src="/icons/admin-line.svg" />
          </div>
        </div>

        {/* User Profile */}
        <div className="flex gap-[12px] items-center relative shrink-0 w-full">
          <div className="relative shrink-0 size-[50px] overflow-hidden rounded-full">
            <img alt="avatar" className="absolute block inset-0 max-w-none size-full object-cover" src="/icons/admin-avatar.png" />
          </div>
          <div className="[word-break:break-word] flex flex-[1_0_0] flex-col items-start leading-[1.2] min-w-px relative whitespace-nowrap">
            <p className="font-sans font-medium relative shrink-0 text-[#454545] text-[16px] truncate w-full" title={adminName}>
              {adminName}
            </p>
            <p className="font-work font-normal relative shrink-0 text-[#7D7F82] text-[13px] truncate w-full" title={adminEmail}>
              {adminEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

