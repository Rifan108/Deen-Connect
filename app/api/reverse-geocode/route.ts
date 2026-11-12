import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get("lat")
    const lngStr = searchParams.get("lng")

    const lat = parseFloat(latStr || "")
    const lng = parseFloat(lngStr || "")

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, error: "Valid latitude (-90 to 90) and longitude (-180 to 180) required" },
        { status: 400 }
      )
    }

    const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cached.data, cached: true })
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary; contact@deenconnect.app)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) {
      throw new Error(`Nominatim responded with HTTP ${res.status}`)
    }

    const data = await res.json()
    const address = data.address || {}

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.county ||
      `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`

    const district = address.suburb || address.neighbourhood || address.district || ""
    const state = address.state || address.province || address.region || ""
    const country = address.country || ""

    const locationDetails = {
      city,
      district,
      state,
      country,
      displayName: data.display_name || `${city}, ${country}`,
    }

    cache.set(cacheKey, { data: locationDetails, timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      data: locationDetails,
    })
  } catch (error: any) {
    console.warn("Reverse geocode failed:", error.message)
    const lat = parseFloat(new URL(request.url).searchParams.get("lat") || "0")
    const lng = parseFloat(new URL(request.url).searchParams.get("lng") || "0")

    return NextResponse.json({
      success: true,
      data: {
        city: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
        district: "",
        state: "",
        country: "",
        displayName: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      },
      fallback: true,
    })
  }
}

