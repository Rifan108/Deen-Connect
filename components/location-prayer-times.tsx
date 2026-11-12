"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  AlertCircle,
  Info,
  Globe,
  Navigation,
} from "lucide-react"
import { useLocation } from "@/lib/location-context"
import { convertTo12Hour } from "@/lib/location"
import { LocationSelectorDialog } from "@/components/location-selector-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

interface PrayerTimeRow {
  key: string
  name: string
  arabic: string
  time: string
  raw24: string
  icon: any
}

export const CALCULATION_METHODS = [
  { id: "1", name: "University of Islamic Sciences, Karachi", region: "Pakistan, India, Bangladesh, South Asia" },
  { id: "2", name: "ISNA (Islamic Society of North America)", region: "North America" },
  { id: "3", name: "Muslim World League (MWL)", region: "Europe, Far East, parts of US" },
  { id: "4", name: "Umm Al-Qura University, Makkah", region: "Saudi Arabia & Arabian Peninsula" },
  { id: "5", name: "Egyptian General Authority of Survey", region: "Egypt, Africa, Syria, Levant" },
  { id: "7", name: "Institute of Geophysics, University of Tehran", region: "Iran & Shia Communities" },
  { id: "8", name: "Gulf Region", region: "UAE, Kuwait, Qatar, Oman" },
  { id: "13", name: "Diyanet İşleri Başkanlığı", region: "Turkey" },
  { id: "11", name: "MUIS (Majlis Ugama Islam Singapura)", region: "Singapore" },
]

const SETTINGS_KEY = "deen_prayer_settings"

