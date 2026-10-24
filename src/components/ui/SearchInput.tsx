"use client";

import React, { forwardRef } from "react";
import Image from "next/image";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onSearchClick?: () => void;
  onClear?: () => void;
  className?: string;
  isTriggerOnly?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder = "Search ui components",
      className = "",
      isTriggerOnly = false,
      onSearchClick,
      onClear,
      ...props
    },
    ref
  ) => {
    if (isTriggerOnly) {
      return (
        <button
          type="button"
          onClick={onSearchClick}
          className={`bg-[#EEF1F4] border border-[#DEE1E4] flex items-center gap-3 px-4 py-3 rounded-[32px] text-left cursor-pointer hover:border-[#DEE1E4] transition-all select-none ${className}`}
        >
          <div className="relative shrink-0 size-[20px] sm:size-[24px]">
            <Image
              src="/icons/search.svg"
              alt="Search"
              width={24}
              height={24}
              className="size-full object-contain"
            />
          </div>
          <span className="font-sans font-medium text-[15px] sm:text-[16px] leading-[1.2] text-[#B0B0B0] truncate">
            {placeholder}
          </span>
        </button>
      );
    }

    const hasValue = props.value !== undefined && props.value !== null && props.value.toString().length > 0;

    return (
      <div
        className={`border border-[#DEE1E4] focus-within:border-[#B0B0B0] flex items-center gap-3 px-4 py-3 rounded-[32px] transition-all ${className} ${hasValue ? 'bg-[#F1F4F6]' : 'bg-[#EEF1F4]'}`}
      >
        <button
          type="submit"
          onClick={onSearchClick}
          aria-label="Search"
          className="relative shrink-0 size-[20px] sm:size-[24px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1566E5] rounded-full"
        >
          <Image
            src="/icons/search.svg"
            alt=""
            width={24}
            height={24}
            className="size-full object-contain pointer-events-none"
          />
        </button>
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none font-sans font-medium text-[15px] sm:text-[16px] leading-[1.2] text-[#454545] placeholder-[#B0B0B0] [&::-webkit-search-cancel-button]:appearance-none"
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClear?.();
            }}
            className="shrink-0 cursor-pointer flex items-center justify-center size-[24px] rounded-full hover:brightness-95 transition-all"
            aria-label="Clear search"
          >
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full">
              <rect width="32" height="32" rx="16" fill="#EEF1F4"/>
              <path d="M21.3333 21.3333L16 16M16 16L10.6667 10.6667M16 16L21.3334 10.6667M16 16L10.6667 21.3334" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

