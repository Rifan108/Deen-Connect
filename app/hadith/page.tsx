"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Search,
  Bookmark,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Library,
} from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HADITH_COLLECTIONS } from "@/lib/hadith-service"

export default function HadithLandingPage() {
  const [search, setSearch] = useState("")

  const filtered = HADITH_COLLECTIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.author.toLowerCase().includes(search.toLowerCase()) ||
      c.arabicName.includes(search)
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#C8A96B]/25">
      <SiteNav />

      {/* Header Banner */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#69766E] dark:text-[#A9B9A7]">
                <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
                Kutub al-Sittah & Canonical Hadith
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground">
                Authentic Hadith{" "}
                <span className="font-arabic text-3xl sm:text-4xl text-[#C8A96B]" dir="rtl">
                  الحديث النبوي
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
                Explore the verified traditions, words, actions, and approvals of Prophet Muhammad (ﷺ), categorized collection-wise, book-wise, and hadith-wise with scholarly gradings.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search collection or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-full bg-card border border-border focus:outline-hidden focus:border-[#C8A96B] text-foreground shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collections Directory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h3 className="font-serif text-2xl font-normal text-foreground">
              Canonical Hadith Collections
            </h3>
            <p className="text-xs text-muted-foreground">
              Select a collection to browse its thematic books and individual narrations.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {filtered.length} Collections Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="group p-6 rounded-3xl bg-card border border-border hover:border-[#C8A96B]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                    {c.authenticity}
                  </span>
                  <span className="font-arabic text-xl text-[#C8A96B]" dir="rtl">
                    {c.arabicName}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-xl font-medium text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition">
                    {c.name}
                  </h4>
                  <p className="text-xs font-medium text-[#69766E] dark:text-[#A9B9A7]">
                    {c.author} (d. {c.deathYear})
                  </p>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5 font-mono text-[11px] text-muted-foreground">
                  <p>{c.totalBooks} Thematic Books</p>
                  <p>{c.totalHadith.toLocaleString()} Total Hadiths</p>
                </div>

                <Link href={`/hadith/${c.id}`}>
                  <Button
                    size="sm"
                    className="rounded-full px-4 h-8 text-xs bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] dark:hover:bg-[#d8bd85] font-semibold gap-1"
                  >
                    <span>Browse Books</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
