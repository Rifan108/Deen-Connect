"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import {
  calculateQibla,
  calculateDistance,
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
  method: "gps" | "manual" | null
  errorMessage: string | null
  isReady: boolean
  requestGpsLocation: (highAccuracy?: boolean) => Promise<boolean>
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
  const [method, setMethod] = useState<"gps" | "manual" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Save to localStorage whenever verified coords change
  const persistLocation = (
    c: Coordinates,
    details: LocationDetails,
    m: "gps" | "manual",
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

  // Restore cached location on initial mount if recent (within 24 hours)
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.coords && parsed.coords.latitude && parsed.coords.longitude) {
          setCoords(parsed.coords)
          setLocationDetails(parsed.details || null)
          setMethod(parsed.method || "manual")
          setAccuracy(parsed.accuracy || null)
          setStatus(parsed.method === "gps" ? "detected" : "manual")
          setIsReady(true)
          return
        }
      }
    } catch (e) {
      console.warn("Failed to read cached location", e)
    }

    // If no previous location, check browser permission state
    if (navigator?.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (result.state === "granted") {
            requestGpsLocation(false)
          } else if (result.state === "denied") {
            setStatus("permission-denied")
            setErrorMessage("Location permission is denied in your browser settings. Please choose a city manually.")
            setIsReady(true)
          } else {
            setStatus("permission-required")
            setIsReady(true)
          }
        })
        .catch(() => {
          setStatus("permission-required")
          setIsReady(true)
        })
    } else {
      setStatus("permission-required")
      setIsReady(true)
    }
  }, [])

  // Request browser GPS position
  const requestGpsLocation = useCallback(async (highAccuracy = true): Promise<boolean> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unavailable")
      setErrorMessage("Geolocation is not supported by your browser or device.")
      setIsReady(true)
      return false
    }

    setStatus("detecting")
    setErrorMessage(null)

    return new Promise((resolve) => {
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
          } catch (err) {
            console.warn("Reverse geocode failed, using coordinates", err)
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
          resolve(true)
        },
        (error) => {
          console.warn("Geolocation error:", error)
          let errorState: LocationStatus = "error"
          let msg = "Could not detect location."

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorState = "permission-denied"
              msg = "Location permission was denied. Please select your location manually below."
              break
            case error.POSITION_UNAVAILABLE:
              errorState = "unavailable"
              msg = "Location signal is currently unavailable from your device."
              break
            case error.TIMEOUT:
              errorState = "unavailable"
              msg = "Location request timed out. Please try again or select manually."
              break
          }

          setStatus(errorState)
          setErrorMessage(msg)
          setIsReady(true)
          resolve(false)
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: 30000,
        }
      )
    })
  }, [])

  // Set location manually from geocoded suggestion
  const setManualLocation = useCallback(async (suggestion: LocationSuggestion) => {
    setStatus("detecting")
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
        requestGpsLocation,
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
