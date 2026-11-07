/** Accept app-relative destinations only; never redirect to another origin. */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return fallback;
  // URL parsing normalizes dot segments before consumers enforce route boundaries.
  try {
    const target = new URL(value, "https://internal.invalid");
    return target.origin === "https://internal.invalid" ? target.pathname + target.search + target.hash : fallback;
  } catch {
    return fallback;
  }
}

export function adminNextPath(value: string | null | undefined): string {
  const path = safeNextPath(value, "/admin");
  const pathname = path.split(/[?#]/, 1)[0];
  return (pathname === "/admin" || pathname.startsWith("/admin/")) && pathname !== "/admin/login"
    ? path : "/admin";
}
