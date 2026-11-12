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
  requestGpsLocation: () => Promise<boolean>
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

  // Request browser GPS position per strict specifications
  const requestGpsLocation = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false

    if (!navigator.geolocation) {
      setStatus("unavailable")
      setErrorMessage("Geolocation is not supported by your browser or device. Please select your location manually.")
      setIsReady(true)
      return false
    }

    setIsDetecting(true)
    setStatus("detecting")
    setErrorMessage(null)

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy: acc } = position.coords
          const newCoords = { latitude, longitude }

          setCoords(newCoords)
          setAccuracy(acc)
          setMethod("gps")

          try {
            const details = await reverseGeocodeCoordinates(latitude, longitude)
            setLocationDetails(details)
            persistLocation(newCoords, details, "gps", acc)
            toast.success(`GPS Location verified: ${details.city || "Coordinates detected"}`, {
              description: `Coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (±${Math.round(acc)}m)`,
            })
          } catch (err) {
            const fallbackDetails: LocationDetails = {
              city: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
              country: "",
              displayName: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
            }
            setLocationDetails(fallbackDetails)
            persistLocation(newCoords, fallbackDetails, "gps", acc)
          }

          setStatus("detected")
          setIsReady(true)
          setIsDetecting(false)
          resolve(true)
        },
        (error) => {
          let errorState: LocationStatus = "error"
          let msg = "Could not detect location. Please select manually."

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorState = "permission-denied"
              msg = "Location permission was denied in your browser. To enable it: click the lock/tune icon in your browser's address bar, set Location to 'Allow', and click Retry."
              break
            case error.POSITION_UNAVAILABLE:
              errorState = "unavailable"
              msg = "Location signal is unavailable from your device sensors. Please verify system location permissions or select your city manually."
              break
            case error.TIMEOUT:
              errorState = "unavailable"
              msg = "Location request timed out after 15 seconds. Please click Retry or search for your city manually."
              break
          }

          setStatus(errorState)
          setErrorMessage(msg)
          setIsReady(true)
          setIsDetecting(false)
          resolve(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      )
    })
  }, [])

  // Optional network IP fallback (invoked explicitly or as secondary choice)
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
        console.warn("Internal ip-location proxy failed, trying public IP fallback...", e)
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
          description: "You can click 'Search City' to refine with exact coordinates.",
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

  // Restore cached location on initial mount or query permission
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

    // Check browser permission status
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
    }
  }, [requestGpsLocation])

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
    toast.success(`Location set: ${details.city}`, {
      description: `Coordinates: ${suggestion.latitude.toFixed(4)}°N, ${suggestion.longitude.toFixed(4)}°E`,
    })
  }, [])

  // City search powered by geocoding
  const searchCities = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    return await searchLocationsQuery(query)
  }, [])

  // Clear / Switch location
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
