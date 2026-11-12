"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, CheckCircle2, Award, Calendar, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface Streak {
  prayerName: string
  current: number
  longest: number
  lastPrayed: string
  loggedToday: boolean
}

export default function PrayerStreakTracker() {
  const [streaks, setStreaks] = useState<Streak[]>([
    { prayerName: "Fajr", current: 12, longest: 65, lastPrayed: "Today", loggedToday: true },
    { prayerName: "Dhuhr", current: 8, longest: 45, lastPrayed: "Today", loggedToday: true },
    { prayerName: "Asr", current: 5, longest: 35, lastPrayed: "Yesterday", loggedToday: false },
    { prayerName: "Maghrib", current: 15, longest: 120, lastPrayed: "Today", loggedToday: true },
    { prayerName: "Isha", current: 10, longest: 85, lastPrayed: "Today", loggedToday: true },
  ])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deen_connect_streaks_list")
      if (saved) setStreaks(JSON.parse(saved))
    } catch {}
  }, [])

  const handleLogPrayer = (prayerName: string) => {
    const updated = streaks.map((s) =>
      s.prayerName === prayerName
        ? {
            ...s,
            current: s.current + 1,
            longest: Math.max(s.longest, s.current + 1),
            lastPrayed: "Today",
            loggedToday: true,
          }
        : s
    )
    setStreaks(updated)
    localStorage.setItem("deen_connect_streaks_list", JSON.stringify(updated))

    const activeDays = Math.max(...updated.map((s) => s.current))
    localStorage.setItem("deen_connect_prayer_streak", activeDays.toString())
    toast.success(`Alhamdulillah! ${prayerName} prayer logged (+1 to streak)`)
  }

  const totalStreakDays = streaks.reduce((sum, s) => sum + s.current, 0)
  const maxPossibleStreak = 250

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Habit Formation • Discipline
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Prayer Consistency & Streaks
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Cultivate steadfastness across all five daily prayers. Track individual prayer endurance and aggregate consistency.
          </p>
        </div>
      </div>

      {/* 5-Prayer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        {streaks.map((streak) => (
          <Card
            key={streak.prayerName}
            className="p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl hover:border-[#C8A96B]/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-medium text-sm text-foreground">{streak.prayerName}</span>
              <Flame className="w-4 h-4 text-[#C8A96B]" />
            </div>

            <div className="text-center py-1">
              <span className="text-4xl font-serif font-light text-foreground">{streak.current}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                Consecutive Days
              </p>
            </div>

            <div className="text-[11px] text-muted-foreground border-t border-border pt-2 flex justify-between font-mono">
              <span>Best: {streak.longest}d</span>
              <span>{streak.lastPrayed}</span>
            </div>

            <Button
              size="sm"
              disabled={streak.loggedToday}
              onClick={() => handleLogPrayer(streak.prayerName)}
              className={`w-full rounded-xl text-xs ${
                streak.loggedToday
                  ? "bg-[#123D32]/10 text-[#123D32] dark:bg-[#C8A96B]/20 dark:text-[#C8A96B] font-medium"
                  : "bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D]"
              }`}
            >
              {streak.loggedToday ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#C8A96B]" />
                  Logged Today
                </>
              ) : (
                "Log Prayer"
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Annual Milestone Progress Bar */}
      <Card className="p-6 sm:p-8 rounded-3xl border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-medium text-foreground">
              Cumulative Devotion Milestone
            </h4>
            <p className="text-xs text-muted-foreground">
              Total cumulative prayer streak days logged across your obligations
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-[#C8A96B]">
            {totalStreakDays} / {maxPossibleStreak} Days
          </span>
        </div>

        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#123D32] via-[#174C3D] to-[#C8A96B] rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (totalStreakDays / maxPossibleStreak) * 100)}%` }}
          />
        </div>
      </Card>
    </div>
  )
}
