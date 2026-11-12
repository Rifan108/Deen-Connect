"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  BookOpen,
  Search,
  Bookmark,
  Volume2,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ALL_SURAHS, type SurahDefinition } from "@/lib/quran-data"
import { useAudioPlayer } from "@/components/audio-context"

const JUZ_MAPPINGS = [
  { juz: 1, label: "Juz 1", surah: "Al-Fatihah 1:1" },
  { juz: 2, label: "Juz 2", surah: "Al-Baqarah 2:142" },
  { juz: 3, label: "Juz 3", surah: "Al-Baqarah 2:253" },
  { juz: 4, label: "Juz 4", surah: "Ali 'Imran 3:93" },
  { juz: 5, label: "Juz 5", surah: "An-Nisa 4:24" },
  { juz: 6, label: "Juz 6", surah: "An-Nisa 4:148" },
  { juz: 7, label: "Juz 7", surah: "Al-Ma'idah 5:82" },
  { juz: 8, label: "Juz 8", surah: "Al-An'am 6:111" },
  { juz: 9, label: "Juz 9", surah: "Al-A'raf 7:88" },
  { juz: 10, label: "Juz 10", surah: "Al-Anfal 8:41" },
  { juz: 11, label: "Juz 11", surah: "At-Tawbah 9:93" },
  { juz: 12, label: "Juz 12", surah: "Hud 11:6" },
  { juz: 13, label: "Juz 13", surah: "Yusuf 12:53" },
  { juz: 14, label: "Juz 14", surah: "Al-Hijr 15:1" },
  { juz: 15, label: "Juz 15", surah: "Al-Isra 17:1" },
  { juz: 16, label: "Juz 16", surah: "Al-Kahf 18:75" },
  { juz: 17, label: "Juz 17", surah: "Al-Anbiya 21:1" },
  { juz: 18, label: "Juz 18", surah: "Al-Mu'minun 23:1" },
  { juz: 19, label: "Juz 19", surah: "Al-Furqan 25:21" },
  { juz: 20, label: "Juz 20", surah: "An-Naml 27:56" },
  { juz: 21, label: "Juz 21", surah: "Al-'Ankabut 29:46" },
  { juz: 22, label: "Juz 22", surah: "Al-Ahzab 33:31" },
  { juz: 23, label: "Juz 23", surah: "Ya-Sin 36:28" },
  { juz: 24, label: "Juz 24", surah: "Az-Zumar 39:32" },
  { juz: 25, label: "Juz 25", surah: "Fussilat 41:47" },
  { juz: 26, label: "Juz 26", surah: "Al-Ahqaf 46:1" },
  { juz: 27, label: "Juz 27", surah: "Adh-Dhariyat 51:31" },
  { juz: 28, label: "Juz 28", surah: "Al-Mujadila 58:1" },
  { juz: 29, label: "Juz 29", surah: "Al-Mulk 67:1" },
  { juz: 30, label: "Juz 30 (Amma)", surah: "An-Naba 78:1" },
]

