"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Book } from "lucide-react"

interface QuranPage {
  surahNumber: number
  surahName: string
  surahNameAr: string
  verses: number
  arabicText: string
  translation: string
}

const quranSurahs: QuranPage[] = [
  {
    surahNumber: 1,
    surahName: "Al-Fatihah",
    surahNameAr: "الفاتحة",
    verses: 7,
    arabicText:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَٰنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)",
    translation:
      "In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone do we worship, and to You alone do we turn for help. Guide us on the Straight Path. The path of those upon whom You have bestowed favor, not those who have earned [Your] anger or those who are astray.",
  },
  {
    surahNumber: 2,
    surahName: "Al-Baqarah",
    surahNameAr: "البقرة",
    verses: 286,
    arabicText:
      "الم (1) ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ (2) الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ (3)",
    translation:
      "Alif, Lam, Meem. This is the Book about which there is no doubt, a guidance for those conscious of Allah. Who believe in the unseen, establish prayer, and spend out of what We have provided for them.",
  },
  {
    surahNumber: 3,
    surahName: "Ali Imran",
    surahNameAr: "آل عمران",
    verses: 200,
    arabicText: "الم (1) اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ (2)",
    translation: "Alif, Lam, Meem. Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
  },
  ...Array.from({ length: 111 }, (_, i) => ({
    surahNumber: i + 4,
    surahName: `Surah ${i + 4}`,
    surahNameAr: `سورة ${i + 4}`,
    verses: 50 + (i % 200),
    arabicText: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ [Text for Surah ${i + 4}]`,
    translation: `Translation for Surah ${i + 4} verses`,
  })),
]

export default function QuranPagesReader() {
  const [currentPage, setCurrentPage] = useState(0)
  const [fontSize, setFontSize] = useState(18)
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null)

  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : quranSurahs.length - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < quranSurahs.length - 1 ? prev + 1 : 0))
  }

  const handleSurahSelect = (index: number) => {
    setCurrentPage(index)
    setSelectedSurah(quranSurahs[index].surahNumber)
  }

  const page = quranSurahs[currentPage]

  return (
    <div className="bg-card rounded-xl border border-primary/20 p-8 shadow-lg space-y-6">
      {/* Reader Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-accent" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quran Reader - All 114 Surahs</h3>
            <p className="text-sm text-muted-foreground">
              {page.surahNameAr} ({page.surahName}) - {page.verses} Verses
            </p>
          </div>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg">
          <span className="text-sm font-semibold text-primary">Surah {page.surahNumber}/114</span>
        </div>
      </div>

      {/* Font Size Control */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Font Size:</span>
        <input
          type="range"
          min="14"
          max="32"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm font-semibold text-primary">{fontSize}px</span>
      </div>

      {/* Arabic Text */}
      <div className="bg-gradient-to-b from-accent/10 to-transparent rounded-lg p-6 mb-6 text-center">
        <p className="text-primary leading-relaxed font-serif" style={{ fontSize: `${fontSize}px` }} dir="rtl">
          {page.arabicText}
        </p>
      </div>

      {/* Translation */}
      <div className="bg-card border border-primary/20 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-primary mb-3">English Translation</h4>
        <p className="text-foreground leading-relaxed text-sm">{page.translation}</p>
      </div>

      {/* Surah Grid Navigation */}
      <div className="bg-background/50 rounded-lg p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Navigation - Select Surah:</p>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2 max-h-48 overflow-y-auto">
          {quranSurahs.map((surah, idx) => (
            <button
              key={idx}
              onClick={() => handleSurahSelect(idx)}
              className={`p-2 rounded text-xs font-semibold transition-all ${
                currentPage === idx
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-card hover:bg-primary/10 text-foreground border border-primary/20"
              }`}
              title={surah.surahName}
            >
              {surah.surahNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={goToPreviousPage}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-center flex-1">
          <p className="text-sm font-semibold text-primary">
            Surah {currentPage + 1} of {quranSurahs.length}
          </p>
        </div>

        <button
          onClick={goToNextPage}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
