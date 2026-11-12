"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Compass, AlertCircle, CheckCircle, RefreshCw, Smartphone, Sliders, Search, MapPin } from "lucide-react"
import { getUserLocation, calculateQibla, calculateDistance, getCompassDirection, searchLocations, setCachedLocation, getCachedLocation, type LocationSuggestion } from "@/lib/location"

interface Coords {
  latitude: number
  longitude: number
  city?: string
  country?: string
  method?: "gps" | "ip" | "manual"
}

export default function QiblaCompass() {
  const [qiblaAngle, setQiblaAngle] = useState(0)
  const [deviceHeading, setDeviceHeading] = useState(0)
  const [location, setLocation] = useState<Coords | null>(null)
  const [locationError, setLocationError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Compass sensor permissions and state
  const [sensorPermission, setSensorPermission] = useState<"default" | "granted" | "denied">("default")
  const [sensorActive, setSensorActive] = useState(false)
  const [requiresInteraction, setRequiresInteraction] = useState(false)
  const [simulatedMode, setSimulatedMode] = useState(false)
  const [simulatedHeading, setSimulatedHeading] = useState(0)

  // Location search states
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [locationSource, setLocationSource] = useState<"gps" | "ip" | "manual">("gps")

  const loadLocation = async (forceFresh = false) => {
    setLoading(true)
    try {
      const coords = await getUserLocation({ ignoreCache: forceFresh })
      setLocation(coords)
      const angle = calculateQibla(coords.latitude, coords.longitude)
      setQiblaAngle(angle)
      setLocationSource(coords.method || "gps")
      setLocationError("")
    } catch (error: any) {
      console.warn("Geolocation denied or failed, falling back to default.", error)
      const fallback = { latitude: 21.4225, longitude: 39.8262, city: "Mecca", country: "Saudi Arabia", method: "ip" as const }
      setLocation(fallback)
      setQiblaAngle(0)
      setLocationSource("ip")
      setLocationError("Location denied. Defaulting to Mecca coordinates.")
    } finally {
      setLoading(false)
    }
  }

  // Reactive listener for global location changes
  useEffect(() => {
    const handleLocationUpdate = () => {
      const cached = getCachedLocation()
      if (cached) {
        setLocation({
          latitude: cached.latitude,
          longitude: cached.longitude,
          city: cached.city,
          country: cached.country,
          method: cached.method
        })
        const angle = calculateQibla(cached.latitude, cached.longitude)
        setQiblaAngle(angle)
        setLocationSource(cached.method || "gps")
        setLocationError("")
      }
    }
    window.addEventListener("deen_connect_location_updated", handleLocationUpdate)
    return () => window.removeEventListener("deen_connect_location_updated", handleLocationUpdate)
  }, [])

  // Geocoding query search suggestion effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchLocations(searchQuery)
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch (e) {
        console.error(e)
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setSearchQuery("")
    setSuggestions([])
    setShowDropdown(false)
    setCachedLocation(
      suggestion.latitude,
      suggestion.longitude,
      suggestion.city || suggestion.name.split(",")[0],
      suggestion.country || "",
      "manual"
    )
  }

  useEffect(() => {
    loadLocation(false)

    const handleAbsoluteOrientation = (event: DeviceOrientationEvent) => {
      handleOrientation(event)
    }

    if (
      typeof window !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      setRequiresInteraction(true)
    } else {
      if (typeof window !== "undefined") {
        if ("ondeviceorientationabsolute" in window) {
          window.addEventListener("deviceorientationabsolute", handleAbsoluteOrientation)
        } else {
          window.addEventListener("deviceorientation", handleOrientation)
        }
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        if ("ondeviceorientationabsolute" in window) {
          window.removeEventListener("deviceorientationabsolute", handleAbsoluteOrientation)
        }
        window.removeEventListener("deviceorientation", handleOrientation)
      }
    }
  }, [])

  // Auto-detect if sensors are actually working. If not after 2 seconds, we fall back to simulated slider.
  useEffect(() => {
    if (!loading && !sensorActive && !requiresInteraction) {
      const timer = setTimeout(() => {
        if (!sensorActive) {
          setSimulatedMode(true)
        }
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [loading, sensorActive, requiresInteraction])

  const handleOrientation = (event: DeviceOrientationEvent) => {
    let heading = 0
    if ((event as any).webkitCompassHeading !== undefined) {
      heading = (event as any).webkitCompassHeading
      setSensorActive(true)
      setSimulatedMode(false)
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha
      setSensorActive(true)
      setSimulatedMode(false)
    }
    setDeviceHeading(heading)
  }

  const requestSensorPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission()
        setSensorPermission(permissionState)
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", handleOrientation)
          setRequiresInteraction(false)
          setSensorActive(true)
          setSimulatedMode(false)
        } else {
          setSimulatedMode(true)
        }
      } catch (err) {
        console.error("Device orientation permission request failed:", err)
        setSimulatedMode(true)
      }
    } else {
      if (typeof window !== "undefined") {
        if ("ondeviceorientationabsolute" in window) {
          window.addEventListener("deviceorientationabsolute", handleOrientation)
        } else {
          window.addEventListener("deviceorientation", handleOrientation)
        }
      }
      setSensorActive(true)
      setSimulatedMode(false)
      setRequiresInteraction(false)
    }
  }

  const currentHeading = simulatedMode ? simulatedHeading : deviceHeading
  const relativeAngle = (qiblaAngle - currentHeading + 360) % 360

  // Calculate difference to determine alignment (within 5 degrees)
  const angleDiff = Math.abs(((currentHeading - qiblaAngle + 540) % 360) - 180)
  const isAligned = angleDiff < 5

  const meccaDistance = location
    ? calculateDistance(location.latitude, location.longitude, 21.4225, 39.8262)
    : 0

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-accent/5 to-background border-accent/20 max-w-md mx-auto shadow-xl rounded-2xl">
      <div className="flex flex-col items-center gap-4 text-center">
        <div>
          <h3 className="text-2xl font-serif font-bold text-accent">Real-time Qibla Compass</h3>
          <p className="text-xs text-muted-foreground mt-1">Gyroscope-assisted Kaaba direction finder</p>
        </div>

        {/* Manual Location Search Bar */}
        <div className="relative w-full z-20">
          <div className="relative flex items-center bg-card border border-primary/20 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl p-1 transition shadow-sm">
            <div className="flex items-center pl-3 pr-2 text-muted-foreground">
              <Search className="w-4 h-4 text-accent" />
            </div>
            <input
              type="text"
              placeholder="Correct your location/city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none py-1.5 px-1 rounded-xl"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false) }}
                className="text-[10px] text-muted-foreground hover:bg-muted rounded-xl px-2 h-7 mr-1"
              >
                Clear
              </Button>
            )}
            {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent mr-3" />}
          </div>

          {/* Suggestion Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/20 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-primary/10 max-h-48 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/5 transition flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.city || item.name.split(",")[0]}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{item.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alignment Indicator */}
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          isAligned 
            ? "bg-green-500/20 text-green-600 border border-green-500/40 animate-bounce" 
            : "bg-muted text-muted-foreground"
        }`}>
          {isAligned ? "🕋 Facing Qibla! Aligned with Mecca" : "Rotate device to align with Mecca"}
        </div>

        {/* Compass Visualization */}
        <div className="relative w-60 h-60 select-none flex items-center justify-center my-2">
          {/* Green alignment glow */}
          <div className={`absolute inset-0 rounded-full transition-all duration-500 blur-xl ${
            isAligned ? "bg-green-500/10 scale-105" : "bg-transparent scale-100"
          }`} />

          {/* Compass housing / outer dial (Rotates opposite to device heading to align to real North) */}
          <div
            className={`absolute w-full h-full rounded-full border-4 bg-card/70 shadow-inner flex items-center justify-center transition-transform duration-150 ease-out ${
              isAligned ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "border-accent/20"
            }`}
            style={{
              transform: `rotate(${-currentHeading}deg)`,
            }}
          >
            {/* Cardinal points */}
            <div className="absolute top-2 text-sm font-bold text-rose-600">N</div>
            <div className="absolute right-2 text-sm font-bold text-foreground">E</div>
            <div className="absolute bottom-2 text-sm font-bold text-foreground">S</div>
            <div className="absolute left-2 text-sm font-bold text-foreground">W</div>

            {/* Ordinals */}
            <div className="absolute top-6 right-6 text-[10px] font-semibold text-muted-foreground">NE</div>
            <div className="absolute bottom-6 right-6 text-[10px] font-semibold text-muted-foreground">SE</div>
            <div className="absolute bottom-6 left-6 text-[10px] font-semibold text-muted-foreground">SW</div>
            <div className="absolute top-6 left-6 text-[10px] font-semibold text-muted-foreground">NW</div>

            {/* Inner degree circle */}
            <div className="absolute inset-4 rounded-full border border-dashed border-muted-foreground/20" />
            <div className="absolute inset-8 rounded-full border border-muted-foreground/5" />
          </div>

          {/* Qibla Needle (points to Kaaba: qiblaAngle - currentHeading) */}
          <div
            className="absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-150 ease-out"
            style={{
              transform: `rotate(${qiblaAngle - currentHeading}deg)`,
            }}
          >
            {/* Custom arrow pointing North/Mecca */}
            <div className="relative h-full flex flex-col items-center pt-2">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[24px] border-b-emerald-600 filter drop-shadow-[0_2px_4px_rgba(16,185,129,0.5)]" />
              <div className="w-1.5 h-28 bg-gradient-to-b from-emerald-600 to-emerald-400 rounded-b-full" />
              
              <div className="absolute top-10 bg-emerald-600 text-white font-serif font-bold text-[9px] px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                🕋 QIBLA
              </div>
            </div>
          </div>

          {/* Center Pivot */}
          <div className="absolute w-8 h-8 rounded-full bg-background border-4 border-accent shadow-md flex items-center justify-center z-10">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isAligned ? "bg-green-500" : "bg-accent"}`} />
          </div>
        </div>

        {/* Readout and details */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm bg-muted/40 p-3 rounded-xl">
            <div className="text-left border-r border-muted px-2">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Your Heading</p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {Math.round(currentHeading)}° {getCompassDirection(currentHeading)}
              </p>
            </div>
            <div className="text-left px-2">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Qibla Angle</p>
              <p className="text-base font-bold text-accent mt-0.5">
                {Math.round(qiblaAngle)}° {getCompassDirection(qiblaAngle)}
              </p>
            </div>
          </div>

          {location && (
            <div className="text-xs text-muted-foreground space-y-2 border-t border-dashed border-muted-foreground/10 pt-3">
              <p className="flex justify-between items-center text-left">
                <span>Current Location:</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                  {location.city || "Detected City"}
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    locationSource === "gps" 
                      ? "bg-green-500/10 text-green-600 border border-green-500/25" 
                      : locationSource === "ip"
                      ? "bg-blue-500/10 text-blue-600 border border-blue-500/25"
                      : "bg-purple-500/10 text-purple-600 border border-purple-500/25"
                  }`}>
                    {locationSource === "gps" && "GPS"}
                    {locationSource === "ip" && "IP"}
                    {locationSource === "manual" && "Manual"}
                  </span>
                </span>
              </p>
              <p className="flex justify-between">
                <span>Distance to Mecca:</span>
                <span className="font-semibold text-foreground">{meccaDistance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km</span>
              </p>
              {locationError ? (
                <p className="text-amber-600 flex items-center justify-center gap-1 mt-1 text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {locationError}
                </p>
              ) : (
                <p className="text-[10px] text-center text-muted-foreground/60">
                  Coordinates: {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                </p>
              )}
            </div>
          )}

          {/* Action buttons or manual simulation slider */}
          {requiresInteraction && (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-5 gap-2 rounded-xl"
              onClick={requestSensorPermission}
            >
              <Smartphone className="w-4 h-4" />
              Enable Device Gyroscope
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full border-primary/20 hover:border-primary/50 text-xs py-3 rounded-xl gap-2 font-semibold"
            onClick={() => loadLocation(true)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh Location (GPS)
          </Button>

          {simulatedMode && (
            <div className="space-y-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
              <div className="flex items-center gap-1.5 text-xs text-accent font-semibold justify-center">
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate Compass Rotation (Desktop Mode)</span>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={simulatedHeading}
                onChange={(e) => setSimulatedHeading(Number(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <p className="text-[10px] text-muted-foreground">
                Move slider to turn your simulated phone direction.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

