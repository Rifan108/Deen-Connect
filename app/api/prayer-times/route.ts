import { NextResponse } from "next/server"
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan"

// In-memory server cache: key = lat_lng_method_school_date
interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Map AlAdhan method IDs to Adhan library calculation parameters
function getCalculationParameters(methodId: string) {
  switch (String(methodId)) {
    case "1": // University of Islamic Sciences, Karachi
      return CalculationMethod.Karachi()
    case "2": // Islamic Society of North America (ISNA)
      return CalculationMethod.NorthAmerica()
    case "4": // Umm Al-Qura University, Makkah
      return CalculationMethod.UmmAlQura()
    case "5": // Egyptian General Authority of Survey
      return CalculationMethod.Egyptian()
    case "7": // Institute of Geophysics, University of Tehran
      return CalculationMethod.Tehran()
    case "8": // Gulf Region
      return CalculationMethod.Dubai()
    case "9": // Kuwait
      return CalculationMethod.Kuwait()
    case "10": // Qatar
      return CalculationMethod.Qatar()
    case "11": // Majlis Ugama Islam Singapura
      return CalculationMethod.Singapore()
    case "15": // Moonsighting Committee Worldwide
      return CalculationMethod.MoonsightingCommittee()
    case "3": // Muslim World League
    default:
      return CalculationMethod.MuslimWorldLeague()
  }
}

function getMethodName(methodId: string): string {
  switch (String(methodId)) {
    case "1": return "University of Islamic Sciences, Karachi"
    case "2": return "Islamic Society of North America (ISNA)"
    case "4": return "Umm Al-Qura University, Makkah"
    case "5": return "Egyptian General Authority of Survey"
    case "7": return "Institute of Geophysics, University of Tehran"
    case "8": return "Gulf Region"
    case "9": return "Kuwait"
    case "10": return "Qatar"
    case "11": return "Majlis Ugama Islam Singapura"
    case "15": return "Moonsighting Committee Worldwide"
    case "3":
    default:
      return "Muslim World League"
  }
}

