"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

import Header from "@/components/header"
import LocationPrayerTimes from "@/components/location-prayer-times"
import QuranSurahReader from "@/components/quran-surah-reader"
import ZakatCalculator from "@/components/zakat-calculator"
import HajjUmrahGuide from "@/components/hajj-umrah-guide"
import DailyQuote from "@/components/daily-quote"
import MemorizationTracker from "@/components/memorization-tracker"
import PrayerTracker from "@/components/prayer-tracker"
import PrayerStreakTracker from "@/components/prayer-streak-tracker"
import IslamicEventsCalendar from "@/components/islamic-events-calendar"
import Qibla from "@/components/qibla"
import NearbyMosques from "@/components/nearby-mosques"
import PrayerReminderSystem from "@/components/prayer-reminder-system"
import UniqueAdvancedFeatures from "@/components/unique-advanced-features"
import QuranicWordSearch from "@/components/quranic-word-search"
import DailyDhikr from "@/components/daily-dikr"
import QuranTafsirReader from "@/components/quran-tafsir-reader"
import AudioQuranPlayer from "@/components/audio-quran-player"
import SunnahDailyTips from "@/components/sunnah-daily-tips"
import ProgressAnalytics from "@/components/progress-analytics"

const FEATURE_TITLES: Record<string, string> = {
  "prayer-times": "Prayer Times",
  quran: "Quran Reader - Surah Wise",
  zakat: "Zakat Calculator",
  hajj: "Hajj & Umrah Guide",
  hadith: "Daily Islamic Quote",
  memorization: "Memorization Tracker",
  "prayer-tracker": "Prayer Tracker",
  "prayer-streak": "Prayer Streak Tracker",
  reminders: "Prayer Reminders & Islamic Daily",
  calendar: "Islamic Calendar",
  qibla: "Qibla Direction",
  mosques: "Nearby Mosques",
  "unique-features": "Islamic Learning & Community",
  "word-search": "Quranic Word Search",
  "daily-dhikr": "Daily Islamic Dhikr",
  tafsir: "Quran Tafsir (Explanation)",
  "audio-quran": "Audio Quran Player",
  "sunnah-tips": "Daily Sunnah Tips",
  analytics: "Progress Analytics",
}

export default function FeatureContentLoader() {
  const searchParams = useSearchParams()
  const feature = searchParams.get("type") || "prayer-times"

  console.log("[v0] Feature router received type:", feature)

  const renderFeature = () => {
    console.log("[v0] Rendering feature:", feature)

    switch (feature) {
      case "prayer-times":
        console.log("[v0] Rendering prayer-times")
        return <LocationPrayerTimes />
      case "quran":
        console.log("[v0] Rendering quran")
        return <QuranSurahReader />
      case "zakat":
        console.log("[v0] Rendering zakat")
        return <ZakatCalculator />
      case "hajj":
        console.log("[v0] Rendering hajj")
        return <HajjUmrahGuide />
      case "hadith":
        console.log("[v0] Rendering hadith")
        return <DailyQuote />
      case "memorization":
        console.log("[v0] Rendering memorization")
        return <MemorizationTracker />
      case "prayer-tracker":
        console.log("[v0] Rendering prayer-tracker")
        return <PrayerTracker />
      case "prayer-streak":
        console.log("[v0] Rendering prayer-streak")
        return <PrayerStreakTracker />
      case "reminders":
        console.log("[v0] Rendering reminders")
        return <PrayerReminderSystem />
      case "calendar":
        console.log("[v0] Rendering calendar")
        return <IslamicEventsCalendar />
      case "qibla":
        console.log("[v0] Rendering qibla")
        return <Qibla />
      case "mosques":
        console.log("[v0] Rendering mosques")
        return <NearbyMosques />
      case "unique-features":
        console.log("[v0] Rendering unique-features")
        return <UniqueAdvancedFeatures />
      case "word-search":
        console.log("[v0] Rendering word-search")
        return <QuranicWordSearch />
      case "daily-dhikr":
        console.log("[v0] Rendering daily-dhikr")
        return <DailyDhikr />
      case "tafsir":
        console.log("[v0] Rendering tafsir")
        return <QuranTafsirReader />
      case "audio-quran":
        console.log("[v0] Rendering audio-quran")
        return <AudioQuranPlayer />
      case "sunnah-tips":
        console.log("[v0] Rendering sunnah-tips")
        return <SunnahDailyTips />
      case "analytics":
        console.log("[v0] Rendering analytics")
        return <ProgressAnalytics />
      default:
        console.log("[v0] No matching feature, defaulting to prayer-times")
        return <LocationPrayerTimes />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">{FEATURE_TITLES[feature] || "Feature"}</h1>
        </div>

        <div className="bg-card rounded-lg border border-primary/10 p-8">{renderFeature()}</div>
      </main>
    </div>
  )
}
