/**
 * Hadith Data Service
 * Provides authentic Hadith collections, books, and individual Hadith texts
 * Powered by verified canonical hadith repositories
 */

export interface HadithCollection {
  id: string
  name: string
  arabicName: string
  author: string
  deathYear: string
  totalHadith: number
  totalBooks: number
  description: string
  authenticity: "Sahih" | "Sunan" | "Specialized"
  engEdition: string
  araEdition: string
}

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    arabicName: "صحيح البخاري",
    author: "Imam Muhammad al-Bukhari",
    deathYear: "256 AH",
    totalHadith: 7563,
    totalBooks: 97,
    description: "Considered the most authentic book after the Holy Quran. Compiled with stringent conditions of narrator reliability.",
    authenticity: "Sahih",
    engEdition: "eng-bukhari",
    araEdition: "ara-bukhari1",
  },
  {
    id: "muslim",
    name: "Sahih Muslim",
    arabicName: "صحيح مسلم",
    author: "Imam Muslim ibn al-Hajjaj",
    deathYear: "261 AH",
    totalHadith: 7500,
    totalBooks: 56,
    description: "The second most authentic collection of Hadith, distinguished by strict thematic organization and pristine chains of narration.",
    authenticity: "Sahih",
    engEdition: "eng-muslim",
    araEdition: "ara-muslim1",
  },
  {
    id: "abudawud",
    name: "Sunan Abi Dawud",
    arabicName: "سنن أبي داود",
    author: "Imam Abu Dawud al-Sijistani",
    deathYear: "275 AH",
    totalHadith: 5274,
    totalBooks: 43,
    description: "One of the Kutub al-Sittah, focusing predominantly on legal and jurisprudential (Ahkam) traditions.",
    authenticity: "Sunan",
    engEdition: "eng-abudawud",
    araEdition: "ara-abudawud1",
  },
  {
    id: "tirmidhi",
    name: "Jami' at-Tirmidhi",
    arabicName: "جامع الترمذي",
    author: "Imam Abu 'Isa at-Tirmidhi",
    deathYear: "279 AH",
    totalHadith: 3956,
    totalBooks: 49,
    description: "Distinguished for its early scholarly classification of hadith grades (Hasan, Sahih, Gharib) and legal jurists' opinions.",
    authenticity: "Sunan",
    engEdition: "eng-tirmidhi",
    araEdition: "ara-tirmidhi1",
  },
  {
    id: "nasai",
    name: "Sunan an-Nasa'i",
    arabicName: "سنن النسائي",
    author: "Imam Ahmad an-Nasa'i",
    deathYear: "303 AH",
    totalHadith: 5758,
    totalBooks: 52,
    description: "Renowned for its meticulous scrutiny of subtle defects in chains of transmission (Ilal).",
    authenticity: "Sunan",
    engEdition: "eng-nasai",
    araEdition: "ara-nasai1",
  },
  {
    id: "ibnmajah",
    name: "Sunan Ibn Majah",
    arabicName: "سنن ابن ماجه",
    author: "Imam Ibn Majah al-Qazwini",
    deathYear: "273 AH",
    totalHadith: 4341,
    totalBooks: 37,
    description: "The sixth major canonical Hadith work, known for its concise topical chapters.",
    authenticity: "Sunan",
    engEdition: "eng-ibnmajah",
    araEdition: "ara-ibnmajah1",
  },
  {
    id: "nawawi",
    name: "Forty Hadith of An-Nawawi",
    arabicName: "الأربعون النووية",
    author: "Imam Yahya ibn Sharaf an-Nawawi",
    deathYear: "676 AH",
    totalHadith: 42,
    totalBooks: 1,
    description: "The universally cherished collection encompassing the foundational pillars, spiritual ethics, and character of Islam.",
    authenticity: "Specialized",
    engEdition: "eng-nawawi",
    araEdition: "ara-nawawi",
  },
]

export interface HadithBookMeta {
  bookId: string
  title: string
  firstHadith?: number
  lastHadith?: number
  count?: number
}

// In-memory cache for collection metadata
let infoCache: any = null

