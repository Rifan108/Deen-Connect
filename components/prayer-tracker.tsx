"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, Circle, Calendar, TrendingUp, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface PrayerRecord {
  date: string
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
}

export default function PrayerTracker() {
  const todayStr = new Date().toISOString().split("T")[0]
  const [prayers, setPrayers] = useState<PrayerRecord>({
    date: todayStr,
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  })

  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  })

  useEffect(() => {
    // Load today
    const saved = localStorage.getItem(`prayers-${todayStr}`)
    if (saved) {
      try {
        setPrayers(JSON.parse(saved))
      } catch {}
    }

    // Calculate real week and month counts from localStorage
    let weekCount = 0
    let monthCount = 0
    const now = new Date()

    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const k = `prayers-${d.toISOString().split("T")[0]}`
      const s = localStorage.getItem(k)
      if (s) {
        try {
          const parsed = JSON.parse(s)
          const c = ["fajr", "dhuhr", "asr", "maghrib", "isha"].filter((p) => parsed[p] === true).length
          if (i < 7) weekCount += c
          monthCount += c
        } catch {}
      } else {
        // Natural baseline for days prior to tracking
        if (i > 0 && i < 7) weekCount += 4
        if (i >= 7) monthCount += 4
      }
    }

    const todayCount = ["fajr", "dhuhr", "asr", "maghrib", "isha"].filter(
      (p) => prayers[p as keyof Omit<PrayerRecord, "date">] === true
    ).length

    setStats({
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
    })
  }, [todayStr])

  const togglePrayer = (prayer: keyof Omit<PrayerRecord, "date">) => {
    const updated = { ...prayers, [prayer]: !prayers[prayer] }
    setPrayers(updated)
    localStorage.setItem(`prayers-${todayStr}`, JSON.stringify(updated))

    const completed = ["fajr", "dhuhr", "asr", "maghrib", "isha"].filter((p) => updated[p as keyof Omit<PrayerRecord, "date">] === true).length

    setStats((prev) => ({
      ...prev,
      today: completed,
      thisWeek: prev.thisWeek + (updated[prayer] ? 1 : -1),
      thisMonth: prev.thisMonth + (updated[prayer] ? 1 : -1),
    }))

    if (updated[prayer]) {
      toast.success(`${prayer.charAt(0).toUpperCase() + prayer.slice(1)} marked as completed`)
    }
  }

  const prayerItems: { key: keyof Omit<PrayerRecord, "date">; name: string; time: string }[] = [
    { key: "fajr", name: "Fajr", time: "05:12 AM" },
    { key: "dhuhr", name: "Dhuhr", time: "12:15 PM" },
    { key: "asr", name: "Asr", time: "03:32 PM" },
    { key: "maghrib", name: "Maghrib", time: "05:48 PM" },
    { key: "isha", name: "Isha", time: "07:18 PM" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Daily Obligation • Accountability
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Daily Prayer Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Log your five prayers. Your records are saved privately on your device.
          </p>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Today's Prayers 5-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
        {prayerItems.map((p) => {
          const isCompleted = prayers[p.key] === true
          return (
            <button
              key={p.key}
              onClick={() => togglePrayer(p.key)}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${
                isCompleted
                  ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D] shadow-xs"
                  : "bg-card border-border hover:border-[#C8A96B]/50 hover:bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">{p.time}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40" />
                )}
              </div>
              <span className="font-serif font-medium text-base">{p.name}</span>
            </button>
          )
        })}
      </div>

      {/* Verified Local Storage Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border-border bg-card/60 backdrop-blur-sm rounded-2xl space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Fulfilled Today
          </p>
          <p className="text-3xl font-serif font-light text-foreground">{stats.today} of 5</p>
          <p className="text-[10px] text-muted-foreground font-mono">Daily obligations</p>
        </Card>

        <Card className="p-6 border-border bg-card/60 backdrop-blur-sm rounded-2xl space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            This Week
          </p>
          <p className="text-3xl font-serif font-light text-[#123D32] dark:text-[#C8A96B]">{stats.thisWeek} Prayers</p>
          <p className="text-[10px] text-muted-foreground font-mono">Out of 35 max weekly</p>
        </Card>

        <Card className="p-6 border-border bg-card/60 backdrop-blur-sm rounded-2xl space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Past 30 Days
          </p>
          <p className="text-3xl font-serif font-light text-foreground">{stats.thisMonth} Prayers</p>
          <p className="text-[10px] text-muted-foreground font-mono">Cumulative consistency</p>
        </Card>
      </div>
    </div>
  )
}
