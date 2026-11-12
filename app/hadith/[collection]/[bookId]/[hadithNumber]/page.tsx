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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchSingleHadith, type HadithCollection, type HadithItem } from "@/lib/hadith-service"
import { toast } from "sonner"

export default function SingleHadithPage({
  params,
}: {
  params: Promise<{ collection: string; bookId: string; hadithNumber: string }>
}) {
  const resolvedParams = use(params)
  const { collection: collectionId, bookId, hadithNumber: hadithNumStr } = resolvedParams
  const hadithNumber = parseInt(hadithNumStr, 10)

  const [collection, setCollection] = useState<HadithCollection | null>(null)
  const [hadith, setHadith] = useState<HadithItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

  const bmKey = `${collectionId}:${hadithNumber}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deen_hadith_bookmarks")
      if (saved) {
        const list: string[] = JSON.parse(saved)
        setIsBookmarked(list.includes(bmKey))
      }
    } catch {}
  }, [bmKey])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchSingleHadith(collectionId, hadithNumber)
      .then((res) => {
        if (!isMounted) return
        setCollection(res.collection)
        setHadith(res.hadith)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(`Failed to retrieve Hadith #${hadithNumber}.`)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [collectionId, hadithNumber])

  const copyHadith = () => {
    if (!hadith) return
    const text = `${hadith.arabicText ? hadith.arabicText + "\n\n" : ""}"${hadith.englishText}"\n— ${collection?.name}, Hadith #${hadith.hadithNumber}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Hadith copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleBookmark = () => {
    try {
      const raw = localStorage.getItem("deen_hadith_bookmarks")
      let list: string[] = raw ? JSON.parse(raw) : []
      if (list.includes(bmKey)) {
        list = list.filter((k) => k !== bmKey)
        setIsBookmarked(false)
        toast.success("Removed from bookmarks")
      } else {
        list.push(bmKey)
        setIsBookmarked(true)
        toast.success("Saved to bookmarks")
      }
      localStorage.setItem("deen_hadith_bookmarks", JSON.stringify(list))
    } catch {}
  }

  const prevHadithNum = hadithNumber > 1 ? hadithNumber - 1 : null
  const nextHadithNum = collection ? Math.min(collection.totalHadith, hadithNumber + 1) : hadithNumber + 1

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* Header Banner */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <Link
              href={`/hadith/${collectionId}/${bookId}`}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Book {bookId}</span>
            </Link>

            <div className="flex items-center gap-2">
              {prevHadithNum && (
                <Link href={`/hadith/${collectionId}/${bookId}/${prevHadithNum}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Hadith #{prevHadithNum}</span>
                  </Button>
                </Link>
              )}
              {nextHadithNum && (
                <Link href={`/hadith/${collectionId}/${bookId}/${nextHadithNum}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1">
                    <span>Hadith #{nextHadithNum}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#69766E] dark:text-[#A9B9A7]">
              {collection?.name} • Reference #{hadithNumber}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
              {collection?.arabicName} • حديث #{hadithNumber}
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Compiled by {collection?.author}
            </p>
          </div>
        </div>
      </section>

      {/* Main Hadith Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-card border border-border rounded-3xl">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C8A96B]" />
            <p className="text-sm font-medium">Retrieving verified text...</p>
          </div>
        ) : error || !hadith ? (
          <div className="p-8 text-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-sm">{error || "Hadith not found"}</p>
          </div>
        ) : (
          <Card className="p-7 sm:p-9 rounded-3xl bg-card border border-border space-y-8 shadow-sm">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold px-3 py-1 rounded-full bg-muted text-foreground">
                  Hadith #{hadith.hadithNumber}
                </span>
                {hadith.grades && hadith.grades.length > 0 && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                    Grade: {hadith.grades[0].grade} ({hadith.grades[0].name})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleBookmark}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                    isBookmarked ? "text-[#C8A96B] bg-[#C8A96B]/15" : "text-muted-foreground hover:bg-muted"
                  }`}
                  title="Bookmark Hadith"
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={copyHadith}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                  title="Copy text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Arabic Matn & Sanad */}
            {hadith.arabicText && (
              <div className="text-right py-4">
                <p
                  className="font-arabic text-2xl sm:text-3xl leading-[2.3] text-foreground font-normal tracking-wide"
                  dir="rtl"
                >
                  {hadith.arabicText}
                </p>
              </div>
            )}

            {/* English Translation */}
            <div className="pt-4 border-t border-border/50">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8A96B] block mb-2">
                English Translation
              </span>
              <p className="text-base sm:text-lg text-foreground/95 font-sans leading-relaxed whitespace-pre-line">
                {hadith.englishText}
              </p>
            </div>

            {/* Reference Citation Footer */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Reference & Citation</p>
              <p className="font-mono text-[11px]">
                {collection?.name} • Book: {hadith.chapterTitle || bookId} • Hadith #{hadith.hadithNumber}
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
