"use client"

import React, { useState, useEffect } from "react"
import { Calendar, Moon, Sparkles, Star } from "lucide-react"
import { Card } from "@/components/ui/card"

interface IslamicEvent {
  name: string
  gregorianDate: string
  hijriDate: string
  description: string
  type: "important" | "observance" | "month"
}

export default function IslamicEventsCalendar() {
  const [events, setEvents] = useState<IslamicEvent[]>([])
  const [currentHijri, setCurrentHijri] = useState("")

  const convertGregorianToHijri = (date: Date) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      const parts = formatter.formatToParts(date)
      let day = 1
      let monthName = ""
      let year = 1447

      const monthMapping: Record<string, string> = {
        "Muharram": "Muharram",
        "Safar": "Safar",
        "Rabiʻ I": "Rabi' al-awwal",
        "Rabiʻ II": "Rabi' al-thani",
        "Jumada I": "Jumada al-awwal",
        "Jumada II": "Jumada al-thani",
        "Rajab": "Rajab",
        "Shaʻban": "Sha'ban",
        "Ramadan": "Ramadan",
        "Shawwal": "Shawwal",
        "Dhuʻl-Qiʻdah": "Dhu al-Qi'dah",
        "Dhuʻl-Hijjah": "Dhu al-Hijjah",
      }

      parts.forEach((part) => {
        if (part.type === "day") day = parseInt(part.value, 10)
        if (part.type === "month") monthName = monthMapping[part.value] || part.value
        if (part.type === "year") year = parseInt(part.value, 10)
      })

      return { day, monthName, year }
    } catch {
      return { day: 15, monthName: "Sha'ban", year: 1447 }
    }
  }

  useEffect(() => {
    const today = new Date()
    const hijri = convertGregorianToHijri(today)
    setCurrentHijri(`${hijri.day} ${hijri.monthName} ${hijri.year} AH`)

    const displayYear = hijri.year

    const islamicEvents: IslamicEvent[] = [
      {
        name: "Islamic New Year (1st Muharram)",
        gregorianDate: "July 2026",
        hijriDate: `1 Muharram ${displayYear + 1}`,
        description: "The beginning of the Islamic lunar calendar commemorating the Hijrah of Prophet Muhammad (ﷺ).",
        type: "important",
      },
      {
        name: "Day of Ashura",
        gregorianDate: "July 2026",
        hijriDate: `10 Muharram ${displayYear + 1}`,
        description: "Day of fasting commemorating Allah delivering Prophet Musa (Moses) and Bani Israel from Pharaoh.",
        type: "observance",
      },
      {
        name: "Mawlid an-Nabi (The Prophet's Birth)",
        gregorianDate: "September 2026",
        hijriDate: `12 Rabi' al-Awwal ${displayYear + 1}`,
        description: "Commemoration of the birth and legacy of the Prophet Muhammad (ﷺ).",
        type: "observance",
      },
      {
        name: "Isra and Mi'raj (Night Journey & Ascension)",
        gregorianDate: "January 2026",
        hijriDate: `27 Rajab ${displayYear}`,
        description: "The miraculous physical and spiritual journey of the Prophet (ﷺ) to Jerusalem and the Heavens.",
        type: "important",
      },
      {
        name: "Mid-Sha'ban (Laylat al-Bara'at)",
        gregorianDate: "February 2026",
        hijriDate: `15 Sha'ban ${displayYear}`,
        description: "Night of divine mercy and forgiveness preceding the blessed arrival of Ramadan.",
        type: "observance",
      },
      {
        name: "Beginning of Blessed Ramadan",
        gregorianDate: "March 2026",
        hijriDate: `1 Ramadan ${displayYear}`,
        description: "The sacred month of fasting, intense Quranic recitation, night prayers (Taraweeh), and charity.",
        type: "important",
      },
      {
        name: "Laylat al-Qadr (Night of Power)",
        gregorianDate: "March 2026",
        hijriDate: `27 Ramadan ${displayYear}`,
        description: "A night greater in virtue than a thousand months in which the Noble Quran began revelation.",
        type: "important",
      },
      {
        name: "Eid al-Fitr (Celebration of Fast-Breaking)",
        gregorianDate: "April 2026",
        hijriDate: `1 Shawwal ${displayYear}`,
        description: "Joyous day of celebration, Eid congregation prayer, Zakat al-Fitr, and family gatherings.",
        type: "important",
      },
      {
        name: "Day of Arafah (Hajj Apex)",
        gregorianDate: "June 2026",
        hijriDate: `9 Dhul-Hijjah ${displayYear}`,
        description: "The pinnacle of the Hajj pilgrimage where millions stand before Allah in humble prayer.",
        type: "important",
      },
      {
        name: "Eid al-Adha (Feast of Sacrifice)",
        gregorianDate: "June 2026",
        hijriDate: `10 Dhul-Hijjah ${displayYear}`,
        description: "Commemorating Prophet Ibrahim's willing devotion and the sacrificial offering.",
        type: "important",
      },
    ]

    setEvents(islamicEvents)
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Lunar Timeline • Hijri Calendar
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Islamic Events & Sacred Milestones
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Key commemorative dates across the 12 lunar months of the Islamic Hijri calendar.
          </p>
        </div>

        {currentHijri && (
          <div className="px-4 py-2 rounded-2xl bg-card border border-border flex items-center gap-2 text-xs font-mono">
            <Moon className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span className="text-foreground font-semibold">{currentHijri}</span>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event, idx) => (
          <Card
            key={idx}
            className="p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl hover:border-[#C8A96B]/50 transition space-y-2 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
                <h4 className="font-serif font-medium text-base text-foreground">{event.name}</h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#123D32] dark:text-[#C8A96B] px-2.5 py-0.5 rounded-full bg-[#123D32]/10 dark:bg-[#C8A96B]/20">
                  {event.hijriDate}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  approx. {event.gregorianDate}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pl-4.5">
              {event.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
