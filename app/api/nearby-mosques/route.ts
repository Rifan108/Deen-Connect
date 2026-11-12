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

// Negative filter: strictly reject any non-Islamic religious places or generic temples
const NON_MOSQUE_PATTERN =
  /temple|mandir|church|cathedral|synagogue|gurdwara|shrine|hindu|christian|jewish|sikh|buddhist|ashram|devasthana|chapel|monastery|basilica|convent|mutt|matha|vihara|statue|kshetra|swamy|devalaya|kovil|st\.\s+/i

// Positive filter: authentic Islamic Mosque terms
const STRICT_MOSQUE_PATTERN =
  /\b(masjid|mosque|musalla|jamaa?|jamea|jami|eidgah|idgah|markaz|maktab)\b|جامع|مسجد|مصلى/i

function isStrictMosque(name: string, tags: Record<string, any> = {}, extraType = ""): boolean {
  const combined = `${name} ${tags.name || ""} ${tags.amenity || ""} ${tags.building || ""} ${tags.religion || ""} ${extraType}`.toLowerCase()

  // 1. Strict rejection of non-Islamic places of worship
  if (NON_MOSQUE_PATTERN.test(combined)) {
    return false
  }

  // 2. Verified tags from OpenStreetMap Overpass
  if (tags.religion === "muslim" || tags.amenity === "mosque" || tags.building === "mosque") {
    return true
  }

  // 3. Name or keywords must explicitly match genuine Islamic mosque patterns
  if (STRICT_MOSQUE_PATTERN.test(name) || STRICT_MOSQUE_PATTERN.test(combined)) {
    return true
  }

  return false
}

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

    // Tier 1: OpenStreetMap Nominatim Queries with bounded viewbox
    const delta = radius / 1000 / 111
    const s = lat - delta
    const n = lat + delta
    const w = lng - delta / Math.cos((lat * Math.PI) / 180)
    const e = lng + delta / Math.cos((lat * Math.PI) / 180)
    const viewbox = `${w.toFixed(5)},${n.toFixed(5)},${e.toFixed(5)},${s.toFixed(5)}`

    const nominatimQueries = [
      `https://nominatim.openstreetmap.org/search?q=mosque&format=json&viewbox=${viewbox}&bounded=1&limit=50&addressdetails=1`,
      `https://nominatim.openstreetmap.org/search?q=masjid&format=json&viewbox=${viewbox}&bounded=1&limit=50&addressdetails=1`,
      `https://nominatim.openstreetmap.org/search?q=jamia+masjid&format=json&viewbox=${viewbox}&bounded=1&limit=50&addressdetails=1`,
    ]

    for (const nomUrl of nominatimQueries) {
      try {
        const res = await fetch(nomUrl, {
          signal: AbortSignal.timeout(4500),
          headers: {
            "User-Agent": "DeenConnect/1.0 (Islamic Digital Platform; contact@deenconnect.app)",
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

              const addr = el.address || {}
              let rawName = el.name || addr.amenity || addr.place_of_worship || "Masjid"
              if (rawName === "place_of_worship") rawName = "Masjid"

              // Filter strictly to mosques / masjids
              if (!isStrictMosque(rawName, addr, el.type)) {
                continue
              }

              const dist = calculateDistance(lat, lng, mLat, mLon)
              const street = addr.road || addr.street || ""
              const suburb = addr.suburb || addr.neighbourhood || addr.village || ""
              const city = addr.city || addr.town || addr.county || ""
              const fullAddress =
                [street, suburb, city].filter(Boolean).join(", ") || el.display_name

              // If name is just generic "Mosque" or "Masjid", qualify with locality
              let finalName = rawName
              if (/^(mosque|masjid)$/i.test(finalName.trim())) {
                const locality = street || suburb || city
                if (locality) {
                  finalName = `${finalName} (${locality})`
                }
              }

              const uniqueKey = `${mLat.toFixed(4)}_${mLon.toFixed(4)}`
              if (!itemsMap.has(uniqueKey)) {
                itemsMap.set(uniqueKey, {
                  id: el.osm_id || uniqueKey,
                  name: finalName,
                  lat: mLat,
                  lon: mLon,
                  distance: dist,
                  address: fullAddress,
                })
              }
            }
          }
        }
      } catch (nomErr) {
        // Continue quietly
      }
    }

    // Tier 2: Overpass Query as complementary source if elements < 5
    if (itemsMap.size < 5) {
      const overpassQuery = `[out:json][timeout:10];(
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
        node["building"="mosque"](around:${radius},${lat},${lng});
        way["building"="mosque"](around:${radius},${lat},${lng});
        node["amenity"="mosque"](around:${radius},${lat},${lng});
        way["amenity"="mosque"](around:${radius},${lat},${lng});
      );out center tags;`

      const overpassMirrors = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
      ]

      for (const mirror of overpassMirrors) {
        try {
          const overpassRes = await fetch(`${mirror}?data=${encodeURIComponent(overpassQuery)}`, {
            signal: AbortSignal.timeout(4000),
            headers: { "User-Agent": "DeenConnect/1.0" },
          })

          if (overpassRes.ok) {
            const data = await overpassRes.json()
            const elements = data.elements || []

            for (const el of elements) {
              const mLat = el.lat || el.center?.lat
              const mLon = el.lon || el.center?.lon
              if (!mLat || !mLon) continue

              const tags = el.tags || {}
              let rawName =
                tags.name ||
                tags["name:en"] ||
                tags["name:ar"] ||
                tags["alt_name"] ||
                "Masjid"

              // Strict mosque verification
              if (!isStrictMosque(rawName, tags)) continue

              const dist = calculateDistance(lat, lng, mLat, mLon)
              const street = tags["addr:street"] || ""
              const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || ""
              const city = tags["addr:city"] || ""
              const address =
                [street, suburb, city].filter(Boolean).join(", ") ||
                `${mLat.toFixed(4)}°N, ${mLon.toFixed(4)}°E`

              let finalName = rawName
              if (/^(mosque|masjid)$/i.test(finalName.trim())) {
                const locality = street || suburb || city
                if (locality) {
                  finalName = `${finalName} (${locality})`
                }
              }

              const uniqueKey = `${mLat.toFixed(4)}_${mLon.toFixed(4)}`
              if (!itemsMap.has(uniqueKey)) {
                itemsMap.set(uniqueKey, {
                  id: el.id || uniqueKey,
                  name: finalName,
                  lat: mLat,
                  lon: mLon,
                  distance: dist,
                  address,
                  phone: tags.phone || tags["contact:phone"],
                  website: tags.website || tags["contact:website"],
                })
              }
            }
            if (elements.length > 0) break
          }
        } catch (mirrorErr) {
          // Continue gracefully
        }
      }
    }

    // Convert to sorted array (nearest first)
    const sorted = Array.from(itemsMap.values())
      .filter((m) => m.distance <= (radius / 1000) * 1.5)
      .sort((a, b) => a.distance - b.distance)

    // Cache the verified results
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
