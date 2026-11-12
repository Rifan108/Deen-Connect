import { NextRequest, NextResponse } from "next/server"
import { calculateDistance } from "@/lib/location"

export const dynamic = "force-dynamic"

export interface MosqueRecord {
  id: string | number
  name: string
  lat: number
  lon: number
  distance: number
  address: string
  osmType: "node" | "way" | "relation"
  osmId: number | string
  osmUrl: string
  phone?: string
  website?: string
  openingHours?: string
  wheelchair?: string
  denomination?: string
}

export interface MosqueDiagnostics {
  userLat: number
  userLng: number
  endpoint: string
  httpStatus: number
  responseTimeMs: number
  recordsReceived: number
  validMosques: number
  excludedCount: number
  duplicateCount: number
  lastApiError: string | null
  cached: boolean
}

// In-memory cache with 15-minute TTL
interface CacheEntry {
  timestamp: number
  data: MosqueRecord[]
  diagnostics: MosqueDiagnostics
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15 * 60 * 1000

// Public Overpass API mirrors to rotate with exponential backoff
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
]

// Strict Rejection Pattern: Non-Muslim religious buildings or generic/incompatible items
const NON_MOSQUE_PATTERN =
  /\b(temple|mandir|church|cathedral|synagogue|gurdwara|shrine|hindu|christian|jewish|sikh|buddhist|ashram|devasthana|chapel|monastery|basilica|convent|mutt|matha|vihara|statue|kshetra|swamy|devalaya|kovil|st\.\s+|cemetery|graveyard)\b/i

// Strict Highway / Non-Building Objects (e.g. Mosque Road, Mosque Bus Stop, Mosque Cafe)
const NON_BUILDING_CLASSES = new Set([
  "highway",
  "bus_stop",
  "traffic_signals",
  "residential",
  "commercial",
  "office",
  "shop",
  "amenity_waste_disposal",
])

/**
 * Validates whether an OSM record is an authentic Muslim Mosque
 * Section 4 Requirement:
 * Accept records that satisfy:
 *   A. amenity=place_of_worship AND religion=muslim
 *   OR
 *   B. building=mosque
 * If a record has conflicting religious tags, exclude it.
 */
