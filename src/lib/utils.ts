export type ClassValue = string | number | boolean | null | undefined;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
    .map(String)
    .filter(Boolean)
    .join(" ");
}
