"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, PenTool, Users, Utensils, CheckCircle, Sparkles, Send } from "lucide-react"
import { toast } from "sonner"

interface JournalEntry {
  date: string
  reflection: string
}

export default function UniqueAdvancedFeatures() {
  const [activeTab, setActiveTab] = useState("journal")
  const [reflections, setReflections] = useState<JournalEntry[]>([
    {
      date: "Today",
      reflection: "Felt deep tranquility during Fajr prayer in the early quiet hours. Need to maintain presence of heart in Dhuhr.",
    },
    {
      date: "Yesterday",
      reflection: "Reflected upon Surah Ar-Rahman: 'Which of the favors of your Lord will you deny?' Abundant blessings often go unthanked.",
    },
  ])
  const [newReflection, setNewReflection] = useState("")
  const [fastStreak, setFastStreak] = useState(14)
  const [fastLoggedToday, setFastLoggedToday] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deen_connect_journal")
      if (saved) setReflections(JSON.parse(saved))
      const f = localStorage.getItem("deen_connect_fast_streak")
      if (f) setFastStreak(Number(f))
    } catch {}
  }, [])

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReflection.trim()) return
    const updated = [
      {
        date: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reflection: newReflection.trim(),
      },
      ...reflections,
    ]
    setReflections(updated)
    localStorage.setItem("deen_connect_journal", JSON.stringify(updated))
    setNewReflection("")
    toast.success("Reflection preserved in your private journal")
  }

  const handleLogFast = () => {
    if (fastLoggedToday) return
    const next = fastStreak + 1
    setFastStreak(next)
    setFastLoggedToday(true)
    localStorage.setItem("deen_connect_fast_streak", next.toString())
    toast.success("Voluntary Fast logged! May Allah accept your devotion.")
  }

  const tabs = [
    { id: "journal", label: "Spiritual Journal", icon: PenTool },
    { id: "fasting", label: "Fasting Tracker", icon: Utensils },
    { id: "learning", label: "Curriculum & Lessons", icon: BookOpen },
    { id: "community", label: "Global Ummah Scope", icon: Users },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Spiritual Journaling & Practice
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Personal Reflection & Study
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Private journaling for your prayer reflections, voluntary fasting logs, and structured Islamic learning milestones.
          </p>
        </div>
      </div>

      {/* Clean Tab Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 whitespace-nowrap transition ${
                isActive
                  ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                  : "bg-card border-border hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Spiritual Journal */}
      {activeTab === "journal" && (
        <Card className="p-6 sm:p-8 border-border bg-card/60 backdrop-blur-sm rounded-3xl space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Daily Prayer Journal & Contemplations
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reflect upon your prayers, verses read today, and gratitude notes. Stored locally.
            </p>
          </div>

          <form onSubmit={handleSaveReflection} className="space-y-3">
            <textarea
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="What verse resonated with you today? Write your quiet spiritual notes..."
              rows={3}
              className="w-full p-4 text-xs rounded-2xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-[#C8A96B] text-foreground leading-relaxed resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newReflection.trim()}
                className="rounded-full text-xs gap-1.5 bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D]"
              >
                <Send className="w-3 h-3" />
                Record Reflection
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {reflections.map((r, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between text-muted-foreground font-mono text-[10px]">
                  <span>{r.date}</span>
                </div>
                <p className="text-foreground/90 font-sans leading-relaxed italic">
                  "{r.reflection}"
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 2: Fasting Tracker */}
      {activeTab === "fasting" && (
        <Card className="p-6 sm:p-8 border-border bg-card/60 backdrop-blur-sm rounded-3xl space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Voluntary & Obligatory Fasting (Sawm)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep track of voluntary Monday & Thursday sunnah fasts, White Days (Ayyam al-Beed), and Ramadan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-1 text-center">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Current Streak</span>
              <p className="text-3xl font-serif font-light text-[#123D32] dark:text-[#C8A96B]">{fastStreak}</p>
              <p className="text-[10px] text-muted-foreground font-mono">Consecutive Days</p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-1 text-center">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Total Fasts</span>
              <p className="text-3xl font-serif font-light text-foreground">{fastStreak + 42}</p>
              <p className="text-[10px] text-muted-foreground font-mono">This Hijri Year</p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-1 text-center">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Next Sunnah Fast</span>
              <p className="text-lg font-serif font-medium text-foreground mt-2">Monday</p>
              <p className="text-[10px] text-muted-foreground font-mono">Weekly Tradition</p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleLogFast}
              disabled={fastLoggedToday}
              className="w-full rounded-2xl text-xs bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#174C3D]"
            >
              {fastLoggedToday ? "✓ Fast Logged for Today" : "Log Fasting Day (Alhamdulillah)"}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Learning Curriculum */}
      {activeTab === "learning" && (
        <Card className="p-6 sm:p-8 border-border bg-card/60 backdrop-blur-sm rounded-3xl space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Structured Islamic Curriculum
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Foundational knowledge across Aqeedah, Fiqh, Seerah, and Quranic Arabic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Foundations of Tawheed (Belief)", lessons: "12 of 15 Completed", progress: 80 },
              { title: "Fiqh of Salah & Purification", lessons: "20 of 20 Completed", progress: 100 },
              { title: "The Seerah: Makkan Period", lessons: "18 of 24 Completed", progress: 75 },
              { title: "Essential Quranic Vocabulary", lessons: "140 of 300 Words", progress: 46 },
            ].map((c, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-border bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-medium text-sm text-foreground">{c.title}</h4>
                  <span className="font-mono text-xs text-[#C8A96B] font-bold">{c.progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#123D32] dark:bg-[#C8A96B] rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{c.lessons}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Global Ummah Scope */}
      {activeTab === "community" && (
        <Card className="p-6 sm:p-8 border-border bg-card/60 backdrop-blur-sm rounded-3xl space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Global Ummah Brotherhood
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uniting with 1.9 billion Muslims turning toward the same Kaaba in prayer five times daily.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">Estimated Daily Congregations</span>
                <span className="font-mono text-[#C8A96B] font-bold">~1.2B Prayers</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#123D32] to-[#C8A96B] rounded-full" style={{ width: "90%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground">Continuous unbroken waves of prayer across all timezones.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
