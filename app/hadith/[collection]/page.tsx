"use client"

import React, { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Search,
  ChevronRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchCollectionInfo, type HadithCollection, type HadithBookMeta } from "@/lib/hadith-service"

export default function HadithBooksPage({
  params,
}: {
  params: Promise<{ collection: string }>
}) {
  const resolvedParams = use(params)
  const collectionId = resolvedParams.collection

  const [collection, setCollection] = useState<HadithCollection | null>(null)
  const [books, setBooks] = useState<HadithBookMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchCollectionInfo(collectionId)
      .then((res) => {
        if (!isMounted) return
        setCollection(res.collection)
        setBooks(res.books)
      })
      .catch((err) => {
        if (!isMounted) return
        setError("Failed to load collection books. Please check connection.")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [collectionId])

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.bookId.toString() === search.trim()
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* Header Banner */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/hadith"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Hadith Collections</span>
          </Link>

          {collection && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                  {collection.authenticity} Standard • {collection.totalHadith.toLocaleString()} Hadiths
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-foreground">
                  {collection.name}{" "}
                  <span className="font-arabic text-2xl sm:text-3xl text-[#C8A96B]" dir="rtl">
                    {collection.arabicName}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Compiled by {collection.author} (d. {collection.deathYear}). {collection.description}
                </p>
              </div>

              {/* Search in collection */}
              <div className="relative sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter books (e.g. Prayer, Fasting)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-card border border-border focus:outline-hidden focus:border-[#C8A96B] text-foreground"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Books Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-card border border-border rounded-3xl">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C8A96B]" />
            <p className="text-sm font-medium">Retrieving collection thematic books...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card
                key={book.bookId}
                className="group p-5 rounded-3xl bg-card border border-border hover:border-[#C8A96B]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-mono text-xs font-semibold text-foreground group-hover:border group-hover:border-[#C8A96B]/40 shrink-0">
                    {book.bookId}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-base font-medium text-foreground line-clamp-2 group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition">
                      {book.title}
                    </h4>
                    {book.firstHadith && book.lastHadith && (
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Hadiths {book.firstHadith} – {book.lastHadith} ({book.count} narrations)
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-border/60 flex justify-end">
                  <Link href={`/hadith/${collectionId}/${book.bookId}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-xs h-8 px-3 font-medium text-muted-foreground group-hover:text-foreground"
                    >
                      <span>Read Narrations</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
