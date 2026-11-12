"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Flame,
  Volume2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react"

import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAudioPlayer } from "@/components/audio-context"

const LocationPrayerTimes = dynamic(() => import("@/components/location-prayer-times"), { ssr: false })
const ProgressAnalytics = dynamic(() => import("@/components/progress-analytics"), { ssr: false })
const DikrCounter = dynamic(() => import("@/components/dikr-counter"), { ssr: false })

export default function Dashboard() {
  const { playSurah, resumeLastSession, lastSavedSession, currentSurah, isPlaying } = useAudioPlayer()

  // Local storage prayer state for today
  const todayKey = new Date().toISOString().split("T")[0]
  const [todayPrayers, setTodayPrayers] = useState<{ [key: string]: boolean }>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  })
  const [todayDhikr, setTodayDhikr] = useState<number>(0)
  const [streak, setStreak] = useState<number>(12)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`prayers-${todayKey}`)
      if (saved) setTodayPrayers(JSON.parse(saved))

      const dCount = localStorage.getItem("dikr-today-count")
      if (dCount) setTodayDhikr(Number(dCount))

      const strk = localStorage.getItem("deen_connect_prayer_streak")
      if (strk) setStreak(Number(strk))
    } catch {}
  }, [todayKey])

  const togglePrayer = (pKey: string) => {
    const updated = { ...todayPrayers, [pKey]: !todayPrayers[pKey] }
    setTodayPrayers(updated)
    localStorage.setItem(`prayers-${todayKey}`, JSON.stringify(updated))
  }

  const completedCount = Object.values(todayPrayers).filter(Boolean).length

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />

      {/* Dashboard Top Editorial Bar */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#123D32] dark:text-[#C8A96B]">
                Personal Sanctuary • Overview
              </span>
              <h1 className="text-3xl font-serif text-foreground font-normal mt-0.5">
                Spiritual Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3.5 py-2 rounded-2xl bg-card border border-border flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-[#C8A96B]" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Streak</p>
                  <p className="text-xs font-serif font-bold text-foreground">{streak} Days</p>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-card border border-border flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#123D32] dark:text-[#C8A96B]" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Prayers</p>
                  <p className="text-xs font-serif font-bold text-foreground">{completedCount} of 5</p>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-card border border-border flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Dhikr</p>
                  <p className="text-xs font-serif font-bold text-foreground">{todayDhikr} times</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10 w-full">
        {/* Today's Obligations Check-in */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Today's Five Prayers Check-in
              </h2>
              <p className="text-xs text-muted-foreground">
                Mark each prayer as completed. Records are saved locally to update your consistency rate.
              </p>
            </div>
            <Link href="/feature?type=prayer-tracker" className="text-xs text-[#C8A96B] hover:underline font-medium">
              View History →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: "fajr", name: "Fajr", time: "05:12 AM" },
              { id: "dhuhr", name: "Dhuhr", time: "12:15 PM" },
              { id: "asr", name: "Asr", time: "03:32 PM" },
              { id: "maghrib", name: "Maghrib", time: "05:48 PM" },
              { id: "isha", name: "Isha", time: "07:18 PM" },
            ].map((p) => {
              const isChecked = todayPrayers[p.id] === true
              return (
                <button
                  key={p.id}
                  onClick={() => togglePrayer(p.id)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between h-24 ${
                    isChecked
                      ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D] shadow-sm"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">{p.time}</span>
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </div>
                  <span className="font-serif font-semibold text-base">{p.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Two-Column Module Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quran Audio & Reading Continuity */}
          <div className="lg:col-span-7 space-y-6">
            {/* Audio Continue Card */}
            <div className="p-6 rounded-3xl border border-border bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] shadow-md space-y-4">
              <div className="flex items-center justify-between text-xs text-[#A9B9A7]">
                <span className="font-mono uppercase tracking-widest text-[10px]">Quran Recitation</span>
                <Volume2 className="w-4 h-4 text-[#C8A96B]" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-light text-[#F7F5EF]">
                  Surah {currentSurah.name} ({currentSurah.arabicName})
                </h3>
                <p className="text-xs text-[#A9B9A7] mt-1">
                  {lastSavedSession ? `Resume at ${Math.floor(lastSavedSession.time / 60)}m` : "Ready to listen"}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={resumeLastSession}
                  className="rounded-full px-6 text-xs bg-[#C8A96B] text-[#123D32] hover:bg-[#d8bd85] font-semibold"
                >
                  {isPlaying ? "Continue Listening" : "Resume Audio"}
                </Button>
                <Link href="/feature?type=quran">
                  <Button variant="outline" className="rounded-full text-xs border-white/20 text-[#F7F5EF] hover:bg-white/10">
                    Read Ayahs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Prayer Times Section in Dashboard */}
            <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-lg font-medium text-foreground">Prayer Timetable</h3>
                <Link href="/feature?type=prayer-times" className="text-xs text-[#C8A96B] hover:underline font-medium">
                  Full Timetable →
                </Link>
              </div>
              <LocationPrayerTimes />
            </div>
          </div>

          {/* Right Column: Tasbih & Shortcuts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Tasbih Dial Widget */}
            <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-lg font-medium text-foreground">Tasbih Remembrance</h3>
                <Link href="/feature?type=dikr-counter" className="text-xs text-[#C8A96B] hover:underline font-medium">
                  Full Dial →
                </Link>
              </div>
              <div className="text-center py-4 space-y-2">
                <p className="font-arabic text-2xl text-[#123D32] dark:text-[#C8A96B]" dir="rtl">
                  سُبْحَانَ ٱللَّٰهِ
                </p>
                <p className="font-serif text-sm font-semibold text-foreground">SubhanAllah (33x)</p>
                <p className="text-xs text-muted-foreground">Recorded today: {todayDhikr} times</p>
              </div>
              <Link href="/feature?type=dikr-counter" className="block">
                <Button className="w-full rounded-2xl bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D] text-xs">
                  Open Tasbih Dial
                </Button>
              </Link>
            </div>

            {/* Quick Practical Shortcuts Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/feature?type=zakat", label: "Zakat Calculator", icon: "💰" },
                { href: "/feature?type=qibla", label: "Qibla Direction", icon: "🧭" },
                { href: "/feature?type=calendar", label: "Islamic Calendar", icon: "📅" },
                { href: "/feature?type=analytics", label: "Analytics", icon: "📈" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="p-4 rounded-2xl border border-border bg-card hover:border-[#C8A96B]/50 transition group flex flex-col justify-between h-24"
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-serif text-xs font-semibold text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B]">
                    {s.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Embedded Spiritual Analytics */}
        <div className="pt-6 border-t border-border">
          <ProgressAnalytics />
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground font-mono">
        Deen Connect • Personal Sanctuary Dashboard
      </footer>
    </div>
  )
}
