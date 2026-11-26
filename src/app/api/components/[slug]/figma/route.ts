import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    return roleData?.role === "admin";
  } catch {
    return false;
  }
}

function hasValidFigmaPayload(html: unknown): html is string {
  return (
    typeof html === "string" &&
    (html.includes("data-buffer") || html.includes("<!--(figma)"))
  );
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { slug } = await params;

  if (!slug) {
    return new NextResponse("Invalid slug", { status: 400 });
  }

  // Sanitize slug to prevent directory traversal
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = path.join(process.cwd(), "public", "figma-data", `${safeSlug}.html`);

  try {
    // 1. Check Supabase database first so admin edits/uploads in any environment work immediately
    const serviceClient = createServiceRoleClient();
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = serviceClient
      .from("components")
      .select("registry_id, status, snippets");

    if (isUUID) {
      query = query.or(`registry_id.eq.${safeSlug},id.eq.${slug}`);
    } else {
      query = query.eq("registry_id", safeSlug);
    }

    const { data: comp } = await query.maybeSingle();

    if (comp) {
      if (comp.status !== "published") {
        const isAdmin = await isAuthenticatedAdmin();
        if (!isAdmin) {
          return new NextResponse(JSON.stringify({ error: "Figma data not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          });
        }
      }

      const dbFigma = comp.snippets?.figma;
      if (hasValidFigmaPayload(dbFigma)) {
        return new NextResponse(dbFigma, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        });
      }
    }

    // 2. Fallback to static file in /public/figma-data/[slug].html
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, "utf-8");
      if (hasValidFigmaPayload(html)) {
        return new NextResponse(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        });
      }
    }

    return new NextResponse(JSON.stringify({ error: "Figma data not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error reading Figma clipboard payload:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { htmlPayload } = body;

    if (!htmlPayload || typeof htmlPayload !== "string") {
      return NextResponse.json({ error: "htmlPayload is required" }, { status: 400 });
    }

    // Validate Figma clipboard markers
    if (!htmlPayload.includes("<!--(figmeta)") || !htmlPayload.includes("<!--(figma)")) {
      return NextResponse.json(
        {
          error:
            "Invalid Figma clipboard payload. It must contain <!--(figmeta)--> and <!--(figma)--> markers.",
        },
        { status: 400 }
      );
    }

    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");

    // Persist to Supabase snippets.figma so it works on both local and serverless deployments
    try {
      const serviceClient = createServiceRoleClient();
      const { data: comp } = await serviceClient
        .from("components")
        .select("id, snippets")
        .eq("registry_id", safeSlug)
        .maybeSingle();

      if (comp) {
        const nextSnippets = {
          ...(comp.snippets || {}),
          figma: htmlPayload,
        };
        await serviceClient
          .from("components")
          .update({ snippets: nextSnippets })
          .eq("id", comp.id);
      }
    } catch (dbErr) {
      console.warn("Could not persist Figma payload to DB:", dbErr);
    }

    // Best-effort sync to /public/figma-data/[slug].html (works locally; skipped on read-only FS)
    try {
      const targetDir = path.join(process.cwd(), "public", "figma-data");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filePath = path.join(targetDir, `${safeSlug}.html`);
      fs.writeFileSync(filePath, htmlPayload, "utf-8");
    } catch (fsErr) {
      console.warn("Local static sync skipped (likely read-only FS):", fsErr);
    }

    return NextResponse.json({
      success: true,
      slug: safeSlug,
      size: htmlPayload.length,
      path: `/figma-data/${safeSlug}.html`,
    });
  } catch (error) {
    console.error("Failed to save Figma payload:", error);
    return NextResponse.json({ error: "Failed to save Figma payload" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");

    // Clear snippets.figma in Supabase DB
    try {
      const serviceClient = createServiceRoleClient();
      const { data: comp } = await serviceClient
        .from("components")
        .select("id, snippets")
        .eq("registry_id", safeSlug)
        .maybeSingle();

      if (comp) {
        const nextSnippets = {
          ...(comp.snippets || {}),
          figma: "",
        };
        await serviceClient
          .from("components")
          .update({ snippets: nextSnippets })
          .eq("id", comp.id);
      }
    } catch (dbErr) {
      console.warn("Could not clear Figma payload in DB:", dbErr);
    }

    // Remove static file if present
    try {
      const targetDir = path.join(process.cwd(), "public", "figma-data");
      const filePath = path.join(targetDir, `${safeSlug}.html`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.warn("Local static delete skipped:", fsErr);
    }

    return NextResponse.json({
      success: true,
      slug: safeSlug,
      message: "Figma payload deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete Figma payload:", error);
    return NextResponse.json({ error: "Failed to delete Figma payload" }, { status: 500 });
  }
}
