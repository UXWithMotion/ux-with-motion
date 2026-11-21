import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ slug: string }>;
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
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, "utf-8");
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    return new NextResponse(JSON.stringify({ error: "Figma data not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
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
    const targetDir = path.join(process.cwd(), "public", "figma-data");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, `${safeSlug}.html`);
    fs.writeFileSync(filePath, htmlPayload, "utf-8");

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
    const targetDir = path.join(process.cwd(), "public", "figma-data");
    const filePath = path.join(targetDir, `${safeSlug}.html`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
