"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { ShowcaseCard } from "@/components/landing/ShowcaseCard";
import { ShowcaseButtonRenderer } from "@/components/landing/ShowcaseButtonRenderer";
import { SHOWCASE_ITEMS } from "@/data/showcaseItems";

export function BentoSection() {
  const row1Items = SHOWCASE_ITEMS.filter((item) => item.row === 1);
  const row2Items = SHOWCASE_ITEMS.filter((item) => item.row === 2);
  const row3Items = SHOWCASE_ITEMS.filter((item) => item.row === 3);

  return (
    <section id="components" className="w-full pt-12 pb-16 md:pt-16 md:pb-24">
      <Container>
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-title font-bold text-[32px] sm:text-[44px] md:text-[61px] leading-[1.12] text-[#454545] tracking-[-0.02em] text-balance">
            Crafted button components.
          </h2>
        </div>

        {/* Desktop Bento Grid (Figma Frame 1023:2945) */}
        <div className="hidden lg:flex flex-col gap-[32px] w-full max-w-[1300px] mx-auto">
          {/* Row 1 (Height: 168px) */}
          <div className="flex gap-[32px] h-[168px] w-full">
            {row1Items.map((item) => {
              const widthClass =
                item.desktopWidth === "flex-1"
                  ? "flex-1"
                  : item.desktopWidth === "233px"
                  ? "w-[233px] shrink-0"
                  : "w-[320px] shrink-0";

              return (
                <ShowcaseCard
                  key={item.id}
                  className={`${widthClass} h-full`}
                >
                  <ShowcaseButtonRenderer componentKey={item.componentKey} />
                </ShowcaseCard>
              );
            })}
          </div>

          {/* Row 2 (Height: 292px) */}
          <div className="flex gap-[32px] h-[292px] w-full">
            {row2Items.map((item) => {
              const widthClass =
                item.desktopWidth === "flex-1"
                  ? "flex-1"
                  : "w-[534px] shrink-0";

              return (
                <ShowcaseCard
                  key={item.id}
                  className={`${widthClass} h-full`}
                >
                  <ShowcaseButtonRenderer componentKey={item.componentKey} />
                </ShowcaseCard>
              );
            })}
          </div>

          {/* Row 3 (Height: 180px) */}
          <div className="flex gap-[32px] h-[180px] w-full">
            {row3Items.map((item) => {
              const widthClass =
                item.desktopWidth === "flex-1"
                  ? "flex-1"
                  : item.desktopWidth === "317px"
                  ? "w-[317px] shrink-0"
                  : "w-[450px] shrink-0";

              return (
                <ShowcaseCard
                  key={item.id}
                  className={`${widthClass} h-full`}
                >
                  <ShowcaseButtonRenderer componentKey={item.componentKey} />
                </ShowcaseCard>
              );
            })}
          </div>
        </div>

        {/* Mobile & Tablet Bento Layout (Figma Frame 1023:3406) */}
        <div className="flex lg:hidden flex-col sm:grid sm:grid-cols-2 gap-5 w-full max-w-[700px] mx-auto">
          {SHOWCASE_ITEMS.map((item) => (
            <ShowcaseCard
              key={item.id}
              className="w-full h-[213px] rounded-[32px] shrink-0"
            >
              <ShowcaseButtonRenderer componentKey={item.componentKey} />
            </ShowcaseCard>
          ))}
        </div>
      </Container>
    </section>
  );
}

