"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen,
  Search,
  Bookmark,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HADITH_COLLECTIONS, fetchSingleHadith, type HadithItem } from "@/lib/hadith-service"
import { toast } from "sonner"

export default function HadithExplorerFeature() {
  const [featuredHadith, setFeaturedHadith] = useState<HadithItem | null>(null)
  const [featuredCollection, setFeaturedCollection] = useState<string>("bukhari")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Load a verified authentic Hadith for contemplation
  const loadFeatured = (hadithNum = 1) => {
    setLoading(true)
    fetchSingleHadith("bukhari", hadithNum)
      .then((res) => {
        setFeaturedHadith(res.hadith)
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadFeatured(1) // Hadith of Intentions (Innama al-a'malu bin-niyyat)
  }, [])

  const copyFeatured = () => {
    if (!featuredHadith) return
    const text = `${featuredHadith.arabicText ? featuredHadith.arabicText + "\n\n" : ""}"${featuredHadith.englishText}"\n— Sahih al-Bukhari #${featuredHadith.hadithNumber}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Hadith copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Featured Hadith of Contemplation */}
      <Card className="p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] space-y-6 shadow-md border border-[#C8A96B]/30">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#C8A96B] flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Hadith of Contemplation • Sahih al-Bukhari #1
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyFeatured}
              className="text-[#A9B9A7] hover:text-[#F7F5EF] transition text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <Link href="/hadith/bukhari/1/1">
              <span className="text-[#C8A96B] hover:underline text-xs flex items-center gap-0.5">
                Full Page <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>

        {featuredHadith?.arabicText && (
          <div className="text-right py-2">
            <p className="font-arabic text-xl sm:text-2xl leading-[2.2] text-[#F7F5EF]" dir="rtl">
              {featuredHadith.arabicText}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-white/10">
          <p className="text-sm sm:text-base font-sans text-[#F7F5EF]/95 leading-relaxed">
            {featuredHadith?.englishText}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#A9B9A7]">
          <span>Narrated by 'Umar bin Al-Khattab (رضي الله عنه)</span>
          <span className="text-[#C8A96B]">Grade: Sahih (Authentic Consensus)</span>
        </div>
      </Card>

      {/* Collections Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-serif text-xl font-normal text-foreground">
              Canonical Hadith Collections
            </h3>
            <p className="text-xs text-muted-foreground">
              Browse authentic books and narrations organized by scholar and topic.
            </p>
          </div>
          <Link href="/hadith">
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              Explore Full Library →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HADITH_COLLECTIONS.map((c) => (
            <Card
              key={c.id}
              className="p-5 rounded-3xl bg-card border border-border hover:border-[#C8A96B]/50 transition shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-muted font-semibold">
                    {c.authenticity}
                  </span>
                  <span className="font-arabic text-lg text-[#C8A96B]" dir="rtl">
                    {c.arabicName}
                  </span>
                </div>
                <h4 className="font-serif text-base font-medium">{c.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {c.totalHadith.toLocaleString()} Hadiths
                </span>
                <Link href={`/hadith/${c.id}`}>
                  <Button size="sm" variant="ghost" className="rounded-full text-xs h-7 px-3">
                    Browse →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

