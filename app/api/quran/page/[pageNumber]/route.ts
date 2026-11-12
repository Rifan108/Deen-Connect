import { NextRequest, NextResponse } from "next/server"
import { ALL_SURAHS } from "@/lib/quran-data"

export const dynamic = "force-dynamic"

export interface PageVerse {
  id: number
  verseKey: string
  surahNumber: number
  surahName: string
  surahArabicName: string
  verseNumber: number
  textUthmani: string
  translation: string
  audioUrl: string
  juzNumber: number
  pageNumber: number
  isFirstAyahOfSurah: boolean
}

export interface QuranPageResponse {
  success: boolean
  pageNumber: number
  juzNumber: number
  surahs: Array<{
    number: number
    name: string
    arabicName: string
    revelationType: string
    versesCount: number
  }>
  verses: PageVerse[]
  totalVerses: number
  error?: string
}

// In-memory cache for all 604 pages
const pageCache = new Map<number, QuranPageResponse>()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageNumber: string }> }
) {
  try {
    const resolvedParams = await params
    const pageNum = parseInt(resolvedParams.pageNumber, 10)

    if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
      return NextResponse.json<QuranPageResponse>(
        {
          success: false,
          pageNumber: pageNum || 1,
          juzNumber: 1,
          surahs: [],
          verses: [],
          totalVerses: 0,
          error: "Invalid page number. Mushaf pages range from 1 to 604.",
        },
        { status: 400 }
      )
    }

    // Check memory cache
    const cached = pageCache.get(pageNum)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch page verses and recitation audio from official Quran Foundation API
    const [versesRes, audioRes] = await Promise.all([
      fetch(
        `https://api.quran.com/api/v4/verses/by_page/${pageNum}?words=false&translations=20&fields=text_uthmani,chapter_id,verse_number,verse_key,juz_number,page_number`,
        {
          signal: AbortSignal.timeout(8000),
          headers: { "Accept": "application/json" },
        }
      ),
      fetch(`https://api.quran.com/api/v4/recitations/7/by_page/${pageNum}`, {
        signal: AbortSignal.timeout(8000),
        headers: { "Accept": "application/json" },
      }).catch(() => null),
    ])

    if (!versesRes.ok) {
      throw new Error(`Quran API failed with HTTP ${versesRes.status}`)
    }

    const versesJson = await versesRes.json()
    const rawVerses = versesJson.verses || []

    const audioMap = new Map<string, string>()
    if (audioRes && audioRes.ok) {
      try {
        const audioJson = await audioRes.json()
        for (const a of audioJson.audio_files || []) {
          audioMap.set(a.verse_key, `https://verses.quran.com/${a.url}`)
        }
      } catch (err) {
        console.warn("Failed to parse page audio response:", err)
      }
    }

    // Map Surahs on this page
    const surahIdSet = new Set<number>()
    const mappedVerses: PageVerse[] = rawVerses.map((v: any) => {
      const sNum = v.chapter_id
      surahIdSet.add(sNum)
      const sMeta = ALL_SURAHS.find((s) => s.number === sNum) || {
        number: sNum,
        name: `Surah ${sNum}`,
        arabicName: "",
        englishName: "",
        versesCount: 0,
        revelationType: "Meccan",
      }

      const defaultAudio = `https://verses.quran.com/Alafasy/mp3/${String(sNum).padStart(3, "0")}${String(v.verse_number).padStart(3, "0")}.mp3`

      const translationRaw = v.translations?.[0]?.text || ""
      const cleanTranslation = translationRaw.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim()

      return {
        id: v.id,
        verseKey: v.verse_key,
        surahNumber: sNum,
        surahName: sMeta.name,
        surahArabicName: sMeta.arabicName,
        verseNumber: v.verse_number,
        textUthmani: v.text_uthmani,
        translation: cleanTranslation,
        audioUrl: audioMap.get(v.verse_key) || defaultAudio,
        juzNumber: v.juz_number,
        pageNumber: v.page_number,
        isFirstAyahOfSurah: v.verse_number === 1,
      }
    })

    const surahsOnPage = Array.from(surahIdSet).map((sNum) => {
      const sMeta = ALL_SURAHS.find((s) => s.number === sNum)!
      return {
        number: sNum,
        name: sMeta?.name || `Surah ${sNum}`,
        arabicName: sMeta?.arabicName || "",
        revelationType: sMeta?.revelationType || "Meccan",
        versesCount: sMeta?.versesCount || 0,
      }
    })

    const juzNum = mappedVerses[0]?.juzNumber || 1

    const responsePayload: QuranPageResponse = {
      success: true,
      pageNumber: pageNum,
      juzNumber: juzNum,
      surahs: surahsOnPage,
      verses: mappedVerses,
      totalVerses: mappedVerses.length,
    }

    // Store in cache
    pageCache.set(pageNum, responsePayload)

    return NextResponse.json(responsePayload)
  } catch (error: any) {
    console.error("Error in /api/quran/page:", error)
    return NextResponse.json<QuranPageResponse>(
      {
        success: false,
        pageNumber: 1,
        juzNumber: 1,
        surahs: [],
        verses: [],
        totalVerses: 0,
        error: error.message || "Failed to load Quran page",
      },
      { status: 500 }
    )
  }
}

