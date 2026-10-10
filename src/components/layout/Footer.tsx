import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface FooterLinkItem {
  label: string;
  href?: string;
}

const FEATURE_LINKS: FooterLinkItem[] = [
  { label: "Components", href: "/components" },
  // { label: "Pricing", href: "/pricing" },
  { label: "Contact us", href: "/contact" },
];

const UPCOMING_ITEMS: FooterLinkItem[] = [
  { label: "Form Inputs" },
  { label: "Toggles & Checkboxes" },
  { label: "Navigation" },
  { label: "Cards & Layouts" },
];

export function Footer() {
  return (
    <footer className="w-full bg-background pt-12">
      {/* Desktop & Tablet Footer */}
      <div className="hidden md:flex flex-col w-full">
        {/* Figma Node 1023:3313 */}
        <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-tl-[64px] rounded-tr-[64px] py-[40px] px-6 lg:px-12 overflow-clip">
          <div className="flex flex-col items-end w-full max-w-[1290.52px] mx-auto">
            <div className="flex items-center justify-between w-full">
              {/* Brand Artwork Composition */}
              <div className="relative w-[357px] h-[296px] shrink-0">
                <Image
                  src="/images/footer-branding.png"
                  alt="UX With Motion"
                  fill
                  priority
                  className="object-contain object-left-top"
                />
              </div>

              {/* Features Column */}
              <div className="flex flex-col gap-[32px] shrink-0 w-[100px]">
                <h3 className="font-sans font-bold text-[20px] text-[#454545] leading-[1.2]">
                  Features
                </h3>
                <ul className="flex flex-col gap-[32px] list-none p-0 m-0 font-sans font-medium text-[16px] text-[#454545] whitespace-nowrap">
                  <li>
                    <Link href="/components" className="hover:text-[#7D7F82] transition-colors leading-[1.2]">
                      Components
                    </Link>
                  </li>
                  {/* Pricing link temporarily disabled */}
                  <li>
                    <Link href="/contact" className="hover:text-[#7D7F82] transition-colors leading-[1.2]">
                      Contact us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Image 2 / Badges */}
              <div className="relative w-[199.5px] h-[255px] shrink-0">
                <Image
                  src="/images/footer-badges-new.png"
                  alt="Badges"
                  fill
                  className="object-contain object-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Instagram & Copyright */}
        <div className="flex items-center justify-between h-[80px] px-[49px]">
          <div className="flex items-center gap-6 font-sans text-[14px] text-[#454545]">
            <span>© {new Date().getFullYear()} Uxwithmotion • </span>
            <Link href="/privacy" className="hover:text-black transition-colors underline">
              Privacy Policy
            </Link>
            <span> • </span>
            <Link href="/terms" className="hover:text-black transition-colors underline">
              Terms & Conditions
            </Link>
          </div>
          
          <a
            href="https://instagram.com/uxwithmotion"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group text-[#454545] hover:text-[#4FBE6B] transition-colors"
            aria-label="Instagram @uxwithmotion"
          >
            <div className="relative size-[35px] shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={35}
                height={35}
                className="size-full object-contain"
              />
            </div>
            <span className="font-sans font-semibold text-[14px]">
              @uxwithmotion
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Footer (Figma Node 1023:3451) */}
      <div className="block md:hidden w-full bg-[#F7F9FB] rounded-tl-[36px] rounded-tr-[36px] pt-[56px] overflow-hidden border-t border-[#DEE1E4]">
        <div className="px-6 flex flex-col gap-[40px]">
          {/* Brand Artwork */}
          <div className="relative w-[357px] h-[296px] shrink-0">
            <Image
              src="/images/footer-branding.png"
              alt="UX With Motion"
              fill
              className="object-contain object-left-top"
            />
          </div>

          {/* Features Group */}
          <div className="flex flex-col gap-[18px]">
            <h4 className="font-title font-bold text-[16px] text-[#181A1B]">
              Features
            </h4>
            <div className="flex flex-col gap-[14px]">
              {FEATURE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href || "#"}
                  className="font-sans font-normal text-[14px] text-[#181A1B] hover:text-[#7D7F82] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* What's new coming Group */}
          <div className="flex flex-col gap-[18px]">
            <h4 className="font-title font-bold text-[16px] text-[#181A1B]">
              What’s new coming
            </h4>
            <div className="flex flex-col gap-[14px]">
              {UPCOMING_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="font-sans font-normal text-[14px] text-[#181A1B]"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>



          {/* Social Link */}
          <a
            href="https://instagram.com/uxwithmotion"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[10px] pb-4 group"
            aria-label="Instagram @uxwithmotion"
          >
            <div className="relative size-[34px] shrink-0">
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={34}
                height={34}
                className="size-full object-contain"
              />
            </div>
            <span className="font-sans font-semibold text-[14px] text-[#454545] group-hover:text-[#4FBE6B] transition-colors">
              @uxwithmotion
            </span>
          </a>
        </div>

        {/* Mobile Copyright Bar */}
        <div className="bg-[#FBFCFD] border-t border-[#DEE1E4] px-6 py-6 flex flex-col gap-2 font-inter font-normal text-[11px] text-[#7D7F82]">
          <p>© {new Date().getFullYear()} UX With Motion</p>
          <p className="underline">Privacy Policy • Terms & Conditions</p>
        </div>
      </div>
    </footer>
  );
}




