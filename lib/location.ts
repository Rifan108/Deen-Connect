/**
 * Location utilities for Deen Connect
 * Verified geographic calculations, great-circle Qibla bearing, and Geocoding
 */

// Holy Kaaba Coordinates (Makkah, Saudi Arabia)
export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
}

export interface LocationDetails {
  city: string
  district?: string
  state?: string
  country: string
  displayName: string
}

export interface LocationSuggestion {
  name: string
  latitude: number
  longitude: number
  city?: string
  district?: string
  state?: string
  country?: string
}

/**
 * Great-circle initial bearing to Holy Kaaba in degrees (0–360)
 * Uses high-precision spherical trigonometry:
 *   φ1 = user latitude in radians
 *   φ2 = Kaaba latitude in radians
 *   Δλ = (Kaaba longitude - user longitude) normalized to [-π, π]
 *
 *   y = sin(Δλ) * cos(φ2)
 *   x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
 *   bearing = atan2(y, x) normalized to [0, 360)
 */
export function calculateQibla(latitude: number, longitude: number): number {
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Coordinates must be valid numbers")
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Coordinates out of range: latitude [-90, 90], longitude [-180, 180]")
  }

  const phi1 = (latitude * Math.PI) / 180
  const phi2 = (KAABA_COORDINATES.latitude * Math.PI) / 180

  // Shortest geodesic path: normalize longitude difference to [-180, 180] degrees
  let diffDeg = KAABA_COORDINATES.longitude - longitude
  diffDeg = (((diffDeg + 180) % 360 + 360) % 360) - 180
  const deltaLambda = (diffDeg * Math.PI) / 180

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  const bearingRad = Math.atan2(y, x)
  const bearingDeg = (bearingRad * 180) / Math.PI

  return (bearingDeg + 360) % 360
}

/**
 * Alias for calculateQibla
 */
export const calculateQiblaDirection = calculateQibla

/**
 * Haversine distance formula between two geographic coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0088 // Earth's mean radius in km
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

/**
 * Straight-line geodesic distance from user coordinate to Kaaba in kilometers
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  return calculateDistance(
    latitude,
    longitude,
    KAABA_COORDINATES.latitude,
    KAABA_COORDINATES.longitude
  )
}

/**
 * Cardinal / Intercardinal direction representation from bearing
 */
export function getCompassDirection(bearing: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ]
  const index = Math.round(bearing / 22.5) % 16
  return directions[index]
}

/**
 * Reverse geocodes coordinates to human readable location details
 * Queries internal caching proxy with direct OSM fallback
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<LocationDetails> {
  // Try internal server proxy first
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lon}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      }
    }
  } catch (proxyErr) {
    // Continue to direct fallback
  }

  // Direct Nominatim fallback
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`

  const res = await fetch(url, {
    headers: {
      "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary; contact@deenconnect.app)",
      "Accept-Language": "en",
    },
    signal: AbortSignal.timeout(6000),
  })

  if (!res.ok) {
    throw new Error(`Reverse geocode failed with HTTP ${res.status}`)
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
    `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`

  const district = address.suburb || address.neighbourhood || address.district || ""
  const state = address.state || address.province || address.region || ""
  const country = address.country || ""

  return {
    city,
    district,
    state,
    country,
    displayName: data.display_name || `${city}, ${country}`,
  }
}

/**
 * Search cities or places worldwide via geocoding service
 * Queries internal caching proxy with direct OSM fallback
 */
export async function searchLocationsQuery(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.trim().length < 2) return []

  // Try internal proxy first
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data
      }
    }
  } catch (proxyErr) {
    // Continue to direct fallback
  }

  // Direct fallback
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query.trim()
  )}&limit=10&accept-language=en&addressdetails=1`

  const res = await fetch(url, {
    headers: {
      "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary; contact@deenconnect.app)",
      "Accept-Language": "en",
    },
    signal: AbortSignal.timeout(6000),
  })

  if (!res.ok) return []

  const data = await res.json()
  if (!Array.isArray(data)) return []

  return data.map((item: any) => {
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
}

/**
 * Helper to convert 24h format "17:45" to 12h format "05:45 PM"
 */
export function convertTo12Hour(time24: string): string {
  if (!time24) return ""
  const baseTime = time24.split(" ")[0]
  const [hoursStr, minutesStr] = baseTime.split(":")
  let hours = parseInt(hoursStr, 10)
  if (isNaN(hours)) return time24
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12
  return `${hours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`
}
