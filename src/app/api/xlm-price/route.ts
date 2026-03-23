export const dynamic = "force-dynamic";

let cachedUsd: number | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

export async function GET() {
  const now = Date.now();
  if (cachedUsd !== null && now - cachedAt < CACHE_TTL_MS) {
    return Response.json({ usd: cachedUsd, cached: true });
  }

  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd",
    { cache: "no-store" }
  );

  if (!response.ok) {
    if (cachedUsd !== null) {
      return Response.json({ usd: cachedUsd, cached: true });
    }
    return Response.json({ error: "Failed to fetch price" }, { status: response.status });
  }

  const data = await response.json();
  const usd = data?.stellar?.usd ?? null;
  cachedUsd = typeof usd === "number" ? usd : null;
  cachedAt = now;
  return Response.json({ usd: cachedUsd, cached: false });
}
