import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const trimmed = query.trim().toLowerCase()
    const cached = cache.get(trimmed)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cached.data, cached: true })
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=10&accept-language=en&addressdetails=1`

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary; contact@deenconnect.app)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) {
      throw new Error(`Nominatim geocode failed with HTTP ${res.status}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: true, data: [] })
    }

    const results = data.map((item: any) => {
      const lat = parseFloat(item.lat)
      const lon = parseFloat(item.lon)
      const address = item.address || {}

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.suburb ||
        address.county ||
        item.name

      return {
        name: item.display_name,
        latitude: lat,
        longitude: lon,
        city,
        district: address.suburb || address.neighbourhood || address.district || "",
        state: address.state || address.region || "",
        country: address.country || "",
      }
    })

    cache.set(trimmed, { data: results, timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    console.warn("Geocode query failed:", error.message)
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to search locations",
      data: [],
    })
  }
}

