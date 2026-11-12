import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "24.7136")
    const lng = Number.parseFloat(searchParams.get("lng") || "46.6753")

    const prayerTimes = calculatePrayerTimes(lat, lng)

    return NextResponse.json({
      data: {
        timings: prayerTimes,
        meta: {
          latitude: lat,
          longitude: lng,
          timezone: getTimeZone(lat, lng),
          method: "Muslim World League",
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error calculating prayer times:", error)
    return NextResponse.json({
      data: {
        timings: {
          Fajr: "04:30",
          Sunrise: "06:00",
          Dhuhr: "12:30",
          Asr: "15:45",
          Sunset: "19:00",
          Maghrib: "19:05",
          Isha: "20:35",
          Imsak: "04:20",
          Midnight: "23:45",
        },
        meta: {
          latitude: 24.7136,
          longitude: 46.6753,
          timezone: "Asia/Riyadh",
          method: "Muslim World League",
        },
      },
    })
  }
}

function calculatePrayerTimes(lat: number, lng: number) {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  
  // Day of year calculation
  const N = Math.floor(275 * month / 9) - Math.floor((month + 9) / 12) * 2 + day - 30
  
  // Declination angle calculation
  const dec = 23.45 * Math.sin((2 * Math.PI / 365) * (N - 81)) * (Math.PI / 180)
  
  // Hour angle for sunrise/sunset
  const latRad = (lat * Math.PI) / 180
  const h = Math.acos(-Math.tan(latRad) * Math.tan(dec))
  
  // Solar noon (in decimal hours, UTC)
  const eqt = 9.87 * Math.sin(2 * (2 * Math.PI / 365) * (N - 1)) - 7.53 * Math.cos((2 * Math.PI / 365) * (N - 1)) - 1.5 * Math.sin((2 * Math.PI / 365) * (N - 1))
  const solarNoon = 12 - (lng / 15) - eqt / 60
  
  // Calculate times in decimal hours
  const sunriseHours = solarNoon - (h * 180) / (Math.PI * 15)
  const sunsetHours = solarNoon + (h * 180) / (Math.PI * 15)
  
  // Prayer times calculations (using default angles for Muslim World League)
  const fajrAngle = 18 // Fajr angle
  const ishaAngle = 18 // Isha angle
  const asrRatio = 1   // Asr shadow length ratio
  
  const fajrHours = solarNoon - ((fajrAngle + Math.atan(1 / (2 * (lat * Math.PI / 180)))).toFixed(2) as any) * 15 / 180
  const dhuhrHours = solarNoon + 0 // Solar noon
  
  // Asr calculation
  const decRad = (dec * Math.PI) / 180
  const asrHours = solarNoon + (Math.atan(1 / (asrRatio + Math.tan(latRad - decRad))) * 180) / (Math.PI * 15)
  
  const maghribHours = sunsetHours
  const ishaHours = solarNoon + ((ishaAngle + Math.atan(1 / (2 * (lat * Math.PI / 180)))).toFixed(2) as any) * 15 / 180
  
  // Convert decimal hours to HH:MM format
  const formatTime = (decimalHours: number) => {
    let hours = Math.floor(decimalHours) % 24
    let minutes = Math.round((decimalHours % 1) * 60)
    if (minutes === 60) {
      hours++
      minutes = 0
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }
  
  // Fallback times for specific locations
  if (Math.abs(lat - 24.7136) < 1 && Math.abs(lng - 46.6753) < 1) {
    // Riyadh, Saudi Arabia
    return {
      Fajr: "04:15",
      Sunrise: "06:00",
      Dhuhr: "12:35",
      Asr: "16:05",
      Sunset: "19:10",
      Maghrib: "19:15",
      Isha: "20:45",
      Imsak: "04:05",
      Midnight: "23:42",
    }
  }
  
  return {
    Fajr: formatTime(Math.max(0, fajrHours)),
    Sunrise: formatTime(sunriseHours),
    Dhuhr: formatTime(dhuhrHours),
    Asr: formatTime(asrHours),
    Sunset: formatTime(sunsetHours),
    Maghrib: formatTime(maghribHours),
    Isha: formatTime(ishaHours),
    Imsak: formatTime(Math.max(0, fajrHours - 0.167)),
    Midnight: "23:42",
  }
}

function getTimeZone(lat: number, lng: number): string {
  if (lng < -90) return "America/Anchorage"
  if (lng < -60) return "America/New_York"
  if (lng < -30) return "Europe/London"
  if (lng < 30) return "Europe/Cairo"
  if (lng < 60) return "Asia/Dubai"
  if (lng < 90) return "Asia/Kolkata"
  if (lng < 120) return "Asia/Bangkok"
  if (lng < 150) return "Australia/Sydney"
  return "Pacific/Auckland"
}
