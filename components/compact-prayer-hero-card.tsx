"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Clock, ArrowRight, Loader2, Navigation, AlertCircle, Globe } from "lucide-react"
import { useLocation } from "@/lib/location-context"
import { convertTo12Hour } from "@/lib/location"
import { LocationSelectorDialog } from "@/components/location-selector-dialog"
import { Button } from "@/components/ui/button"

export function CompactPrayerHeroCard() {
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

  const [timings, setTimings] = useState<any>(null)
  const [hijriDate, setHijriDate] = useState<string>("1448 AH")
  const [loading, setLoading] = useState<boolean>(true)
  const [nextPrayer, setNextPrayer] = useState<{
    name: string
    arabic: string
    time: string
    raw24: string
    remainingText: string
  }>({
    name: "Asr",
    arabic: "العصر",
    time: "--:--",
    raw24: "",
    remainingText: "Calculating...",
  })

  // Fetch real prayer times for active coordinates
  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    fetch(`/api/prayer-times?lat=${coords.latitude}&lng=${coords.longitude}&method=3&school=0`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return
        if (json.data?.timings) {
          setTimings(json.data.timings)
          if (json.data.date?.hijri?.year) {
            setHijriDate(`${json.data.date.hijri.year} AH`)
          }
        }
      })
      .catch((e) => console.warn("Failed to fetch hero prayer times", e))
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [coords])

  // Countdown timer
  useEffect(() => {
    if (!timings) return

    const tick = () => {
      const now = new Date()
      const currentSecondsInDay = (now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()

      const schedule = [
        { name: "Fajr", arabic: "الفجر", raw: (timings.Fajr || "").split(" ")[0] },
        { name: "Dhuhr", arabic: "الظهر", raw: (timings.Dhuhr || "").split(" ")[0] },
        { name: "Asr", arabic: "العصر", raw: (timings.Asr || "").split(" ")[0] },
        { name: "Maghrib", arabic: "المغرب", raw: (timings.Maghrib || "").split(" ")[0] },
        { name: "Isha", arabic: "العشاء", raw: (timings.Isha || "").split(" ")[0] },
      ]

      let foundNext: any = null

      for (const p of schedule) {
        const [h, m] = p.raw.split(":").map(Number)
        if (isNaN(h) || isNaN(m)) continue
        const sec = (h * 60 + m) * 60
        if (sec > currentSecondsInDay) {
          foundNext = {
            name: p.name,
            arabic: p.arabic,
            time: convertTo12Hour(p.raw),
            raw24: p.raw,
            diffSec: sec - currentSecondsInDay,
          }
          break
        }
      }

      // Next day Fajr fallback
      if (!foundNext) {
        const fajrRaw = (timings.Fajr || "").split(" ")[0]
        const [fh, fm] = fajrRaw.split(":").map(Number)
        const fajrTomorrowSec = 24 * 3600 + (fh * 60 + fm) * 60
        foundNext = {
          name: "Fajr",
          arabic: "الفجر",
          time: convertTo12Hour(fajrRaw),
          raw24: fajrRaw,
          diffSec: fajrTomorrowSec - currentSecondsInDay,
        }
      }

      const hours = Math.floor(foundNext.diffSec / 3600)
      const minutes = Math.floor((foundNext.diffSec % 3600) / 60)
      const seconds = foundNext.diffSec % 60

      setNextPrayer({
        name: foundNext.name,
        arabic: foundNext.arabic,
        time: foundNext.time,
        raw24: foundNext.raw24,
        remainingText: `${hours}h ${minutes}m ${seconds}s`,
      })
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [timings])

  return (
    <div className="rounded-3xl border border-[#C8A96B]/30 bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] p-7 sm:p-8 shadow-[0_20px_50px_rgba(18,61,50,0.18)] space-y-6">
      {/* Header: Location & Lunar Hijri Date */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
        <LocationSelectorDialog>
          <button
            type="button"
            className="flex items-center gap-2.5 text-left group hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B] shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-serif font-medium text-sm text-[#F7F5EF] group-hover:text-[#C8A96B] transition">
                {locationDetails?.city || "Set Your Location"}
              </p>
              <div className="text-[10px] font-mono text-[#A9B9A7] flex items-center gap-1.5">
                {coords ? (
                  <>
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        method === "gps"
                          ? "bg-emerald-400 animate-pulse"
                          : method === "ip"
                          ? "bg-amber-400"
                          : "bg-sky-400"
                      }`}
                    />
                    <span>
                      {coords.latitude.toFixed(2)}°, {coords.longitude.toFixed(2)}° (
                      {method === "gps" ? "GPS" : method === "ip" ? "Network" : "Manual"})
                    </span>
                  </>
                ) : (
                  <span>Click to enable location</span>
                )}
              </div>
            </div>
          </button>
        </LocationSelectorDialog>

        <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] border border-[#C8A96B]/30">
          {hijriDate}
        </span>
      </div>

      {/* Primary Next Prayer Focus */}
      {coords ? (
        <div className="space-y-1.5 py-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B9A7]">
            Upcoming Obligation
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-4xl font-light text-[#F7F5EF] tracking-tight">
              {nextPrayer.name}{" "}
              <span className="text-xl font-arabic text-[#C8A96B]" dir="rtl">
                {nextPrayer.arabic}
              </span>
            </h3>
            <span className="font-mono text-xl text-[#C8A96B] font-medium">
              {nextPrayer.time}
            </span>
          </div>
          <p className="text-xs text-[#A9B9A7] font-mono">
            Time remaining:{" "}
            <span className="text-[#F7F5EF] font-semibold">{nextPrayer.remainingText}</span>
          </p>
        </div>
      ) : (
        <div className="py-4 space-y-3">
          <p className="text-xs text-[#A9B9A7] leading-relaxed">
            Location access is required to compute verified astronomical prayer times for your exact coordinates.
          </p>

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              disabled={isDetecting}
              onClick={() => requestGpsLocation()}
              className="bg-[#C8A96B] hover:bg-[#d8bd85] text-[#101A16] rounded-full text-xs font-semibold gap-1.5 shadow-sm"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  Enable GPS
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isDetecting}
              onClick={() => detectIpLocation()}
              className="rounded-full text-xs border-white/20 text-[#F7F5EF] hover:bg-white/10 gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[#C8A96B]" />
              Detect via Network
            </Button>

            <LocationSelectorDialog>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs border-white/20 text-[#F7F5EF] hover:bg-white/10"
              >
                Search City
              </Button>
            </LocationSelectorDialog>
          </div>
        </div>
      )}

      {/* 5 Daily Prayers Timetable Grid */}
      {timings && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A9B9A7] uppercase tracking-wider mb-1">
            <span>Astronomical Timetable</span>
            <span>Muslim World League</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[
              { name: "Fajr", raw: timings.Fajr },
              { name: "Dhuhr", raw: timings.Dhuhr },
              { name: "Asr", raw: timings.Asr },
              { name: "Maghrib", raw: timings.Maghrib },
              { name: "Isha", raw: timings.Isha },
            ].map((p) => {
              const formatted = convertTo12Hour(p.raw || "")
              const isNext = nextPrayer.name === p.name
              return (
                <div
                  key={p.name}
                  className={`py-2 px-1 rounded-xl transition ${
                    isNext
                      ? "bg-[#C8A96B] text-[#123D32] font-semibold shadow-sm"
                      : "bg-white/5 text-[#A9B9A7] hover:bg-white/10"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider font-mono opacity-80">{p.name}</p>
                  <p className="text-[11px] font-mono font-medium mt-0.5">{formatted.split(" ")[0]}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom Quick Action */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <Link
          href="/feature?type=prayer-times"
          className="text-[#C8A96B] hover:underline flex items-center gap-1 font-medium"
        >
          View Full Timetable & Calculation Settings
          <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-[10px] font-mono text-[#A9B9A7]/60">AlAdhan API</span>
      </div>
    </div>
  )
}
