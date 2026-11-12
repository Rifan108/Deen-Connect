"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react"
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
  isWatching: boolean
  lastUpdated: number | null
  requestGpsLocation: () => Promise<boolean>
  startWatchingGps: () => void
  stopWatchingGps: () => void
  detectIpLocation: () => Promise<boolean>
  setManualLocation: (suggestion: LocationSuggestion) => Promise<void>
  searchCities: (query: string) => Promise<LocationSuggestion[]>
  clearLocation: () => void
  retryLocation: () => Promise<boolean>
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
  const [isWatching, setIsWatching] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const watchIdRef = useRef<number | null>(null)

  // Persist location to localStorage
  const persistLocation = (
    c: Coordinates,
    details: LocationDetails,
    m: "gps" | "ip" | "manual",
    acc: number | null
  ) => {
    try {
      const now = Date.now()
      setLastUpdated(now)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          coords: c,
          details,
          method: m,
          accuracy: acc,
          timestamp: now,
        })
      )
    } catch (e) {
      console.warn("Failed to persist location", e)
    }
  }

  // Handle successful position result
  const handlePositionSuccess = async (position: GeolocationPosition, sourceMethod: "gps" = "gps") => {
    const { latitude, longitude, accuracy: acc } = position.coords

    // Coordinate validation
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setStatus("error")
      setErrorMessage("Received invalid GPS coordinates from browser sensor.")
      setIsDetecting(false)
      return false
    }

    const newCoords: Coordinates = { latitude, longitude }
    setCoords(newCoords)
    setAccuracy(acc)
    setMethod(sourceMethod)
    setStatus("detected")
    setErrorMessage(null)

    try {
      const details = await reverseGeocodeCoordinates(latitude, longitude)
      setLocationDetails(details)
      persistLocation(newCoords, details, sourceMethod, acc)
      toast.success(`GPS Location verified: ${details.city}`, {
        description: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (±${Math.round(acc)}m)`,
      })
    } catch (err) {
      const fallbackDetails: LocationDetails = {
        city: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
        country: "",
        displayName: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
      }
      setLocationDetails(fallbackDetails)
      persistLocation(newCoords, fallbackDetails, sourceMethod, acc)
    }

    setIsReady(true)
    setIsDetecting(false)
    return true
  }

  // Request browser GPS position with high-accuracy and smart Wi-Fi fallback
  const requestGpsLocation = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false

    // 1. Verify secure context
    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setStatus("unavailable")
      setErrorMessage(
        "Browser Geolocation is restricted to HTTPS origins or localhost. Please access via https:// or select your city manually."
      )
      setIsReady(true)
      setIsDetecting(false)
      return false
    }

    // 2. Verify navigator.geolocation API
    if (!navigator.geolocation) {
      setStatus("unavailable")
      setErrorMessage("Geolocation API is not supported by your browser. Please search and select your city manually.")
      setIsReady(true)
      setIsDetecting(false)
      return false
    }

    setIsDetecting(true)
    setStatus("detecting")
    setErrorMessage(null)

    // Tier 1: Try High-Accuracy satellite GPS (timeout 9s)
    const tryHighAccuracy = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 0,
        })
      })
    }

    // Tier 2: Try Low-Accuracy Wi-Fi / Cell tower triangulation (timeout 8s)
    const tryLowAccuracy = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        })
      })
    }

    try {
      const pos = await tryHighAccuracy()
      return await handlePositionSuccess(pos, "gps")
    } catch (err1: any) {
      // If permission was denied by user, do not retry - report directly
      if (err1.code === err1.PERMISSION_DENIED) {
        setStatus("permission-denied")
        setErrorMessage(
          "Location permission was denied. To enable it: click the padlock/tune icon in your browser's address bar, set Location to 'Allow', and click Retry."
        )
        setIsReady(true)
        setIsDetecting(false)
        return false
      }

      // If timed out or hardware GPS unavailable, attempt Tier 2 Wi-Fi positioning
      try {
        const pos2 = await tryLowAccuracy()
        return await handlePositionSuccess(pos2, "gps")
      } catch (err2: any) {
        let errorState: LocationStatus = "unavailable"
        let msg = "Could not retrieve GPS coordinates. Please select your city manually."

        if (err2.code === err2.PERMISSION_DENIED) {
          errorState = "permission-denied"
          msg = "Location permission is blocked in browser settings. Please allow location access or choose your city manually."
        } else if (err2.code === err2.TIMEOUT) {
          errorState = "unavailable"
          msg = "Location request timed out. Your device GPS could not obtain a satellite lock. Please click Retry or select your city manually."
        } else if (err2.code === err2.POSITION_UNAVAILABLE) {
          errorState = "unavailable"
          msg = "Location signal unavailable from device sensors. Verify that device location services are enabled in OS settings, or choose your city manually."
        }

        setStatus(errorState)
        setErrorMessage(msg)
        setIsReady(true)
        setIsDetecting(false)
        return false
      }
    }
  }, [])

  // Start Continuous GPS Watch
  const startWatchingGps = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    setIsWatching(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handlePositionSuccess(position, "gps")
      },
      (error) => {
        console.warn("GPS watch update error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    )
  }, [])

  // Stop Continuous GPS Watch
  const stopWatchingGps = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsWatching(false)
  }, [])

  // Fallback network IP detection
  const detectIpLocation = useCallback(async (): Promise<boolean> => {
    try {
      setIsDetecting(true)
      setStatus("detecting")
      setErrorMessage(null)

      let resolvedData: any = null

      try {
        const res = await fetch("/api/ip-location", { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.coords) resolvedData = json
        }
      } catch (e) {
        console.warn("Internal ip-location proxy failed", e)
      }

      if (!resolvedData) {
        try {
          const directRes = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(5000) })
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
                  state,
                  country,
                  displayName: [city, state, country].filter(Boolean).join(", "),
                },
              }
            }
          }
        } catch {}
      }

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
        toast.info(`Location detected via network: ${details.city}`, {
          description: "For higher precision, enable device GPS or search your exact locality.",
        })
        return true
      }

      setStatus("unavailable")
      setErrorMessage("Network location unavailable. Please choose your city manually.")
      setIsReady(true)
      setIsDetecting(false)
      return false
    } catch {
      setStatus("unavailable")
      setErrorMessage("Could not detect location. Please search for your city.")
      setIsReady(true)
      setIsDetecting(false)
      return false
    }
  }, [])

  // Restore cached location on initial mount or query browser permission
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
          setLastUpdated(parsed.timestamp || null)
          setIsReady(true)
          return
        }
      }
    } catch (e) {
      console.warn("Failed to read cached location", e)
    }

    // Check browser permission status if available
    if (navigator?.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (cancelled) return
          if (result.state === "granted") {
            requestGpsLocation()
          } else if (result.state === "denied") {
            setStatus("permission-denied")
            setErrorMessage("Location permission is currently blocked in your browser settings. Please allow location or select your city manually.")
            setIsReady(true)
          } else {
            setStatus("permission-required")
            setIsReady(true)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setStatus("permission-required")
            setIsReady(true)
          }
        })
    } else {
      setStatus("permission-required")
      setIsReady(true)
    }

    return () => {
      cancelled = true
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [requestGpsLocation])

  // Set location manually from geocoded suggestion
  const setManualLocation = useCallback(async (suggestion: LocationSuggestion) => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      setIsWatching(false)
    }

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
    toast.success(`Location set: ${details.city}`, {
      description: `${suggestion.latitude.toFixed(4)}°N, ${suggestion.longitude.toFixed(4)}°E`,
    })
  }, [])

  // City search powered by geocoding
  const searchCities = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    return await searchLocationsQuery(query)
  }, [])

  // Clear / Switch location
  const clearLocation = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      setIsWatching(false)
    }
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setCoords(null)
    setLocationDetails(null)
    setAccuracy(null)
    setMethod(null)
    setStatus("permission-required")
    setErrorMessage(null)
    setLastUpdated(null)
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
        isWatching,
        lastUpdated,
        requestGpsLocation,
        startWatchingGps,
        stopWatchingGps,
        detectIpLocation,
        setManualLocation,
        searchCities,
        clearLocation,
        retryLocation: requestGpsLocation,
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
