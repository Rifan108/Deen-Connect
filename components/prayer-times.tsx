"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface PrayerTime {
  name: string
  time: string
  icon: string
}

export default function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([
    { name: "Fajr", time: "05:30 AM", icon: "🌙" },
    { name: "Dhuhr", time: "12:45 PM", icon: "☀️" },
    { name: "Asr", time: "03:30 PM", icon: "🌤️" },
    { name: "Maghrib", time: "06:15 PM", icon: "🌅" },
    { name: "Isha", time: "07:45 PM", icon: "🌙" },
  ])

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {prayerTimes.map((prayer) => (
        <Card key={prayer.name} className="p-4 bg-card hover:bg-card/80 transition-colors border-border">
          <div className="text-center">
            <div className="text-3xl mb-2">{prayer.icon}</div>
            <h3 className="font-serif font-bold text-primary text-lg">{prayer.name}</h3>
            <p className="text-sm text-accent font-semibold mt-2">{prayer.time}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
