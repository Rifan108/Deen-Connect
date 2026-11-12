"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, BookOpen, ExternalLink, Sparkles } from "lucide-react"
import { SURAH_LIST } from "@/components/audio-context"
import Link from "next/link"

interface Tafsir {
  surah: number
  ayah: number
  text: string
  scholar: string
}

const TAFSIR_DATA: Record<string, Tafsir[]> = {
  "1": [
    {
      surah: 1,
      ayah: 1,
      text: "Bismillah (In the Name of Allah, the Entirely Merciful, the Especially Merciful) — This sacred phrase consecrates every human deed. Classical jurists observe that initiating affairs with the Divine Name invites barakah, dispels distraction, and aligns the heart with its Creator.",
      scholar: "Tafsir Ibn Kathir",
    },
    {
      surah: 1,
      ayah: 2,
      text: "Alhamdulillah (All praise and gratitude belong to Allah, Lord of all the Worlds) — Gratitude (Shukr) is the foundation of spiritual elevation. Al-Tabari explains that praising Allah is both a declaration of His absolute perfection and a testament to His unceasing beneficence toward creation.",
      scholar: "Tafsir al-Tabari",
    },
    {
      surah: 1,
      ayah: 5,
      text: "Iyyaka na'budu wa iyyaka nasta'een (It is You alone we worship, and You alone we ask for help) — The quintessential core of Tawheed. Worship is purified of ostentation (Riya'), and reliance is stripped of dependence upon secondary causes.",
      scholar: "Tafsir as-Sa'di",
    },
  ],
  "2": [
    {
      surah: 2,
      ayah: 1,
      text: "Alif-Lam-Meem — Disjointed letters (Al-Huruf al-Muqatta'at) that demonstrate the divine, inimitable origin of the Quran. Composed of the very letters spoken by the Arabs, yet impossible for humanity to replicate.",
      scholar: "Tafsir Ibn Kathir",
    },
    {
      surah: 2,
      ayah: 255,
      text: "Ayat al-Kursi (The Throne Verse) — The greatest verse of the Quran. Describes Allah's absolute living sovereignty (Al-Hayy, Al-Qayyum), unburdened by slumber or weariness, encompassing heavens and earth.",
      scholar: "Tafsir al-Qurtubi",
    },
  ],
  "18": [
    {
      surah: 18,
      ayah: 1,
      text: "Praise be to Allah Who revealed the Book to His Servant — Surah Al-Kahf was revealed as a spiritual fortress against the four tribulations: of faith (Ashab al-Kahf), wealth (the garden), knowledge (Musa & Khidr), and power (Dhul-Qarnayn).",
      scholar: "Tafsir Ibn Kathir",
    },
  ],
  "36": [
    {
      surah: 36,
      ayah: 1,
      text: "Ya-Sin — Termed the heart of the Quran by early scholars. Centered on resurrection, divine craftsmanship in nature, and the prophetic mission.",
      scholar: "Tafsir as-Sa'di",
    },
  ],
  "112": [
    {
      surah: 112,
      ayah: 1,
      text: "Say: He is Allah, the One (Ahad) — Surah Al-Ikhlas represents one-third of the Quran in meaning, dedicating its entirety to the uncompromised unity and uniqueness of the Divine essence.",
      scholar: "Tafsir Ibn Kathir",
    },
  ],
}

export default function QuranTafsirReader() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1)
  const [tafsirData, setTafsirData] = useState<Tafsir[]>([])

  const currentMeta = SURAH_LIST.find((s) => s.number === selectedSurah) || SURAH_LIST[0]

  useEffect(() => {
    const data = TAFSIR_DATA[selectedSurah.toString()] || []
    setTafsirData(data)
  }, [selectedSurah])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Exegesis & Scholarly Commentary • Tafsir
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Quranic Tafsir Exegesis
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Scholarly verse-by-verse commentary from Ibn Kathir, Al-Tabari, Al-Qurtubi, and As-Sa'di.
          </p>
        </div>

        {/* Surah Step Selector */}
        <div className="flex items-center border border-border rounded-full p-1 bg-card">
          <button
            onClick={() => setSelectedSurah((s) => Math.max(1, s - 1))}
            disabled={selectedSurah <= 1}
            className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium px-3 text-foreground">
            Surah {selectedSurah} • {currentMeta.name}
          </span>
          <button
            onClick={() => setSelectedSurah((s) => Math.min(114, s + 1))}
            disabled={selectedSurah >= 114}
            className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Surah Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 18, 36, 67, 112].map((sNum) => {
          const s = SURAH_LIST.find((item) => item.number === sNum)
          if (!s) return null
          return (
            <button
              key={sNum}
              onClick={() => setSelectedSurah(sNum)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition ${
                selectedSurah === sNum
                  ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                  : "bg-card border-border hover:bg-muted text-foreground"
              }`}
            >
              {s.number}. {s.name}
            </button>
          )
        })}
      </div>

      {/* Tafsir Notes List */}
      <div className="space-y-4">
        {tafsirData.length > 0 ? (
          tafsirData.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 sm:p-8 border-border bg-card/60 backdrop-blur-sm rounded-3xl space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B] font-semibold">
                  Surah {item.surah}:{item.ayah}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {item.scholar}
                </span>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                {item.text}
              </p>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/feature?type=quran`}
                  className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium"
                >
                  Read in Quran Reader <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center border-border bg-card/40 rounded-3xl space-y-3">
            <p className="font-serif text-lg text-foreground">Scholarly Tafsir in Preparation</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Our scholars are reviewing verified classical commentaries for Surah {currentMeta.name}. Select Surah 1, 2, 18, 36, or 112 to explore authenticated exegesis.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
