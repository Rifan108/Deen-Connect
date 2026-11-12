"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import {
  MapPin,
  Phone,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Navigation,
  Compass,
  Layers,
  Map,
  List,
  Globe,
} from "lucide-react"
import { useLocation } from "@/lib/location-context"
import { calculateDistance } from "@/lib/location"
import { LocationSelectorDialog } from "@/components/location-selector-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MapMosque } from "./mosque-map"

// Dynamic import Leaflet map to prevent SSR window reference error
const MosqueMap = dynamic(() => import("./mosque-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[480px] rounded-3xl bg-muted/40 animate-pulse flex items-center justify-center text-xs text-muted-foreground border border-border">
      <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
      Loading OpenStreetMap Navigation...
    </div>
  ),
})

export interface MosqueRecord {
  id: number
  name: string
  distance: number
  address: string
  phone?: string
  website?: string
  lat: number
  lon: number
}

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
]

export default function NearbyMosques() {
  const {
    coords,
    locationDetails,
    status,
    method,
    isDetecting,
    errorMessage,
    requestGpsLocation,
    detectIpLocation,
  } = useLocation()

  const [radius, setRadius] = useState<number>(5000) // Default 5 km
  const [mosques, setMosques] = useState<MosqueRecord[]>([])
  const [selectedMosque, setSelectedMosque] = useState<MosqueRecord | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split")

  // Fetch real mosques from internal API proxy (with Nominatim & Overpass failover)
  const fetchMosques = useCallback(async () => {
    if (!coords) {
      setMosques([])
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setSelectedMosque(null)

    try {
      const { latitude, longitude } = coords
      const res = await fetch(
        `/api/nearby-mosques?lat=${latitude}&lng=${longitude}&radius=${radius}`
      )
      if (!res.ok) {
        throw new Error(`Server responded with HTTP ${res.status}`)
      }

      const json = await res.json()
      const items: MosqueRecord[] = (json.data || []).map((el: any) => ({
        id: el.id,
        name: el.name,
        distance: el.distance,
        address: el.address,
        phone: el.phone,
        website: el.website,
        lat: el.lat,
        lon: el.lon,
      }))

      setMosques(items)

      if (items.length > 0) {
        setSelectedMosque(items[0])
      }
    } catch (err: any) {
      console.warn("Could not query nearby mosques:", err)
      setErrorMsg(
        "Could not load nearby mosques for this radius. Please try widening your search distance or refresh."
      )
    } finally {
      setLoading(false)
    }
  }, [coords, radius])

  useEffect(() => {
    fetchMosques()
  }, [fetchMosques])

  const mapMosques: MapMosque[] = useMemo(() => {
    return mosques.map((m) => ({
      id: m.id,
      name: m.name,
      address: m.address,
      distance: m.distance,
      lat: m.lat,
      lon: m.lon,
    }))
  }, [mosques])

  return (
    <div className="space-y-6">
      {/* 1. Location Bar & Radius Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3">
          <LocationSelectorDialog>
            <button
              type="button"
              className="group flex items-center gap-3 text-left p-1 rounded-2xl hover:bg-muted/50 transition"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B] shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-medium text-foreground">
                    {locationDetails?.city || "Set Your Location"}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:border group-hover:border-[#C8A96B]/40 transition">
                    Change
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {coords
                    ? `Searching within ${(radius / 1000).toFixed(0)} km of ${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°`
                    : "Coordinates required for geospatial radius queries"}
                </p>
              </div>
            </button>
          </LocationSelectorDialog>
        </div>

        {/* Radius Pills & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Radius options */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border text-xs">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRadius(opt.value)}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  radius === opt.value
                    ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchMosques}
            disabled={loading}
            className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
            title="Refresh Mosque Search"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Location Required Prompt */}
      {!coords && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-serif text-lg font-medium">Location Required for Nearby Mosques</h4>
          </div>
          <p className="text-xs leading-relaxed max-w-xl">
            To find actual registered mosques around you, we query OpenStreetMap's verified global geospatial places database around your verified coordinates.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs">
              <span className="font-medium">Notice:</span> {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              size="sm"
              disabled={isDetecting}
              onClick={() => requestGpsLocation(true)}
              className="bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] rounded-full text-xs font-semibold gap-1.5"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detecting Coordinates...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  Detect Exact GPS
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isDetecting}
              onClick={() => detectIpLocation()}
              className="rounded-full text-xs border-amber-600/30 gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[#C8A96B]" />
              Detect via Network
            </Button>
            <LocationSelectorDialog>
              <Button variant="outline" size="sm" className="rounded-full text-xs border-amber-600/30">
                Search City
              </Button>
            </LocationSelectorDialog>
          </div>
        </div>
      )}

      {/* Mosque Results Counter Header */}
      {coords && (
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl font-normal text-foreground">
              Verified Mosque Locations
            </h3>
            <p className="text-xs text-muted-foreground">
              {loading ? (
                "Scanning OpenStreetMap registry..."
              ) : (
                <>
                  Found <span className="font-medium text-foreground">{mosques.length}</span> mosques within{" "}
                  <span className="font-medium text-foreground">{(radius / 1000).toFixed(0)} km</span>
                </>
              )}
            </p>
          </div>

          {/* View Toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === "split" ? "bg-card text-foreground font-medium shadow-xs" : "text-muted-foreground"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === "map" ? "bg-card text-foreground font-medium shadow-xs" : "text-muted-foreground"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === "list" ? "bg-card text-foreground font-medium shadow-xs" : "text-muted-foreground"
              }`}
            >
              List
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {coords && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          {(viewMode === "split" || viewMode === "map") && (
            <div className={viewMode === "split" ? "lg:col-span-7" : "lg:col-span-12"}>
              <MosqueMap
                userCoords={coords}
                mosques={mapMosques}
                selectedMosque={selectedMosque}
                onSelectMosque={(m) => {
                  const found = mosques.find((x) => x.id === m.id)
                  if (found) setSelectedMosque(found)
                }}
              />
            </div>
          )}

          {/* List Column */}
          {(viewMode === "split" || viewMode === "list") && (
            <div className={viewMode === "split" ? "lg:col-span-5 space-y-3" : "lg:col-span-12 space-y-3"}>
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
                  <span>{errorMsg}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchMosques}
                    className="rounded-full text-xs shrink-0 h-7"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="p-8 text-center space-y-3 bg-card border border-border rounded-3xl">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C8A96B]" />
                  <p className="text-xs text-muted-foreground">Searching real mosque coordinates...</p>
                </div>
              ) : mosques.length === 0 ? (
                <div className="p-8 text-center space-y-4 bg-card border border-border rounded-3xl">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground text-xl">
                    🕌
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-base font-medium">No Mosques Found Within {(radius / 1000).toFixed(0)} km</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      There are no registered mosques tagged on OpenStreetMap in this immediate circle. Try widening the search radius.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setRadius(Math.min(25000, radius * 2))}
                      className="bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] rounded-full text-xs"
                    >
                      Widen Radius to {Math.min(25, (radius * 2) / 1000)} km
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {mosques.map((m) => {
                    const isSelected = selectedMosque?.id === m.id
                    return (
                      <Card
                        key={m.id}
                        onClick={() => setSelectedMosque(m)}
                        className={`p-4 rounded-2xl transition cursor-pointer border ${
                          isSelected
                            ? "bg-[#123D32]/5 dark:bg-[#C8A96B]/10 border-[#C8A96B] shadow-sm"
                            : "bg-card border-border hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-serif text-sm font-medium text-foreground line-clamp-1">
                              {m.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {m.address}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-[#C8A96B] shrink-0">
                            {m.distance < 1
                              ? `${Math.round(m.distance * 1000)} m`
                              : `${m.distance.toFixed(1)} km`}
                          </span>
                        </div>

                        <div className="pt-3 mt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-muted-foreground text-[10px]">
                            {m.lat.toFixed(4)}°, {m.lon.toFixed(4)}°
                          </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[#123D32] dark:text-[#C8A96B] hover:underline font-medium"
                          >
                            <span>Get Directions</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
