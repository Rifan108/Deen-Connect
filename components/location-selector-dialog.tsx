"use client"

import React, { useState, useEffect } from "react"
import { useLocation } from "@/lib/location-context"
import { type LocationSuggestion } from "@/lib/location"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Search, Check, AlertCircle, Loader2 } from "lucide-react"

interface LocationSelectorDialogProps {
  children?: React.ReactNode
  triggerLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LocationSelectorDialog({
  children,
  triggerLabel,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: LocationSelectorDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const {
    status,
    coords,
    locationDetails,
    method,
    errorMessage,
    requestGpsLocation,
    setManualLocation,
    searchCities,
  } = useLocation()

  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGpsLoading, setIsGpsLoading] = useState(false)

  // Debounced search for locations
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchCities(query.trim())
        setSuggestions(results)
      } catch (err) {
        console.error("Search error", err)
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query, searchCities])

  const handleSelectSuggestion = async (item: LocationSuggestion) => {
    await setManualLocation(item)
    setIsOpen(false)
    setQuery("")
    setSuggestions([])
  }

  const handleGpsClick = async () => {
    setIsGpsLoading(true)
    const success = await requestGpsLocation(true)
    setIsGpsLoading(false)
    if (success) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : triggerLabel ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
            {locationDetails?.city || triggerLabel}
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-normal text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C8A96B]" />
            Set Your Location
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            All prayer times, Qibla calculations, and nearby mosque discovery require your verified coordinates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Current Active Location Card */}
          {coords && locationDetails && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Active Location ({method === "gps" ? "Device GPS" : "Manual Selection"})
                </span>
                <p className="font-medium text-sm text-foreground">{locationDetails.city}, {locationDetails.country}</p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  {coords.latitude.toFixed(4)}°, {coords.longitude.toFixed(4)}°
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Active
              </span>
            </div>
          )}

          {/* GPS Auto-detect Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGpsClick}
            disabled={isGpsLoading}
            className="w-full justify-center gap-2 py-5 rounded-xl border-dashed border-[#123D32]/30 dark:border-[#C8A96B]/30 hover:border-[#123D32] dark:hover:border-[#C8A96B]"
          >
            {isGpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Navigation className="w-4 h-4 text-[#123D32] dark:text-[#C8A96B]" />
            )}
            <span className="font-medium text-xs">
              {isGpsLoading ? "Detecting Satellite Signal..." : "Detect Exact GPS Location"}
            </span>
          </Button>

          {/* Error Message if GPS was denied or unavailable */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-card px-2 text-muted-foreground">Or search city manually</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search city (e.g. Cairo, London, Jakarta, Riyadh)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-8 text-xs rounded-xl"
              />
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <div className="border border-border rounded-xl divide-y divide-border overflow-hidden max-h-52 overflow-y-auto bg-card shadow-lg">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left p-2.5 text-xs hover:bg-muted/60 transition flex items-start gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C8A96B] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{item.city || item.name.split(",")[0]}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{item.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
