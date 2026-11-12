"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Loader2, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"

interface SearchMatch {
  number: number
  text: string
  surah: {
    number: number
    name: string
    englishName: string
  }
  numberInSurah: number
}

export default function QuranicWordSearch() {
  const [searchTerm, setSearchTerm] = useState("mercy")
  const [results, setResults] = useState<SearchMatch[]>([])
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const executeSearch = async (termToSearch = searchTerm) => {
    const q = termToSearch.trim()
    if (!q) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/en.sahih`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error("Search service error")
      const json = await res.json()

      if (json.status === "OK" && json.data) {
        setResults(json.data.matches || [])
        setTotalCount(json.data.count || 0)
      } else {
        setResults([])
        setTotalCount(0)
      }
    } catch (e: any) {
      console.warn("Quran search error", e)
      setError("Unable to complete live search. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePresetClick = (word: string) => {
    setSearchTerm(word)
    executeSearch(word)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Linguistic Exploration • Concordance
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Quranic Word Search
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Search across all 6,236 verses of the Quran for themes, words, and concepts with live concordance results.
          </p>
        </div>
      </div>

      {/* Search Bar & Curated Theme Chips */}
      <Card className="p-6 border-border bg-card/60 backdrop-blur-sm rounded-3xl space-y-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            executeSearch()
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts (e.g. mercy, patience, justice, light, forgiveness)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-1 focus:ring-[#C8A96B] text-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full px-6 text-xs bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D]"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search Quran"}
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-muted-foreground font-mono text-[11px]">Recommended themes:</span>
          {["mercy", "patience", "forgiveness", "paradise", "peace", "gratitude"].map((w) => (
            <button
              key={w}
              onClick={() => handlePresetClick(w)}
              className="px-3 py-1 rounded-full text-xs font-medium border border-border/80 hover:border-[#C8A96B] hover:bg-muted text-foreground transition"
            >
              {w}
            </button>
          ))}
        </div>
      </Card>

      {/* Results Count Banner */}
      {totalCount !== null && (
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
          <span>Found {totalCount} matching occurrences for "{searchTerm}"</span>
          <span>Saheeh International Translation</span>
        </div>
      )}

      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      {/* Search Results List */}
      <div className="space-y-3">
        {results.slice(0, 30).map((item, idx) => (
          <Card
            key={idx}
            className="p-5 border-border bg-card hover:border-[#C8A96B]/50 transition rounded-2xl space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B] font-semibold">
                  Surah {item.surah.number}:{item.numberInSurah}
                </span>
                <span className="font-serif font-medium text-sm text-foreground">
                  Surah {item.surah.englishName}
                </span>
              </div>

              <Link
                href={`/feature?type=quran`}
                className="text-xs text-[#C8A96B] hover:underline flex items-center gap-0.5"
              >
                Read in Surah <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed font-sans pt-1">
              "{item.text}"
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
