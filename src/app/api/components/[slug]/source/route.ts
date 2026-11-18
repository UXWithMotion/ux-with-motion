import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getOfficialComponentSource } from "@/lib/registry/sources";

export const dynamic = "force-dynamic";

// In-memory cache for dynamic DB components (5-minute TTL)
const dbSourceCache = new Map<
  string,
  { registryId: string; sourceRevision: string; snippets: Record<string, string>; timestamp: number }
>();
const DB_CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Fast User Authentication
  // First attempt instant local session check from cookie store (0ms, no network round-trip).
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData.session?.user || null;

  // If session is absent from cookie parser, race getUser against a 2000ms timeout
  // to prevent hanging when Supabase remote auth has latency or cold starts.
  if (!user) {
    try {
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null }, error: new Error("Auth timeout") }), 2000)
      );
      const res = await Promise.race([userPromise, timeoutPromise]);
      if (res.data?.user) {
        user = res.data.user;
      }
    } catch {
      // Auth timeout or network error fallback
    }
  }

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to view source code" },
      { status: 401 }
    );
  }

  // 2. Fetch official source from reviewed server source registry (served from RAM in microseconds)
  const officialSource = await getOfficialComponentSource(slug);
  const officialReact = officialSource?.snippets?.react?.trim() || "";
  const officialNextjs = officialSource?.snippets?.nextjs?.trim() || officialReact;
  if (officialSource && (officialReact || officialNextjs)) {
    return NextResponse.json(
      {
        registryId: officialSource.registryId,
        sourceRevision: officialSource.sourceRevision,
        snippets: {
          ...officialSource.snippets,
          react: officialReact,
          nextjs: officialNextjs,
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // 3. Fallback to Supabase database for custom dynamic components (with in-memory cache)
  const now = Date.now();
  const cachedDbEntry = dbSourceCache.get(slug);
  if (cachedDbEntry && now - cachedDbEntry.timestamp < DB_CACHE_TTL_MS) {
    return NextResponse.json(
      {
        registryId: cachedDbEntry.registryId,
        sourceRevision: cachedDbEntry.sourceRevision,
        snippets: cachedDbEntry.snippets,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

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

  const dbSnippets = comp.snippets || {};
  const dbReact = dbSnippets.react?.trim() || dbSnippets.nextjs?.trim() || "";
  const dbNextjs = dbSnippets.nextjs?.trim() || dbSnippets.react?.trim() || "";

  const finalSnippets = {
    ...dbSnippets,
    react: dbReact,
    nextjs: dbNextjs,
  };

  dbSourceCache.set(slug, {
    registryId: comp.registry_id,
    sourceRevision: comp.updated_at || "1.0.0",
    snippets: finalSnippets,
    timestamp: now,
  });

  return NextResponse.json(
    {
      registryId: comp.registry_id,
      sourceRevision: comp.updated_at || "1.0.0",
      snippets: finalSnippets,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
