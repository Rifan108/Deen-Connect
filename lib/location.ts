/**
 * Location utilities for Deen Connect
 * Verified geographic calculations and Nominatim Geocoding
 */

// Holy Kaaba Coordinates (Mecca, Saudi Arabia)
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
 * Uses spherical trigonometry:
 *   Δλ = λ2 - λ1
 *   y = sin(Δλ) * cos(φ2)
 *   x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
 *   bearing = atan2(y, x) (in degrees, normalized to [0, 360))
 */
export function calculateQibla(latitude: number, longitude: number): number {
  const phi1 = (latitude * Math.PI) / 180
  const lambda1 = (longitude * Math.PI) / 180
  const phi2 = (KAABA_COORDINATES.latitude * Math.PI) / 180
  const lambda2 = (KAABA_COORDINATES.longitude * Math.PI) / 180

  const deltaLambda = lambda2 - lambda1

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  const bearingRad = Math.atan2(y, x)
  const bearingDeg = (bearingRad * 180) / Math.PI

  return (bearingDeg + 360) % 360
}

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
 * Distance from any coordinate to the Kaaba in kilometers
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
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(bearing / 22.5) % 16
  return directions[index]
}

/**
 * Reverse geocodes coordinates to human readable location details using OpenStreetMap Nominatim
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<LocationDetails> {
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
    "Current Location"

  const district = address.suburb || address.neighbourhood || address.district
  const state = address.state || address.province || address.region
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
 * Search cities or places worldwide via Nominatim geocoding service
 */
export async function searchLocationsQuery(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.trim().length < 2) return []

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query.trim()
  )}&limit=8&accept-language=en&addressdetails=1`

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
      district: address.suburb || address.neighbourhood || address.district,
      state: address.state || address.region,
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
