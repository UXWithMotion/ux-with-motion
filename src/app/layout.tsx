import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";
import { CustomizationProvider } from "@/components/providers/CustomizationProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const gcGudlak = localFont({
  variable: "--font-gc-gudlak",
  display: "swap",
  src: [
    { path: "./fonts/GCGudlakDemo-ExtraLight.ttf", weight: "200" },
    { path: "./fonts/GCGudlakDemo-Light.ttf", weight: "300" },
    { path: "./fonts/GCGudlakDemo-Regular.ttf", weight: "400" },
    { path: "./fonts/GCGudlakDemo-Medium.ttf", weight: "500" },
    { path: "./fonts/GCGudlakDemo-SemiBold.ttf", weight: "600" },
    { path: "./fonts/GCGudlakDemo-Bold.ttf", weight: "700" },
    { path: "./fonts/GCGudlakDemo-ExtraBold.ttf", weight: "800" },
    { path: "./fonts/GCGudlakDemo-Thin.ttf", weight: "100" },
  ],
});

export const metadata: Metadata = {
  title: "UX With Motion",
  description: "Premium UI, starting here. Discover 50+ thoughtfully crafted UI components to explore, learn from, and get inspired.",
  openGraph: {
    title: "UX With Motion",
    description: "Premium UI, starting here. Discover 50+ thoughtfully crafted UI components to explore, learn from, and get inspired.",
    siteName: "UX With Motion",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${gcGudlak.variable} min-h-screen bg-[#FBFCFD] text-[#454545] font-sans`}
      >
        <NextTopLoader showSpinner={false} color="#000000" />
        <CustomizationProvider>
          {children}
        </CustomizationProvider>
      </body>
    </html>
  );
}