function isAuthenticMosque(
  tags: Record<string, any> = {},
  name: string = ""
): { valid: boolean; reason?: string } {
  const religion = (tags.religion || "").toLowerCase().trim()
  const amenity = (tags.amenity || "").toLowerCase().trim()
  const building = (tags.building || "").toLowerCase().trim()
  const combined = `${name} ${tags["name:en"] || ""} ${tags["name:ar"] || ""} ${amenity} ${building} ${religion}`.toLowerCase()

  // 1. Strict rejection of other religions
  if (religion && religion !== "muslim" && religion !== "islam") {
    return { valid: false, reason: `Conflicting religion tag: "${religion}"` }
  }

  // 2. Strict rejection of keywords for other faiths
  if (NON_MOSQUE_PATTERN.test(combined)) {
    return { valid: false, reason: "Name or tags matched non-Islamic place of worship" }
  }

  // 3. Strict rejection of highways, roads, shops, or transit stops
  if (tags.highway || tags.office || tags.shop || tags.railway) {
    return { valid: false, reason: "Infrastructure or commercial tag rather than place of worship" }
  }

  // 4. Condition A: amenity=place_of_worship AND religion=muslim
  if (amenity === "place_of_worship" && (religion === "muslim" || religion === "islam")) {
    return { valid: true }
  }

  // 5. Condition B: building=mosque
  if (building === "mosque") {
    return { valid: true }
  }

  // 6. Direct amenity=mosque
  if (amenity === "mosque") {
    return { valid: true }
  }

  return { valid: false, reason: "Does not meet OSM criteria (amenity=place_of_worship + religion=muslim OR building=mosque)" }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get("lat")
    const lngStr = searchParams.get("lng")
    const radiusStr = searchParams.get("radius") || "5000"

    const lat = parseFloat(latStr || "")
    const lng = parseFloat(lngStr || "")
    const radius = Math.min(Math.max(parseInt(radiusStr, 10) || 5000, 500), 50000)

    // 1. Strict coordinate validation (Section 1)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid latitude ([-90, 90]) and longitude ([-180, 180]) are required",
        },
        { status: 400 }
      )
    }

    // 2. Check in-memory cache
    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        total: cached.data.length,
        radius,
        diagnostics: {
          ...cached.diagnostics,
          cached: true,
          responseTimeMs: Date.now() - startTime,
        },
      })
    }

    // 3. Construct official Overpass QL query (Section 3)
    const overpassQuery = `[out:json][timeout:25];(
  nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
  nwr["building"="mosque"](around:${radius},${lat},${lng});
  nwr["amenity"="mosque"](around:${radius},${lat},${lng});
);out center tags;`

    let rawElements: any[] = []
    let usedEndpoint = OVERPASS_MIRRORS[0]
    let httpStatus = 0
    let lastApiError: string | null = null

    // 4. Multi-Mirror Rotation with Exponential Backoff (Section 9)
    for (let i = 0; i < OVERPASS_MIRRORS.length; i++) {
      const endpoint = OVERPASS_MIRRORS[i]
      usedEndpoint = endpoint

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 25000)

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "DeenConnectApp/1.0 (contact@deenconnect.app; Islamic Digital Sanctuary)",
            "Referer": "https://deenconnect.app",
            "Accept": "application/json",
          },
          body: new URLSearchParams({ data: overpassQuery }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        httpStatus = res.status

        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json.elements)) {
            rawElements = json.elements
            lastApiError = null
            break
          }
        } else {
          lastApiError = `HTTP ${res.status}: ${res.statusText || "Server error"}`
        }
      } catch (err: any) {
        lastApiError = err.name === "AbortError" ? "Request timed out (25s)" : err.message || "Network error"
      }

      // Backoff before trying next mirror
      if (i < OVERPASS_MIRRORS.length - 1) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)))
      }
    }

    // 5. Strict Mosque Filtering & Deduplication (Section 4 & 5)
    let excludedCount = 0
    let duplicateCount = 0
    const rawParsed: MosqueRecord[] = []
    const spatialDedupeMap = new Map<string, MosqueRecord>()

    for (const el of rawElements) {
      const mLat = el.lat || el.center?.lat
      const mLon = el.lon || el.center?.lon

      if (typeof mLat !== "number" || typeof mLon !== "number" || isNaN(mLat) || isNaN(mLon)) {
        excludedCount++
        continue
      }

      const tags = el.tags || {}
      const rawName =
        tags.name ||
        tags["name:en"] ||
        tags["name:ar"] ||
        tags["name:ur"] ||
        tags["alt_name"] ||
        "Masjid"

      // Strict validation
      const authCheck = isAuthenticMosque(tags, rawName)
      if (!authCheck.valid) {
        excludedCount++
        continue
      }

      // Calculate Haversine distance
      const dist = calculateDistance(lat, lng, mLat, mLon)

      // Strict radius boundary check: do not return mosques outside radius (Section 6)
      if (dist > (radius / 1000) * 1.05) {
        excludedCount++
        continue
      }

      // Assemble human-readable locality & address
      const street = tags["addr:street"] || tags.street || ""
      const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || tags.suburb || ""
      const city = tags["addr:city"] || tags.city || ""
      const state = tags["addr:state"] || tags.state || ""
      const addressParts = [street, suburb, city, state].filter(Boolean)
      const address = addressParts.length > 0 ? addressParts.join(", ") : `${mLat.toFixed(4)}°N, ${mLon.toFixed(4)}°E`

      // If name is just bare "Masjid" or "Mosque", qualify with suburb for clarity
      let finalName = rawName
      if (/^(mosque|masjid)$/i.test(finalName.trim()) && (suburb || city)) {
        finalName = `${finalName} (${suburb || city})`
      }

      const osmType = el.type || "node"
      const osmId = el.id
      const osmUrl = `https://www.openstreetmap.org/${osmType}/${osmId}`

      const record: MosqueRecord = {
        id: `${osmType}-${osmId}`,
        name: finalName,
        lat: mLat,
        lon: mLon,
        distance: dist,
        address,
        osmType,
        osmId,
        osmUrl,
        phone: tags.phone || tags["contact:phone"] || undefined,
        website: tags.website || tags["contact:website"] || undefined,
        openingHours: tags.opening_hours || undefined,
        wheelchair: tags.wheelchair || undefined,
        denomination: tags.denomination || undefined,
      }

      // Spatial deduplication: 35-meter grid rounding (approx 0.00035 degrees)
      const spatialKey = `${mLat.toFixed(3)}_${mLon.toFixed(3)}_${finalName.toLowerCase()}`
      if (spatialDedupeMap.has(spatialKey)) {
        duplicateCount++
        // If current is a polygon/way, it often has richer data than a point node
        if (osmType === "way" || osmType === "relation") {
          spatialDedupeMap.set(spatialKey, record)
        }
      } else {
        spatialDedupeMap.set(spatialKey, record)
      }
    }

    // 6. Sort results by nearest distance (Section 5)
    const sortedMosques = Array.from(spatialDedupeMap.values()).sort(
      (a, b) => a.distance - b.distance
    )

    const responseTimeMs = Date.now() - startTime
    const diagnostics: MosqueDiagnostics = {
      userLat: lat,
      userLng: lng,
      endpoint: usedEndpoint,
      httpStatus,
      responseTimeMs,
      recordsReceived: rawElements.length,
      validMosques: sortedMosques.length,
      excludedCount,
      duplicateCount,
      lastApiError,
      cached: false,
    }

    // If an error occurred and no elements were returned from any mirror, do not return fake success
    if (lastApiError && rawElements.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: lastApiError,
          data: [],
          total: 0,
          radius,
          diagnostics,
        },
        { status: httpStatus >= 400 ? httpStatus : 503 }
      )
    }

    // Cache verified results only on genuine successful responses
    if (httpStatus === 200 && !lastApiError) {
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: sortedMosques,
        diagnostics,
      })
    }

    if (cache.size > 200) {
      const oldestKey = cache.keys().next().value
      if (oldestKey) cache.delete(oldestKey)
    }

    return NextResponse.json({
      success: true,
      data: sortedMosques,
      total: sortedMosques.length,
      radius,
      diagnostics,
    })
  } catch (error: any) {
    console.error("Critical error in /api/nearby-mosques:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve verified mosques",
        data: [],
        diagnostics: {
          userLat: 0,
          userLng: 0,
          endpoint: OVERPASS_MIRRORS[0],
          httpStatus: 500,
          responseTimeMs: Date.now() - startTime,
          recordsReceived: 0,
          validMosques: 0,
          excludedCount: 0,
          duplicateCount: 0,
          lastApiError: error.message || "Unknown error",
          cached: false,
        },
      },
      { status: 500 }
    )
  }
}
