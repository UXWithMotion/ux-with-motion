import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
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
  metadataBase: new URL("https://www.uxwithmotion.com"),
  title: {
    default: "UX With Motion (uxwithmotion) — Animated UI Components for Figma & React",
    template: "%s | UX With Motion",
  },
  description:
    "Explore 50+ copy-paste animated UI components, interactive buttons, badges, and design system micro-interactions built for Figma, React, Next.js, and Tailwind CSS.",
  keywords: [
    "ux with motion",
    "uxwithmotion",
    "animated ui components",
    "best button components",
    "design system based components",
    "animation component",
    "figma to react animated components",
    "interactive button component react",
    "framer motion ui library",
    "micro-interaction components",
    "copy paste ui components",
    "Sahil Pandavadara",
  ],
  authors: [{ name: "Sahil Pandavadara", url: "https://x.com/gfxwithsahil" }],
  creator: "Sahil Pandavadara",
  publisher: "UX With Motion",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.uxwithmotion.com",
    siteName: "UX With Motion",
    title: "UX With Motion — 50+ Animated UI Components for Figma & React",
    description:
      "Copy-paste interactive buttons, badges, and design system micro-interactions for Figma and React.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UX With Motion - Crafted UI Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UX With Motion — Animated UI Components for Figma & React",
    description:
      "Explore 50+ animated UI components. Copy-paste interactive buttons, badges, and micro-interactions for Figma and React.",
    creator: "@gfxwithsahil",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      "@id": "https://www.uxwithmotion.com/#website",
      "url": "https://www.uxwithmotion.com",
      "name": "UX With Motion",
      "alternateName": ["uxwithmotion", "UXWithMotion", "UX With Motion UI"],
      "description":
        "50+ Animated UI Components and Design System Micro-Interactions for Figma and React.",
      "publisher": {
        "@id": "https://www.uxwithmotion.com/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.uxwithmotion.com/#organization",
      "name": "UX With Motion",
      "alternateName": "uxwithmotion",
      "url": "https://www.uxwithmotion.com",
      "logo": "https://www.uxwithmotion.com/logo.png",
      "founder": {
        "@type": "Person",
        "name": "Sahil Pandavadara",
        "url": "https://x.com/gfxwithsahil",
        "sameAs": [
          "https://x.com/gfxwithsahil",
          "https://www.instagram.com/uxwithmotion",
        ],
      },
      "sameAs": [
        "https://www.instagram.com/uxwithmotion",
        "https://x.com/gfxwithsahil",
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
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());

            gtag("config", "G-W20DFBH7L3");
          `}
        </Script>
        <NextTopLoader showSpinner={false} color="#000000" />
        <CustomizationProvider>{children}</CustomizationProvider>
      </body>
    </html>
  );
}
