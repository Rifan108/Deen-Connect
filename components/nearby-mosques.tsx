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
  ShieldCheck,
  Info,
  CheckCircle2,
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
  id: string | number
  name: string
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
  lat: number
  lon: number
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
    accuracy,
    isDetecting,
    errorMessage,
    requestGpsLocation,
    detectIpLocation,
  } = useLocation()

  const [radius, setRadius] = useState<number>(5000) // Default 5 km (Section 6)
  const [mosques, setMosques] = useState<MosqueRecord[]>([])
  const [selectedMosque, setSelectedMosque] = useState<MosqueRecord | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split")
  const [diagnostics, setDiagnostics] = useState<MosqueDiagnostics | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)

  // Fetch verified mosques from internal Overpass API proxy
  const fetchMosques = useCallback(async () => {
    if (!coords) {
      setMosques([])
      setDiagnostics(null)
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
        osmType: el.osmType || "node",
        osmId: el.osmId || el.id,
        osmUrl: el.osmUrl || `https://www.openstreetmap.org/node/${el.id}`,
        phone: el.phone,
        website: el.website,
        openingHours: el.openingHours,
        wheelchair: el.wheelchair,
        denomination: el.denomination,
        lat: el.lat,
        lon: el.lon,
      }))

      setMosques(items)
      if (json.diagnostics) {
        setDiagnostics(json.diagnostics)
      }

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
                    ? `Searching within ${(radius / 1000).toFixed(0)} km of ${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}° (${method === "gps" ? "GPS" : method === "ip" ? "Network" : "Manual"})`
                    : "Coordinates required for geospatial radius queries"}
                </p>
              </div>
            </button>
          </LocationSelectorDialog>
        </div>

        {/* Radius Pills & View Switcher (Section 6) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Radius options: 1 km, 3 km, 5 km, 10 km, 25 km */}
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

      {/* Location Required Prompt (Section 2) */}
      {!coords && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-serif text-lg font-medium">Location Required to Find Nearby Mosques</h4>
          </div>
          <p className="text-xs leading-relaxed max-w-xl">
            To discover actual registered mosques around you, we query OpenStreetMap&apos;s verified global geospatial database around your validated coordinates.
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
              onClick={() => requestGpsLocation()}
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
                  Find Nearby Mosques (GPS)
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
                Search City Manually
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
                "Scanning OpenStreetMap Overpass registry..."
              ) : (
                <>
                  Found <span className="font-medium text-foreground">{mosques.length}</span> verified mosques within{" "}
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

      {/* Main Content Layout (Section 8) */}
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
                  <p className="text-xs text-muted-foreground">Searching real mosque coordinates from Overpass...</p>
                </div>
              ) : mosques.length === 0 ? (
                <div className="p-8 text-center space-y-4 bg-card border border-border rounded-3xl">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground text-xl">
                    🕌
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-base font-medium">No Verified Mosques Found Within {(radius / 1000).toFixed(0)} km</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      There are no registered Muslim worship locations tagged on OpenStreetMap within this radius. Try widening your search distance or selecting a nearby city.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {radius < 10000 && (
                      <Button
                        size="sm"
                        onClick={() => setRadius(10000)}
                        className="bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] rounded-full text-xs"
                      >
                        Expand to 10 km
                      </Button>
                    )}
                    {radius < 25000 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRadius(25000)}
                        className="rounded-full text-xs"
                      >
                        Expand to 25 km
                      </Button>
                    )}
                    <LocationSelectorDialog>
                      <Button size="sm" variant="outline" className="rounded-full text-xs">
                        Change Location
                      </Button>
                    </LocationSelectorDialog>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {mosques.map((m) => {
                    const isSelected = selectedMosque?.id === m.id
                    return (
                      <Card
                        key={m.id}
                        onClick={() => setSelectedMosque(m)}
                        className={`p-4 rounded-2xl transition cursor-pointer border ${
                          isSelected
                            ? "bg-[#123D32]/5 dark:bg-[#C8A96B]/10 border-[#C8A96B] shadow-sm ring-1 ring-[#C8A96B]/40"
                            : "bg-card border-border hover:border-border/80"
                        }`}
                      >
                        {/* Top: Name & Distance (Section 5 & 7) */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-serif text-sm font-medium text-foreground line-clamp-1">
                              {m.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {m.address}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-[#C8A96B] shrink-0 bg-[#C8A96B]/10 px-2.5 py-0.5 rounded-full border border-[#C8A96B]/20">
                            {m.distance < 1
                              ? `${Math.round(m.distance * 1000)} m`
                              : `${m.distance.toFixed(1)} km`}
                          </span>
                        </div>

                        {/* Mid Meta: Verified Attributes (No fake data!) */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-mono">
                            {m.lat.toFixed(4)}°N, {m.lon.toFixed(4)}°E
                          </span>
                          {m.denomination && (
                            <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">
                              {m.denomination}
                            </span>
                          )}
                          {m.openingHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#C8A96B]" />
                              {m.openingHours}
                            </span>
                          )}
                          {m.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500" />
                              {m.phone}
                            </span>
                          )}
                        </div>

                        {/* Bottom: External Actions */}
                        <div className="pt-3 mt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                          <a
                            href={m.osmUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground text-[10px] underline underline-offset-2 flex items-center gap-1"
                          >
                            <span>OSM Record ({m.osmType}/{m.osmId})</span>
                          </a>

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

      {/* Developer Diagnostic Panel (Section 10) */}
      <div className="p-4 rounded-3xl bg-card border border-border/80 text-xs space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Mosque Geospatial Diagnostic Panel
          </span>
          <button
            type="button"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="text-[11px] font-mono text-[#C8A96B] hover:underline"
          >
            {showDiagnostics ? "Hide Diagnostics" : "Show Full Diagnostics"}
          </button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-between">
            <span className="text-muted-foreground">Source:</span>
            <span className="font-bold text-foreground uppercase">{method || "None"}</span>
          </div>
          <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-between">
            <span className="text-muted-foreground">Accuracy:</span>
            <span className="font-bold text-foreground">{accuracy ? `±${Math.round(accuracy)}m` : "Manual"}</span>
          </div>
          <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={errorMsg ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>
              {loading ? "SEARCHING" : errorMsg ? "ERROR" : `${mosques.length} MOSQUES`}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-between">
            <span className="text-muted-foreground">API Lat/Lon:</span>
            <span className="font-bold text-foreground">
              {coords ? `${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°` : "None"}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showDiagnostics && diagnostics && (
          <div className="pt-2 border-t border-border/60 space-y-2 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Endpoint:</span>
              <span className="text-foreground">{diagnostics.endpoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">HTTP Status:</span>
              <span className={diagnostics.httpStatus === 200 ? "text-emerald-500 font-bold" : "text-destructive"}>
                {diagnostics.httpStatus || 200}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response Time:</span>
              <span className="text-foreground">{diagnostics.responseTimeMs} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overpass Records Received:</span>
              <span className="text-foreground">{diagnostics.recordsReceived}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Mosques:</span>
              <span className="text-emerald-500 font-bold">{diagnostics.validMosques}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Excluded Non-Mosques:</span>
              <span className="text-muted-foreground">{diagnostics.excludedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duplicates Merged:</span>
              <span className="text-muted-foreground">{diagnostics.duplicateCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cached Response:</span>
              <span className="text-foreground">{diagnostics.cached ? "Yes (15-min TTL)" : "No (Live Overpass)"}</span>
            </div>
            {diagnostics.lastApiError && (
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-[11px]">
                API Notice: {diagnostics.lastApiError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
