"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Volume2,
  Copy,
  Check,
  Search,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ALL_SURAHS, type SurahDefinition } from "@/lib/quran-data"
import { type PageVerse, type QuranPageResponse } from "@/app/api/quran/page/[pageNumber]/route"
import { toast } from "sonner"

interface QuranMushafReaderProps {
  initialPage?: number
  onPageChange?: (page: number) => void
}

const STORAGE_KEY_LAST_PAGE = "quran_last_read_page"

// Juz starting pages in standard 604-page Madani Mushaf
export const JUZ_PAGE_START = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
]

export function QuranMushafReader({ initialPage = 1, onPageChange }: QuranMushafReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [pageData, setPageData] = useState<QuranPageResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Reader Preferences
  const [showTranslation, setShowTranslation] = useState<boolean>(true)
  const [arabicFontSize, setArabicFontSize] = useState<"md" | "lg" | "xl">("lg")
  const [jumpPageInput, setJumpPageInput] = useState<string>("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Audio Playback
  const [isPlayingPage, setIsPlayingPage] = useState<boolean>(false)
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null)

  // Restore last read page from localStorage on mount if no initialPage specified
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_PAGE)
      if (saved && !initialPage) {
        const p = parseInt(saved, 10)
        if (p >= 1 && p <= 604) {
          setCurrentPage(p)
        }
      }
    } catch {}
  }, [initialPage])

  // Save last read page
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_PAGE, currentPage.toString())
    } catch {}
    if (onPageChange) onPageChange(currentPage)
  }, [currentPage, onPageChange])

  // Fetch page content
  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)
    setIsPlayingPage(false)
    setActiveVerseIndex(null)
    if (audioRef.current) {
      audioRef.current.pause()
    }

    try {
      const res = await fetch(`/api/quran/page/${pageNum}`)
      if (!res.ok) {
        throw new Error(`Failed to load page ${pageNum}`)
      }
      const data: QuranPageResponse = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to load Quran page")
      }
      setPageData(data)
    } catch (err: any) {
      console.error("Error fetching Quran page:", err)
      setError(err.message || "Could not retrieve page text")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(currentPage)
  }, [currentPage, fetchPage])

  // Page Turn Handlers
  const goToNextPage = useCallback(() => {
    if (currentPage < 604) {
      setCurrentPage((p) => p + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentPage])

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentPage])

  const jumpToPage = (pageNum: number) => {
    const valid = Math.min(Math.max(pageNum, 1), 604)
    setCurrentPage(valid)
    setJumpPageInput("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Keyboard Navigation (Left / Right arrow keys in Arabic reading order)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === "ArrowRight") {
        goToPrevPage()
      } else if (e.key === "ArrowLeft") {
        goToNextPage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNextPage, goToPrevPage])

  // Touch Swipe for Mobile (Right to Left advance, Left to Right back)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartXRef.current
    if (diff > 80) {
      // Swiped right -> go to previous page (Mushaf flips right)
      goToPrevPage()
    } else if (diff < -80) {
      // Swiped left -> go to next page
      goToNextPage()
    }
    touchStartXRef.current = null
  }

  // Sequential Page Audio Player
  const playVerseAtIndex = useCallback(
    (index: number) => {
      if (!pageData || !pageData.verses || index >= pageData.verses.length) {
        setIsPlayingPage(false)
        setActiveVerseIndex(null)
        return
      }

      const verse = pageData.verses[index]
      setActiveVerseIndex(index)
      setIsPlayingPage(true)

      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      audioRef.current.src = verse.audioUrl
      audioRef.current.play().catch((err) => {
        console.warn("Audio play prevented:", err)
        setIsPlayingPage(false)
      })

      audioRef.current.onended = () => {
        if (index + 1 < pageData.verses.length) {
          playVerseAtIndex(index + 1)
        } else {
          // Finished playing all verses on this page
          setIsPlayingPage(false)
          setActiveVerseIndex(null)
          toast.success(`Completed recitation of Page ${currentPage}`)
        }
      }
    },
    [pageData, currentPage]
  )

  const togglePageAudio = () => {
    if (isPlayingPage) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlayingPage(false)
    } else {
      playVerseAtIndex(activeVerseIndex !== null ? activeVerseIndex : 0)
    }
  }

  const playSingleVerse = (index: number) => {
    if (activeVerseIndex === index && isPlayingPage) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlayingPage(false)
      setActiveVerseIndex(null)
    } else {
      playVerseAtIndex(index)
    }
  }

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Copy Ayah
  const copyAyah = (verse: PageVerse) => {
    const text = `${verse.textUthmani}\n\n"${verse.translation}"\n(Quran ${verse.verseKey})`
    navigator.clipboard.writeText(text)
    setCopiedKey(verse.verseKey)
    toast.success(`Copied Ayah ${verse.verseKey}`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Group verses by Surah on this page
  const versesBySurah = pageData?.verses.reduce<Record<number, PageVerse[]>>((acc, v) => {
    if (!acc[v.surahNumber]) acc[v.surahNumber] = []
    acc[v.surahNumber].push(v)
    return acc
  }, {})

  const primarySurah = pageData?.surahs[0]

  return (
    <div
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Mushaf Ribbon / Quick Page Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#123D32] dark:bg-[#C8A96B] text-[#F7F5EF] dark:text-[#101A16] flex items-center justify-center font-serif text-sm font-semibold shrink-0">
            {currentPage}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-medium text-base text-foreground">
                {pageData?.surahs.map((s) => s.name).join(" & ") || "Noble Quran"}
              </span>
              <span className="text-[10px] font-mono uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                Juz {pageData?.juzNumber || 1}
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground">
              Standard Madani Mushaf • Page {currentPage} of 604
            </p>
          </div>
        </div>

        {/* Reader Controls: Play Page, Font Size, Translation Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={togglePageAudio}
            disabled={loading}
            className={`rounded-full text-xs gap-1.5 font-medium transition ${
              isPlayingPage
                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                : "bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16]"
            }`}
          >
            {isPlayingPage ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Page</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play Full Page</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className="rounded-full text-xs gap-1.5 border-border"
          >
            {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showTranslation ? "Hide English" : "Show English"}</span>
          </Button>

          <div className="hidden md:flex items-center gap-1 border border-border rounded-full p-0.5 text-xs">
            <button
              onClick={() => setArabicFontSize("md")}
              className={`px-2 py-0.5 rounded-full transition ${arabicFontSize === "md" ? "bg-muted font-bold" : "text-muted-foreground"}`}
            >
              A
            </button>
            <button
              onClick={() => setArabicFontSize("lg")}
              className={`px-2 py-0.5 rounded-full transition ${arabicFontSize === "lg" ? "bg-muted font-bold text-sm" : "text-muted-foreground"}`}
            >
              A+
            </button>
            <button
              onClick={() => setArabicFontSize("xl")}
              className={`px-2 py-0.5 rounded-full transition ${arabicFontSize === "xl" ? "bg-muted font-bold text-base" : "text-muted-foreground"}`}
            >
              A++
            </button>
          </div>
        </div>
      </div>

      {/* Main Mushaf Frame */}
      <div className="relative rounded-3xl border-2 border-[#C8A96B]/30 bg-gradient-to-b from-[#FAF8F5] via-[#FFFFFF] to-[#FAF8F5] dark:from-[#131F19] dark:via-[#101A16] dark:to-[#131F19] p-6 sm:p-10 shadow-lg">
        {/* Mushaf Decorative Header Banner */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#C8A96B]/30 text-xs font-mono text-[#69766E] dark:text-[#A9B9A7]">
          <span>الجزء {pageData?.juzNumber || 1} • Juz {pageData?.juzNumber || 1}</span>
          <span className="font-serif text-sm font-medium text-[#123D32] dark:text-[#C8A96B]">
            {primarySurah?.arabicName || ""}
          </span>
          <span>صفحة {currentPage} • Page {currentPage}</span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C8A96B]" />
            <p className="font-serif text-sm text-muted-foreground">
              Retrieving verified Madani Mushaf page {currentPage}...
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="py-16 text-center space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" onClick={() => fetchPage(currentPage)} className="rounded-full">
              Retry Page
            </Button>
          </div>
        )}

        {/* Mushaf Page Content */}
        {!loading && pageData && versesBySurah && (
          <div className="space-y-8">
            {Object.entries(versesBySurah).map(([sNumStr, verses]) => {
              const sNum = parseInt(sNumStr, 10)
              const sMeta = ALL_SURAHS.find((s) => s.number === sNum)
              const isSurahFirstVerse = verses.some((v) => v.isFirstAyahOfSurah)

              return (
                <div key={sNum} className="space-y-6">
                  {/* Surah Header Box if new Surah starts on this page */}
                  {isSurahFirstVerse && (
                    <div className="relative my-6 p-4 sm:p-5 rounded-2xl border-2 border-[#C8A96B]/40 bg-gradient-to-r from-[#123D32]/10 via-[#C8A96B]/15 to-[#123D32]/10 text-center space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-2">
                        <span>{sMeta?.revelationType} Revelation</span>
                        <span>{sMeta?.versesCount} Verses</span>
                      </div>
                      <h2 className="font-arabic text-3xl sm:text-4xl text-[#123D32] dark:text-[#C8A96B] font-bold" dir="rtl">
                        سورة {sMeta?.arabicName}
                      </h2>
                      <p className="font-serif text-xs text-muted-foreground">
                        Surah {sMeta?.name} ({sMeta?.englishName})
                      </p>

                      {/* Bismillah Header (except Surah At-Tawbah 9 and Surah Al-Fatihah 1 which has Bismillah as verse 1) */}
                      {sNum !== 9 && sNum !== 1 && (
                        <div className="pt-2">
                          <p className="font-arabic text-2xl text-foreground font-medium" dir="rtl">
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uthmani Verses Container */}
                  <div
                    className={`leading-[2.6] sm:leading-[2.8] text-right text-foreground font-arabic select-text ${
                      arabicFontSize === "md"
                        ? "text-2xl sm:text-3xl"
                        : arabicFontSize === "lg"
                        ? "text-3xl sm:text-4xl"
                        : "text-4xl sm:text-5xl"
                    }`}
                    dir="rtl"
                  >
                    {verses.map((v) => {
                      const globalIndex = pageData.verses.findIndex((pv) => pv.verseKey === v.verseKey)
                      const isVerseActive = activeVerseIndex === globalIndex

                      return (
                        <span
                          key={v.verseKey}
                          onClick={() => playSingleVerse(globalIndex)}
                          className={`inline transition-colors duration-200 cursor-pointer rounded-lg px-1 py-0.5 ${
                            isVerseActive
                              ? "bg-emerald-500/25 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs"
                              : "hover:bg-[#C8A96B]/15"
                          }`}
                          title={`Ayah ${v.verseKey} • Click to listen`}
                        >
                          {v.textUthmani}{" "}
                          {/* Ayah End Circle Marker with Arabic number */}
                          <span
                            className="inline-flex items-center justify-center font-mono text-xs sm:text-sm text-[#C8A96B] mx-1 border border-[#C8A96B]/60 rounded-full w-7 h-7 align-middle select-none"
                            dir="ltr"
                          >
                            {v.verseNumber}
                          </span>{" "}
                        </span>
                      )
                    })}
                  </div>

                  {/* English Translation View (when toggled) */}
                  {showTranslation && (
                    <div className="space-y-3 pt-6 border-t border-border/60 divide-y divide-border/40">
                      {verses.map((v) => {
                        const globalIndex = pageData.verses.findIndex((pv) => pv.verseKey === v.verseKey)
                        const isVerseActive = activeVerseIndex === globalIndex

                        return (
                          <div
                            key={`trans-${v.verseKey}`}
                            className={`pt-3.5 pb-2 flex items-start justify-between gap-4 p-3.5 rounded-2xl transition border border-transparent ${
                              isVerseActive
                                ? "bg-emerald-500/10 border-emerald-500/30 shadow-xs"
                                : "hover:bg-muted/40 hover:border-border/60"
                            }`}
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#C8A96B]/15 text-[#C8A96B] font-semibold border border-[#C8A96B]/30">
                                  {v.verseKey}
                                </span>
                              </div>
                              <p
                                className="font-arabic text-xl sm:text-2xl text-foreground text-right leading-relaxed"
                                dir="rtl"
                              >
                                {v.textUthmani}
                              </p>
                              <p className="font-sans text-xs sm:text-sm text-foreground/90 dark:text-muted-foreground leading-relaxed pt-0.5">
                                {v.translation}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => playSingleVerse(globalIndex)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                title="Recite Ayah"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => copyAyah(v)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                title="Copy Ayah text"
                              >
                                {copiedKey === v.verseKey ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Mushaf Decorative Bottom Border & Page Number */}
        <div className="mt-8 pt-4 border-t border-[#C8A96B]/30 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>Quran Foundation • Madani Mushaf</span>
          <div className="w-8 h-8 rounded-full border border-[#C8A96B]/40 flex items-center justify-center font-bold text-foreground">
            {currentPage}
          </div>
          <span>604 Pages Total</span>
        </div>
      </div>

      {/* Persistent Bottom Page Navigation Bar */}
      <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-3xl bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Previous Button (Moves backwards towards Page 1) */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || loading}
          onClick={goToPrevPage}
          className="rounded-full text-xs gap-1 border-border font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Page</span>
        </Button>

        {/* Jump Navigation Dropdowns & Page Input */}
        <div className="flex items-center gap-2">
          {/* Jump to Page Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const p = parseInt(jumpPageInput, 10)
              if (!isNaN(p)) jumpToPage(p)
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              min={1}
              max={604}
              placeholder={`Page ${currentPage}`}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              className="w-20 px-2 py-1 text-center text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:border-[#C8A96B]"
            />
            <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs rounded-lg">
              Go
            </Button>
          </form>

          {/* Jump to Surah Selector */}
          <select
            value={primarySurah?.number || 1}
            onChange={(e) => {
              const sNum = parseInt(e.target.value, 10)
              const s = ALL_SURAHS.find((item) => item.number === sNum)
              if (s) {
                // Find start page of this Surah from API or mappings
                fetch(`/api/quran/page/1`) // fallback or direct surah route
                window.location.href = `/quran/${s.slug}`
              }
            }}
            className="text-xs rounded-xl border border-border bg-background px-2 py-1.5 focus:outline-hidden"
          >
            {ALL_SURAHS.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.name} ({s.arabicName})
              </option>
            ))}
          </select>

          {/* Jump to Juz Selector */}
          <select
            value={pageData?.juzNumber || 1}
            onChange={(e) => {
              const jNum = parseInt(e.target.value, 10)
              const targetPage = JUZ_PAGE_START[jNum - 1] || 1
              jumpToPage(targetPage)
            }}
            className="text-xs rounded-xl border border-border bg-background px-2 py-1.5 focus:outline-hidden"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Juz {j} (Page {JUZ_PAGE_START[j - 1]})
              </option>
            ))}
          </select>
        </div>

        {/* Next Button (Advances towards Page 604) */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= 604 || loading}
          onClick={goToNextPage}
          className="rounded-full text-xs gap-1 border-border font-medium"
        >
          <span className="hidden sm:inline">Next Page</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
