"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface HijriDate {
  hijri: string
  gregorian: string
  monthName: string
}

export default function HijriCalendar() {
  const [hijriDate, setHijriDate] = useState<HijriDate>({
    hijri: "Loading...",
    gregorian: "",
    monthName: "",
  })

  useEffect(() => {
    fetchHijriDate()
  }, [])

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
      let year = 1448

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

      return {
        day,
        monthName,
        year,
      }
    } catch (e) {
      console.warn("Intl conversion failed, using fallback", e)
      return {
        day: 9,
        monthName: "Muharram",
        year: 1448,
      }
    }
  }

  const fetchHijriDate = async () => {
    try {
      const today = new Date()
      const hijri = convertGregorianToHijri(today)

      const gregorian = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      setHijriDate({
        hijri: `${hijri.day} ${hijri.monthName} ${hijri.year} AH`,
        gregorian: gregorian,
        monthName: hijri.monthName,
      })
    } catch (error) {
      console.error("Error setting Hijri date:", error)
      setHijriDate({
        hijri: "Error loading",
        gregorian: "",
        monthName: "",
      })
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 text-center">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">ISLAMIC DATE</p>
        <h3 className="text-3xl font-serif font-bold text-primary">{hijriDate.hijri}</h3>
      </div>
      <div className="border-t border-border/50 pt-4">
        <p className="text-sm text-muted-foreground mb-1">GREGORIAN DATE</p>
        <p className="text-lg text-foreground">{hijriDate.gregorian}</p>
      </div>
    </Card>
  )
}
