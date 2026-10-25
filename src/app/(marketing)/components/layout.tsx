import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse 50+ animated, interactive UI components crafted by UX With Motion (uxwithmotion). Copy-paste React, Framer Motion, HTML, CSS, and Figma micro-interactions.",
  openGraph: {
    title: "UI Components | uxwithmotion — UX With Motion",
    description:
      "Browse 50+ animated, interactive UI components crafted by UX With Motion (uxwithmotion). Copy-paste React, Framer Motion, HTML, CSS, and Figma micro-interactions.",
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
