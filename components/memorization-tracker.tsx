"use client"

import React, { useState, useEffect } from "react"
import { BookOpen, Plus, CheckCircle, Trash2, Award, Sparkles, ChevronRight } from "lucide-react"
import { SURAH_LIST, type SurahMeta } from "@/components/audio-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

interface MemorizationItem {
  id: string
  surahNumber: number
  surahName: string
  arabicName: string
  versesFrom: number
  versesTo: number
  totalVerses: number
  progress: number
  lastReviewed: string
}

const DEFAULT_ITEMS: MemorizationItem[] = [
  {
    id: "1",
    surahNumber: 1,
    surahName: "Al-Fatihah",
    arabicName: "الفاتحة",
    versesFrom: 1,
    versesTo: 7,
    totalVerses: 7,
    progress: 100,
    lastReviewed: "Today",
  },
  {
    id: "2",
    surahNumber: 114,
    surahName: "An-Nas",
    arabicName: "الناس",
    versesFrom: 1,
    versesTo: 6,
    totalVerses: 6,
    progress: 85,
    lastReviewed: "Yesterday",
  },
  {
    id: "3",
    surahNumber: 113,
    surahName: "Al-Falaq",
    arabicName: "الفلق",
    versesFrom: 1,
    versesTo: 5,
    totalVerses: 5,
    progress: 70,
    lastReviewed: "2 days ago",
  },
  {
    id: "4",
    surahNumber: 112,
    surahName: "Al-Ikhlas",
    arabicName: "الإخلاص",
    versesFrom: 1,
    versesTo: 4,
    totalVerses: 4,
    progress: 100,
    lastReviewed: "Today",
  },
]

export default function MemorizationTracker() {
  const [items, setItems] = useState<MemorizationItem[]>(DEFAULT_ITEMS)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(36) // Ya-Sin default
  const [versesFrom, setVersesFrom] = useState<number>(1)
  const [versesTo, setVersesTo] = useState<number>(10)
  const [progressVal, setProgressVal] = useState<number>(20)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deen_connect_hifz_surahs")
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const saveItems = (newItems: MemorizationItem[]) => {
    setItems(newItems)
    localStorage.setItem("deen_connect_hifz_surahs", JSON.stringify(newItems))
  }

  const handleAddSurah = (e: React.FormEvent) => {
    e.preventDefault()
    const surah = SURAH_LIST.find((s) => s.number === selectedSurahNum) || SURAH_LIST[0]
    const newItem: MemorizationItem = {
      id: Date.now().toString(),
      surahNumber: surah.number,
      surahName: surah.name,
      arabicName: surah.arabicName,
      versesFrom: Math.max(1, versesFrom),
      versesTo: Math.min(surah.versesCount, Math.max(versesFrom, versesTo)),
      totalVerses: surah.versesCount,
      progress: progressVal,
      lastReviewed: "Today",
    }
    const updated = [newItem, ...items]
    saveItems(updated)
    setDialogOpen(false)
    toast.success(`Surah ${surah.name} added to your Hifz tracker`)
  }

  const handleUpdateProgress = (id: string, newProgress: number) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, progress: newProgress, lastReviewed: "Today" } : item
    )
    saveItems(updated)
  }

  const handleDelete = (id: string) => {
    const updated = items.filter((item) => item.id !== id)
    saveItems(updated)
    toast.info("Surah removed from tracker")
  }

  const overallHifzProgress =
    items.length > 0 ? Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Preservation of Quran • Hifz
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Quran Memorization Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Track verses committed to memory, manage revision schedules, and evaluate retention consistency.
          </p>
        </div>

        {/* Add Surah Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full text-xs gap-1.5 bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D]">
              <Plus className="w-3.5 h-3.5" />
              Add Surah Target
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg text-foreground">
                Add Surah to Hifz Tracker
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSurah} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Select Surah
                </label>
                <select
                  value={selectedSurahNum}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setSelectedSurahNum(n)
                    const s = SURAH_LIST.find((item) => item.number === n)
                    if (s) setVersesTo(s.versesCount)
                  }}
                  className="w-full p-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                >
                  {SURAH_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabicName}) — {s.versesCount} verses
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    From Verse
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={versesFrom}
                    onChange={(e) => setVersesFrom(Number(e.target.value))}
                    className="text-xs rounded-xl border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    To Verse
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={versesTo}
                    onChange={(e) => setVersesTo(Number(e.target.value))}
                    className="text-xs rounded-xl border-border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Initial Retention Level:</span>
                  <span className="font-mono font-bold text-[#C8A96B]">{progressVal}%</span>
                </div>
                <Slider
                  value={[progressVal]}
                  max={100}
                  step={5}
                  onValueChange={(val) => setProgressVal(val[0])}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#123D32] text-[#F7F5EF] text-xs">
                  Save to Tracker
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Retention Card */}
      <div className="p-6 rounded-3xl bg-card border border-border flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/20 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground">Overall Target Retention</p>
            <h3 className="font-serif text-2xl font-light text-foreground">{overallHifzProgress}% Average Mastery</h3>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground">
          {items.length} Tracked Surahs
        </span>
      </div>

      {/* Tracked Surahs List */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className="p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl hover:border-[#C8A96B]/40 transition space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center font-mono text-xs font-semibold text-foreground">
                  {item.surahNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-medium text-base text-foreground">{item.surahName}</h4>
                    <span className="font-arabic text-sm text-[#C8A96B]" dir="rtl">{item.arabicName}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Verses {item.versesFrom}–{item.versesTo} of {item.totalVerses} • Last reviewed: {item.lastReviewed}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#123D32] dark:text-[#C8A96B]">
                  {item.progress}%
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-muted-foreground hover:text-rose-500 transition"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Progress Slider */}
            <div className="space-y-1">
              <Slider
                value={[item.progress]}
                max={100}
                step={5}
                onValueChange={(val) => handleUpdateProgress(item.id, val[0])}
                className="cursor-pointer"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