export default function LocationPrayerTimes() {
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

  // Calculation settings stored in localStorage
  const [selectedMethod, setSelectedMethod] = useState<string>("3") // MWL default
  const [selectedSchool, setSelectedSchool] = useState<string>("0") // 0 = Shafi, 1 = Hanafi
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Real Prayer Data from API
  const [timingsData, setTimingsData] = useState<any>(null)
  const [hijriDate, setHijriDate] = useState<string>("")
  const [gregorianDate, setGregorianDate] = useState<string>("")
  const [timezone, setTimezone] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Live second countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{
    name: string
    arabic: string
    time: string
    raw24: string
  } | null>(null)
  const [currentPrayerName, setCurrentPrayerName] = useState<string>("Dhuhr")

  // Load user settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.method) setSelectedMethod(parsed.method)
        if (parsed.school !== undefined) setSelectedSchool(parsed.school)
      }
    } catch {}
  }, [])

  // Persist settings
  const handleSaveSettings = (method: string, school: string) => {
    setSelectedMethod(method)
    setSelectedSchool(school)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ method, school }))
    } catch {}
    setSettingsOpen(false)
  }

  // Fetch real prayer times whenever coordinates, method, or school change
  const fetchPrayerTimes = useCallback(async () => {
    if (!coords) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const url = `/api/prayer-times?lat=${coords.latitude}&lng=${coords.longitude}&method=${selectedMethod}&school=${selectedSchool}`
      const res = await fetch(url)
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `API error ${res.status}`)
      }

      const json = await res.json()
      const data = json.data
      setTimingsData(data.timings)

      if (data.date) {
        const h = data.date.hijri
        if (h) {
          const hMonth = typeof h.month === "object" ? h.month.en : h.month
          setHijriDate(`${h.day} ${hMonth} ${h.year} AH`)
        }
        if (data.date.readable) {
          setGregorianDate(data.date.readable)
        }
      }

      if (data.meta?.timezone) {
        setTimezone(data.meta.timezone)
      }
    } catch (e: any) {
      console.error("Failed to fetch prayer times:", e)
      setErrorMsg("Unable to retrieve verified prayer calculations. Please check your internet connection.")
    } finally {
      setLoading(false)
    }
  }, [coords, selectedMethod, selectedSchool])

  useEffect(() => {
    fetchPrayerTimes()
  }, [fetchPrayerTimes])

  // Parse timings into structured rows
  const prayerRows: PrayerTimeRow[] = useMemo(() => {
    if (!timingsData) {
      return []
    }

    const configs = [
      { key: "Fajr", name: "Fajr", arabic: "الفجر", icon: Moon },
      { key: "Dhuhr", name: "Dhuhr", arabic: "الظهر", icon: Sun },
      { key: "Asr", name: "Asr", arabic: "العصر", icon: CloudSun },
      { key: "Maghrib", name: "Maghrib", arabic: "المغرب", icon: Sunset },
      { key: "Isha", name: "Isha", arabic: "العشاء", icon: Moon },
    ]

    return configs.map((c) => {
      const raw24 = (timingsData[c.key] || "").split(" ")[0]
      return {
        key: c.key,
        name: c.name,
        arabic: c.arabic,
        time: convertTo12Hour(raw24),
        raw24,
        icon: c.icon,
      }
    })
  }, [timingsData])

  // Second-by-second ticker to determine next prayer and live countdown
  useEffect(() => {
    if (!timingsData) return

    const updateCountdown = () => {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const currentSecondsInDay = currentMinutes * 60 + now.getSeconds()

      const schedule = [
        { name: "Fajr", arabic: "الفجر", raw: timingsData.Fajr },
        { name: "Sunrise", arabic: "الشروق", raw: timingsData.Sunrise },
        { name: "Dhuhr", arabic: "الظهر", raw: timingsData.Dhuhr },
        { name: "Asr", arabic: "العصر", raw: timingsData.Asr },
        { name: "Maghrib", arabic: "المغرب", raw: timingsData.Maghrib },
        { name: "Isha", arabic: "العشاء", raw: timingsData.Isha },
      ]

      const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

      let next: { name: string; arabic: string; time: string; raw24: string; diffSec: number } | null = null
      let currentName = "Isha"

      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i]
        const raw = (item.raw || "").split(" ")[0]
        const [h, m] = raw.split(":").map(Number)
        if (isNaN(h) || isNaN(m)) continue

        const itemSec = (h * 60 + m) * 60

        if (mainPrayers.includes(item.name) && currentSecondsInDay >= itemSec) {
          currentName = item.name
        }

        if (itemSec > currentSecondsInDay && !next && mainPrayers.includes(item.name)) {
          next = {
            name: item.name,
            arabic: item.arabic,
            time: convertTo12Hour(raw),
            raw24: raw,
            diffSec: itemSec - currentSecondsInDay,
          }
        }
      }

      // If all prayers today have passed, next prayer is tomorrow's Fajr
      if (!next) {
        const fajrRaw = (timingsData.Fajr || "").split(" ")[0]
        const [fh, fm] = fajrRaw.split(":").map(Number)
        const fajrTomorrowSec = 24 * 3600 + (fh * 60 + fm) * 60
        next = {
          name: "Fajr",
          arabic: "الفجر",
          time: convertTo12Hour(fajrRaw),
          raw24: fajrRaw,
          diffSec: fajrTomorrowSec - currentSecondsInDay,
        }
      }

      setCurrentPrayerName(currentName)
      setNextPrayerInfo({
        name: next.name,
        arabic: next.arabic,
        time: next.time,
        raw24: next.raw24,
      })
      setSecondsRemaining(Math.max(0, next.diffSec))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [timingsData])

  // Format seconds into HH:MM:SS
  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
  }

  const activeMethodObj = CALCULATION_METHODS.find((m) => m.id === selectedMethod) || CALCULATION_METHODS[2]

  return (
    <div className="space-y-6">
      {/* 1. Location Bar & Calculation Method Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/80 shadow-xs">
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
                    {locationDetails?.city || "Detecting Location..."}
                  </span>
                  {coords && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        method === "gps"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : method === "ip"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      }`}
                    >
                      {method === "gps" ? "GPS" : method === "ip" ? "Network" : "Manual"}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:border group-hover:border-[#C8A96B]/40 transition">
                    Change
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {coords
                    ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E • ${timezone || "Local Time"}`
                    : "No location set"}
                </p>
              </div>
            </button>
          </LocationSelectorDialog>
        </div>

        {/* Calculation Settings Dialog Trigger */}
        <div className="flex items-center gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs gap-2 border-border hover:border-[#C8A96B] transition"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{activeMethodObj.name.split("(")[0]}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({selectedSchool === "1" ? "Hanafi" : "Shafi"})
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl font-normal text-foreground flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-[#C8A96B]" />
                  Prayer Calculation Standards
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select your regional astronomical calculation authority and Asr jurisprudence school.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Method Options */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Calculation Convention</label>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {CALCULATION_METHODS.map((m) => {
                      const isSelected = selectedMethod === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSaveSettings(m.id, selectedSchool)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between border ${
                            isSelected
                              ? "bg-[#123D32]/10 dark:bg-[#C8A96B]/15 border-[#C8A96B] font-medium"
                              : "border-transparent hover:bg-muted/60 text-muted-foreground"
                          }`}
                        >
                          <div>
                            <p className="text-foreground">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground">{m.region}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#C8A96B]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Asr School: Shafi vs Hanafi */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="text-xs font-medium text-foreground">Asr Shadow Ratio (Juristic School)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={selectedSchool === "0" ? "default" : "outline"}
                      onClick={() => handleSaveSettings(selectedMethod, "0")}
                      className={`rounded-xl text-xs py-2 justify-center ${
                        selectedSchool === "0" ? "bg-[#123D32] dark:bg-[#C8A96B] dark:text-[#101A16]" : ""
                      }`}
                    >
                      Shafi / Maliki / Hanbali (1x)
                    </Button>
                    <Button
                      type="button"
                      variant={selectedSchool === "1" ? "default" : "outline"}
                      onClick={() => handleSaveSettings(selectedMethod, "1")}
                      className={`rounded-xl text-xs py-2 justify-center ${
                        selectedSchool === "1" ? "bg-[#123D32] dark:bg-[#C8A96B] dark:text-[#101A16]" : ""
                      }`}
                    >
                      Hanafi (2x Shadow)
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPrayerTimes}
            disabled={loading}
            className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
            title="Refresh Prayer Times"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Location Permission / Error Prompt if no location detected */}
      {!coords && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-serif text-lg font-medium">Location Required for Accurate Prayer Times</h4>
          </div>
          <p className="text-xs leading-relaxed max-w-xl">
            Islamic prayer times depend directly on your exact solar latitude and longitude. To calculate authentic timings, please allow GPS access, detect via network, or search for your city.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs">
              <span className="font-medium">Notice:</span> {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              size="sm"
              disabled={isDetecting}
              onClick={() => requestGpsLocation(true)}
              className="bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] rounded-full text-xs font-semibold gap-1.5"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  Detect My GPS Position
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
                Choose City Manually
              </Button>
            </LocationSelectorDialog>
          </div>
        </div>
      )}

      {/* 2. Hero Focus: Next Prayer Countdown */}
      {nextPrayerInfo && (
        <div className="rounded-3xl border border-[#C8A96B]/30 bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#C8A96B]/30 text-[#C8A96B] text-[10px] font-mono uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                <span>Upcoming Obligation</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#F7F5EF]">
                {nextPrayerInfo.name}{" "}
                <span className="font-arabic text-2xl sm:text-3xl text-[#C8A96B]" dir="rtl">
                  {nextPrayerInfo.arabic}
                </span>
              </h2>
              <p className="text-xs font-mono text-[#A9B9A7]">
                Scheduled for {nextPrayerInfo.time} • Current: {currentPrayerName}
              </p>
            </div>

            {/* Live Countdown Display */}
            <div className="text-left md:text-right space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B9A7]">
                Time Remaining
              </span>
              <div className="font-mono text-3xl sm:text-4xl text-[#C8A96B] font-semibold tracking-tight">
                {formatCountdown(secondsRemaining)}
              </div>
              <p className="text-[10px] font-mono text-[#F7F5EF]/60">
                {hijriDate || "1448 AH"} • {gregorianDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Five Daily Prayers Timetable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-xl font-normal text-foreground">Daily Prayer Timetable</h3>
          <span className="text-xs font-mono text-muted-foreground">{hijriDate}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {prayerRows.map((prayer) => {
            const Icon = prayer.icon
            const isNext = nextPrayerInfo?.name === prayer.name
            const isCurrent = currentPrayerName === prayer.name

            return (
              <Card
                key={prayer.key}
                className={`p-5 rounded-2xl transition-all border ${
                  isNext
                    ? "bg-[#123D32] text-[#F7F5EF] border-[#C8A96B] dark:bg-[#174C3D] shadow-md scale-[1.02]"
                    : isCurrent
                    ? "bg-card border-[#C8A96B]/50"
                    : "bg-card border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between pb-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isNext
                        ? "bg-white/10 text-[#C8A96B]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isNext && (
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C8A96B] text-[#101A16] font-bold">
                      Next
                    </span>
                  )}
                  {isCurrent && !isNext && (
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Current
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-serif text-lg font-medium">{prayer.name}</h4>
                    <span className="font-arabic text-sm text-[#C8A96B]" dir="rtl">
                      {prayer.arabic}
                    </span>
                  </div>
                  <p
                    className={`font-mono text-xl font-semibold tracking-tight ${
                      isNext ? "text-[#C8A96B]" : "text-foreground"
                    }`}
                  >
                    {prayer.time}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 4. Astronomical Astronomical Celestial Markers (Sunrise, Imsak, Midnight) */}
      {timingsData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>Sunrise (Shuruq)</span>
            </div>
            <p className="font-mono text-base font-medium text-foreground">
              {convertTo12Hour(timingsData.Sunrise)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Imsak (Fasting Start)</span>
            </div>
            <p className="font-mono text-base font-medium text-foreground">
              {convertTo12Hour(timingsData.Imsak)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Islamic Midnight</span>
            </div>
            <p className="font-mono text-base font-medium text-foreground">
              {convertTo12Hour(timingsData.Midnight)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Sunset className="w-3.5 h-3.5 text-rose-400" />
              <span>Sunset (Ghurub)</span>
            </div>
            <p className="font-mono text-base font-medium text-foreground">
              {convertTo12Hour(timingsData.Sunset)}
            </p>
          </div>
        </div>
      )}

      {/* 5. Essential Legal & Mosque Timings Notice */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground flex items-start gap-3 leading-relaxed">
        <Info className="w-4 h-4 text-[#C8A96B] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">Calculated Astronomical Timings Notice</p>
          <p>
            Times displayed above are scientifically calculated based on solar altitude angles for your coordinates. Local mosque congregation (Iqamah) times are determined by each mosque committee and typically occur 10–25 minutes after the adhan.
          </p>
        </div>
      </div>
    </div>
  )
}