export default function QuranLandingPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"surahs" | "juz" | "bookmarks">("surahs")
  const [lastRead, setLastRead] = useState<{ surahNum: number; ayahNum: number; timestamp: number } | null>(null)
  const [bookmarks, setBookmarks] = useState<number[]>([])

  const { playSurah, currentSurah, isPlaying } = useAudioPlayer()

  // Load last read & bookmarks
  useEffect(() => {
    try {
      const savedLast = localStorage.getItem("deen_last_read_ayah")
      if (savedLast) setLastRead(JSON.parse(savedLast))

      const savedBm = localStorage.getItem("quran-bookmarks")
      if (savedBm) setBookmarks(JSON.parse(savedBm))
    } catch {}
  }, [])

  // Filter surahs by search
  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return ALL_SURAHS
    const q = search.toLowerCase().trim()
    return ALL_SURAHS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(q) ||
        s.number.toString() === q
    )
  }, [search])

  const lastReadSurahObj = lastRead ? ALL_SURAHS.find((s) => s.number === lastRead.surahNum) : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* Hero Section */}
      <section className="border-b border-border bg-card/30 backdrop-blur-sm py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#69766E] dark:text-[#A9B9A7]">
                <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
                The Noble Word • 114 Surahs
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground">
                The Holy Quran{" "}
                <span className="font-arabic text-3xl sm:text-4xl text-[#C8A96B]" dir="rtl">
                  القرآن الكريم
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                Authentic Uthmani Arabic script, verified Saheeh International English translation, classical Tafsir exegesis, and international audio recitations.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-card border border-border text-center min-w-[90px]">
                <span className="text-xl font-serif font-bold text-foreground">114</span>
                <p className="text-[10px] uppercase text-muted-foreground">Surahs</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border text-center min-w-[90px]">
                <span className="text-xl font-serif font-bold text-foreground">6,236</span>
                <p className="text-[10px] uppercase text-muted-foreground">Ayahs</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border text-center min-w-[90px]">
                <span className="text-xl font-serif font-bold text-foreground">30</span>
                <p className="text-[10px] uppercase text-muted-foreground">Juz</p>
              </div>
            </div>
          </div>

          {/* Continue Reading Card if available */}
          {lastReadSurahObj && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#123D32] to-[#174C3D] text-[#F7F5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B] shrink-0">
                  <Bookmark className="w-5 h-5 fill-[#C8A96B]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9B9A7]">
                    Continue Reading
                  </span>
                  <h3 className="font-serif text-lg font-medium">
                    Surah {lastReadSurahObj.name} • Verse {lastRead?.ayahNum || 1}
                  </h3>
                  <p className="text-xs text-[#A9B9A7]">
                    {lastReadSurahObj.englishName} ({lastReadSurahObj.versesCount} Ayahs)
                  </p>
                </div>
              </div>

              <Link href={`/quran/${lastReadSurahObj.slug}`}>
                <Button
                  size="sm"
                  className="rounded-full bg-[#C8A96B] hover:bg-[#d8bd85] text-[#101A16] font-semibold text-xs gap-1.5 shadow-sm"
                >
                  <span>Resume Reading</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Search & Tabs Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("surahs")}
                className={`px-4 py-1.5 rounded-xl font-medium transition ${
                  activeTab === "surahs"
                    ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Surahs (114)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("juz")}
                className={`px-4 py-1.5 rounded-xl font-medium transition ${
                  activeTab === "juz"
                    ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Juz (30)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bookmarks")}
                className={`px-4 py-1.5 rounded-xl font-medium transition ${
                  activeTab === "bookmarks"
                    ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bookmarks ({bookmarks.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, English or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-card border border-border focus:outline-hidden focus:border-[#C8A96B] text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* 1. Surahs Grid View */}
        {activeTab === "surahs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => {
              const isPlayingThis = isPlaying && currentSurah.number === surah.number

              return (
                <Card
                  key={surah.number}
                  className="group p-5 rounded-3xl bg-card border border-border hover:border-[#C8A96B]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Number Badge */}
                      <div className="w-10 h-10 rounded-2xl bg-muted/80 border border-border flex items-center justify-center font-mono text-xs font-semibold text-foreground group-hover:border-[#C8A96B]/50 transition shrink-0">
                        {surah.number}
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href={`/quran/${surah.slug}`}
                          className="font-serif text-base font-medium text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition line-clamp-1"
                        >
                          {surah.name}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {surah.englishName}
                        </p>
                      </div>
                    </div>

                    {/* Arabic Calligraphic Name */}
                    <span className="font-arabic text-xl text-[#C8A96B]" dir="rtl">
                      {surah.arabicName}
                    </span>
                  </div>

                  {/* Bottom Meta & Actions */}
                  <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] uppercase">
                        {surah.revelationType}
                      </span>
                      <span>{surah.versesCount} Ayahs</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio Play Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          playSurah(surah.number)
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          isPlayingThis
                            ? "bg-[#C8A96B] text-[#101A16]"
                            : "bg-muted hover:bg-[#123D32] hover:text-[#F7F5EF] text-muted-foreground"
                        }`}
                        title="Play recitation audio"
                      >
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      </button>

                      {/* Read Link */}
                      <Link href={`/quran/${surah.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-xs h-8 px-3 font-medium text-muted-foreground group-hover:text-foreground"
                        >
                          Read →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* 2. Juz Grid View */}
        {activeTab === "juz" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JUZ_MAPPINGS.map((j) => (
              <Card key={j.juz} className="p-5 rounded-3xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg font-medium">{j.label}</span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Part {j.juz}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Starts at: {j.surah}</p>
                <div className="pt-2">
                  <Link href={`/quran/${j.juz <= 1 ? "al-fatihah" : "al-baqarah"}`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                      Open in Reader
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 3. Bookmarks View */}
        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            {bookmarks.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                <Bookmark className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="font-serif text-lg font-medium">No Bookmarks Saved Yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click the bookmark icon next to any verse while reading a Surah to save it to your local sanctuary ledger.
                </p>
                <Link href="/quran/al-fatihah">
                  <Button size="sm" className="rounded-full text-xs bg-[#123D32] text-[#F7F5EF] mt-2">
                    Begin with Al-Fatihah
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookmarks.map((bm, i) => (
                  <Card key={i} className="p-5 rounded-3xl bg-card border border-border flex justify-between items-center">
                    <div>
                      <p className="font-serif font-medium text-sm">Ayah #{bm}</p>
                      <p className="text-xs text-muted-foreground">Saved to device ledger</p>
                    </div>
                    <Link href={`/quran/al-fatihah`}>
                      <Button variant="outline" size="sm" className="rounded-full text-xs">
                        Go to Verse
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

