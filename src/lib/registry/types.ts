import React from "react";

export type ControlInputType = "text" | "boolean" | "enum";

export interface TextControl {
  name: string;
  label: string;
  type: "text";
  defaultValue: string;
  placeholder?: string;
  description?: string;
}

export interface BooleanControl {
  name: string;
  label: string;
  type: "boolean";
  defaultValue: boolean;
  description?: string;
}

export interface EnumControl {
  name: string;
  label: string;
  type: "enum";
  defaultValue: string;
  options: string[];
  description?: string;
}

export type ComponentControlDefinition = TextControl | BooleanControl | EnumControl;

export interface ComponentPropDoc {
  prop: string;
  type: string;
  defaultVal: string;
  description: string;
}

export interface ComponentDependency {
  name: string;
  version?: string;
}

export interface ComponentDocs {
  overview: string;
  useCases: string[];
  dependencies: ComponentDependency[];
  setupInstructions: string;
  usageExample: string;
  supportedProps: ComponentPropDoc[];
  accessibilityNotes: string;
  relatedComponents: { slug: string; name: string }[];
  figmaLink?: string;
}

export interface ComponentSeo {
  seoTitle?: string;
  metaDescription?: string;
  shareImage?: string;
}

export interface ComponentClientEntry {
  registryId: string;
  name: string;
  category: string;
  component: React.ComponentType<any>;
  sourceRevision: string;
  controls?: ComponentControlDefinition[];
  docs?: ComponentDocs;
  seo?: ComponentSeo;
}

export interface ComponentSnippets {
  html?: string;
  css?: string;
  react?: string;
  nextjs?: string;
}

export interface ComponentServerEntry {
  registryId: string;
  sourceRevision: string;
  snippets: ComponentSnippets;
}
