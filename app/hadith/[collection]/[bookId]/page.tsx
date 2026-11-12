"use client"

import React, { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchBookHadiths, type HadithCollection, type HadithItem } from "@/lib/hadith-service"
import { toast } from "sonner"

export default function HadithBookDetailPage({
  params,
}: {
  params: Promise<{ collection: string; bookId: string }>
}) {
  const resolvedParams = use(params)
  const { collection: collectionId, bookId } = resolvedParams

  const [collection, setCollection] = useState<HadithCollection | null>(null)
  const [bookTitle, setBookTitle] = useState<string>("")
  const [hadiths, setHadiths] = useState<HadithItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deen_hadith_bookmarks")
      if (saved) setBookmarks(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchBookHadiths(collectionId, bookId)
      .then((res) => {
        if (!isMounted) return
        setCollection(res.collection)
        setBookTitle(res.bookTitle)
        setHadiths(res.hadiths)
      })
      .catch((err) => {
        if (!isMounted) return
        setError("Failed to retrieve book narrations. Please check your connection.")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [collectionId, bookId])

  const copyHadith = (h: HadithItem) => {
    const text = `${h.arabicText ? h.arabicText + "\n\n" : ""}"${h.englishText}"\n— ${collection?.name}, Hadith #${h.hadithNumber}`
    navigator.clipboard.writeText(text)
    setCopiedId(h.hadithNumber)
    toast.success("Hadith copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleBookmark = (hadithNumber: number) => {
    const key = `${collectionId}:${hadithNumber}`
    const updated = bookmarks.includes(key)
      ? bookmarks.filter((k) => k !== key)
      : [...bookmarks, key]

    setBookmarks(updated)
    try {
      localStorage.setItem("deen_hadith_bookmarks", JSON.stringify(updated))
    } catch {}

    toast.success(bookmarks.includes(key) ? "Removed from saved" : "Hadith saved to bookmarks")
  }

  const bookNum = parseInt(bookId, 10)
  const prevBookId = bookNum > 1 ? String(bookNum - 1) : null
  const nextBookId = String(bookNum + 1)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* Header Banner */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <Link
              href={`/hadith/${collectionId}`}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{collection?.name || "Back to Collection"}</span>
            </Link>

            <div className="flex items-center gap-2">
              {prevBookId && (
                <Link href={`/hadith/${collectionId}/${prevBookId}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Prev Book</span>
                  </Button>
                </Link>
              )}
              <Link href={`/hadith/${collectionId}/${nextBookId}`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1">
                  <span>Next Book</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#69766E] dark:text-[#A9B9A7]">
              {collection?.name} • Book {bookId}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
              {bookTitle || `Book ${bookId}`}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Displaying authentic narrations with verified chains of transmission.
            </p>
          </div>
        </div>
      </section>

      {/* Hadiths Stream */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-card border border-border rounded-3xl">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C8A96B]" />
            <p className="text-sm font-medium">Retrieving verified Hadith records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hadiths.map((h) => {
              const bmKey = `${collectionId}:${h.hadithNumber}`
              const isBm = bookmarks.includes(bmKey)

              return (
                <Card
                  key={h.hadithNumber}
                  id={`hadith-${h.hadithNumber}`}
                  className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground">
                        Hadith #{h.hadithNumber}
                      </span>
                      {h.grades && h.grades.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                          {h.grades[0].grade} ({h.grades[0].name})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(h.hadithNumber)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          isBm ? "text-[#C8A96B] bg-[#C8A96B]/15" : "text-muted-foreground hover:bg-muted"
                        }`}
                        title="Bookmark Hadith"
                      >
                        {isBm ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyHadith(h)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                        title="Copy Hadith"
                      >
                        {copiedId === h.hadithNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link href={`/hadith/${collectionId}/${bookId}/${h.hadithNumber}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-full text-[11px] text-muted-foreground hover:text-foreground"
                          title="Open dedicated hadith page"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span>Detail</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  {h.arabicText && (
                    <div className="text-right py-2">
                      <p
                        className="font-arabic text-xl sm:text-2xl leading-[2.1] text-foreground font-normal"
                        dir="rtl"
                      >
                        {h.arabicText}
                      </p>
                    </div>
                  )}

                  {/* English Translation */}
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-sm sm:text-base text-foreground/90 font-sans leading-relaxed whitespace-pre-line">
                      {h.englishText}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
