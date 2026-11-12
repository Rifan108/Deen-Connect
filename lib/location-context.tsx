"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { toast } from "sonner"
import {
  reverseGeocodeCoordinates,
  searchLocationsQuery,
  type LocationSuggestion,
  type LocationDetails,
} from "./location"

export type LocationStatus =
  | "idle"
  | "detecting"
  | "detected"
  | "permission-required"
  | "permission-denied"
  | "unavailable"
  | "error"
  | "manual"

export interface Coordinates {
  latitude: number
  longitude: number
}

interface LocationContextType {
  status: LocationStatus
  coords: Coordinates | null
  locationDetails: LocationDetails | null
  accuracy: number | null
  method: "gps" | "ip" | "manual" | null
  errorMessage: string | null
  isReady: boolean
  isDetecting: boolean
  requestGpsLocation: (highAccuracy?: boolean) => Promise<boolean>
  detectIpLocation: () => Promise<boolean>
  setManualLocation: (suggestion: LocationSuggestion) => Promise<void>
  searchCities: (query: string) => Promise<LocationSuggestion[]>
  clearLocation: () => void
}

const STORAGE_KEY = "deen_connect_verified_location"

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>("idle")
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [method, setMethod] = useState<"gps" | "ip" | "manual" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)

  // Persist location to localStorage
  const persistLocation = (
    c: Coordinates,
    details: LocationDetails,
    m: "gps" | "ip" | "manual",
    acc: number | null
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          coords: c,
          details,
          method: m,
          accuracy: acc,
          timestamp: Date.now(),
        })
      )
    } catch (e) {
      console.error("Failed to persist location", e)
    }
  }

  // Detect location via Network IP (Fast, resilient fallback)
  const detectIpLocation = useCallback(async (): Promise<boolean> => {
    try {
      setIsDetecting(true)
      setStatus("detecting")
      setErrorMessage(null)

      // Try internal Next.js API proxy first
      let resolvedData: any = null

      try {
        const res = await fetch("/api/ip-location", {
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.coords) {
            resolvedData = json
          }
        }
      } catch (err) {
        console.warn("Local /api/ip-location route failed, trying direct public IP API...", err)
      }

      // If internal proxy failed, fallback to direct client call to freeipapi
      if (!resolvedData) {
        try {
          const directRes = await fetch("https://freeipapi.com/api/json", {
            signal: AbortSignal.timeout(5000),
          })
          if (directRes.ok) {
            const data = await directRes.json()
            const lat = parseFloat(data.latitude)
            const lon = parseFloat(data.longitude)
            if (!isNaN(lat) && !isNaN(lon) && lat !== 0) {
              const city = data.cityName || "Current Location"
              const state = data.regionName || ""
              const country = data.countryName || ""
              resolvedData = {
                coords: { latitude: lat, longitude: lon },
                locationDetails: {
                  city,
                  district: "",
                  state,
                  country,
                  displayName: [city, state, country].filter(Boolean).join(", "),
                },
              }
            }
          }
        } catch (directErr) {
          console.warn("Direct freeipapi client fetch failed:", directErr)
        }
      }

      // If resolved
      if (resolvedData?.coords) {
        const newCoords = resolvedData.coords
        const details = resolvedData.locationDetails

        setCoords(newCoords)
        setLocationDetails(details)
        setMethod("ip")
        setAccuracy(null)
        setStatus("detected")
        setIsReady(true)
        setIsDetecting(false)

        persistLocation(newCoords, details, "ip", null)
        return true
      }

      setStatus("unavailable")
      setErrorMessage("Network location unavailable. Please select your city manually.")
      setIsReady(true)
      setIsDetecting(false)
      return false
    } catch (e: any) {
      console.error("IP location detection error:", e)
      setStatus("unavailable")
      setErrorMessage("Could not detect location. Please search for your city.")
      setIsReady(true)
      setIsDetecting(false)
      return false
    }
  }, [])

  // Request browser GPS position with intelligent multi-stage fallback
  const requestGpsLocation = useCallback(
    async (highAccuracy = false): Promise<boolean> => {
      if (typeof window === "undefined") return false

      setIsDetecting(true)
      setStatus("detecting")
      setErrorMessage(null)

      // If browser doesn't have geolocation at all
      if (!navigator.geolocation) {
        console.warn("Browser geolocation unsupported, falling back to IP...")
        const ipSuccess = await detectIpLocation()
        if (ipSuccess) {
          toast.info("Device GPS unsupported. Location detected via your network connection.")
        }
        return ipSuccess
      }

      // Helper function to query browser geolocation
      const attemptBrowserGeo = (useHighAcc: boolean, timeoutMs: number): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: useHighAcc,
            timeout: timeoutMs,
            maximumAge: 60000,
          })
        })
      }

      try {
        let position: GeolocationPosition | null = null

        // Attempt 1: Fast Wi-Fi / cell triangulation (low accuracy, works reliably on laptops)
        try {
          position = await attemptBrowserGeo(false, 5000)
        } catch (firstErr: any) {
          console.warn("Low-accuracy geolocation failed, checking high-accuracy...", firstErr)

          // If permission explicitly denied by user, don't keep polling browser
          if (firstErr?.code === 1 /* PERMISSION_DENIED */) {
            console.warn("User or browser denied location permission. Falling back to IP...")
            const ipSuccess = await detectIpLocation()
            if (ipSuccess) {
              toast.info("Browser location permission was denied. Location detected via network IP.", {
                description: "You can click 'Search City' to refine your exact location.",
              })
              return true
            } else {
              setStatus("permission-denied")
              setErrorMessage("Location permission was denied. Please select your location manually.")
              setIsReady(true)
              setIsDetecting(false)
              return false
            }
          }

          // Attempt 2: Try high accuracy (satellite GPS lock, works on mobile)
          try {
            position = await attemptBrowserGeo(true, 5000)
          } catch (secondErr) {
            console.warn("High-accuracy geolocation also failed:", secondErr)
          }
        }

        // If browser geolocation succeeded
        if (position?.coords) {
          const { latitude, longitude, accuracy: acc } = position.coords
          const newCoords = { latitude, longitude }

          setCoords(newCoords)
          setAccuracy(acc)
          setMethod("gps")

          try {
            const details = await reverseGeocodeCoordinates(latitude, longitude)
            setLocationDetails(details)
            persistLocation(newCoords, details, "gps", acc)
            toast.success(`Exact GPS located: ${details.city || "Current Location"}`, {
              description: `Accuracy: ±${Math.round(acc)}m`,
            })
          } catch (err) {
            const fallbackDetails: LocationDetails = {
              city: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
              country: "",
              displayName: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
            }
            setLocationDetails(fallbackDetails)
            persistLocation(newCoords, fallbackDetails, "gps", acc)
          }

          setStatus("detected")
          setIsReady(true)
          setIsDetecting(false)
          return true
        }

        // If both browser attempts failed (typical on desktop without GPS or Windows Location disabled)
        console.warn("Browser GPS unavailable on this device. Triggering IP geolocation fallback...")
        const ipSuccess = await detectIpLocation()
        if (ipSuccess) {
          toast.info("Device GPS signal unavailable. Location detected via network connection.", {
            description: "Click 'Search City' if you need to adjust coordinates.",
          })
          return true
        }

        setStatus("unavailable")
        setErrorMessage("Location signal unavailable. Please choose your city manually.")
        setIsReady(true)
        setIsDetecting(false)
        return false
      } catch (err: any) {
        console.error("Unexpected error in requestGpsLocation:", err)
        const ipSuccess = await detectIpLocation()
        if (ipSuccess) return true

        setStatus("error")
        setErrorMessage("Could not detect location. Please select manually.")
        setIsReady(true)
        setIsDetecting(false)
        return false
      }
    },
    [detectIpLocation]
  )

  // Restore cached location on initial mount or auto-detect via IP
  useEffect(() => {
    if (typeof window === "undefined") return

    let cancelled = false

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.coords && parsed.coords.latitude && parsed.coords.longitude) {
          setCoords(parsed.coords)
          setLocationDetails(parsed.details || null)
          setMethod(parsed.method || "manual")
          setAccuracy(parsed.accuracy || null)
          setStatus(parsed.method === "gps" || parsed.method === "ip" ? "detected" : "manual")
          setIsReady(true)
          return
        }
      }
    } catch (e) {
      console.warn("Failed to read cached location", e)
    }

    // If no cached location, check permissions first
    if (navigator?.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (cancelled) return
          if (result.state === "granted") {
            requestGpsLocation(false)
          } else {
            // Auto-detect via IP silently on first visit so user gets immediate prayer times
            detectIpLocation()
          }
        })
        .catch(() => {
          if (!cancelled) detectIpLocation()
        })
    } else {
      detectIpLocation()
    }

    return () => {
      cancelled = true
    }
  }, [detectIpLocation, requestGpsLocation])

  // Set location manually from geocoded suggestion
  const setManualLocation = useCallback(async (suggestion: LocationSuggestion) => {
    setIsDetecting(false)
    setErrorMessage(null)

    const newCoords: Coordinates = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }

    const details: LocationDetails = {
      city: suggestion.city || suggestion.name.split(",")[0].trim(),
      district: suggestion.district,
      state: suggestion.state,
      country: suggestion.country || "",
      displayName: suggestion.name,
    }

    setCoords(newCoords)
    setLocationDetails(details)
    setMethod("manual")
    setAccuracy(null)
    setStatus("manual")
    setIsReady(true)

    persistLocation(newCoords, details, "manual", null)
    toast.success(`Location set: ${details.city}`)
  }, [])

  // City search powered by geocoding
  const searchCities = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    return await searchLocationsQuery(query)
  }, [])

  // Clear location
  const clearLocation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setCoords(null)
    setLocationDetails(null)
    setAccuracy(null)
    setMethod(null)
    setStatus("permission-required")
    setErrorMessage(null)
  }, [])

  return (
    <LocationContext.Provider
      value={{
        status,
        coords,
        locationDetails,
        accuracy,
        method,
        errorMessage,
        isReady,
        isDetecting,
        requestGpsLocation,
        detectIpLocation,
        setManualLocation,
        searchCities,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
