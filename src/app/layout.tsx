import type { Metadata } from "next";
import Script from "next/script";
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
  metadataBase: new URL("https://uxwithmotion.com"),
  title: {
    default: "uxwithmotion — UI Components & Motion",
    template: "%s | uxwithmotion",
  },
  description:
    "Explore UI components, animations, and reusable code to build modern web experiences.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "uxwithmotion — UI Components & Motion",
    description:
      "Explore reusable UI components and motion effects.",
    url: "https://uxwithmotion.com",
    siteName: "uxwithmotion",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: [
      "8oKlrphvXeGncRQXDCYdZvtD0kuGH2fvDF00gn0sMV4",
      "xQKqwaghJEMloMQ0cQ0-Eb3KYqsBNRlVx-H2SCYTAUI",
    ],
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
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-W20DFBH7L3"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());

            gtag("config", "G-W20DFBH7L3");
          `}
        </Script>
        <NextTopLoader showSpinner={false} color="#000000" />
        <CustomizationProvider>
          {children}
        </CustomizationProvider>
      </body>
    </html>
  );
}
