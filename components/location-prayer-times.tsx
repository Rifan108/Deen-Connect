"use client"

import React, { useState, useEffect } from "react"
import {
  MapPin,
  Clock,
  Compass,
  RefreshCw,
  Search,
  Settings2,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  Loader2,
  Check,
} from "lucide-react"
import {
  getCachedLocation,
  setCachedLocation,
  getUserLocation,
  convertTo12Hour,
  searchLocations,
  type LocationSuggestion,
} from "@/lib/location"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PrayerTimeRow {
  key: string
  name: string
  arabic: string
  time: string
  raw24: string
  icon: any
}

const CALCULATION_METHODS = [
  { id: "2", name: "ISNA (Islamic Society of North America)", region: "North America" },
  { id: "3", name: "Muslim World League (MWL)", region: "Europe, Far East, parts of US" },
  { id: "4", name: "Umm Al-Qura University", region: "Saudi Arabia & Arabian Peninsula" },
  { id: "1", name: "University of Islamic Sciences, Karachi", region: "Pakistan, India, Bangladesh" },
  { id: "5", name: "Egyptian General Authority of Survey", region: "Egypt, Africa, Syria" },
  { id: "13", name: "Diyanet İşleri Başkanlığı", region: "Turkey" },
  { id: "11", name: "MUIS (Majlis Ugama Islam Singapura)", region: "Singapore" },
]

