"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function QuranPageReader() {
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const data = await response.json()

        if (data.status === "OK" && data.data?.ayahs?.length > 0) {
          setPageData(data.data)
          setError("")
          console.log("[v0] Quran page loaded successfully:", {
            page: currentPage,
            verses: data.data.ayahs.length,
            firstSurah: data.data.ayahs[0]?.surah?.name,
            lastSurah: data.data.ayahs[data.data.ayahs.length - 1]?.surah?.name,
          })
        } else {
          setError(`Invalid page data for page ${currentPage}`)
          setPageData(null)
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setError("Request timeout. Please try again.")
        } else {
          console.error("[v0] Error fetching Quran page:", err)
          setError("Error loading page. Please try again.")
        }
        setPageData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [currentPage])

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < 604) setCurrentPage(currentPage + 1)
  }

  const handleJumpToPage = (pageNum: number) => {
    const validPage = Math.max(1, Math.min(604, pageNum))
    setCurrentPage(validPage)
  }

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(currentPage) ? prev.filter((p) => p !== currentPage) : [...prev, currentPage],
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground/70">Loading Quran Page {currentPage}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-red-500 mb-4 text-lg font-semibold">{error}</p>
        <Button onClick={() => setCurrentPage(1)}>Reset to Page 1</Button>
      </div>
    )
  }

  if (!pageData || !pageData.ayahs) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <p className="text-foreground/70">No verses found for this page</p>
          <Button onClick={() => setCurrentPage(1)}>Go to Page 1</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="card-premium p-8 space-y-6 bg-gradient-to-br from-card/60 via-card/40 to-background/50 border-2 border-accent/20">
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-accent/30">
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-bold text-gradient">Quran Al-Kareem</h2>
              <span className="text-lg text-accent font-semibold">Page {currentPage}</span>
            </div>
            <p className="text-3xl font-serif text-accent/90 tracking-wide">Page {currentPage} of 604 Pages</p>
            <div className="flex gap-6 text-sm">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                {pageData?.ayahs?.length || 0} Verses
              </span>
            </div>
          </div>
          <button
            onClick={toggleBookmark}
            className="p-4 rounded-xl hover:bg-accent/20 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            {bookmarks.includes(currentPage) ? (
              <BookmarkCheck className="w-7 h-7 text-accent" />
            ) : (
              <Bookmark className="w-7 h-7 text-muted-foreground hover:text-accent" />
            )}
          </button>
        </div>

        <div className="relative bg-gradient-to-b from-background/20 to-background/5 rounded-xl p-10 min-h-96 space-y-6 border border-primary/10 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="relative text-right space-y-4">
            {pageData?.ayahs?.map((ayah: any, idx: number) => (
              <div key={`${currentPage}-${idx}`} className="space-y-2 pb-4 border-b border-foreground/10">
                <p className="text-right font-serif text-2xl leading-relaxed text-foreground/95">{ayah.text}</p>
                <p className="text-right text-sm text-foreground/60 flex justify-end gap-2">
                  <span className="text-accent font-semibold">[{ayah.surah.name}]</span>
                  <span>Verse {ayah.numberInSurah}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t-2 border-accent/20">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="button-premium bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 border border-primary/30"
            variant="outline"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-base font-semibold text-foreground">Page {currentPage} / 604</span>
            <input
              type="number"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => {
                const pageNum = Math.min(Math.max(1, Number.parseInt(e.target.value) || 1), 604)
                handleJumpToPage(pageNum)
              }}
              className="w-20 px-3 py-2 rounded-lg text-center bg-card border-2 border-primary/30 text-foreground font-semibold hover:border-primary/50 focus:border-accent transition-colors"
            />
          </div>

          <Button
            onClick={handleNext}
            disabled={currentPage === 604}
            className="button-premium bg-gradient-to-r from-accent/20 to-primary/20 hover:from-accent/40 hover:to-primary/40 border border-primary/30"
            variant="outline"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-premium p-6 bg-gradient-to-br from-accent/20 to-transparent border-2 border-accent/30">
          <p className="text-sm font-semibold text-accent/80 mb-2">Bookmarks</p>
          <p className="text-3xl font-bold text-gradient">{bookmarks.length}</p>
        </Card>
        <Card className="card-premium p-6 bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/30">
          <p className="text-sm font-semibold text-primary/80 mb-2">Current Page</p>
          <p className="text-3xl font-bold text-primary">{currentPage}/604</p>
        </Card>
        <Card className="card-premium p-6 bg-gradient-to-br from-secondary/20 to-transparent border-2 border-secondary/30">
          <p className="text-sm font-semibold text-secondary/80 mb-2">Total Pages</p>
          <p className="text-3xl font-bold text-secondary">604</p>
        </Card>
      </div>
    </div>
  )
}