// Compute verified astronomical prayer times using Batoul Apps engine
function calculateLocalPrayerTimes(
  lat: number,
  lng: number,
  methodId: string,
  schoolId: string,
  date: Date = new Date()
) {
  const coords = new Coordinates(lat, lng)
  const params = getCalculationParameters(methodId)
  params.madhab = String(schoolId) === "1" ? Madhab.Hanafi : Madhab.Shafi

  const pt = new PrayerTimes(coords, date, params)

  const format24 = (d: Date | null) => {
    if (!d || isNaN(d.getTime())) return "--:--"
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  // Calculate midnight & imsak
  const fajrTime = pt.fajr ? pt.fajr.getTime() : date.getTime()
  const maghribTime = pt.maghrib ? pt.maghrib.getTime() : date.getTime()
  const nextFajrTime = fajrTime + 24 * 3600 * 1000
  const midnightDate = new Date(maghribTime + (nextFajrTime - maghribTime) / 2)
  const imsakDate = new Date(fajrTime - 10 * 60 * 1000)

  // Format lunar Hijri date using Intl
  let hijriDay = "02"
  let hijriMonthEn = "Jumada al-akhirah"
  let hijriMonthAr = "جُمَادَى الآخِرَة"
  let hijriYear = "1448"
  let hijriMonthNum = 6

  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(date)

    const dPart = parts.find((p) => p.type === "day")
    const mPart = parts.find((p) => p.type === "month")
    const yPart = parts.find((p) => p.type === "year")

    if (dPart) hijriDay = String(dPart.value).padStart(2, "0")
    if (mPart) {
      hijriMonthNum = parseInt(mPart.value, 10) || 6
      const monthNames = [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
      ]
      hijriMonthEn = monthNames[hijriMonthNum - 1] || "Jumada al-Akhirah"
    }
    if (yPart) hijriYear = yPart.value.replace(/[^0-9]/g, "") || "1448"
  } catch (intlErr) {
    // Keep standard fallback
  }

  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayNamesAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
  const monthNamesGregorian = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const dayIndex = date.getDay()
  const readableDate = `${String(date.getDate()).padStart(2, "0")} ${monthNamesGregorian[date.getMonth()]} ${date.getFullYear()}`

  return {
    timings: {
      Fajr: format24(pt.fajr),
      Sunrise: format24(pt.sunrise),
      Dhuhr: format24(pt.dhuhr),
      Asr: format24(pt.asr),
      Sunset: format24(pt.maghrib),
      Maghrib: format24(pt.maghrib),
      Isha: format24(pt.isha),
      Imsak: format24(imsakDate),
      Midnight: format24(midnightDate),
      Firstthird: format24(new Date(maghribTime + (nextFajrTime - maghribTime) / 3)),
      Lastthird: format24(new Date(maghribTime + ((nextFajrTime - maghribTime) * 2) / 3)),
    },
    date: {
      readable: readableDate,
      timestamp: String(Math.floor(date.getTime() / 1000)),
      gregorian: {
        date: `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`,
        day: String(date.getDate()).padStart(2, "0"),
        weekday: { en: dayNamesEn[dayIndex] },
        month: { number: date.getMonth() + 1, en: monthNamesGregorian[date.getMonth()] },
        year: String(date.getFullYear()),
      },
      hijri: {
        date: `${hijriDay}-${String(hijriMonthNum).padStart(2, "0")}-${hijriYear}`,
        day: hijriDay,
        weekday: { en: dayNamesEn[dayIndex], ar: dayNamesAr[dayIndex] },
        month: { number: hijriMonthNum, en: hijriMonthEn, ar: hijriMonthAr },
        year: hijriYear,
      },
    },
    meta: {
      latitude: lat,
      longitude: lng,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
      method: {
        id: parseInt(methodId, 10) || 3,
        name: getMethodName(methodId),
      },
      school: {
        id: parseInt(schoolId, 10) || 0,
        name: schoolId === "1" ? "Hanafi" : "Shafi",
      },
    },
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const latParam = searchParams.get("lat")
    const lngParam = searchParams.get("lng")
    const methodParam = searchParams.get("method") || "3" // Default: 3 (Muslim World League)
    const schoolParam = searchParams.get("school") || "0" // Default: 0 (Shafi / Standard)
    const dateParam = searchParams.get("date")

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: "Latitude and Longitude parameters are required" },
        { status: 400 }
      )
    }

    const lat = parseFloat(latParam)
    const lng = parseFloat(lngParam)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid geographic coordinates provided" },
        { status: 400 }
      )
    }

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const queryDate = dateParam || todayStr

    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${methodParam}_${schoolParam}_${queryDate}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
      })
    }

    let payloadData: any = null
    let source = "Astronomical Calculation Engine (Batoul Apps)"

    // Try AlAdhan API with a strict 2.5s timeout; if it fails or returns 502/503, fallback to local engine
    try {
      const timestamp = Math.floor(today.getTime() / 1000)
      const alAdhanUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${methodParam}&school=${schoolParam}`

      const apiRes = await fetch(alAdhanUrl, {
        signal: AbortSignal.timeout(2500),
        headers: {
          "Accept": "application/json",
          "User-Agent": "DeenConnect/1.0 (Islamic Digital Sanctuary)",
        },
      })

      if (apiRes.ok) {
        const json = await apiRes.json()
        if (json.code === 200 && json.data?.timings) {
          payloadData = json.data
          source = "AlAdhan Official Astronomical Calculations API"
        }
      }
    } catch (apiErr) {
      // AlAdhan is down or timed out - seamlessly proceed to local calculation
    }

    // If AlAdhan is down (502, 503, timeout), use local astronomical engine
    if (!payloadData) {
      payloadData = calculateLocalPrayerTimes(lat, lng, methodParam, schoolParam, today)
      source = "Local Astronomical Solar Engine (Zero Downtime Fallback)"
    }

    const payload = {
      code: 200,
      status: "OK",
      source,
      disclaimer: "Calculated astronomical prayer times. Local mosque congregation (Iqamah) times may differ.",
      data: payloadData,
    }

    // Cache the result
    cache.set(cacheKey, { data: payload, timestamp: Date.now() })

    if (cache.size > 200) {
      const now = Date.now()
      for (const [k, v] of cache.entries()) {
        if (now - v.timestamp > CACHE_TTL_MS) {
          cache.delete(k)
        }
      }
    }

    return NextResponse.json(payload, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    })
  } catch (error: any) {
    // Ultimate safety fallback: calculate locally even if unexpected error happens
    const lat = parseFloat(new URL(request.url).searchParams.get("lat") || "12.2958")
    const lng = parseFloat(new URL(request.url).searchParams.get("lng") || "76.6394")
    const fallbackData = calculateLocalPrayerTimes(lat, lng, "3", "0", new Date())

    return NextResponse.json({
      code: 200,
      status: "OK",
      source: "Fail-safe Local Astronomical Solar Engine",
      data: fallbackData,
    })
  }
}
