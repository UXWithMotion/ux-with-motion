"use client";

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { ComponentModal } from './ComponentModal';

export interface ComponentTag {
  label: string;
}

export interface ComponentCustomStyles {
  cornerRadius: number;
  colors: Record<string, string>;
  fontSize: number;
  fontWeight: string;
}

export interface ComponentCardProps {
  id: string;
  title: string;
  tags?: ComponentTag[];
  children: React.ReactNode | ((props: { 
    isPlaying: boolean; 
    playState: 'idle' | 'hover' | 'active' | 'loading';
    customStyles?: ComponentCustomStyles;
  }) => React.ReactNode);
  accessTier?: "free" | "premium";
}

const DEFAULT_TAGS = [{ label: "Html & css" }, { label: "Next js" }, { label: "Figma" }];

const tailwindColors: Record<string, string> = {
  'white': '#FFFFFF', 'black': '#000000', 'transparent': 'transparent',
  'slate-500': '#64748B', 'gray-500': '#6B7280', 'zinc-500': '#71717A', 'neutral-500': '#737373', 'stone-500': '#78716C',
  'red-500': '#EF4444', 'orange-500': '#F97316', 'amber-500': '#F59E0B', 'yellow-500': '#EAB308', 'lime-500': '#84CC16',
  'green-500': '#22C55E', 'emerald-500': '#10B981', 'teal-500': '#14B8A6', 'cyan-500': '#06B6D4', 'sky-500': '#0EA5E9',
  'blue-500': '#3B82F6', 'indigo-500': '#6366F1', 'violet-500': '#8B5CF6', 'purple-500': '#A855F7', 'fuchsia-500': '#D946EF',
  'pink-500': '#EC4899', 'rose-500': '#F43F5E'
};

export type ColorCategory = 'background' | 'font' | 'icon' | 'border';

export interface DetectedColor {
  category: ColorCategory;
  hex: string;
}

