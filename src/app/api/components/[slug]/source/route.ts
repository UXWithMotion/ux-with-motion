import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getOfficialComponentSource } from "@/lib/registry/sources";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required to view source code" },
      { status: 401 }
    );
  }

  // 2. Fetch official source from reviewed server source registry
  const officialSource = await getOfficialComponentSource(slug);
  if (officialSource) {
    return NextResponse.json(
      {
        registryId: officialSource.registryId,
        sourceRevision: officialSource.sourceRevision,
        snippets: officialSource.snippets,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  // 3. Fallback to Supabase database for dynamic components
  const serviceClient = createServiceRoleClient();
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = serviceClient.from("components").select("*");
  if (isUUID) {
    query = query.or(`registry_id.eq.${slug},id.eq.${slug}`);
  } else {
    query = query.eq("registry_id", slug);
  }

  const { data: comp, error: dbError } = await query.maybeSingle();

  if (dbError || !comp) {
    return NextResponse.json(
      { error: "Component not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      registryId: comp.registry_id,
      sourceRevision: comp.updated_at || "1.0.0",
      snippets: comp.snippets || {},
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    }
  );
}
