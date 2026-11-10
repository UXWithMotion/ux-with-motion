"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ComponentDocs, ComponentSeo, ComponentControlDefinition } from "@/lib/registry/types";

export type SourceType = "react" | "html_css" | "both";

export interface ComponentSnippets {
  html?: string;
  css?: string;
  react?: string;
  figma?: string;
  prompt?: string;
}

export interface ComponentBuilderState {
  id?: string;
  title: string;
  description: string;
  registry_id: string;
  category: string;
  source_type: SourceType;
  snippets: ComponentSnippets;
  schema_definition: any[];
  controls_values: Record<string, any>;
  docs: ComponentDocs;
  seo: ComponentSeo;
  currentStep: number;
  status: "draft" | "published" | "archived";
  hasUnsavedChanges: boolean;
  publishedSource?: string;
}

interface BuilderContextType {
  state: ComponentBuilderState;
  updateState: (updates: Partial<ComponentBuilderState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const defaultDocs: ComponentDocs = {
  overview: "",
  useCases: [],
  dependencies: [],
  setupInstructions: "",
  usageExample: "",
  supportedProps: [],
  accessibilityNotes: "",
  relatedComponents: [],
};

const defaultSeo: ComponentSeo = {
  seoTitle: "",
  metaDescription: "",
  shareImage: "",
};

const defaultState: ComponentBuilderState = {
  title: "",
  description: "",
  registry_id: "",
  category: "inputs",
  source_type: "react",
  snippets: { html: "", css: "", react: "" },
  schema_definition: [],
  controls_values: {},
  docs: defaultDocs,
  seo: defaultSeo,
  currentStep: 1,
  status: "draft",
  hasUnsavedChanges: false,
};

const BuilderContext = createContext<BuilderContextType | null>(null);

export function BuilderProvider({ 
  children, 
  initialState 
}: { 
  children: ReactNode; 
  initialState?: Partial<ComponentBuilderState>;
}) {
  const [state, setState] = useState<ComponentBuilderState>({
    ...defaultState,
    ...initialState,
    docs: {
      ...defaultDocs,
      ...(initialState?.docs || {}),
    },
    seo: {
      ...defaultSeo,
      ...(initialState?.seo || {}),
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateState = (updates: Partial<ComponentBuilderState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      hasUnsavedChanges: true,
    }));
  };

  const nextStep = () => updateState({ currentStep: Math.min(state.currentStep + 1, 4) });
  const prevStep = () => updateState({ currentStep: Math.max(state.currentStep - 1, 1) });
  const setStep = (step: number) => updateState({ currentStep: Math.max(1, Math.min(step, 4)) });

  return (
    <BuilderContext.Provider value={{ state, updateState, nextStep, prevStep, setStep, isSaving, setIsSaving }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within a BuilderProvider");
  }
  return context;
}
