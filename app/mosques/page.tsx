"use client"

import React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ChevronLeft, MapPin } from "lucide-react"
import { SiteNav } from "@/components/site-nav"

const NearbyMosques = dynamic(() => import("@/components/nearby-mosques"), { ssr: false })

export default function MosquesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Sanctuary
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#C8A96B] bg-[#C8A96B]/10 px-3 py-1 rounded-full border border-[#C8A96B]/20">
            OpenStreetMap Verified
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123D32]/10 dark:bg-[#C8A96B]/15 text-[#123D32] dark:text-[#C8A96B] text-xs font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>Mosque Locator</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
            Nearby Mosque Locations
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Locate authentic registered Masjids in your vicinity, check exact distances, view coordinates, and get turn-by-turn driving or walking directions.
          </p>
        </div>

        {/* Interactive Mosque Map & Locator Component */}
        <NearbyMosques />
      </main>
    </div>
  )
}

