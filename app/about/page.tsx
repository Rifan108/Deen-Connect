"use client"

import React from "react"
import Link from "next/link"
import { SiteNav } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Compass, Sparkles, HeartHandshake, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />

      {/* Editorial Hero */}
      <section className="py-16 sm:py-24 border-b border-border/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#69766E] dark:text-[#A9B9A7]">
            Manifesto • The Philosophy of Deen Connect
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-foreground tracking-tight leading-[1.12]">
            Technology in the Service <br />
            <span className="editorial-italic text-[#123D32] dark:text-[#C8A96B]">
              of Quiet Devotion.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We believe digital tools should quiet the mind rather than compete for attention. Deen Connect was created as a peaceful sanctuary for your daily prayers, Quranic study, and mindful remembrance.
          </p>
        </div>
      </section>

      {/* Narrative Section (Pure Editorial Typography, No Picture) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#123D32] dark:text-[#C8A96B]">
              The Genesis
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-foreground leading-tight">
              Rejecting Noise, <br />
              <span className="editorial-italic">Embracing Sacred Rhythm.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              Most digital applications thrive on notifications, algorithmic feeds, and visual clutter. When it comes to spiritual practice, however, what Muslims need most is presence, serenity, and unquestionable accuracy.
            </p>
          </div>

          <div className="md:col-span-6 space-y-4 pt-0 md:pt-10">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deen Connect rejects noisy banner ads, artificial gamification, and unnecessary subscriptions. We crafted an editorial instrument with the proportion of classical calligraphy and the restraint of contemporary architecture.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All records, prayer timestamps, and Dhikr repetitions remain locally stored on your machine. Technology should be a quiet vessel that serves your faith, never an intrusion upon your devotional presence.
            </p>
          </div>
        </div>

        {/* The Four Foundational Pillars */}
        <div className="space-y-8 pt-8 border-t border-border">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Standards of Craft
            </span>
            <h3 className="font-serif text-3xl font-normal text-foreground">
              Our Foundational Pillars
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/20 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-medium text-foreground">
                Authenticity Above All
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All Quranic texts utilize certified Medina Uthmani script. Prayer calculations adhere to the highest astronomical standards recognized by the Muslim World League, ISNA, and Umm Al-Qura.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/20 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B]">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-medium text-foreground">
                Local Data Sovereignty
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your prayer streaks, Dhikr session counters, and reading history are stored privately on your device. We do not sell, track, or harvest your personal devotional records.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/20 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-medium text-foreground">
                Dignified Aesthetics
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No glowing neon cards, garish gradients, or generic AI templates. Every typeface, border weight, and color transition is selected with typographic intention.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/20 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-medium text-foreground">
                Continuous Access
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Offline-capable prayer calculation caches, lightweight assets, and fluid performance across desktops, tablets, and phones alike.
              </p>
            </div>
          </div>
        </div>

        {/* Closing Call to Action */}
        <div className="p-10 rounded-3xl bg-[#123D32] dark:bg-[#174C3D] text-[#F7F5EF] text-center space-y-6">
          <h3 className="font-serif text-3xl font-light">
            Begin Your Spiritual Journey Today
          </h3>
          <p className="text-xs sm:text-sm text-[#A9B9A7] max-w-lg mx-auto leading-relaxed">
            Explore the Quran reader, discover accurate prayer schedules, or practice mindful Tasbih in complete serenity.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/home">
              <Button className="rounded-full px-8 bg-[#C8A96B] text-[#123D32] hover:bg-[#d8bd85] font-semibold text-xs shadow-md">
                Explore The Sanctuary
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground font-mono">
        Deen Connect • An Editorial Islamic Digital Platform
      </footer>
    </div>
  )
}
