import { NextResponse } from "next/server"

// In-memory server cache: key = lat_lng_method_school_date
interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const latParam = searchParams.get("lat")
    const lngParam = searchParams.get("lng")
    const methodParam = searchParams.get("method") || "3" // Default: 3 (Muslim World League)
    const schoolParam = searchParams.get("school") || "0" // Default: 0 (Shafi / Standard)
    const dateParam = searchParams.get("date") // Optional DD-MM-YYYY or timestamp

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: "Latitude and Longitude parameters are required" },
        { status: 400 }
      )
    }

    const lat = parseFloat(latParam)
    const lng = parseFloat(lngParam)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid geographic coordinates provided" },
        { status: 400 }
      )
    }

    // Format today date in YYYY-MM-DD
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const queryDate = dateParam || todayStr

    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${methodParam}_${schoolParam}_${queryDate}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
      })
    }

    // Call official AlAdhan API endpoint
    // Format timestamp in unix seconds or date string
    const timestamp = Math.floor(today.getTime() / 1000)
    const alAdhanUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${methodParam}&school=${schoolParam}`

    const apiRes = await fetch(alAdhanUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary)",
      },
      next: { revalidate: 3600 },
    })

    if (!apiRes.ok) {
      throw new Error(`AlAdhan API returned HTTP ${apiRes.status}`)
    }

    const json = await apiRes.json()

    if (json.code !== 200 || !json.data) {
      throw new Error(json.data || "Invalid response from AlAdhan API")
    }

    const payload = {
      code: 200,
      status: "OK",
      source: "AlAdhan Official Astronomical Calculations API",
      disclaimer: "Calculated astronomical prayer times. Local mosque congregation (Iqamah) times may differ.",
      data: json.data,
    }

    // Store in cache
    cache.set(cacheKey, { data: payload, timestamp: Date.now() })

    // Clean old cache entries if map grows too large
    if (cache.size > 200) {
      const now = Date.now()
      for (const [k, v] of cache.entries()) {
        if (now - v.timestamp > CACHE_TTL_MS) {
          cache.delete(k)
        }
      }
    }

    return NextResponse.json(payload, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    })
  } catch (error: any) {
    console.error("[Deen Connect] Error fetching prayer times from AlAdhan:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve verified prayer times",
        message: error.message || "Network or upstream provider error",
      },
      { status: 502 }
    )
  }
}
