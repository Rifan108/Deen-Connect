"use client"

import React, { use } from "react"
import Link from "next/link"
import { ChevronLeft, BookOpen, Layers } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { QuranMushafReader } from "@/components/quran-mushaf-reader"
import { Button } from "@/components/ui/button"

export default function DedicatedQuranPage({
  params,
}: {
  params: Promise<{ pageNumber: string }>
}) {
  const resolvedParams = use(params)
  const pageNum = parseInt(resolvedParams.pageNumber, 10) || 1

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Quran Index
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/quran">
              <Button variant="ghost" size="sm" className="rounded-full text-xs gap-1.5 h-8">
                <Layers className="w-3.5 h-3.5" />
                <span>Surahs & Juz</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mushaf Page-Wise Reader */}
        <QuranMushafReader initialPage={pageNum} />
      </main>
    </div>
  )
}
