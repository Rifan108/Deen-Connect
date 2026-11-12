import { NextRequest, NextResponse } from "next/server"
import { calculateDistance } from "@/lib/location"

export const dynamic = "force-dynamic"

interface MosqueItem {
  id: string | number
  name: string
  lat: number
  lon: number
  distance: number
  address: string
  phone?: string
  website?: string
}

// In-memory cache with 15-minute TTL
interface CacheEntry {
  timestamp: number
  data: MosqueItem[]
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15 * 60 * 1000

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get("lat")
    const lngStr = searchParams.get("lng")
    const radiusStr = searchParams.get("radius") || "5000"

    const lat = parseFloat(latStr || "")
    const lng = parseFloat(lngStr || "")
    const radius = Math.min(Math.max(parseInt(radiusStr, 10) || 5000, 500), 50000)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: "Valid latitude and longitude are required" },
        { status: 400 }
      )
    }

    // Check cache (round coordinates to ~300m for cache hits)
    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        total: cached.data.length,
        radius,
        cached: true,
      })
    }

    const itemsMap = new Map<string, MosqueItem>()

    // Tier 1: OpenStreetMap Nominatim search (highly reliable, no 502s)
    const delta = (radius / 1000) / 111 // ~1 degree = 111km
    const s = lat - delta
    const n = lat + delta
    const w = lng - (delta / Math.cos((lat * Math.PI) / 180))
    const e = lng + (delta / Math.cos((lat * Math.PI) / 180))
    const viewbox = `${w.toFixed(5)},${n.toFixed(5)},${e.toFixed(5)},${s.toFixed(5)}`

    // Fetch from Nominatim place_of_worship
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?amenity=place_of_worship&religion=muslim&format=json&viewbox=${viewbox}&bounded=1&limit=50&addressdetails=1`
      const res = await fetch(nominatimUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary; contact@deenconnect.app)",
          "Accept-Language": "en,ar",
        },
      })

      if (res.ok) {
        const list = await res.json()
        if (Array.isArray(list)) {
          for (const el of list) {
            const mLat = parseFloat(el.lat)
            const mLon = parseFloat(el.lon)
            if (isNaN(mLat) || isNaN(mLon)) continue

            const dist = calculateDistance(lat, lng, mLat, mLon)
            const addr = el.address || {}
            const name = el.name || addr.amenity || addr.place_of_worship || "Masjid / Mosque"
            const street = addr.road || addr.street || ""
            const suburb = addr.suburb || addr.neighbourhood || addr.village || ""
            const city = addr.city || addr.town || addr.county || ""
            const fullAddress = [street, suburb, city].filter(Boolean).join(", ") || el.display_name

            const uniqueKey = `${mLat.toFixed(4)}_${mLon.toFixed(4)}`
            itemsMap.set(uniqueKey, {
              id: el.osm_id || uniqueKey,
              name,
              lat: mLat,
              lon: mLon,
              distance: dist,
              address: fullAddress,
            })
          }
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim primary search failed:", nomErr)
    }

    // Also run keyword "mosque" on Nominatim if items < 15
    if (itemsMap.size < 15) {
      try {
        const nomKwUrl = `https://nominatim.openstreetmap.org/search?q=mosque&format=json&viewbox=${viewbox}&bounded=1&limit=50&addressdetails=1`
        const resKw = await fetch(nomKwUrl, {
          signal: AbortSignal.timeout(5000),
          headers: {
            "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary; contact@deenconnect.app)",
            "Accept-Language": "en,ar",
          },
        })

        if (resKw.ok) {
          const listKw = await resKw.json()
          if (Array.isArray(listKw)) {
            for (const el of listKw) {
              const mLat = parseFloat(el.lat)
              const mLon = parseFloat(el.lon)
              if (isNaN(mLat) || isNaN(mLon)) continue

              const uniqueKey = `${mLat.toFixed(4)}_${mLon.toFixed(4)}`
              if (itemsMap.has(uniqueKey)) continue

              const dist = calculateDistance(lat, lng, mLat, mLon)
              const addr = el.address || {}
              const name = el.name || "Masjid / Mosque"
              const street = addr.road || addr.street || ""
              const suburb = addr.suburb || addr.neighbourhood || addr.village || ""
              const city = addr.city || addr.town || addr.county || ""
              const fullAddress = [street, suburb, city].filter(Boolean).join(", ") || el.display_name

              itemsMap.set(uniqueKey, {
                id: el.osm_id || uniqueKey,
                name,
                lat: mLat,
                lon: mLon,
                distance: dist,
                address: fullAddress,
              })
            }
          }
        }
      } catch (kwErr) {
        console.warn("Nominatim keyword search failed:", kwErr)
      }
    }

    // Tier 2: If Nominatim found very few and we need more, try Overpass mirror with short timeout
    if (itemsMap.size === 0) {
      const overpassQuery = `[out:json][timeout:6];(node["amenity"="mosque"](around:${radius},${lat},${lng});node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng}););out center;`
      const mirrors = [
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass-api.de/api/interpreter",
      ]

      for (const mirror of mirrors) {
        try {
          const overpassRes = await fetch(`${mirror}?data=${encodeURIComponent(overpassQuery)}`, {
            signal: AbortSignal.timeout(6000),
            headers: { "User-Agent": "DeenConnect/1.0" },
          })

          if (overpassRes.ok) {
            const data = await overpassRes.json()
            const elements = data.elements || []
            for (const el of elements) {
              const mLat = el.lat || el.center?.lat
              const mLon = el.lon || el.center?.lon
              if (!mLat || !mLon) continue

              const uniqueKey = `${mLat.toFixed(4)}_${mLon.toFixed(4)}`
              if (itemsMap.has(uniqueKey)) continue

              const dist = calculateDistance(lat, lng, mLat, mLon)
              const tags = el.tags || {}
              const name =
                tags.name ||
                tags["name:en"] ||
                tags["name:ar"] ||
                "Masjid / Muslim Community Center"
              const street = tags["addr:street"] || ""
              const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || ""
              const city = tags["addr:city"] || ""
              const address = [street, suburb, city].filter(Boolean).join(", ") || `${mLat.toFixed(4)}°, ${mLon.toFixed(4)}°`

              itemsMap.set(uniqueKey, {
                id: el.id,
                name,
                lat: mLat,
                lon: mLon,
                distance: dist,
                address,
                phone: tags.phone || tags["contact:phone"],
                website: tags.website || tags["contact:website"],
              })
            }
            if (elements.length > 0) break
          }
        } catch (opErr) {
          console.warn(`Mirror ${mirror} failed:`, opErr)
        }
      }
    }

    // Convert to sorted array
    const sorted = Array.from(itemsMap.values())
      .filter((m) => m.distance <= (radius / 1000) * 1.5) // Filter within reasonable vicinity
      .sort((a, b) => a.distance - b.distance)

    // Save in cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: sorted,
    })

    return NextResponse.json({
      success: true,
      data: sorted,
      total: sorted.length,
      radius,
    })
  } catch (error: any) {
    console.warn("Error in /api/nearby-mosques:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve nearby mosques",
        data: [],
      },
      { status: 500 }
    )
  }
}
