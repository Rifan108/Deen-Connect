"use client"

import React, { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Search,
  Play,
  Share2,
  Copy,
  Check,
  BookOpen,
  Volume2,
  Sliders,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SURAH_LIST, useAudioPlayer, type SurahMeta } from "@/components/audio-context"
import { toast } from "sonner"

interface AyahPair {
  number: number
  numberInSurah: number
  arabic: string
  translation: string
}

export default function QuranSurahReader() {
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(1)
  const [ayahs, setAyahs] = useState<AyahPair[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null)
  const [arabicFontSize, setArabicFontSize] = useState<"md" | "lg" | "xl">("lg")
  const [showTranslation, setShowTranslation] = useState<boolean>(true)

  const { playSurah, currentSurah, isPlaying, togglePlay } = useAudioPlayer()

  const currentMeta: SurahMeta =
    SURAH_LIST.find((s) => s.number === currentSurahNum) || SURAH_LIST[0]

  // Load Bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("quran-bookmarks")
      if (saved) setBookmarks(JSON.parse(saved))
    } catch {}
  }, [])

  // Fetch Surah Arabic + English translation
  useEffect(() => {
    const fetchSurah = async () => {
      setLoading(true)
      setError("")
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${currentSurahNum}/editions/quran-uthmani,en.sahih`,
          { signal: controller.signal }
        )
        clearTimeout(timeout)

        if (!res.ok) throw new Error("Could not fetch surah")
        const json = await res.json()

        if (json.status === "OK" && json.data && json.data.length >= 2) {
          const uthmani = json.data[0].ayahs
          const sahih = json.data[1].ayahs

          const paired: AyahPair[] = uthmani.map((a: any, idx: number) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            arabic: a.text,
            translation: sahih[idx]?.text || "",
          }))

          setAyahs(paired)
        } else {
          throw new Error("Invalid structure")
        }
      } catch (err: any) {
        console.warn("Failed fetching dual edition, falling back to basic", err)
        setError("Could not load Surah text. Please check your network connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchSurah()
  }, [currentSurahNum])

  const toggleBookmark = (ayahNumber: number) => {
    let next: number[]
    if (bookmarks.includes(ayahNumber)) {
      next = bookmarks.filter((b) => b !== ayahNumber)
      toast.info("Bookmark removed")
    } else {
      next = [...bookmarks, ayahNumber]
      toast.success("Ayah bookmarked")
    }
    setBookmarks(next)
    localStorage.setItem("quran-bookmarks", JSON.stringify(next))
  }

  const copyAyahText = (ayah: AyahPair) => {
    const textToCopy = `${ayah.arabic}\n\n"${ayah.translation}"\n(Surah ${currentMeta.name} ${currentMeta.number}:${ayah.numberInSurah})`
    navigator.clipboard.writeText(textToCopy)
    setCopiedAyah(ayah.numberInSurah)
    toast.success("Ayah copied to clipboard")
    setTimeout(() => setCopiedAyah(null), 2000)
  }

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery.trim()
  )

  const fontClass = {
    md: "text-2xl leading-loose",
    lg: "text-3xl leading-loose",
    xl: "text-4xl leading-loose",
  }[arabicFontSize]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              The Noble Quran • Surah {currentMeta.number} of 114
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-foreground">
              {currentMeta.revelationType}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-3xl font-serif text-foreground font-normal">
              {currentMeta.name}
            </h2>
            <span className="text-xl font-serif font-arabic text-[#C8A96B]" dir="rtl">
              {currentMeta.arabicName}
            </span>
            <span className="text-xs text-muted-foreground italic">
              ("{currentMeta.englishName}")
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Listen Button */}
          <Button
            size="sm"
            onClick={() => {
              if (currentSurah.number === currentMeta.number && isPlaying) {
                togglePlay()
              } else {
                playSurah(currentMeta.number)
              }
            }}
            className="rounded-full text-xs gap-1.5 bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D] dark:hover:bg-[#223128]"
          >
            <Volume2 className="w-4 h-4 text-[#C8A96B]" />
            <span>
              {currentSurah.number === currentMeta.number && isPlaying ? "Pause Audio" : "Listen to Recitation"}
            </span>
          </Button>

          {/* Surah Prev / Next */}
          <div className="flex items-center border border-border rounded-full p-0.5 bg-card">
            <button
              onClick={() => setCurrentSurahNum((n) => Math.max(1, n - 1))}
              disabled={currentSurahNum <= 1}
              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
              title="Previous Surah"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-foreground font-medium">
              {currentSurahNum} / 114
            </span>
            <button
              onClick={() => setCurrentSurahNum((n) => Math.min(114, n + 1))}
              disabled={currentSurahNum >= 114}
              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
              title="Next Surah"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Surah Quick Switcher Drawer / Pills */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-1 focus:ring-[#C8A96B]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/* Font Size controls */}
            <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
              {(["md", "lg", "xl"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setArabicFontSize(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition ${
                    arabicFontSize === s
                      ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#174C3D]"
                      : "hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Translation toggle */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1 rounded-lg border text-xs transition ${
                showTranslation
                  ? "bg-[#123D32]/10 dark:bg-[#C8A96B]/20 border-[#C8A96B]/40 text-foreground font-medium"
                  : "border-border hover:bg-muted"
              }`}
            >
              Translation: {showTranslation ? "On" : "Off"}
            </button>
          </div>
        </div>

        {/* Quick Surah Horizontal Ribbon */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {filteredSurahs.slice(0, 15).map((s) => (
            <button
              key={s.number}
              onClick={() => {
                setCurrentSurahNum(s.number)
                setSearchQuery("")
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                currentSurahNum === s.number
                  ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                  : "border-border hover:border-[#C8A96B]/50 hover:bg-muted text-foreground"
              }`}
            >
              {s.number}. {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Surah Bismillah Banner (for all except At-Tawbah 9) */}
      {currentSurahNum !== 9 && (
        <div className="text-center py-6 border-y border-border/80 my-8">
          <p className="font-arabic text-2xl text-[#123D32] dark:text-[#C8A96B] leading-relaxed" dir="rtl">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs text-muted-foreground italic mt-1">
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </p>
        </div>
      )}

      {/* Main Ayahs List */}
      {loading ? (
        <div className="space-y-4 py-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-pulse space-y-3">
              <div className="h-6 bg-muted rounded w-3/4 ml-auto" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setCurrentSurahNum(currentSurahNum)}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const isBookmarked = bookmarks.includes(ayah.number)

            return (
              <div
                key={ayah.number}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-[#C8A96B]/50 transition-all shadow-xs space-y-4"
              >
                {/* Ayah Top Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#123D32]/10 dark:bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center font-mono text-xs font-semibold text-foreground">
                      {ayah.numberInSurah}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {currentMeta.number}:{ayah.numberInSurah}
                    </span>
                  </div>

                  {/* Micro Actions: Bookmark, Copy */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleBookmark(ayah.number)}
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? "bg-[#C8A96B]/20 text-[#C8A96B] border-[#C8A96B]"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      title="Bookmark Ayah"
                    >
                      {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => copyAyahText(ayah)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      title="Copy Arabic & English"
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Uthmani Script */}
                <div className="pt-2 text-right" dir="rtl">
                  <p className={`font-arabic text-foreground font-normal tracking-normal ${fontClass}`}>
                    {ayah.arabic}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#C8A96B]/40 text-[#C8A96B] font-mono text-xs mr-2 ml-1 align-middle">
                      {ayah.numberInSurah}
                    </span>
                  </p>
                </div>

                {/* English Translation */}
                {showTranslation && (
                  <div className="pt-2 border-t border-border/40 text-left">
                    <p className="text-sm text-foreground/90 leading-relaxed font-sans font-normal">
                      {ayah.translation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom Pagination */}
      <div className="flex items-center justify-between pt-8 border-t border-border">
        <Button
          variant="outline"
          disabled={currentSurahNum <= 1}
          onClick={() => {
            setCurrentSurahNum((n) => Math.max(1, n - 1))
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className="rounded-full text-xs gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Surah
        </Button>

        <span className="text-xs font-mono text-muted-foreground">
          Surah {currentMeta.number} of 114
        </span>

        <Button
          variant="outline"
          disabled={currentSurahNum >= 114}
          onClick={() => {
            setCurrentSurahNum((n) => Math.min(114, n + 1))
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className="rounded-full text-xs gap-1.5"
        >
          Next Surah
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
