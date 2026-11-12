"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ChevronLeft, Compass, BookOpen, Clock, Heart, Sparkles, SlidersHorizontal } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"

const LocationPrayerTimes = dynamic(() => import("@/components/location-prayer-times"), { ssr: false })
const QuranSurahReader = dynamic(() => import("@/components/quran-surah-reader"), { ssr: false })
const ZakatCalculator = dynamic(() => import("@/components/zakat-calculator"), { ssr: false })
const HajjUmrahGuide = dynamic(() => import("@/components/hajj-umrah-guide"), { ssr: false })
const DailyQuote = dynamic(() => import("@/components/daily-quote"), { ssr: false })
const MemorizationTracker = dynamic(() => import("@/components/memorization-tracker"), { ssr: false })
const PrayerTracker = dynamic(() => import("@/components/prayer-tracker"), { ssr: false })
const PrayerStreakTracker = dynamic(() => import("@/components/prayer-streak-tracker"), { ssr: false })
const IslamicEventsCalendar = dynamic(() => import("@/components/islamic-events-calendar"), { ssr: false })
const Qibla = dynamic(() => import("@/components/qibla"), { ssr: false })
const NearbyMosques = dynamic(() => import("@/components/nearby-mosques"), { ssr: false })
const PrayerReminderSystem = dynamic(() => import("@/components/prayer-reminder-system"), { ssr: false })
const UniqueAdvancedFeatures = dynamic(() => import("@/components/unique-advanced-features"), { ssr: false })
const QuranicWordSearch = dynamic(() => import("@/components/quranic-word-search"), { ssr: false })
const DailyDhikr = dynamic(() => import("@/components/daily-dikr"), { ssr: false })
const QuranTafsirReader = dynamic(() => import("@/components/quran-tafsir-reader"), { ssr: false })
const AudioQuranPlayer = dynamic(() => import("@/components/audio-quran-player"), { ssr: false })
const SunnahDailyTips = dynamic(() => import("@/components/sunnah-daily-tips"), { ssr: false })
const ProgressAnalytics = dynamic(() => import("@/components/progress-analytics"), { ssr: false })
const DikrCounter = dynamic(() => import("@/components/dikr-counter"), { ssr: false })

interface FeatureMeta {
  title: string
  category: string
  description: string
  related: { id: string; label: string }[]
}

