"use client"

import React, { useState, useEffect, useMemo, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Play,
  Volume2,
  Copy,
  Check,
  Share2,
  Sliders,
  Eye,
  EyeOff,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { findSurah, ALL_SURAHS, type SurahDefinition } from "@/lib/quran-data"
import { useAudioPlayer } from "@/components/audio-context"
import { toast } from "sonner"

interface AyahItem {
  number: number
  numberInSurah: number
  arabic: string
  translation: string
}

export default function SurahDetailPage({
  params,
}: {
  params: Promise<{ surahSlug: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const surahSlug = resolvedParams.surahSlug

  const surahMeta: SurahDefinition | undefined = useMemo(() => {
    return findSurah(surahSlug) || ALL_SURAHS[0]
  }, [surahSlug])

  const [ayahs, setAyahs] = useState<AyahItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reader Settings
  const [arabicFontSize, setArabicFontSize] = useState<"md" | "lg" | "xl">("lg")
  const [showTranslation, setShowTranslation] = useState(true)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null)

  // Tafsir Modal
  const [tafsirOpen, setTafsirOpen] = useState(false)
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<AyahItem | null>(null)
  const [tafsirLoading, setTafsirLoading] = useState(false)
  const [tafsirContent, setTafsirContent] = useState<string>("")

  const {
    playSurah,
    playAyah,
    currentSurah,
    isPlaying,
    activeMode,
    currentAyahNumber,
    togglePlay,
  } = useAudioPlayer()

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem("quran-bookmarks")
      if (saved) setBookmarks(JSON.parse(saved))
    } catch {}
  }, [])

  // Fetch full Surah Arabic (Uthmani) + English (Saheeh International)
  useEffect(() => {
    if (!surahMeta) return

    let isMounted = true
    setLoading(true)
    setError(null)

    const fetchSurah = async () => {
      try {
        const url = `https://api.alquran.cloud/v1/surah/${surahMeta.number}/editions/quran-uthmani,en.sahih`
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) })

        if (!res.ok) throw new Error(`Quran API status ${res.status}`)

        const json = await res.json()
        if (!json.data || json.data.length < 2) {
          throw new Error("Invalid response from Quran content service")
        }

        const uthmaniEdition = json.data[0].ayahs
        const englishEdition = json.data[1].ayahs

        const combined: AyahItem[] = uthmaniEdition.map((item: any, idx: number) => {
          return {
            number: item.number,
            numberInSurah: item.numberInSurah,
            arabic: item.text,
            translation: englishEdition[idx]?.text || "",
          }
        })

        if (isMounted) {
          setAyahs(combined)
          // Save last-read position
          try {
            localStorage.setItem(
              "deen_last_read_ayah",
              JSON.stringify({
                surahNum: surahMeta.number,
                ayahNum: 1,
                timestamp: Date.now(),
              })
            )
          } catch {}
        }
      } catch (err: any) {
        console.error("Failed to load surah:", err)
        if (isMounted) {
          setError(
            "Unable to retrieve complete authentic Surah text from the Quran content service. Please check your network connection and reload."
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchSurah()

    return () => {
      isMounted = false
    }
  }, [surahMeta])

  // Bookmark toggle
  const toggleBookmark = (ayahGlobalNum: number) => {
    const updated = bookmarks.includes(ayahGlobalNum)
      ? bookmarks.filter((b) => b !== ayahGlobalNum)
      : [...bookmarks, ayahGlobalNum]

    setBookmarks(updated)
    try {
      localStorage.setItem("quran-bookmarks", JSON.stringify(updated))
    } catch {}

    toast.success(
      bookmarks.includes(ayahGlobalNum) ? "Bookmark removed" : "Bookmark saved to your sanctuary ledger"
    )
  }

  // Copy Ayah
  const copyAyah = (ayah: AyahItem) => {
    const text = `${ayah.arabic}\n\n"${ayah.translation}"\n— Surah ${surahMeta.name} (${surahMeta.number}:${ayah.numberInSurah})`
    navigator.clipboard.writeText(text)
    setCopiedAyah(ayah.numberInSurah)
    toast.success("Ayah copied to clipboard")
    setTimeout(() => setCopiedAyah(null), 2000)
  }

  // Open Tafsir Commentary
  const openTafsir = async (ayah: AyahItem) => {
    setActiveTafsirAyah(ayah)
    setTafsirOpen(true)
    setTafsirLoading(true)
    setTafsirContent("")

    try {
      // Query classical Ibn Kathir exegesis
      const res = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahMeta.number}:${ayah.numberInSurah}/editions/en.ibnkathir`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (res.ok) {
        const json = await res.json()
        const text = json.data?.[0]?.text || json.data?.text || ""
        setTafsirContent(text || "No extensive commentary commentary recorded for this specific verse.")
      } else {
        setTafsirContent("Scholarly commentary commentary temporarily unavailable.")
      }
    } catch {
      setTafsirContent("Scholarly commentary temporarily unavailable.")
    } finally {
      setTafsirLoading(false)
    }
  }

  // Prev / Next Surah navigation
  const prevSurah = surahMeta.number > 1 ? ALL_SURAHS[surahMeta.number - 2] : null
  const nextSurah = surahMeta.number < 114 ? ALL_SURAHS[surahMeta.number] : null

  // Font size classes
  const fontClass =
    arabicFontSize === "md"
      ? "text-2xl sm:text-3xl leading-[2.2]"
      : arabicFontSize === "xl"
      ? "text-4xl sm:text-5xl leading-[2.4]"
      : "text-3xl sm:text-4xl leading-[2.3]"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* Surah Header Banner */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Navigation Back & Breadcrumbs */}
          <div className="flex items-center justify-between text-xs">
            <Link
              href="/quran"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All 114 Surahs</span>
            </Link>

            <div className="flex items-center gap-2">
              {prevSurah && (
                <Link href={`/quran/${prevSurah.slug}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1">
                    <ChevronLeft className="w-3 h-3" />
                    <span>{prevSurah.name}</span>
                  </Button>
                </Link>
              )}
              {nextSurah && (
                <Link href={`/quran/${nextSurah.slug}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1">
                    <span>{nextSurah.name}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Surah Identity Card */}
          <div className="text-center space-y-3 pt-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#69766E] dark:text-[#A9B9A7]">
              Surah {surahMeta.number} • {surahMeta.revelationType} Revelation • {surahMeta.versesCount} Verses
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-normal text-foreground">
              {surahMeta.name}
            </h1>
            <p className="font-arabic text-3xl sm:text-4xl text-[#C8A96B]" dir="rtl">
              سُورَةُ {surahMeta.arabicName}
            </p>
            <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
              "{surahMeta.englishName}"
            </p>

            {/* Audio Recitation Button */}
            <div className="pt-2 flex justify-center gap-2">
              <Button
                onClick={() => playSurah(surahMeta.number)}
                className="rounded-full px-6 bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] dark:hover:bg-[#d8bd85] text-xs font-semibold gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isPlaying && currentSurah.number === surahMeta.number
                    ? "Currently Reciting"
                    : "Listen Full Recitation"}
                </span>
              </Button>
            </div>
          </div>

          {/* Reader Controls Toolbar */}
          <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setArabicFontSize("md")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  arabicFontSize === "md" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setArabicFontSize("lg")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  arabicFontSize === "lg" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setArabicFontSize("xl")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  arabicFontSize === "xl" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                A+
              </button>
            </div>

            {/* Translation Visibility Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
              className="rounded-xl text-xs gap-1.5 h-8 border-border"
            >
              {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTranslation ? "Hide Translation" : "Show Translation"}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Quran Reading Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
        {/* Bismillah Header (Except Surah 9 At-Tawbah) */}
        {surahMeta.number !== 9 && (
          <div className="text-center py-8">
            <p className="font-arabic text-3xl sm:text-4xl text-[#123D32] dark:text-[#C8A96B]" dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-xs text-muted-foreground font-sans mt-2 italic">
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center space-y-3 bg-card border border-border rounded-3xl">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C8A96B]" />
            <p className="text-sm font-medium">Retrieving verified Uthmani calligraphy...</p>
            <p className="text-xs text-muted-foreground">Connecting to AlQuran Cloud API</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3 text-center">
            <AlertCircle className="w-6 h-6 mx-auto text-amber-600 dark:text-amber-400" />
            <h4 className="font-serif text-lg font-medium">Failed to Load Surah</h4>
            <p className="text-xs max-w-md mx-auto">{error}</p>
            <Button
              size="sm"
              onClick={() => window.location.reload()}
              className="rounded-full text-xs bg-[#123D32] text-[#F7F5EF] mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Ayahs Stream */}
        {!loading && !error && ayahs.length > 0 && (
          <div className="space-y-6">
            {ayahs.map((ayah) => {
              const isBookmarked = bookmarks.includes(ayah.number)
              const isPlayingThisAyah =
                isPlaying &&
                activeMode === "ayah" &&
                currentSurah.number === surahMeta.number &&
                currentAyahNumber === ayah.numberInSurah

              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`p-6 sm:p-7 rounded-3xl transition-all border ${
                    isPlayingThisAyah
                      ? "bg-[#123D32]/5 dark:bg-[#C8A96B]/10 border-[#C8A96B] shadow-sm"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  {/* Top Ayah Meta & Actions Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs">
                    {/* Verse Marker */}
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center font-mono text-xs font-semibold text-foreground">
                        {surahMeta.number}:{ayah.numberInSurah}
                      </span>
                      {isPlayingThisAyah && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#C8A96B] uppercase font-bold animate-pulse">
                          <Volume2 className="w-3 h-3" /> Playing
                        </span>
                      )}
                    </div>

                    {/* Ayah Actions */}
                    <div className="flex items-center gap-1">
                      {/* Play Ayah Audio */}
                      <button
                        type="button"
                        onClick={() => playAyah(surahMeta.number, ayah.numberInSurah, true)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          isPlayingThisAyah
                            ? "bg-[#C8A96B] text-[#101A16]"
                            : "bg-muted text-muted-foreground hover:bg-[#123D32] hover:text-[#F7F5EF]"
                        }`}
                        title="Recite this Ayah"
                      >
                        <Play className="w-3 h-3 ml-0.5" />
                      </button>

                      {/* Bookmark */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(ayah.number)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          isBookmarked
                            ? "text-[#C8A96B] bg-[#C8A96B]/15"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title="Bookmark verse"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 fill-current" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => copyAyah(ayah)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                        title="Copy Arabic & translation"
                      >
                        {copiedAyah === ayah.numberInSurah ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Tafsir Exegesis */}
                      <button
                        type="button"
                        onClick={() => openTafsir(ayah)}
                        className="h-8 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                        title="Read Tafsir commentary"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Tafsir</span>
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text (Uthmani Calligraphy) */}
                  <div className="py-6 text-right">
                    <p
                      className={`font-arabic text-foreground font-normal tracking-wide ${fontClass}`}
                      dir="rtl"
                    >
                      {ayah.arabic}
                      <span className="inline-flex items-center justify-center mx-2 text-sm font-mono text-[#C8A96B] select-none">
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </p>
                  </div>

                  {/* Saheeh International English Translation */}
                  {showTranslation && (
                    <div className="pt-3 border-t border-border/40">
                      <p className="text-sm sm:text-base text-foreground/90 font-sans leading-relaxed">
                        {ayah.translation}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Surah Navigation */}
        {!loading && (
          <div className="pt-8 border-t border-border flex items-center justify-between">
            {prevSurah ? (
              <Link href={`/quran/${prevSurah.slug}`}>
                <Button variant="outline" className="rounded-full text-xs gap-1.5 border-border">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: {prevSurah.name}</span>
                </Button>
              </Link>
            ) : <div />}

            {nextSurah ? (
              <Link href={`/quran/${nextSurah.slug}`}>
                <Button variant="outline" className="rounded-full text-xs gap-1.5 border-border">
                  <span>Next: {nextSurah.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : <div />}
          </div>
        )}
      </main>

      {/* Tafsir Exegesis Modal */}
      <Dialog open={tafsirOpen} onOpenChange={setTafsirOpen}>
        <DialogContent className="sm:max-w-xl bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C8A96B]" />
              Scholarly Tafsir Commentary
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Surah {surahMeta.name} • Verse {activeTafsirAyah?.numberInSurah}
            </DialogDescription>
          </DialogHeader>

          {activeTafsirAyah && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border text-right">
                <p className="font-arabic text-xl leading-relaxed text-foreground" dir="rtl">
                  {activeTafsirAyah.arabic}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8A96B]">
                  Ibn Kathir Exegesis Commentary
                </span>
                {tafsirLoading ? (
                  <div className="py-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2">Loading scholarly exegesis...</p>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed whitespace-pre-line">
                    {tafsirContent}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