export async function fetchCollectionInfo(collectionId: string): Promise<{
  collection: HadithCollection
  books: HadithBookMeta[]
}> {
  const collection =
    HADITH_COLLECTIONS.find((c) => c.id === collectionId) || HADITH_COLLECTIONS[0]

  if (!infoCache) {
    try {
      const res = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/info.json", {
        next: { revalidate: 86400 },
      })
      if (res.ok) {
        infoCache = await res.json()
      }
    } catch (e) {
      console.warn("Failed to fetch info.json", e)
    }
  }

  const collData = infoCache?.[collection.id]
  const sections = collData?.metadata?.sections || {}
  const sectionDetails = collData?.metadata?.section_details || {}

  const books: HadithBookMeta[] = Object.entries(sections)
    .filter(([key, val]) => key !== "0" && Boolean(val))
    .map(([key, val]) => {
      const detail = sectionDetails[key] || {}
      const first = detail.hadithnumber_first
      const last = detail.hadithnumber_last
      const count = first && last ? last - first + 1 : undefined

      return {
        bookId: key,
        title: String(val),
        firstHadith: first,
        lastHadith: last,
        count,
      }
    })

  return { collection, books }
}

export interface HadithItem {
  hadithNumber: number
  arabicNumber?: number
  arabicText?: string
  englishText: string
  bookId?: string
  chapterTitle?: string
  grades?: { name: string; grade: string }[]
}

export async function fetchBookHadiths(
  collectionId: string,
  bookId: string
): Promise<{
  collection: HadithCollection
  bookTitle: string
  hadiths: HadithItem[]
}> {
  const collection =
    HADITH_COLLECTIONS.find((c) => c.id === collectionId) || HADITH_COLLECTIONS[0]

  const engUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.engEdition}/sections/${bookId}.json`
  const araUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.araEdition}/sections/${bookId}.json`

  const [engRes, araRes] = await Promise.all([
    fetch(engUrl, { next: { revalidate: 86400 } }).catch(() => null),
    fetch(araUrl, { next: { revalidate: 86400 } }).catch(() => null),
  ])

  if (!engRes || !engRes.ok) {
    throw new Error(`Failed to retrieve book ${bookId} from ${collection.name}`)
  }

  const engJson = await engRes.json()
  const araJson = araRes && araRes.ok ? await araRes.json().catch(() => null) : null

  const bookTitle = engJson.metadata?.section?.[bookId] || `Book ${bookId}`
  const araHadithsMap = new Map<number, string>()

  if (araJson?.hadiths && Array.isArray(araJson.hadiths)) {
    araJson.hadiths.forEach((h: any) => {
      araHadithsMap.set(h.hadithnumber, h.text)
    })
  }

  const hadiths: HadithItem[] = (engJson.hadiths || []).map((h: any) => {
    return {
      hadithNumber: h.hadithnumber,
      arabicNumber: h.arabicnumber,
      englishText: h.text,
      arabicText: araHadithsMap.get(h.hadithnumber) || "",
      bookId,
      chapterTitle: bookTitle,
      grades: h.grades || [],
    }
  })

  return { collection, bookTitle, hadiths }
}

export async function fetchSingleHadith(
  collectionId: string,
  hadithNumber: number
): Promise<{
  collection: HadithCollection
  hadith: HadithItem
}> {
  const collection =
    HADITH_COLLECTIONS.find((c) => c.id === collectionId) || HADITH_COLLECTIONS[0]

  const engUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.engEdition}/${hadithNumber}.json`
  const araUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.araEdition}/${hadithNumber}.json`

  const [engRes, araRes] = await Promise.all([
    fetch(engUrl, { next: { revalidate: 86400 } }).catch(() => null),
    fetch(araUrl, { next: { revalidate: 86400 } }).catch(() => null),
  ])

  if (!engRes || !engRes.ok) {
    throw new Error(`Hadith #${hadithNumber} not found in ${collection.name}`)
  }

  const engJson = await engRes.json()
  const araJson = araRes && araRes.ok ? await araRes.json().catch(() => null) : null

  const rawH = engJson.hadiths?.[0] || {}
  const rawAraH = araJson?.hadiths?.[0] || {}

  const bookId = Object.keys(engJson.metadata?.section || {})[0] || "1"
  const chapterTitle = engJson.metadata?.section?.[bookId] || ""

  const hadith: HadithItem = {
    hadithNumber: rawH.hadithnumber || hadithNumber,
    arabicNumber: rawH.arabicnumber,
    englishText: rawH.text || "",
    arabicText: rawAraH.text || "",
    bookId,
    chapterTitle,
    grades: rawH.grades || [],
  }

  return { collection, hadith }
}