const FEATURE_METADATA: Record<string, FeatureMeta> = {
  "prayer-times": {
    title: "Prayer Times & Timetable",
    category: "Worship",
    description: "Astronomically precise daily prayer schedules with GPS location detection and customizable calculation standards.",
    related: [
      { id: "prayer-tracker", label: "Prayer Tracker" },
      { id: "prayer-streak", label: "Streak" },
      { id: "qibla", label: "Qibla Direction" },
      { id: "reminders", label: "Reminders" },
    ],
  },
  quran: {
    title: "The Noble Quran",
    category: "Quran",
    description: "Read complete Surahs with authentic Uthmani calligraphy, verified Saheeh International English translation, and Ayah bookmarks.",
    related: [
      { id: "audio-quran", label: "Audio Recitations" },
      { id: "tafsir", label: "Tafsir" },
      { id: "word-search", label: "Word Search" },
      { id: "memorization", label: "Memorization" },
    ],
  },
  "audio-quran": {
    title: "Audio Quran Player",
    category: "Quran",
    description: "Listen to reverent recitations from authentic international Qaris with continuous background streaming.",
    related: [
      { id: "quran", label: "Quran Reader" },
      { id: "tafsir", label: "Tafsir" },
      { id: "memorization", label: "Memorization" },
    ],
  },
  "dikr-counter": {
    title: "Mindful Tasbih Counter",
    category: "Daily Practice",
    description: "A distraction-free, tactile circular counter with acoustic wood taps, device haptics, preset supplications, and session logs.",
    related: [
      { id: "daily-dhikr", label: "Daily Dhikr" },
      { id: "hadith", label: "Daily Hadith" },
      { id: "sunnah-tips", label: "Sunnah Tips" },
    ],
  },
  "daily-dhikr": {
    title: "Daily Islamic Dhikr",
    category: "Daily Practice",
    description: "Morning and evening Adhkar with authentic hadith references and spiritual virtues.",
    related: [
      { id: "dikr-counter", label: "Tasbih Dial" },
      { id: "hadith", label: "Daily Hadith" },
      { id: "sunnah-tips", label: "Sunnah Tips" },
    ],
  },
  zakat: {
    title: "Zakat Calculator",
    category: "Islamic Tools",
    description: "Calculate your annual Islamic financial obligation against the gold and silver Nisab thresholds.",
    related: [
      { id: "hajj", label: "Hajj & Umrah" },
      { id: "calendar", label: "Islamic Calendar" },
      { id: "mosques", label: "Nearby Mosques" },
    ],
  },
  hajj: {
    title: "Hajj & Umrah Guide",
    category: "Islamic Tools",
    description: "Step-by-step interactive ritual guide and supplications for pilgrims embarking on Hajj or Umrah.",
    related: [
      { id: "zakat", label: "Zakat Calculator" },
      { id: "calendar", label: "Islamic Calendar" },
      { id: "qibla", label: "Qibla" },
    ],
  },
  hadith: {
    title: "Daily Authentic Hadith",
    category: "Daily Practice",
    description: "Authentic Prophetic traditions with scholarly commentary for daily spiritual contemplation.",
    related: [
      { id: "sunnah-tips", label: "Sunnah Tips" },
      { id: "daily-dhikr", label: "Daily Dhikr" },
      { id: "dikr-counter", label: "Tasbih" },
    ],
  },
  memorization: {
    title: "Memorization Tracker (Hifz)",
    category: "Quran",
    description: "Track your personal Quran memorization journey with progress percentages and verse markers.",
    related: [
      { id: "quran", label: "Quran Reader" },
      { id: "audio-quran", label: "Audio Reciter" },
      { id: "analytics", label: "Spiritual Analytics" },
    ],
  },
  "prayer-tracker": {
    title: "Daily Prayer Tracker",
    category: "Worship",
    description: "Log your 5 daily obligatory prayers to maintain discipline and evaluate weekly consistency.",
    related: [
      { id: "prayer-times", label: "Prayer Times" },
      { id: "prayer-streak", label: "Streak Tracker" },
      { id: "analytics", label: "Analytics" },
    ],
  },
  "prayer-streak": {
    title: "Prayer Streak & Consistency",
    category: "Worship",
    description: "Build lasting spiritual habits and celebrate consecutive days of fulfilled obligations.",
    related: [
      { id: "prayer-tracker", label: "Prayer Tracker" },
      { id: "prayer-times", label: "Prayer Times" },
      { id: "analytics", label: "Analytics" },
    ],
  },
  reminders: {
    title: "Prayer Reminders & Adhan Alerts",
    category: "Worship",
    description: "Set personalized notifications before or at the moment of each prayer call.",
    related: [
      { id: "prayer-times", label: "Prayer Times" },
      { id: "prayer-tracker", label: "Prayer Tracker" },
    ],
  },
  calendar: {
    title: "Hijri Islamic Calendar",
    category: "Islamic Tools",
    description: "Explore the lunar calendar, sacred months, historical Islamic events, and Ramadan dates.",
    related: [
      { id: "prayer-times", label: "Prayer Times" },
      { id: "zakat", label: "Zakat Calculator" },
    ],
  },
  qibla: {
    title: "Qibla Direction",
    category: "Worship",
    description: "Align precisely towards the Holy Kaaba in Makkah with sensor compass and map calculation.",
    related: [
      { id: "prayer-times", label: "Prayer Times" },
      { id: "mosques", label: "Nearby Mosques" },
    ],
  },
  mosques: {
    title: "Nearby Mosques Finder",
    category: "Islamic Tools",
    description: "Locate mosques and Islamic centers near your geographical coordinates.",
    related: [
      { id: "qibla", label: "Qibla Direction" },
      { id: "prayer-times", label: "Prayer Times" },
    ],
  },
  "unique-features": {
    title: "Islamic Learning & Community",
    category: "Personal Growth",
    description: "Explore articles, community insights, and foundational knowledge of Islamic practice.",
    related: [
      { id: "analytics", label: "Analytics" },
      { id: "hadith", label: "Hadith" },
    ],
  },
  "word-search": {
    title: "Quranic Word Search",
    category: "Quran",
    description: "Discover the frequency and occurrences of words throughout the Noble Quran.",
    related: [
      { id: "quran", label: "Quran Reader" },
      { id: "tafsir", label: "Tafsir" },
    ],
  },
  tafsir: {
    title: "Quran Tafsir (Scholarly Commentary)",
    category: "Quran",
    description: "Deepen your understanding with verse-by-verse scholarly explanations.",
    related: [
      { id: "quran", label: "Quran Reader" },
      { id: "word-search", label: "Word Search" },
      { id: "audio-quran", label: "Audio Quran" },
    ],
  },
  "sunnah-tips": {
    title: "Daily Sunnah Traditions",
    category: "Daily Practice",
    description: "Timeless habits and etiquettes from the Sunnah of Prophet Muhammad (ﷺ).",
    related: [
      { id: "hadith", label: "Daily Hadith" },
      { id: "daily-dhikr", label: "Daily Dhikr" },
    ],
  },
  analytics: {
    title: "Spiritual Consistency & Analytics",
    category: "Personal Growth",
    description: "Review your actual stored prayer consistency, Quran reading minutes, and Dhikr progress.",
    related: [
      { id: "prayer-tracker", label: "Prayer Tracker" },
      { id: "dikr-counter", label: "Tasbih" },
      { id: "memorization", label: "Memorization" },
    ],
  },
}

