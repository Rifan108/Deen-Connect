"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Compass,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Volume2,
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Award,
  Layers,
  HeartHandshake,
  Search,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun,
} from "lucide-react"

import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/components/audio-context"
import LocationPrayerTimes from "@/components/location-prayer-times"
import DikrCounter from "@/components/dikr-counter"

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const kickerRef = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const photoCardRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)

  const { playSurah, isPlaying } = useAudioPlayer()
  const [activePrayerCategory, setActivePrayerCategory] = useState<string>("all")

  // GSAP Entrance & ScrollTrigger Animation
  useEffect(() => {
    if (typeof window === "undefined") return
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Hero Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(kickerRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.8,
      })
        .from(
          titleRef.current,
          {
            opacity: 0,
            y: 28,
            duration: 1.1,
          },
          "-=0.5"
        )
        .from(
          descRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ctaRef.current,
          {
            opacity: 0,
            y: 18,
            duration: 0.7,
          },
          "-=0.5"
        )
        .from(
          photoCardRef.current,
          {
            opacity: 0,
            scale: 0.96,
            y: 30,
            duration: 1.2,
          },
          "-=0.9"
        )
        .from(
          quoteRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
          },
          "-=0.6"
        )

      // Section Reveals with ScrollTrigger
      gsap.utils.toArray<HTMLElement>(".gsap-reveal").forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 35,
          duration: 0.9,
          ease: "power2.out",
        })
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* 1. HERO SECTION (Asymmetrical Editorial Composition) */}
      <section
        ref={heroRef}
        className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden border-b border-border/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Typography & Actions */}
            <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">
              <span
                ref={kickerRef}
                className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#69766E] dark:text-[#A9B9A7]"
              >
                <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
                Anno Domini 2026 • 1447 AH • Digital Sanctuary
              </span>

              <h1
                ref={titleRef}
                className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-foreground text-balance leading-[1.08]"
              >
                Find Peace in <br />
                <span className="editorial-italic text-[#123D32] dark:text-[#C8A96B]">
                  Every Moment.
                </span>
              </h1>

              <p
                ref={descRef}
                className="text-base sm:text-lg text-[#69766E] dark:text-[#A9B9A7] max-w-xl font-sans font-normal leading-relaxed text-balance"
              >
                Your daily companion for Quran, prayer, remembrance and a more meaningful spiritual journey.
              </p>

              {/* Two Elegant Action Buttons */}
              <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#feature-explorer">
                  <Button
                    size="lg"
                    className="rounded-full px-7 text-xs font-semibold tracking-wide bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] shadow-md dark:bg-[#C8A96B] dark:text-[#101A16] dark:hover:bg-[#d8bd85] transition-transform active:scale-95"
                  >
                    Explore Features
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </a>

                <Link href="/feature?type=quran">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-7 text-xs font-medium tracking-wide border-border hover:border-[#C8A96B] hover:bg-card text-foreground transition-all"
                  >
                    Read the Quran
                  </Button>
                </Link>
              </div>

              {/* Serenity Verse Card */}
              <div
                ref={quoteRef}
                className="pt-6 border-t border-border/80 flex items-start gap-4 max-w-lg"
              >
                <div className="w-1 h-12 bg-[#C8A96B] rounded-full shrink-0" />
                <div className="space-y-1">
                  <p className="font-serif text-sm italic text-foreground/90 leading-snug">
                    "Unquestionably, by the remembrance of Allah hearts are assured."
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Surah Ar-Ra'd • 13:28
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Compact Prayer Information Component (Pure Architectural UI, No Picture) */}
            <div className="lg:col-span-5 relative" ref={photoCardRef}>
              <div className="rounded-3xl border border-[#C8A96B]/30 bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] p-7 sm:p-8 shadow-[0_20px_50px_rgba(18,61,50,0.18)] space-y-6">
                {/* Header: Location & Lunar Hijri Date */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-serif font-medium text-sm text-[#F7F5EF]">Riyadh, Saudi Arabia</p>
                      <p className="text-[10px] font-mono text-[#A9B9A7]">Detected via GPS / Network</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] border border-[#C8A96B]/30">
                    1447 AH
                  </span>
                </div>

                {/* Primary Next Prayer Focus */}
                <div className="space-y-1.5 py-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B9A7]">
                    Upcoming Obligation
                  </span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-4xl font-light text-[#F7F5EF] tracking-tight">
                      Asr <span className="text-xl font-arabic text-[#C8A96B]" dir="rtl">العصر</span>
                    </h3>
                    <span className="font-mono text-xl text-[#C8A96B] font-medium">
                      03:32 PM
                    </span>
                  </div>
                  <p className="text-xs text-[#A9B9A7] font-mono">
                    Time remaining: <span className="text-[#F7F5EF] font-semibold">1 hour 17 minutes</span>
                  </p>
                </div>

                {/* 5 Daily Prayers Timetable Grid */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A9B9A7] uppercase tracking-wider mb-1">
                    <span>Daily Schedule</span>
                    <span>Standard ISNA</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {[
                      { name: "Fajr", time: "05:12" },
                      { name: "Dhuhr", time: "12:15" },
                      { name: "Asr", time: "15:32", active: true },
                      { name: "Maghrib", time: "17:48" },
                      { name: "Isha", time: "19:18" },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className={`py-2 px-1 rounded-xl transition ${
                          p.active
                            ? "bg-[#C8A96B] text-[#123D32] font-semibold shadow-sm"
                            : "bg-white/5 text-[#A9B9A7] hover:bg-white/10"
                        }`}
                      >
                        <p className="text-[9px] uppercase tracking-wider font-mono opacity-80">{p.name}</p>
                        <p className="text-xs font-mono font-medium mt-0.5">{p.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <a
                    href="#prayer-times"
                    className="text-[#C8A96B] hover:underline flex items-center gap-1 font-medium"
                  >
                    View Complete Timetable & Settings →
                  </a>
                  <Link
                    href="/feature?type=qibla"
                    className="text-[#A9B9A7] hover:text-[#F7F5EF] flex items-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Qibla
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DISTINCTIVE PRAYER TIMES SECTION (Clean Timetable Layout) */}
      <section id="prayer-times" className="py-20 border-b border-border/60 gsap-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#69766E] dark:text-[#A9B9A7]">
              Accurate Calculations • Timetable
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
              Daily Prayer Schedule
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Calculated precisely for your location with authentic astronomical formulas and configurable juristic methods.
            </p>
          </div>

          <LocationPrayerTimes />
        </div>
      </section>

      {/* 3. FEATURE EXPLORER (Categorized with Distinct Layouts per Category) */}
      <section id="feature-explorer" className="py-24 space-y-24 gsap-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#69766E] dark:text-[#A9B9A7]">
              Spiritual Ecosystem • Categorized
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
              The Digital Sanctuary
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Each discipline of your practice given an intentional, distraction-free environment.
            </p>
          </div>

          {/* CATEGORY 1: QURAN — Editorial Feature Block */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Category 01</span>
                <h3 className="font-serif text-2xl text-foreground font-medium">The Noble Quran</h3>
              </div>
              <Link href="/feature?type=quran" className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium">
                Open Reader <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Asymmetrical Hero Feature Block for Quran */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Large Story Card */}
              <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-8 flex flex-col justify-between space-y-8 shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#123D32]/10 dark:bg-[#C8A96B]/15 text-[#123D32] dark:text-[#C8A96B]">
                      Surah-Wise Study
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">114 Surahs</span>
                  </div>
                  <h4 className="font-serif text-3xl text-foreground font-light">
                    Complete Surah Reader with Uthmani Script & Verified Translations
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Immerse yourself in authentic typography, verse-by-verse bookmarks, and scholarly translations curated for deep reflection and daily reading.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Link href="/feature?type=quran">
                    <Button className="rounded-full text-xs bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D]">
                      Open Quran Reader
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => playSurah(1)}
                    className="rounded-full text-xs gap-1.5 border-border"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#C8A96B]" />
                    Listen to Al-Fatiha
                  </Button>
                </div>
              </div>

              {/* Supporting Secondary Quran Modules */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                <Link
                  href="/feature?type=audio-quran"
                  className="p-6 rounded-3xl border border-border bg-card hover:border-[#C8A96B]/50 transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Continuous Playback</span>
                    <Volume2 className="w-4 h-4 text-[#C8A96B]" />
                  </div>
                  <div className="mt-4">
                    <h5 className="font-serif text-lg font-medium text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition">
                      Audio Quran & Reciters
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mishary Al-Afasy, Sudais, Abdul Basit, and Yasser Al-Dosari with persistent audio stream.
                    </p>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/feature?type=tafsir"
                    className="p-5 rounded-2xl border border-border bg-card hover:border-[#C8A96B]/50 transition group"
                  >
                    <BookOpen className="w-4 h-4 text-[#123D32] dark:text-[#C8A96B] mb-2" />
                    <h5 className="font-serif text-sm font-medium text-foreground group-hover:text-[#C8A96B] transition">
                      Quran Tafsir
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Scholar explanations</p>
                  </Link>

                  <Link
                    href="/feature?type=word-search"
                    className="p-5 rounded-2xl border border-border bg-card hover:border-[#C8A96B]/50 transition group"
                  >
                    <Search className="w-4 h-4 text-[#123D32] dark:text-[#C8A96B] mb-2" />
                    <h5 className="font-serif text-sm font-medium text-foreground group-hover:text-[#C8A96B] transition">
                      Word Search
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Explore Quranic vocabulary</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY 2: WORSHIP — Minimal Icon-and-Text Rows */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Category 02</span>
                <h3 className="font-serif text-2xl text-foreground font-medium">Worship & Obligation</h3>
              </div>
              <Link href="/feature?type=prayer-tracker" className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium">
                Prayer Tracker <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Clean Minimal Horizontal Rows Layout */}
            <div className="bg-card border border-border rounded-3xl divide-y divide-border overflow-hidden shadow-xs">
              {[
                {
                  href: "/feature?type=prayer-tracker",
                  title: "Prayer Tracker",
                  desc: "Log daily Fajr, Dhuhr, Asr, Maghrib, and Isha with persistent local records.",
                  badge: "Daily Tracking",
                  icon: CheckCircle2,
                },
                {
                  href: "/feature?type=prayer-streak",
                  title: "Prayer Streak & Consistency",
                  desc: "Build unwavering prayer discipline with milestone recognition.",
                  badge: "Consistency",
                  icon: Flame,
                },
                {
                  href: "/feature?type=qibla",
                  title: "Qibla Direction Compass",
                  desc: "Accurate Mecca alignment using device compass sensors & GPS geocoding.",
                  badge: "Orientation",
                  icon: Compass,
                },
                {
                  href: "/feature?type=reminders",
                  title: "Prayer Reminders & Adhan Alerts",
                  desc: "Configurable notifications for each prayer time and Islamic daily tasks.",
                  badge: "Notifications",
                  icon: Clock,
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition group"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/15 border border-[#C8A96B]/20 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        {item.badge}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* CATEGORY 3: DAILY PRACTICE — Asymmetric Layout */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Category 03</span>
                <h3 className="font-serif text-2xl text-foreground font-medium">Daily Remembrance & Practice</h3>
              </div>
              <Link href="/feature?type=dikr-counter" className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium">
                Full Tasbih <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Asymmetrical Left: Live Interactive Dhikr Preview */}
              <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Mindful Tasbih Instrument
                  </span>
                  <Link href="/feature?type=dikr-counter" className="text-xs text-[#C8A96B] hover:underline font-medium">
                    Open Fullscreen →
                  </Link>
                </div>

                <div className="text-center py-4 space-y-1">
                  <p className="font-arabic text-3xl text-[#123D32] dark:text-[#C8A96B] leading-relaxed" dir="rtl">
                    سُبْحَانَ ٱللَّٰهِ
                  </p>
                  <h4 className="font-serif text-lg font-medium text-foreground">SubhanAllah</h4>
                  <p className="text-xs text-muted-foreground italic">"Glory be to Allah"</p>
                </div>

                <div className="flex justify-center">
                  <Link href="/feature?type=dikr-counter">
                    <Button
                      size="lg"
                      className="rounded-full px-8 bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] text-xs font-semibold shadow-md dark:bg-[#174C3D]"
                    >
                      Open Interactive Tasbih Dial
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Asymmetrical Right: Daily Hadith & Sunnah Tips */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl border border-border bg-[#123D32]/5 dark:bg-[#174C3D]/20 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>Hadith of the Day</span>
                    <span>Sahih al-Bukhari</span>
                  </div>
                  <p className="font-serif text-sm italic text-foreground leading-relaxed">
                    "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
                  </p>
                  <div className="pt-2">
                    <Link href="/feature?type=hadith">
                      <span className="text-xs text-[#C8A96B] hover:underline font-medium">Read more reflections →</span>
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>Daily Sunnah</span>
                    <span>Prophetic Tradition</span>
                  </div>
                  <h5 className="font-serif text-sm font-semibold text-foreground">
                    Remembrance Before Sleeping (Ayat al-Kursi)
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Reciting Surah Al-Baqarah 2:255 provides spiritual protection until dawn.
                  </p>
                  <Link href="/feature?type=sunnah-tips">
                    <span className="text-xs text-[#C8A96B] hover:underline font-medium">Explore all Sunnah habits →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY 4: ISLAMIC TOOLS — Sophisticated 4-Column Balanced Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Category 04</span>
                <h3 className="font-serif text-2xl text-foreground font-medium">Islamic Practical Tools</h3>
              </div>
              <Link href="/feature?type=zakat" className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium">
                All Tools <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  href: "/feature?type=zakat",
                  title: "Zakat Calculator",
                  desc: "Calculate gold, silver, cash and business inventory against official Nisab.",
                  tag: "Financial Duty",
                },
                {
                  href: "/feature?type=hajj",
                  title: "Hajj & Umrah Guide",
                  desc: "Step-by-step interactive ritual timelines with authentic supplications.",
                  tag: "Pilgrimage",
                },
                {
                  href: "/feature?type=calendar",
                  title: "Islamic Hijri Calendar",
                  desc: "Key lunar calendar milestones, Ramadan countdown, and sacred days.",
                  tag: "Lunar Dates",
                },
                {
                  href: "/feature?type=mosques",
                  title: "Nearby Mosques Finder",
                  desc: "Discover local congregation centers and prayer community spaces.",
                  tag: "Community",
                },
              ].map((tool, idx) => (
                <Link
                  key={idx}
                  href={tool.href}
                  className="p-6 rounded-3xl border border-border bg-card hover:border-[#C8A96B]/50 transition-all flex flex-col justify-between h-56 group shadow-xs hover:shadow-md"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {tool.tag}
                  </span>
                  <div>
                    <h4 className="font-serif text-lg font-medium text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition">
                      {tool.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#C8A96B] flex items-center gap-1">
                    Launch tool <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* CATEGORY 5: PERSONAL GROWTH & ISLAMIC LEARNING — Premium Data & Curriculum Display (No Pictures) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Category 05</span>
                <h3 className="font-serif text-2xl text-foreground font-medium">Personal Growth & Spiritual Analytics</h3>
              </div>
              <Link href="/feature?type=analytics" className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium">
                Detailed Analytics <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-3xl border border-border bg-gradient-to-r from-card via-card to-muted/30 p-8 sm:p-10 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B]">
                  True Data • No Fabrication
                </span>
                <h4 className="font-serif text-3xl font-light text-foreground">
                  Understand Your Spiritual Rhythm
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track 7-day prayer fulfillment, weekly Quran recitation hours, and daily Dhikr sessions with minimal Recharts analytics built strictly from your private local device storage records.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Link href="/feature?type=analytics">
                  <Button
                    size="lg"
                    className="rounded-full px-7 bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] text-xs font-semibold shadow-md dark:bg-[#C8A96B] dark:text-[#101A16]"
                  >
                    View Spiritual Analytics
                  </Button>
                </Link>
                <Link href="/feature?type=unique-features">
                  <Button variant="outline" size="lg" className="rounded-full text-xs border-border">
                    Learning Tracker
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REFINED EDITORIAL FOOTER */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-sm py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#123D32] dark:bg-[#174C3D] border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B]">
                  <span className="font-serif font-bold text-sm">د</span>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-medium text-foreground">Deen Connect</h4>
                  <p className="text-[11px] text-muted-foreground font-mono">Digital Sanctuary for Spiritual Excellence</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Built with reverence, authentic sources, and minimalist design. No user data tracking or cloud fabrication; your spiritual records belong entirely to you.
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <p className="font-serif font-semibold text-foreground">Quran & Worship</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><Link href="/feature?type=quran" className="hover:text-foreground">Quran Reader</Link></li>
                  <li><Link href="/feature?type=audio-quran" className="hover:text-foreground">Audio Quran</Link></li>
                  <li><Link href="/feature?type=prayer-times" className="hover:text-foreground">Prayer Times</Link></li>
                  <li><Link href="/feature?type=qibla" className="hover:text-foreground">Qibla Direction</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-serif font-semibold text-foreground">Remembrance</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><Link href="/feature?type=dikr-counter" className="hover:text-foreground">Tasbih Dial</Link></li>
                  <li><Link href="/feature?type=daily-dhikr" className="hover:text-foreground">Daily Dhikr</Link></li>
                  <li><Link href="/feature?type=hadith" className="hover:text-foreground">Authentic Hadith</Link></li>
                  <li><Link href="/feature?type=sunnah-tips" className="hover:text-foreground">Sunnah Tips</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-serif font-semibold text-foreground">Tools & Platform</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><Link href="/feature?type=zakat" className="hover:text-foreground">Zakat Calculator</Link></li>
                  <li><Link href="/feature?type=hajj" className="hover:text-foreground">Hajj Guide</Link></li>
                  <li><Link href="/feature?type=analytics" className="hover:text-foreground">Analytics</Link></li>
                  <li><Link href="/about" className="hover:text-foreground">About the Project</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-mono">
            <span>© 2026 Deen Connect • Crafted with precision and reverence</span>
            <span>All Islamic calculations sourced from authentic global conventions</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
