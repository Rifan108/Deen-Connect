"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  History,
  Target,
  Check,
  Plus,
  Sparkles,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DhikrPreset {
  id: string
  arabic: string
  transliteration: string
  translation: string
  defaultTarget: number
}

const PRESETS: DhikrPreset[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ ٱللَّٰهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    defaultTarget: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    transliteration: "Alhamdulillah",
    translation: "Praise be to Allah",
    defaultTarget: 33,
  },
  {
    id: "allahuakbar",
    arabic: "ٱللَّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    defaultTarget: 34,
  },
  {
    id: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    defaultTarget: 100,
  },
  {
    id: "lailahaillallah",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    transliteration: "La ilaha illallah",
    translation: "There is no deity except Allah",
    defaultTarget: 100,
  },
  {
    id: "salawat",
    arabic: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammad",
    translation: "O Allah, send blessings upon Muhammad",
    defaultTarget: 100,
  },
]

interface SessionRecord {
  id: string
  dhikr: string
  count: number
  target: number
  timestamp: string
}

export default function DikrCounter() {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(PRESETS[0])
  const [count, setCount] = useState<number>(0)
  const [laps, setLaps] = useState<number>(0)
  const [target, setTarget] = useState<number>(33)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true)
  const [history, setHistory] = useState<SessionRecord[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [showPresets, setShowPresets] = useState<boolean>(false)
  const [showTargetInput, setShowTargetInput] = useState<boolean>(false)
  const [customTarget, setCustomTarget] = useState<string>("")

  const audioCtxRef = useRef<AudioContext | null>(null)

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("deen_connect_dhikr_sessions")
      if (savedHistory) setHistory(JSON.parse(savedHistory))

      const savedCount = localStorage.getItem("dikr-today-count")
      if (savedCount) setCount(Number(savedCount) || 0)
    } catch (e) {
      console.warn("Storage loading error", e)
    }
  }, [])

  // Web Audio click generator (wood bead knock sound)
  const playWoodTap = () => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current

      if (ctx.state === "suspended") ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(320, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch {
      // Audio not permitted or supported
    }
  }

  const triggerHaptic = () => {
    if (!hapticsEnabled || typeof window === "undefined") return
    if ("vibrate" in navigator) {
      navigator.vibrate(25)
    }
  }

  const handleIncrement = () => {
    const nextCount = count + 1
    playWoodTap()
    triggerHaptic()
    setCount(nextCount)

    // Save daily total
    const currentToday = Number(localStorage.getItem("dikr-today-count") || 0) + 1
    const currentTotal = Number(localStorage.getItem("dikr-total-count") || 0) + 1
    localStorage.setItem("dikr-today-count", currentToday.toString())
    localStorage.setItem("dikr-total-count", currentTotal.toString())

    // Target celebration
    if (nextCount === target) {
      if ("vibrate" in navigator) navigator.vibrate([40, 60, 40])
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#C8A96B", "#123D32", "#A9B9A7"],
      })
      // Record completed session
      saveSession(target)
      setLaps((l) => l + 1)
      setCount(0)
    }
  }

  const saveSession = (completedCount: number) => {
    const newRecord: SessionRecord = {
      id: Date.now().toString(),
      dhikr: selectedDhikr.transliteration,
      count: completedCount,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    const updated = [newRecord, ...history.slice(0, 24)]
    setHistory(updated)
    localStorage.setItem("deen_connect_dhikr_sessions", JSON.stringify(updated))
  }

  const handleReset = () => {
    if (count > 0) {
      saveSession(count)
    }
    setCount(0)
  }

  const selectPreset = (preset: DhikrPreset) => {
    setSelectedDhikr(preset)
    setTarget(preset.defaultTarget)
    setCount(0)
    setShowPresets(false)
  }

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(customTarget, 10)
    if (!isNaN(val) && val > 0) {
      setTarget(val)
      setCount(0)
      setShowTargetInput(false)
      setCustomTarget("")
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("deen_connect_dhikr_sessions")
  }

  // Circular calculations
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (count / target) * circumference

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Top Header & Settings Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Spiritual Remembrance • Tasbih
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Mindful Dhikr Counter
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-full border transition ${
              soundEnabled
                ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
            title="Acoustic tap feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptics Toggle */}
          <button
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
            className={`p-2.5 rounded-full border transition ${
              hapticsEnabled
                ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
            title="Tactile haptic feedback"
          >
            <Vibrate className="w-4 h-4" />
          </button>

          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition ${
              showHistory
                ? "bg-[#C8A96B] text-[#123D32] border-[#C8A96B] font-semibold"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tasbih Instrument */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Preset Selector & Target Controls */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-border bg-card/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                Current Dhikr
              </span>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-[#C8A96B] hover:underline flex items-center gap-1 font-medium"
              >
                Change <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xl font-serif font-arabic text-[#123D32] dark:text-[#C8A96B] leading-relaxed" dir="rtl">
                {selectedDhikr.arabic}
              </p>
              <h4 className="font-serif text-base font-semibold text-foreground">
                {selectedDhikr.transliteration}
              </h4>
              <p className="text-xs text-muted-foreground italic">
                "{selectedDhikr.translation}"
              </p>
            </div>

            {/* Presets Accordion */}
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-3 border-t border-border overflow-hidden"
                >
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPreset(p)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                        selectedDhikr.id === p.id
                          ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                          : "border-border/60 hover:bg-muted text-foreground"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{p.transliteration}</p>
                        <p className="text-[10px] opacity-75">{p.defaultTarget}x target</p>
                      </div>
                      <span className="font-arabic text-sm">{p.arabic.split(" ")[0]}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Target Selector */}
          <Card className="p-5 border-border bg-card/60 backdrop-blur-sm space-y-3">
            <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
              Cycle Target
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[33, 99, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTarget(t)
                    setCount(0)
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-medium border transition ${
                    target === t
                      ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setShowTargetInput(!showTargetInput)}
                className={`py-2 rounded-xl text-xs font-mono font-medium border transition ${
                  ![33, 99, 100].includes(target)
                    ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                Custom
              </button>
            </div>

            {showTargetInput && (
              <form onSubmit={handleCustomTargetSubmit} className="flex gap-2 pt-2">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="Target (e.g. 500)"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-[#C8A96B]"
                />
                <Button type="submit" size="sm" className="bg-[#123D32] text-[#F7F5EF] text-xs rounded-xl">
                  Set
                </Button>
              </form>
            )}

            <div className="pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Completed Cycles:</span>
              <span className="font-mono font-bold text-foreground">{laps}</span>
            </div>
          </Card>
        </div>

        {/* Center: The Tactile Circular Dial */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-6">
          <div className="relative select-none flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform">
              {/* Outer guide track */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-muted/50 fill-none"
                strokeWidth="8"
              />
              {/* Dynamic progress fill */}
              <motion.circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-[#C8A96B] fill-none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </svg>

            {/* Inner Tactile Tap Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleIncrement}
              className="absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] border-2 border-[#C8A96B]/40 text-[#F7F5EF] flex flex-col items-center justify-center p-6 shadow-2xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#C8A96B]/20 transition-shadow"
            >
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#A9B9A7] mb-1">
                Tap to count
              </span>
              <motion.span
                key={count}
                initial={{ scale: 0.85, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-serif text-6xl sm:text-7xl font-light text-[#F7F5EF] tracking-tight"
              >
                {count}
              </motion.span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-mono text-[#C8A96B]">/ {target}</span>
              </div>
            </motion.button>
          </div>

          {/* Quick Controls Under Dial */}
          <div className="flex items-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-full text-xs gap-1.5 border-border hover:border-rose-400/50 hover:text-rose-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Cycle
            </Button>
          </div>
        </div>
      </div>

      {/* Session History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border border-border rounded-2xl bg-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Session History
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your mindful remembrances recorded during this session
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-rose-500 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear history
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No sessions completed yet. Tap the dial to complete your first target cycle.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-background/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.dhikr}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{item.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-[#123D32] dark:text-[#C8A96B]">
                        +{item.count}
                      </span>
                      <p className="text-[10px] text-muted-foreground">target {item.target}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