function injectMappedColors(node: React.ReactNode, colorMapping: Record<string, string>, detectedColors: Map<string, DetectedColor>, isIconContext = false): React.ReactNode {
  if (!React.isValidElement(node)) return node;

  let currentIsIcon = isIconContext;
  if (typeof node.type === 'string' && (node.type === 'svg' || node.type === 'path')) {
    currentIsIcon = true;
  }
  if (typeof node.type === 'function' && node.type.name && /Icon|Play|Bookmark|Square|Chevron|Heart|Star|Send|Arrow/.test(node.type.name)) {
    currentIsIcon = true;
  }

  const element = node as React.ReactElement;
  if (!element || typeof element !== 'object' || !element.props) return node;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: any = { ...(element.props as any) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const injectedStyle: any = { ...(props.style || {}) };
  let modified = false;

  const addColor = (category: ColorCategory, hex: string) => {
    hex = hex.toUpperCase();
    const key = `${category}_${hex}`;
    if (!detectedColors.has(key)) {
      detectedColors.set(key, { category, hex });
    }
    return key;
  };

  if (typeof props.className === 'string') {
    const className = props.className as string;
    
    // Parse arbitrary hex and standard Tailwind colors
    const regex = /\b(bg|text|border|fill|stroke)-(\[#([0-9a-fA-F]{3,8})\]|([a-z]+(?:-[0-9]{2,3})?)|white|black)(?:\/(\d+))?\b/g;
    let match;
    while ((match = regex.exec(className)) !== null) {
      const prefix = match[1];
      const colorVal = match[2];
      const opacity = match[5];
      
      let hex = '';
      if (colorVal.startsWith('[#')) {
        hex = '#' + colorVal.slice(2, -1);
      } else {
        hex = tailwindColors[colorVal] || '';
      }
      
      if (hex && hex !== 'transparent') {
        let category: ColorCategory = 'background';
        if (prefix === 'bg') category = 'background';
        else if (prefix === 'text' && currentIsIcon) category = 'icon';
        else if (prefix === 'text') category = 'font';
        else if (prefix === 'border') category = 'border';
        else if (prefix === 'fill' || prefix === 'stroke') category = 'icon';

        const key = addColor(category, hex);
        
        if (colorMapping[key] && colorMapping[key] !== hex.toUpperCase()) {
          let mappedColor = colorMapping[key];
          if (opacity) {
            const hexMatch = mappedColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (hexMatch) {
              const r = parseInt(hexMatch[1], 16);
              const g = parseInt(hexMatch[2], 16);
              const b = parseInt(hexMatch[3], 16);
              mappedColor = `rgba(${r}, ${g}, ${b}, ${parseInt(opacity)/100})`;
            }
          }
          
          if (prefix === 'bg') injectedStyle.backgroundColor = mappedColor;
          if (prefix === 'text') injectedStyle.color = mappedColor;
          if (prefix === 'border') injectedStyle.borderColor = mappedColor;
          if (prefix === 'fill') injectedStyle.fill = mappedColor;
          if (prefix === 'stroke') injectedStyle.stroke = mappedColor;
          modified = true;
        }
      }
    }
  }

  ['fill', 'stroke', 'color', 'backgroundColor', 'borderColor'].forEach(propKey => {
    const val = injectedStyle[propKey] || props[propKey];
    if (typeof val === 'string' && val.startsWith('#')) {
      let category: ColorCategory = 'background';
      if (propKey === 'backgroundColor') category = 'background';
      else if (propKey === 'color' && currentIsIcon) category = 'icon';
      else if (propKey === 'color') category = 'font';
      else if (propKey === 'borderColor') category = 'border';
      else if (propKey === 'fill' || propKey === 'stroke') category = 'icon';

      const key = addColor(category, val);
      if (colorMapping[key]) {
        injectedStyle[propKey] = colorMapping[key];
        modified = true;
      }
    }
  });

  if (modified) {
    props.style = injectedStyle;
  }

  if (props.children) {
    props.children = React.Children.map(props.children, child => 
      injectMappedColors(child, colorMapping, detectedColors, currentIsIcon)
    );
  }

  return React.cloneElement(element, props);
}

export function ComponentCard({ id, title, tags = DEFAULT_TAGS, children, accessTier }: ComponentCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [playState, setPlayState] = useState<'idle' | 'hover' | 'active' | 'loading'>('idle');
  const isPlaying = false;
  const playState = 'idle';
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_components") || "[]");
    setIsSaved(saved.includes(id));
  }, [id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("saved_components") || "[]");
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((savedId: string) => savedId !== id);
    } else {
      if (!saved.includes(id)) {
        newSaved = [...saved, id];
      } else {
        newSaved = saved;
      }
    }
    localStorage.setItem("saved_components", JSON.stringify(newSaved));
    setIsSaved(!isSaved);
    window.dispatchEvent(new Event("saved_components_changed"));
  };

  const [customStyles, setCustomStyles] = useState<ComponentCustomStyles | undefined>(undefined);

  // useEffect(() => {
  //   if (!isPlaying) {
  //     setTimeout(() => setPlayState('idle'), 0);
  //     return;
  //   }
  //
  //   let timeoutId: NodeJS.Timeout;
  //   let isCancelled = false;
  //
  //   const runSequence = async () => {
  //     setPlayState('hover');
  //     await new Promise(r => setTimeout(r, 800));
  //     if (isCancelled) return;
  //     
  //     setPlayState('active');
  //     await new Promise(r => setTimeout(r, 400));
  //     if (isCancelled) return;
  //     
  //     setPlayState('loading');
  //     await new Promise(r => setTimeout(r, 1200));
  //     if (isCancelled) return;
  //     
  //     setPlayState('idle');
  //     timeoutId = setTimeout(runSequence, 800);
  //   };
  //
  //   runSequence();
  //
  //   return () => {
  //     isCancelled = true;
  //     clearTimeout(timeoutId);
  //   };
  // }, [isPlaying]);

  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && !customStyles && contentRef.current) {
      const element = contentRef.current.firstElementChild as HTMLElement;
      if (element) {
        const computed = window.getComputedStyle(element);
        
        const radiusStr = computed.borderRadius;
        const sizeStr = computed.fontSize;
        const weightStr = computed.fontWeight;
        
        setCustomStyles({
          cornerRadius: parseFloat(radiusStr) || 0,
          colors: {},
          fontSize: parseFloat(sizeStr) || 16,
          fontWeight: weightStr || '500'
        });
      }
    }
  }, [isModalOpen, customStyles]);

  let renderedContent = typeof children === 'function' ? children({ isPlaying, playState, customStyles }) : children;
  const detectedColorsMap = new Map<string, DetectedColor>();

  if (React.isValidElement(renderedContent)) {
    // Collect and map colors deeply in the React tree
    renderedContent = injectMappedColors(renderedContent, customStyles?.colors || {}, detectedColorsMap) as React.ReactElement;
    
    // Auto-apply structural styles to the root node if customStyles exists
    if (customStyles) {
      const element = renderedContent as React.ReactElement<{ style?: React.CSSProperties }>;
      const existingStyle = element.props.style || {};
      renderedContent = React.cloneElement(element, {
        style: {
          ...existingStyle,
          borderRadius: `${customStyles.cornerRadius}px`,
          fontSize: `${customStyles.fontSize}px`,
          fontWeight: customStyles.fontWeight,
        }
      });
    }
  }

  const detectedColors = Array.from(detectedColorsMap.values());

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-[#F7F9FB] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[12px] w-full max-w-[420px] overflow-clip cursor-pointer group min-h-[251px]"
      >
        {/* Top action bar */}
        <div className="flex gap-[6px] items-center justify-end p-[8px] w-full shrink-0 relative z-10">
          <button 
            onClick={toggleSave}
            className={`flex items-center justify-center size-[34px] transition-colors ${isSaved ? 'text-[#454545]' : 'text-[#B0B0B0] hover:text-black'}`}
            aria-label={isSaved ? "Saved" : "Bookmark"}
          >
            <Bookmark size={20} className={isSaved ? "fill-current stroke-current" : "fill-transparent stroke-current stroke-2"} />
          </button>
        </div>
        
        {/* Component Display Area */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full relative flex-1 flex items-center justify-center shrink-0 overflow-clip cursor-default"
        >
          <div ref={contentRef} className="w-full flex items-center justify-center">
            {renderedContent}
          </div>
        </div>
        
        {/* Footer Area */}
        <div className="flex items-center justify-between px-[20px] py-[12px] w-full shrink-0 relative z-10">
          <div className="flex items-center gap-2 max-w-[65%]">
            <h3 className="font-sans font-medium text-[20px] leading-[1.2] text-[#454545] whitespace-nowrap truncate">
              {title}
            </h3>
            {accessTier === 'premium' && (
              <div className="flex items-center justify-center bg-[#FDF8F0] border border-[#F3E2C6] rounded-full px-2 py-0.5 shrink-0" title="Premium Component">
                <span className="text-[#C18824] text-[10px] font-bold uppercase tracking-wider">Premium</span>
              </div>
            )}
          </div>
          <div className="flex gap-[4px] h-[24px] items-center">
            {tags.map((tag, i) => (
              <div key={i} className="bg-[#FBFCFD] border border-[#EEF1F4] flex h-full items-center p-[4px] rounded-[4px] overflow-hidden">
                <span className="font-sans font-normal text-[13px] leading-[1.2] text-[#7D7F82] whitespace-nowrap">
                  {tag.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ComponentModal
        title={title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customStyles={customStyles}
        setCustomStyles={setCustomStyles}
        detectedColors={detectedColors}
      >
        {renderedContent}
      </ComponentModal>
    </>
  );
}







