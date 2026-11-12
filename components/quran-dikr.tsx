"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Dikr {
  text: string
  transliteration: string
  translation: string
  count?: number
}

export default function QuranDikr() {
  const [selectedDikr, setSelectedDikr] = useState(0)
  const [counter, setCounter] = useState(0)

  const dikrs: Dikr[] = [
    {
      text: "سُبْحَانَ اللَّهِ",
      transliteration: "Subhan'allah",
      translation: "Glory be to Allah",
      count: 33,
    },
    {
      text: "الْحَمْدُ لِلَّهِ",
      transliteration: "Alhamdulillah",
      translation: "All praise is due to Allah",
      count: 33,
    },
    {
      text: "اللَّهُ أَكْبَرُ",
      transliteration: "Allahu Akbar",
      translation: "Allah is the Greatest",
      count: 34,
    },
    {
      text: "لَا إِلَـٰهَ إِلَّا اللَّهُ",
      transliteration: "La ilaha illallah",
      translation: "There is no deity except Allah",
    },
  ]

  const handleCounter = () => {
    const target = dikrs[selectedDikr].count || 33
    if (counter < target) {
      setCounter(counter + 1)
    }
  }

  const resetCounter = () => {
    setCounter(0)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dikrs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDikr(idx)
                setCounter(0)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedDikr === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="text-4xl font-serif text-primary mb-4">{dikrs[selectedDikr].text}</div>
          <p className="text-lg text-accent font-semibold">{dikrs[selectedDikr].transliteration}</p>
          <p className="text-muted-foreground">{dikrs[selectedDikr].translation}</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-5xl font-bold text-primary">{counter}</div>
          <div className="flex gap-3">
            <Button onClick={handleCounter} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Count
            </Button>
            <Button
              onClick={resetCounter}
              variant="outline"
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              Reset
            </Button>
          </div>
          {dikrs[selectedDikr].count && (
            <p className="text-sm text-muted-foreground">Target: {dikrs[selectedDikr].count}</p>
          )}
        </div>
      </Card>
    </div>
  )
}
