"use client"

export interface CachedCoords {
  latitude: number
  longitude: number
  city?: string
  country?: string
  method?: "gps" | "ip" | "manual"
  timestamp: number
}

const CACHE_KEY = "deen_connect_coords"
const CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes cache

export function getCachedLocation(): CachedCoords | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: CachedCoords = JSON.parse(raw)
    const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY
    if (isExpired) {
      // Return expired but don't delete immediately so it can serve as a secondary fallback
      return parsed
    }
    return parsed
  } catch (e) {
    console.error("Error reading cached coordinates", e)
    return null
  }
}

export function setCachedLocation(latitude: number, longitude: number, city?: string, country?: string, method?: "gps" | "ip" | "manual") {
  if (typeof window === "undefined") return
  try {
    const cacheData: CachedCoords = {
      latitude,
      longitude,
      city,
      country,
      method,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    // Dispatch global event for other components to react in real-time
    window.dispatchEvent(new Event("deen_connect_location_updated"))
  } catch (e) {
    console.error("Error writing coordinates cache", e)
  }
}

export function getUserLocation(options?: PositionOptions & { ignoreCache?: boolean }): Promise<{ latitude: number; longitude: number; city?: string; country?: string; method?: "gps" | "ip" | "manual" }> {
  return new Promise(async (resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window context not available"))
      return
    }

    if (!options?.ignoreCache) {
      const cached = getCachedLocation()
      // If the cache is valid and not older than CACHE_EXPIRY, use it immediately
      if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
        resolve({
          latitude: cached.latitude,
          longitude: cached.longitude,
          city: cached.city,
          country: cached.country,
          method: cached.method || "gps"
        })
        return
      }
    }

    // Try HTML5 Geolocation API first
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: options?.ignoreCache ? 0 : 60000,
            ...options,
          })
        })
        const { latitude, longitude } = position.coords
        
        // Keep cached city/country if coordinates didn't change much
        const cached = getCachedLocation()
        const isClose = cached && Math.abs(cached.latitude - latitude) < 0.05 && Math.abs(cached.longitude - longitude) < 0.05
        const city = isClose ? cached.city : undefined
        const country = isClose ? cached.country : undefined
        
        setCachedLocation(latitude, longitude, city, country, "gps")
        resolve({ latitude, longitude, city, country, method: "gps" })
        return
      } catch (err) {
        console.warn("Browser geolocation failed, attempting IP Geolocation fallback...", err)
      }
    }

    // Fallback: IP Geolocation (ipapi.co)
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) })
      if (res.ok) {
        const data = await res.json()
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude)
          const lon = parseFloat(data.longitude)
          const city = data.city || ""
          const country = data.country_name || ""
          setCachedLocation(lat, lon, city, country, "ip")
          resolve({ latitude: lat, longitude: lon, city, country, method: "ip" })
          return
        }
      }
    } catch (e) {
      console.warn("IP Geolocation API failed:", e)
    }

    // Fallback to expired cache if we have one (since it's better than hardcoded Riyadh)
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed: CachedCoords = JSON.parse(raw)
        resolve({
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          city: parsed.city,
          country: parsed.country,
          method: parsed.method || "manual"
        })
        return
      }
    } catch (e) {
      console.error("Failed to read expired cache fallback", e)
    }

    // Ultimate fallback (Riyadh defaults)
    const fallbackLat = 24.7136
    const fallbackLon = 46.6753
    resolve({
      latitude: fallbackLat,
      longitude: fallbackLon,
      city: "Riyadh",
      country: "Saudi Arabia",
      method: "ip"
    })
  })
}

export interface LocationSuggestion {
  name: string
  latitude: number
  longitude: number
  city?: string
  country?: string
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.trim().length < 2) return []
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en&addressdetails=1`
    const res = await fetch(url, {
      headers: { "User-Agent": "DeenConnect/1.0" },
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.map((item: any) => {
      const name = item.display_name
      const latitude = parseFloat(item.lat)
      const longitude = parseFloat(item.lon)
      
      const address = item.address || {}
      const city = address.city || address.town || address.village || address.suburb || ""
      const country = address.country || ""
      
      return { name, latitude, longitude, city, country }
    })
  } catch (e) {
    console.error("Failed to search locations using Nominatim:", e)
    return []
  }
}


export function calculateQibla(lat: number, lon: number): number {
  // Mecca coordinates (ISNA verified source)
  const meccaLat = 21.4225
  const meccaLon = 39.8262

  const latRad = (lat * Math.PI) / 180
  const lonDiff = ((meccaLon - lon) * Math.PI) / 180
  const meccaLatRad = (meccaLat * Math.PI) / 180

  const y = Math.sin(lonDiff) * Math.cos(meccaLatRad)
  const x = Math.cos(latRad) * Math.sin(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLatRad) * Math.cos(lonDiff)

  let angle = (Math.atan2(y, x) * 180) / Math.PI
  return (angle + 360) % 360
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getCompassDirection(heading: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  const index = Math.round(heading / 45) % 8
  return directions[index]
}

export function convertTo12Hour(time24: string): string {
  if (!time24) return ""
  // Remove any bracket details like "(EEST)" if present in the response
  const baseTime = time24.split(" ")[0]
  const [hoursStr, minutesStr] = baseTime.split(":")
  let hours = parseInt(hoursStr, 10)
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  return `${hours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`
}