export default function LocationPrayerTimes() {
  const [prayers, setPrayers] = useState<PrayerTimeRow[]>([
    { key: "Fajr", name: "Fajr", arabic: "الفجر", time: "05:12 AM", raw24: "05:12", icon: Moon },
    { key: "Dhuhr", name: "Dhuhr", arabic: "الظهر", time: "12:15 PM", raw24: "12:15", icon: Sun },
    { key: "Asr", name: "Asr", arabic: "العصر", time: "03:32 PM", raw24: "15:32", icon: CloudSun },
    { key: "Maghrib", name: "Maghrib", arabic: "المغرب", time: "05:48 PM", raw24: "17:48", icon: Sunset },
    { key: "Isha", name: "Isha", arabic: "العشاء", time: "07:18 PM", raw24: "19:18", icon: Moon },
  ])

  const [currentPrayer, setCurrentPrayer] = useState<string>("Dhuhr")
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string }>({
    name: "Asr",
    time: "03:32 PM",
    remaining: "1h 17m",
  })
  const [locationName, setLocationName] = useState<string>("Riyadh, Saudi Arabia")
  const [hijriDate, setHijriDate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [searching, setSearching] = useState<boolean>(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [method, setMethod] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("deen_connect_method") || "2"
    }
    return "2"
  })

  // Load location & times
  useEffect(() => {
    loadLocationAndTimes()
  }, [])

  // Geocoding query debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchLocations(searchQuery)
        setSuggestions(results)
        setShowSearchDropdown(results.length > 0)
      } catch (e) {
        console.error(e)
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadLocationAndTimes = async (forceFresh = false) => {
    setLoading(true)
    try {
      let coordsObj
      try {
        coordsObj = await getUserLocation({ ignoreCache: forceFresh })
      } catch {
        coordsObj = { latitude: 24.7136, longitude: 46.6753, city: "Riyadh", country: "Saudi Arabia", method: "ip" as const }
      }

      const { latitude, longitude, city, country } = coordsObj
      if (city) {
        setLocationName(`${city}, ${country || ""}`)
      }
      await fetchPrayerTimes(latitude, longitude)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrayerTimes = async (lat: number, lon: number) => {
    try {
      const today = new Date()
      const d = String(today.getDate()).padStart(2, "0")
      const m = String(today.getMonth() + 1).padStart(2, "0")
      const y = today.getFullYear()

      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lon}&method=${method}`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (!res.ok) throw new Error("API response error")
      const data = await res.json()

      if (data?.data?.timings) {
        const t = data.data.timings
        const updatedRows: PrayerTimeRow[] = [
          { key: "Fajr", name: "Fajr", arabic: "الفجر", time: convertTo12Hour(t.Fajr), raw24: t.Fajr, icon: Moon },
          { key: "Dhuhr", name: "Dhuhr", arabic: "الظهر", time: convertTo12Hour(t.Dhuhr), raw24: t.Dhuhr, icon: Sun },
          { key: "Asr", name: "Asr", arabic: "العصر", time: convertTo12Hour(t.Asr), raw24: t.Asr, icon: CloudSun },
          { key: "Maghrib", name: "Maghrib", arabic: "المغرب", time: convertTo12Hour(t.Maghrib), raw24: t.Maghrib, icon: Sunset },
          { key: "Isha", name: "Isha", arabic: "العشاء", time: convertTo12Hour(t.Isha), raw24: t.Isha, icon: Moon },
        ]

        setPrayers(updatedRows)
        calculateActivePrayer(updatedRows)

        const hijri = data.data.date?.hijri
        if (hijri) {
          setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} AH`)
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote prayer times, using cache/defaults", err)
    }
  }

  const calculateActivePrayer = (rows: PrayerTimeRow[]) => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const parseToMins = (raw: string) => {
      const [h, m] = raw.split(":").map(Number)
      return h * 60 + m
    }

    let active = "Isha"
    let nextIdx = 0

    for (let i = 0; i < rows.length; i++) {
      const pMins = parseToMins(rows[i].raw24)
      if (currentMinutes >= pMins) {
        active = rows[i].name
        nextIdx = (i + 1) % rows.length
      } else {
        nextIdx = i
        break
      }
    }

    setCurrentPrayer(active)
    const nextP = rows[nextIdx]
    let nextMins = parseToMins(nextP.raw24)
    if (nextMins < currentMinutes) nextMins += 24 * 60

    const diff = nextMins - currentMinutes
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    const remStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

    setNextPrayer({
      name: nextP.name,
      time: nextP.time,
      remaining: remStr,
    })
  }

  const handleSelectSuggestion = (s: LocationSuggestion) => {
    setSearchQuery("")
    setSuggestions([])
    setShowSearchDropdown(false)
    const city = s.city || s.name.split(",")[0]
    setLocationName(`${city}, ${s.country || ""}`)
    setCachedLocation(s.latitude, s.longitude, city, s.country || "", "manual")
    fetchPrayerTimes(s.latitude, s.longitude)
  }

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod)
    localStorage.setItem("deen_connect_method", newMethod)
    const cached = getCachedLocation()
    const lat = cached ? cached.latitude : 24.7136
    const lon = cached ? cached.longitude : 46.6753
    fetchPrayerTimes(lat, lon)
    setSettingsOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Bar: Location, Search & Method Settings */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-border">
        {/* Location Display */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#123D32]/10 dark:bg-[#174C3D]/30 border border-[#C8A96B]/30 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-semibold text-foreground text-lg">{locationName}</h3>
              <button
                onClick={() => loadLocationAndTimes(true)}
                className="text-muted-foreground hover:text-foreground transition p-1"
                title="Detect my current location"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C8A96B]" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {hijriDate || "Calculating Hijri date..."}
            </p>
          </div>
        </div>

        {/* Search & Calculation Settings */}
        <div className="flex items-center gap-2">
          {/* Inline Location Search */}
          <div className="relative flex-1 sm:w-64">
            <div className="flex items-center bg-card border border-border rounded-full px-3 py-1.5 focus-within:border-[#C8A96B] transition shadow-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
              />
              {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A96B]" />}
            </div>

            {/* Suggestions Dropdown */}
            {showSearchDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border max-h-56 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-foreground hover:bg-muted/70 transition flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings Modal Button */}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs gap-1.5 border-border hover:border-[#C8A96B] hover:bg-muted"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calculation</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg text-foreground">
                  Prayer Calculation Method
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 pt-2">
                {CALCULATION_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleMethodChange(m.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                      method === m.id
                        ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-[10px] opacity-75">{m.region}</p>
                    </div>
                    {method === m.id && <Check className="w-4 h-4 text-[#C8A96B]" />}
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hero Prayer Countdown Card (Clean Timetable Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Next Prayer Highlight Box */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] border border-[#C8A96B]/30 text-[#F7F5EF] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B9A7]">
              Next Obligation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#C8A96B]/20 border border-[#C8A96B]/40 text-[#C8A96B]">
              In {nextPrayer.remaining}
            </span>
          </div>

          <div>
            <h4 className="font-serif text-4xl font-light text-[#F7F5EF] tracking-tight">
              {nextPrayer.name}
            </h4>
            <p className="text-2xl font-mono text-[#C8A96B] font-medium mt-1">
              {nextPrayer.time}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#A9B9A7]">
            <span>Current Prayer:</span>
            <span className="font-medium text-[#F7F5EF]">{currentPrayer}</span>
          </div>
        </div>

        {/* Clean Editorial Timetable */}
        <div className="md:col-span-7 bg-card border border-border rounded-2xl overflow-hidden shadow-xs divide-y divide-border">
          {prayers.map((prayer) => {
            const isCurrent = currentPrayer === prayer.name
            const isNext = nextPrayer.name === prayer.name
            const Icon = prayer.icon

            return (
              <div
                key={prayer.name}
                className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                  isCurrent
                    ? "bg-[#123D32]/5 dark:bg-[#C8A96B]/5"
                    : "hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#123D32]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif font-medium text-sm text-foreground">
                      {prayer.name}
                    </span>
                    <span className="ml-2 font-arabic text-xs text-muted-foreground">
                      {prayer.arabic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B]">
                      Current
                    </span>
                  )}
                  {isNext && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B] font-mono">
                      Next
                    </span>
                  )}
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {prayer.time}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
