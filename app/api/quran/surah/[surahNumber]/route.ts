import { NextRequest, NextResponse } from "next/server"
import { ALL_SURAHS } from "@/lib/quran-data"

export const dynamic = "force-dynamic"

export interface SurahVerseItem {
  number: number
  numberInSurah: number
  verseKey: string
  arabic: string
  translation: string
}

export interface SurahDetailResponse {
  success: boolean
  surahNumber: number
  name: string
  arabicName: string
  englishName: string
  revelationType: string
  versesCount: number
  ayahs: SurahVerseItem[]
  error?: string
}

// In-memory cache for all 114 Surahs (static immutable revelation)
const surahCache = new Map<number, SurahDetailResponse>()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surahNumber: string }> }
) {
  try {
    const resolvedParams = await params
    const sNum = parseInt(resolvedParams.surahNumber, 10)

    if (isNaN(sNum) || sNum < 1 || sNum > 114) {
      return NextResponse.json<SurahDetailResponse>(
        {
          success: false,
          surahNumber: sNum || 1,
          name: "Invalid",
          arabicName: "",
          englishName: "",
          revelationType: "Meccan",
          versesCount: 0,
          ayahs: [],
          error: "Invalid Surah number. Surahs range from 1 to 114.",
        },
        { status: 400 }
      )
    }

    // Check memory cache
    const cached = surahCache.get(sNum)
    if (cached) {
      return NextResponse.json(cached)
    }

    const meta = ALL_SURAHS.find((s) => s.number === sNum) || {
      number: sNum,
      name: `Surah ${sNum}`,
      arabicName: "",
      englishName: "",
      versesCount: 0,
      revelationType: "Meccan",
    }

    let verses: SurahVerseItem[] = []

    // Tier 1: Fetch from official Quran Foundation API (api.quran.com)
    try {
      const qdcRes = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${sNum}?words=false&translations=20&fields=text_uthmani,chapter_id,verse_number,verse_key&per_page=300`,
        {
          signal: AbortSignal.timeout(8000),
          headers: { "Accept": "application/json" },
        }
      )

      if (qdcRes.ok) {
        const qdcJson = await qdcRes.json()
        const rawList = qdcJson.verses || []

        if (Array.isArray(rawList) && rawList.length > 0) {
          verses = rawList.map((v: any) => {
            const translationRaw = v.translations?.[0]?.text || ""
            const cleanTranslation = translationRaw
              .replace(/<sup[^>]*>.*?<\/sup>/g, "")
              .replace(/<[^>]+>/g, "")
              .trim()

            return {
              number: v.id || v.verse_number,
              numberInSurah: v.verse_number,
              verseKey: v.verse_key || `${sNum}:${v.verse_number}`,
              arabic: v.text_uthmani || "",
              translation: cleanTranslation,
            }
          })
        }
      }
    } catch (tier1Err) {
      console.warn(`Quran.com API fetch failed for Surah ${sNum}, trying alquran.cloud fallback:`, tier1Err)
    }

    // Tier 2: Failover to AlQuran Cloud API
    if (verses.length === 0) {
      try {
        const cloudRes = await fetch(
          `https://api.alquran.cloud/v1/surah/${sNum}/editions/quran-uthmani,en.sahih`,
          {
            signal: AbortSignal.timeout(8000),
            headers: { "Accept": "application/json" },
          }
        )

        if (cloudRes.ok) {
          const cloudJson = await cloudRes.json()
          if (cloudJson.data && Array.isArray(cloudJson.data) && cloudJson.data.length >= 2) {
            const uthmaniEdition =
              cloudJson.data.find((e: any) => e.edition?.identifier === "quran-uthmani")?.ayahs ||
              cloudJson.data[0]?.ayahs ||
              []
            const englishEdition =
              cloudJson.data.find((e: any) => e.edition?.identifier === "en.sahih")?.ayahs ||
              cloudJson.data[1]?.ayahs ||
              []

            verses = uthmaniEdition.map((item: any, idx: number) => {
              const engText = englishEdition[idx]?.text || ""
              const cleanEng = engText.replace(/<[^>]+>/g, "").trim()
              return {
                number: item.number,
                numberInSurah: item.numberInSurah,
                verseKey: `${sNum}:${item.numberInSurah}`,
                arabic: item.text,
                translation: cleanEng,
              }
            })
          }
        }
      } catch (tier2Err) {
        console.warn(`AlQuran Cloud API fetch also failed for Surah ${sNum}:`, tier2Err)
      }
    }

    if (verses.length === 0) {
      throw new Error(`Failed to retrieve authentic text for Surah ${sNum}`)
    }

    const payload: SurahDetailResponse = {
      success: true,
      surahNumber: sNum,
      name: meta.name,
      arabicName: meta.arabicName,
      englishName: meta.englishName,
      revelationType: meta.revelationType,
      versesCount: verses.length,
      ayahs: verses,
    }

    // Cache the verified response
    surahCache.set(sNum, payload)

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error("Error in /api/quran/surah:", err)
    return NextResponse.json<SurahDetailResponse>(
      {
        success: false,
        surahNumber: 1,
        name: "",
        arabicName: "",
        englishName: "",
        revelationType: "Meccan",
        versesCount: 0,
        ayahs: [],
        error: err.message || "Failed to load Surah",
      },
      { status: 500 }
    )
  }
}
