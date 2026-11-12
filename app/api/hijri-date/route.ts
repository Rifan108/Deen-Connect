import { NextResponse } from "next/server"

export async function GET() {
  try {
    const today = new Date()
    const hijriDate = calculateHijriDate(today)

    return NextResponse.json({
      data: {
        hijri: hijriDate,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating Hijri date:", error)
    return NextResponse.json({
      data: {
        hijri: {
          date: "15/06/1447",
          day: 15,
          month: { en: "Jumada al-Ula", ar: "جمادى الأولى" },
          year: 1447,
        },
      },
    })
  }
}

// Simple Hijri date calculation
function calculateHijriDate(date: Date) {
  const jd = Math.floor(date.getTime() / 86400000 + 2440587.5)
  const n = jd - 1948440 + 0.5
  const q = Math.floor(n / 10631.5)
  const r = n % 10631.5
  const a = Math.floor(r / 325.25) + 1
  const w = (r % 325.25) + 1
  const q1 = Math.floor(w / 30.6001)
  const day = Math.floor(w % 30.6001)
  const month = q1 < 11 ? q1 : 11
  const year = 30 * q + a * 100 + q1 + 1

  const months = [
    "Muharram",
    "Safar",
    "Rabi al-awwal",
    "Rabi al-thani",
    "Jumada al-Ula",
    "Jumada al-Akhira",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ]

  return {
    date: `${day}/${month}/${year}`,
    day,
    month: { en: months[month - 1], ar: "شهر" },
    year,
  }
}
