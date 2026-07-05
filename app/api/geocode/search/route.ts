import { NextResponse } from "next/server";
import {
  formatGeocodeSearchResult,
  normalizeAreaSearchQuery,
} from "@/lib/location";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ error: "Search query is too short" }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("q", normalizeAreaSearchQuery(query));
    url.searchParams.set("countrycodes", "gh");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MamaPeaceMiniMart/1.0 (orders@mamapeacemart.com)",
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Area search failed" }, { status: 502 });
    }

    const data = (await response.json()) as Parameters<typeof formatGeocodeSearchResult>[0][];

    const results = data.map(formatGeocodeSearchResult);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Area search failed" }, { status: 502 });
  }
}