function LoadingFallback() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 py-16">
      <div className="h-10 bg-muted/60 rounded-xl animate-pulse w-1/3" />
      <div className="h-64 bg-muted/40 rounded-3xl animate-pulse" />
    </div>
  )
}

function FeatureContentComponent() {
  const searchParams = useSearchParams()
  const featureKey = searchParams.get("type") || "prayer-times"
  const meta = FEATURE_METADATA[featureKey] || FEATURE_METADATA["prayer-times"]
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [featureKey])

  if (!mounted) return <LoadingFallback />

  const renderActiveFeature = () => {
    switch (featureKey) {
      case "prayer-times":
        return <LocationPrayerTimes />
      case "quran":
        return <QuranSurahReader />
      case "zakat":
        return <ZakatCalculator />
      case "hajj":
        return <HajjUmrahGuide />
      case "hadith":
        return <DailyQuote />
      case "memorization":
        return <MemorizationTracker />
      case "prayer-tracker":
        return <PrayerTracker />
      case "prayer-streak":
        return <PrayerStreakTracker />
      case "reminders":
        return <PrayerReminderSystem />
      case "calendar":
        return <IslamicEventsCalendar />
      case "qibla":
        return <Qibla />
      case "mosques":
        return <NearbyMosques />
      case "unique-features":
        return <UniqueAdvancedFeatures />
      case "word-search":
        return <QuranicWordSearch />
      case "daily-dhikr":
        return <DailyDhikr />
      case "tafsir":
        return <QuranTafsirReader />
      case "audio-quran":
        return <AudioQuranPlayer />
      case "sunnah-tips":
        return <SunnahDailyTips />
      case "analytics":
        return <ProgressAnalytics />
      case "dikr-counter":
        return <DikrCounter />
      default:
        return <LocationPrayerTimes />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />

      {/* Feature Header Banner */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href="/home"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition font-mono"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Overview
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs font-mono uppercase tracking-widest text-[#123D32] dark:text-[#C8A96B]">
                  {meta.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-foreground font-normal">
                {meta.title}
              </h1>
            </div>

            {/* Related Feature Quick Switcher */}
            {meta.related.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-muted-foreground mr-1 hidden md:inline">
                  Related:
                </span>
                {meta.related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/feature?type=${r.id}`}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-border hover:border-[#C8A96B]/50 hover:bg-muted text-foreground transition"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {meta.description}
          </p>
        </div>
      </section>

      {/* Main Feature Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {renderActiveFeature()}
      </main>

      {/* Editorial Mini Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground font-mono">
        Deen Connect • Authentic Islamic Platform
      </footer>
    </div>
  )
}

export default function FeatureContentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FeatureContentComponent />
    </Suspense>
  )
}
