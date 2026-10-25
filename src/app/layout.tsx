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
    default: "uxwithmotion — UX With Motion | Crafted UI Components",
    template: "%s | uxwithmotion — UX With Motion",
  },
  description:
    "Explore 50+ animated UI components by UX With Motion (uxwithmotion). Copy-paste interactive buttons, badges, and micro-interactions for Figma and React.",
  keywords: [
    "uxwithmotion",
    "UX With Motion",
    "UXWithMotion",
    "animated UI components",
    "micro-interactions",
    "React motion components",
    "Framer Motion",
    "Figma UI components",
    "interactive buttons",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "uxwithmotion — UX With Motion | Crafted UI Components",
    description:
      "Explore 50+ animated UI components by UX With Motion (uxwithmotion). Copy-paste interactive buttons, badges, and micro-interactions for Figma and React.",
    url: "https://uxwithmotion.com",
    siteName: "uxwithmotion — UX With Motion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "uxwithmotion — UX With Motion | Crafted UI Components",
    description:
      "Explore 50+ animated UI components by UX With Motion (uxwithmotion). Copy-paste interactive buttons, badges, and micro-interactions for Figma and React.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: [
      "8oKlrphvXeGncRQXDCYdZvtD0kuGH2fvDF00gn0sMV4",
      "xQKqwaghJEMloMQ0cQ0-Eb3KYqsBNRlVx-H2SCYTAUI",
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "uxwithmotion",
      "alternateName": ["UX With Motion", "UXWithMotion"],
      "url": "https://uxwithmotion.com/",
      "description":
        "Explore 50+ animated UI components by UX With Motion (uxwithmotion). Copy-paste interactive buttons, badges, and micro-interactions for Figma and React.",
    },
    {
      "@type": "Organization",
      "name": "UX With Motion",
      "alternateName": "uxwithmotion",
      "url": "https://uxwithmotion.com/",
      "logo": "https://uxwithmotion.com/icon.png",
      "sameAs": [
        "https://instagram.com/uxwithmotion",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
