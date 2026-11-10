"use client";

import React, { useState } from "react";
import { X, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ComponentCustomStyles, DetectedColor } from "./ComponentCard";

export interface ComponentModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  customStyles: ComponentCustomStyles | undefined;
  setCustomStyles: React.Dispatch<React.SetStateAction<ComponentCustomStyles | undefined>>;
  detectedColors?: DetectedColor[];
}

export function ComponentModal({
  title,
  isOpen,
  onClose,
  children,
  customStyles,
  setCustomStyles,
  detectedColors = [],
}: ComponentModalProps) {
  const [activeTab, setActiveTab] = useState<"customisation" | "code">("customisation");
  const [copied, setCopied] = useState<string | false>(false);

  const currentStyles = customStyles || {
    cornerRadius: 24,
    colors: {},
    fontSize: 16,
    fontWeight: "500"
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateStyle = (key: keyof ComponentCustomStyles, value: any) => {
    setCustomStyles(prev => ({
      ...(prev || { cornerRadius: 24, colors: {}, fontSize: 16, fontWeight: "500" }),
      [key]: value
    }));
  };

  const updateColor = (origColor: string, newColor: string) => {
    setCustomStyles(prev => {
      const base = prev || { cornerRadius: 24, colors: {}, fontSize: 16, fontWeight: "500" };
      return {
        ...base,
        colors: {
          ...base.colors,
          [origColor]: newColor
        }
      };
    });
  };

  // Dynamic code content based on customization
  const codeContent = `// Example React Code for ${title}
import React from 'react';

export default function ${title.replace(/\s+/g, "")}() {
  return (
    <button 
      style={{
        borderRadius: '${currentStyles.cornerRadius}px',
        fontSize: '${currentStyles.fontSize}px',
        fontWeight: ${currentStyles.fontWeight}
      }}
      className="text-white px-4 py-2 hover:scale-105 transition-transform"
    >
      ${title}
    </button>
  );
}`;



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[#1F2123]/30 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#FBFCFD] w-full max-w-[1301px] h-full max-h-[692px] rounded-[40px] p-[32px] flex flex-col md:flex-row gap-[24px] pointer-events-auto shadow-2xl overflow-hidden"
            >
              {/* Left Side: Preview Area */}
              <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[28px] w-full md:w-[572px] h-full shrink-0 relative flex items-center justify-center overflow-hidden">
                {/* Embedded component */}
                <div className="scale-150 transform transition-transform">
                  {children}
                </div>
              </div>

              {/* Right Side: Panel Area */}
              <div className="flex-1 flex flex-col gap-[24px] p-0 md:p-[24px] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between w-full shrink-0">
                  <h2 className="font-sans font-medium text-[24px] md:text-[31px] text-[#454545] leading-[1.2]">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="size-[32px] flex items-center justify-center text-[#7D7F82] hover:text-black transition-colors bg-[#F7F9FB] hover:bg-[#EEF1F4] rounded-full"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-[8px] items-center shrink-0">
                  <button
                    onClick={() => setActiveTab("customisation")}
                    className={`px-[24px] py-[12px] rounded-[40px] transition-colors font-sans font-medium text-[14px] md:text-[16px] ${
                      activeTab === "customisation"
                        ? "bg-[#1F2123] text-white"
                        : "bg-[#EEF1F4] text-[#7D7F82] hover:text-black hover:bg-[#DEE1E4]"
                    }`}
                  >
                    Customisation
                  </button>
                  <button
                    onClick={() => setActiveTab("code")}
                    className={`px-[24px] py-[12px] rounded-[40px] transition-colors font-sans font-medium text-[14px] md:text-[16px] ${
                      activeTab === "code"
                        ? "bg-[#1F2123] text-white"
                        : "bg-[#EEF1F4] text-[#7D7F82] hover:text-black hover:bg-[#DEE1E4]"
                    }`}
                  >
                    Code
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto w-full">
                  {activeTab === "customisation" ? (
                    <div className="flex flex-col gap-[24px]">
                      <h3 className="font-sans font-bold text-[18px] text-[#454545]">
                        Customisation
                      </h3>

                      {/* Appearance Group */}
                      <div className="flex flex-col gap-[16px] w-full max-w-[593px]">
                        <h4 className="font-sans font-semibold text-[14px] text-[#7D7F82]">
                          Appearance
                        </h4>
                        <div className="flex gap-[16px] w-full">
                          {/* Corner Radius */}
                          <div className="flex-1 flex flex-col gap-[8px]">
                            <span className="font-sans font-normal text-[12px] text-[#7D7F82]">
                              Corner Radius
                            </span>
                            <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[58px] px-[16px] py-[12px] w-full flex items-center justify-between">
                              <input 
                                type="number" 
                                value={currentStyles.cornerRadius}
                                onChange={(e) => updateStyle('cornerRadius', Number(e.target.value))}
                                className="bg-transparent font-sans text-[14px] text-[#454545] w-full outline-none"
                              />
                            </div>
                          </div>
                        </div>
                          {/* Color Groups */}
                          <div className="w-full flex flex-col gap-[24px] mt-[8px]">
                            {/* 1. Font Color */}
                            {detectedColors.filter(c => c.category === 'font').length > 0 && (
                              <div className="flex flex-col gap-[12px] w-full">
                                <h4 className="font-sans font-semibold text-[14px] text-[#7D7F82]">Font Colors</h4>
                                <div className="grid grid-cols-2 gap-[16px]">
                                  {detectedColors.filter(c => c.category === 'font').map((c, idx) => {
                                    const key = `${c.category}_${c.hex}`;
                                    return (
                                      <div key={key} className="flex flex-col gap-[8px]">
                                        <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[58px] px-[16px] py-[12px] w-full flex items-center justify-between relative overflow-hidden">
                                          <div className="flex items-center gap-2 w-full">
                                            <input 
                                              type="color" 
                                              value={currentStyles.colors[key] || c.hex}
                                              onChange={(e) => updateColor(key, e.target.value)}
                                              className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                                            />
                                            <div className="size-4 rounded-full shadow-sm border border-black/10 shrink-0" style={{ backgroundColor: currentStyles.colors[key] || c.hex }} />
                                            <span className="font-sans text-[14px] text-[#454545] uppercase pointer-events-none">
                                              {currentStyles.colors[key] || c.hex}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 2. Background Colors */}
                            {detectedColors.filter(c => c.category === 'background' || c.category === 'border').length > 0 && (
                              <div className="flex flex-col gap-[12px] w-full">
                                <h4 className="font-sans font-semibold text-[14px] text-[#7D7F82]">Background Colors</h4>
                                <div className="grid grid-cols-2 gap-[16px]">
                                  {detectedColors.filter(c => c.category === 'background' || c.category === 'border').map((c, idx) => {
                                    const key = `${c.category}_${c.hex}`;
                                    return (
                                      <div key={key} className="flex flex-col gap-[8px]">
                                        <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[58px] px-[16px] py-[12px] w-full flex items-center justify-between relative overflow-hidden">
                                          <div className="flex items-center gap-2 w-full">
                                            <input 
                                              type="color" 
                                              value={currentStyles.colors[key] || c.hex}
                                              onChange={(e) => updateColor(key, e.target.value)}
                                              className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                                            />
                                            <div className="size-4 rounded-full shadow-sm border border-black/10 shrink-0" style={{ backgroundColor: currentStyles.colors[key] || c.hex }} />
                                            <span className="font-sans text-[14px] text-[#454545] uppercase pointer-events-none">
                                              {currentStyles.colors[key] || c.hex}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 3. Icon Color */}
                            {detectedColors.filter(c => c.category === 'icon').length > 0 && (
                              <div className="flex flex-col gap-[12px] w-full">
                                <h4 className="font-sans font-semibold text-[14px] text-[#7D7F82]">Icon Colors</h4>
                                <div className="grid grid-cols-2 gap-[16px]">
                                  {detectedColors.filter(c => c.category === 'icon').map((c, idx) => {
                                    const key = `${c.category}_${c.hex}`;
                                    return (
                                      <div key={key} className="flex flex-col gap-[8px]">
                                        <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[58px] px-[16px] py-[12px] w-full flex items-center justify-between relative overflow-hidden">
                                          <div className="flex items-center gap-2 w-full">
                                            <input 
                                              type="color" 
                                              value={currentStyles.colors[key] || c.hex}
                                              onChange={(e) => updateColor(key, e.target.value)}
                                              className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                                            />
                                            <div className="size-4 rounded-full shadow-sm border border-black/10 shrink-0" style={{ backgroundColor: currentStyles.colors[key] || c.hex }} />
                                            <span className="font-sans text-[14px] text-[#454545] uppercase pointer-events-none">
                                              {currentStyles.colors[key] || c.hex}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                      </div>

                      {/* Typography Group */}
                      <div className="flex flex-col gap-[16px] w-full max-w-[593px] pt-4">
                        <h4 className="font-sans font-semibold text-[14px] text-[#7D7F82]">
                          Typography
                        </h4>
                        <div className="flex gap-[16px] w-full">
                          {/* Font Size */}
                          <div className="flex-1 flex flex-col gap-[8px]">
                            <span className="font-sans font-normal text-[12px] text-[#7D7F82]">
                              Font Size
                            </span>
                            <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[58px] px-[16px] py-[12px] w-full flex items-center justify-between">
                              <input 
                                type="number" 
                                value={currentStyles.fontSize}
                                onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                                className="bg-transparent font-sans text-[14px] text-[#454545] w-full outline-none"
                              />
                            </div>
                          </div>
                          {/* Font Weight */}
                          <div className="flex-1 flex flex-col gap-[8px]">
                            <span className="font-sans font-normal text-[12px] text-[#7D7F82]">
                              Font Weight
                            </span>
                            <div className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[58px] px-[16px] py-[12px] w-full flex items-center justify-between pr-2">
                              <select 
                                value={currentStyles.fontWeight}
                                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                                className="bg-transparent font-sans text-[14px] text-[#454545] w-full outline-none appearance-none cursor-pointer"
                              >
                                <option value="400">Regular</option>
                                <option value="500">Medium</option>
                                <option value="600">SemiBold</option>
                                <option value="700">Bold</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[16px]">
                      <h3 className="font-sans font-bold text-[18px] text-[#454545] mb-2">
                        Code
                      </h3>

                      {/* Next.js Code */}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(codeContent);
                          setCopied('nextjs');
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="border border-[#CBCED1] flex items-center justify-between px-[24px] h-[60px] rounded-[53px] w-full hover:bg-[#F7F9FB] active:scale-[0.99] transition-all cursor-pointer group shadow-2xs"
                      >
                        <span className="font-sans font-medium text-[17.28px] text-[#3D3D3D]">
                          Next.js Code
                        </span>
                        <div className="flex gap-[10px] items-center">
                          <span className="font-sans font-medium text-[17.28px] text-[#B0B0B0]">
                            |
                          </span>
                          <div className="size-[18px] text-[#454545] group-hover:text-black transition-colors flex items-center justify-center">
                            {copied === 'nextjs' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


