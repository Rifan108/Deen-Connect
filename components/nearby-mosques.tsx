"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Loader2, AlertCircle, ExternalLink, RefreshCw, Search } from "lucide-react"
import { getUserLocation, calculateDistance, searchLocations, setCachedLocation, getCachedLocation, type LocationSuggestion } from "@/lib/location"

interface Mosque {
  id: number
  name: string
  distance: number
  address: string
  phone?: string
  lat: number
  lon: number
}

export default function NearbyMosques() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [loading, setLoading] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Location search states
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [locationSource, setLocationSource] = useState<"gps" | "ip" | "manual">("gps")
  const [currentCity, setCurrentCity] = useState("Detected Location")

  useEffect(() => {
    loadNearbyMosques()
  }, [])

  // Reactive listener for global location changes
  useEffect(() => {
    const handleLocationUpdate = () => {
      loadNearbyMosques()
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

  const loadNearbyMosques = async (forceFresh = false) => {
    setLoading(true)
    setErrorMsg("")
    try {
      const coords = await getUserLocation({ ignoreCache: forceFresh })
      setLocationEnabled(true)
      setLocationSource(coords.method || "gps")
      
      if (coords.city) {
        setCurrentCity(coords.city)
      } else {
        // Resolve city name using Nominatim reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`, {
            headers: { "Accept-Language": "en", "User-Agent": "DeenConnect/1.0" },
            signal: AbortSignal.timeout(4000)
          })
          if (res.ok) {
            const data = await res.json()
            const city = data.address?.city || data.address?.town || data.address?.suburb || "Detected City"
            setCurrentCity(city)
            setCachedLocation(coords.latitude, coords.longitude, city, data.address?.country || "", coords.method)
          }
        } catch (e) {
          console.warn("Could not reverse geocode for mosques", e)
          setCurrentCity("Detected Location")
        }
      }

      const fetchedMosques = await fetchMosquesFromOSM(coords.latitude, coords.longitude)
      setMosques(fetchedMosques)

      if (fetchedMosques.length === 0) {
        setErrorMsg("No mosques found within a 10km radius of your location.")
      }
    } catch (err: any) {
      console.error("Error loading nearby mosques:", err)
      setLocationEnabled(false)
      setErrorMsg(
        err.message?.includes("denied") 
          ? "Location permission denied. Please enable location or search for a city manually to find mosques." 
          : "Could not fetch nearby mosques. Please check your network connection."
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchMosquesFromOSM = async (lat: number, lon: number): Promise<Mosque[]> => {
    const radius = 10000 // Search within 10 km
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="mosque"](around:${radius},${lat},${lon});
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
        way["amenity"="mosque"](around:${radius},${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      );
      out center;
    `
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query.trim())}`

    const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) throw new Error("Overpass API failed to respond")

    const data = await res.json()
    const elements = data.elements || []

    const list: Mosque[] = elements.map((el: any) => {
      const mLat = el.lat || el.center?.lat
      const mLon = el.lon || el.center?.lon
      const dist = calculateDistance(lat, lon, mLat, mLon)

      const tags = el.tags || {}
      const name = tags.name || tags["name:en"] || tags["name:ar"] || "Masjid / Mosque"
      
      const street = tags["addr:street"] || ""
      const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || ""
      const city = tags["addr:city"] || ""
      const housenumber = tags["addr:housenumber"] || ""

      let address = [housenumber, street, suburb, city].filter(Boolean).join(", ")
      if (!address) {
        address = `Coordinates: ${mLat.toFixed(4)}°, ${mLon.toFixed(4)}°`
      }

      const phone = tags.phone || tags["contact:phone"] || ""

      return {
        id: el.id,
        name,
        distance: dist,
        address,
        phone,
        lat: mLat,
        lon: mLon,
      }
    })

    // Sort by distance (closest first)
    list.sort((a, b) => a.distance - b.distance)
    return list
  }

  const handleGetDirections = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-4">
      {/* Manual Location Search Bar */}
      <div className="relative w-full z-20">
        <div className="relative flex items-center bg-card border border-primary/20 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl p-1 transition shadow-sm">
          <div className="flex items-center pl-3 pr-2 text-muted-foreground">
            <Search className="w-5 h-5 text-primary/80" />
          </div>
          <input
            type="text"
            placeholder="Search for mosques in another city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2 px-1 rounded-xl"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false) }}
              className="text-xs text-muted-foreground hover:bg-muted rounded-xl px-2 h-8 mr-1"
            >
              Clear
            </Button>
          )}
          {searching && <Loader2 className="w-4 h-4 animate-spin text-primary mr-3" />}
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/20 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-primary/10 max-h-60 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/5 transition flex items-start gap-2.5"
              >
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.city || item.name.split(",")[0]}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground">Nearby Mosques for</span>
          <span className="text-sm font-bold text-foreground">{currentCity}</span>
          
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            locationSource === "gps" 
              ? "bg-green-500/10 text-green-600 border border-green-500/25" 
              : locationSource === "ip"
              ? "bg-blue-500/10 text-blue-600 border border-blue-500/25"
              : "bg-purple-500/10 text-purple-600 border border-purple-500/25"
          }`}>
            {locationSource === "gps" && "📡 GPS"}
            {locationSource === "ip" && "🌐 IP Network"}
            {locationSource === "manual" && "✍️ Manual"}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadNearbyMosques(true)}
          disabled={loading}
          className="h-9 gap-1.5 border-primary/20 hover:border-primary/50 text-xs rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Scan GPS
        </Button>
      </div>
      {errorMsg && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6 flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>{errorMsg}</p>
              {!locationEnabled && (
                <Button size="sm" variant="outline" onClick={loadNearbyMosques} className="mt-1">
                  Retry Access
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Scanning for nearby mosques...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mosques.map((mosque) => (
            <Card key={mosque.id} className="border-primary/20 hover:border-primary/50 transition-colors shadow-sm bg-card hover:bg-card/85">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">{mosque.name}</CardTitle>
                    <p className="text-sm text-accent font-semibold mt-1">📍 {mosque.distance.toFixed(2)} km away</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{mosque.address}</span>
                </div>
                {mosque.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{mosque.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>Open for daily congregational prayers.</span>
                </div>
                <Button 
                  onClick={() => handleGetDirections(mosque)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-5 gap-2 rounded-xl mt-2"
                >
                  Get Directions
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

