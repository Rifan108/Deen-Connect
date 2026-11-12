"use client"

import { useRef } from "react"

import { useState } from "react"
import { Play, Pause, ChevronLeft, ChevronRight, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Complete Quran data with all 114 Surahs
const QURAN_DATA = [
  { num: 1, name: "Al-Fatihah", ar: "الفاتحة", verses: 7 },
  { num: 2, name: "Al-Baqarah", ar: "البقرة", verses: 286 },
  { num: 3, name: "Ali Imran", ar: "آل عمران", verses: 200 },
  { num: 4, name: "An-Nisa", ar: "النساء", verses: 176 },
  { num: 5, name: "Al-Ma'idah", ar: "المائدة", verses: 120 },
  { num: 6, name: "Al-An'am", ar: "الأنعام", verses: 165 },
  { num: 7, name: "Al-A'raf", ar: "الأعراف", verses: 206 },
  { num: 8, name: "Al-Anfal", ar: "الأنفال", verses: 75 },
  { num: 9, name: "At-Tawbah", ar: "التوبة", verses: 129 },
  { num: 10, name: "Yunus", ar: "يونس", verses: 109 },
  { num: 11, name: "Hud", ar: "هود", verses: 123 },
  { num: 12, name: "Yusuf", ar: "يوسف", verses: 111 },
  { num: 13, name: "Ar-Ra'd", ar: "الرعد", verses: 43 },
  { num: 14, name: "Ibrahim", ar: "إبراهيم", verses: 52 },
  { num: 15, name: "Al-Hijr", ar: "الحجر", verses: 99 },
  { num: 16, name: "An-Nahl", ar: "النحل", verses: 128 },
  { num: 17, name: "Al-Isra", ar: "الإسراء", verses: 111 },
  { num: 18, name: "Al-Kahf", ar: "الكهف", verses: 110 },
  { num: 19, name: "Maryam", ar: "مريم", verses: 98 },
  { num: 20, name: "Ta-Ha", ar: "طه", verses: 135 },
  { num: 21, name: "Al-Anbya", ar: "الأنبياء", verses: 112 },
  { num: 22, name: "Al-Hajj", ar: "الحج", verses: 78 },
  { num: 23, name: "Al-Mu'minun", ar: "المؤمنون", verses: 118 },
  { num: 24, name: "An-Nur", ar: "النور", verses: 64 },
  { num: 25, name: "Al-Furqan", ar: "الفرقان", verses: 77 },
  { num: 26, name: "Ash-Shu'ara", ar: "الشعراء", verses: 227 },
  { num: 27, name: "An-Naml", ar: "النمل", verses: 93 },
  { num: 28, name: "Al-Qasas", ar: "القصص", verses: 88 },
  { num: 29, name: "Al-Ankabut", ar: "العنكبوت", verses: 69 },
  { num: 30, name: "Ar-Rum", ar: "الروم", verses: 60 },
  { num: 31, name: "Luqman", ar: "لقمان", verses: 34 },
  { num: 32, name: "As-Sajdah", ar: "السجدة", verses: 30 },
  { num: 33, name: "Al-Ahzab", ar: "الأحزاب", verses: 73 },
  { num: 34, name: "Saba", ar: "سبأ", verses: 54 },
  { num: 35, name: "Fatir", ar: "فاطر", verses: 45 },
  { num: 36, name: "Ya-Sin", ar: "يس", verses: 83 },
  { num: 37, name: "As-Saffat", ar: "الصافات", verses: 182 },
  { num: 38, name: "Sad", ar: "ص", verses: 88 },
  { num: 39, name: "Az-Zumar", ar: "الزمر", verses: 75 },
  { num: 40, name: "Ghafir", ar: "غافر", verses: 85 },
  { num: 41, name: "Fussilat", ar: "فصلت", verses: 54 },
  { num: 42, name: "Ash-Shura", ar: "الشورى", verses: 53 },
  { num: 43, name: "Az-Zukhruf", ar: "الزخرف", verses: 89 },
  { num: 44, name: "Ad-Dukhan", ar: "الدخان", verses: 59 },
  { num: 45, name: "Al-Jathiya", ar: "الجاثية", verses: 37 },
  { num: 46, name: "Al-Ahqaf", ar: "الأحقاف", verses: 35 },
  { num: 47, name: "Muhammad", ar: "محمد", verses: 38 },
  { num: 48, name: "Al-Fath", ar: "الفتح", verses: 29 },
  { num: 49, name: "Al-Hujurat", ar: "الحجرات", verses: 18 },
  { num: 50, name: "Qaf", ar: "ق", verses: 45 },
  { num: 51, name: "Ad-Dhariyat", ar: "الذاريات", verses: 60 },
  { num: 52, name: "At-Tur", ar: "الطور", verses: 49 },
  { num: 53, name: "An-Najm", ar: "النجم", verses: 62 },
  { num: 54, name: "Al-Qamar", ar: "القمر", verses: 55 },
  { num: 55, name: "Ar-Rahman", ar: "الرحمن", verses: 78 },
  { num: 56, name: "Al-Waqi'ah", ar: "الواقعة", verses: 96 },
  { num: 57, name: "Al-Hadid", ar: "الحديد", verses: 29 },
  { num: 58, name: "Al-Mujadila", ar: "المجادلة", verses: 22 },
  { num: 59, name: "Al-Hashr", ar: "الحشر", verses: 24 },
  { num: 60, name: "Al-Mumtahina", ar: "الممتحنة", verses: 13 },
  { num: 61, name: "As-Saff", ar: "الصف", verses: 14 },
  { num: 62, name: "Al-Jumu'ah", ar: "الجمعة", verses: 11 },
  { num: 63, name: "Al-Munafiqun", ar: "المنافقون", verses: 11 },
  { num: 64, name: "At-Taghabun", ar: "التغابن", verses: 18 },
  { num: 65, name: "At-Talaq", ar: "الطلاق", verses: 12 },
  { num: 66, name: "At-Tahrim", ar: "التحريم", verses: 12 },
  { num: 67, name: "Al-Mulk", ar: "الملك", verses: 30 },
  { num: 68, name: "Al-Qalam", ar: "القلم", verses: 52 },
  { num: 69, name: "Al-Haqqah", ar: "الحاقة", verses: 52 },
  { num: 70, name: "Al-Ma'arij", ar: "المعارج", verses: 44 },
  { num: 71, name: "Nuh", ar: "نوح", verses: 28 },
  { num: 72, name: "Al-Jinn", ar: "الجن", verses: 28 },
  { num: 73, name: "Al-Muzzammil", ar: "المزمل", verses: 20 },
  { num: 74, name: "Al-Muddaththir", ar: "المدثر", verses: 56 },
  { num: 75, name: "Al-Qiyamah", ar: "القيامة", verses: 40 },
  { num: 76, name: "Al-Insan", ar: "الإنسان", verses: 31 },
  { num: 77, name: "Al-Mursalat", ar: "المرسلات", verses: 50 },
  { num: 78, name: "An-Naba", ar: "النبأ", verses: 40 },
  { num: 79, name: "An-Nazi'at", ar: "الناعات", verses: 46 },
  { num: 80, name: "'Abasa", ar: "عبس", verses: 42 },
  { num: 81, name: "At-Takwir", ar: "التكوير", verses: 29 },
  { num: 82, name: "Al-Infitar", ar: "الإنفطار", verses: 19 },
  { num: 83, name: "Al-Mutaffifin", ar: "المطففين", verses: 36 },
  { num: 84, name: "Al-Inshiqaq", ar: "الإنشقاق", verses: 25 },
  { num: 85, name: "Al-Buruj", ar: "البروج", verses: 22 },
  { num: 86, name: "At-Tariq", ar: "الطارق", verses: 17 },
  { num: 87, name: "Al-A'la", ar: "الأعلى", verses: 19 },
  { num: 88, name: "Al-Ghashiyah", ar: "الغاشية", verses: 26 },
  { num: 89, name: "Al-Fajr", ar: "الفجر", verses: 30 },
  { num: 90, name: "Al-Balad", ar: "البلد", verses: 20 },
  { num: 91, name: "Ash-Shams", ar: "الشمس", verses: 15 },
  { num: 92, name: "Al-Lail", ar: "الليل", verses: 21 },
  { num: 93, name: "Ad-Dhuha", ar: "الضحى", verses: 11 },
  { num: 94, name: "Al-Inshirah", ar: "الشرح", verses: 8 },
  { num: 95, name: "At-Tin", ar: "التين", verses: 8 },
  { num: 96, name: "Al-'Alaq", ar: "العلق", verses: 19 },
  { num: 97, name: "Al-Qadr", ar: "القدر", verses: 5 },
  { num: 98, name: "Al-Bayyinah", ar: "البينة", verses: 8 },
  { num: 99, name: "Az-Zilzal", ar: "الزلزلة", verses: 8 },
  { num: 100, name: "Al-Adiyat", ar: "العاديات", verses: 11 },
  { num: 101, name: "Al-Qari'ah", ar: "القارعة", verses: 11 },
  { num: 102, name: "At-Takathur", ar: "التكاثر", verses: 8 },
  { num: 103, name: "Al-Asr", ar: "العصر", verses: 3 },
  { num: 104, name: "Al-Humazah", ar: "الهمزة", verses: 9 },
  { num: 105, name: "Al-Fil", ar: "الفيل", verses: 5 },
  { num: 106, name: "Quraysh", ar: "قريش", verses: 4 },
  { num: 107, name: "Al-Ma'un", ar: "الماعون", verses: 7 },
  { num: 108, name: "Al-Kawthar", ar: "الكوثر", verses: 3 },
  { num: 109, name: "Al-Kafirun", ar: "الكافرون", verses: 6 },
  { num: 110, name: "An-Nasr", ar: "النصر", verses: 3 },
  { num: 111, name: "Al-Masad", ar: "المسد", verses: 5 },
  { num: 112, name: "Al-Ikhlas", ar: "الإخلاص", verses: 4 },
  { num: 113, name: "Al-Falaq", ar: "الفلق", verses: 5 },
  { num: 114, name: "An-Nas", ar: "الناس", verses: 6 },
]

export default function CompleteQuranReader() {
  const [currentSurah, setCurrentSurah] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedReciter, setSelectedReciter] = useState("abdulsamad")
  const audioRef = useRef<HTMLAudioElement>(null)

  const RECITERS = {
    abdulsamad: {
      name: "Abdul Basit Abdul Samad",
      baseUrl: "https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/",
    },
    sudais: {
      name: "Abdul Rahman Al-Sudais",
      baseUrl: "https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/",
    },
    afasy: {
      name: "Mishary Rashid Al-Afasy",
      baseUrl: "https://cdn.islamic.network/quran/audio-surah/128/ar.minshawi/",
    },
  }

  const getAudioUrl = (surahNum: number) => {
    const baseUrl = RECITERS[selectedReciter as keyof typeof RECITERS].baseUrl
    return `${baseUrl}${surahNum}.mp3`
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      const audioUrl = getAudioUrl(QURAN_DATA[currentSurah].num)
      audioRef.current.src = audioUrl
      audioRef.current.play().catch((err) => {
        console.log("[v0] Audio playback error:", err)
        setIsPlaying(false)
      })
    }
  }

  const handlePrevious = () => {
    if (currentSurah > 0) {
      setCurrentSurah(currentSurah - 1)
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    if (currentSurah < QURAN_DATA.length - 1) {
      setCurrentSurah(currentSurah + 1)
      setIsPlaying(false)
    }
  }

  const surah = QURAN_DATA[currentSurah]

  return (
    <Card className="card-premium p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-accent" />
          <div>
            <h2 className="text-2xl font-bold text-primary">Complete Quran - All 114 Surahs</h2>
            <p className="text-sm text-muted-foreground">Read and listen to the Holy Quran</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-lg">
          <span className="text-sm font-semibold text-primary">Surah {currentSurah + 1}/114</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-foreground">Reciter:</label>
        <select
          value={selectedReciter}
          onChange={(e) => setSelectedReciter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-card border border-primary/30 text-foreground text-sm"
        >
          <option value="abdulsamad">Abdul Basit Abdul Samad</option>
          <option value="sudais">Abdul Rahman Al-Sudais</option>
          <option value="afasy">Mishary Rashid Al-Afasy</option>
        </select>
      </div>

      {/* Audio Player */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="button-premium bg-gradient-to-r from-primary to-accent text-white p-4 rounded-full hover:shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <div className="flex-1">
            <p className="font-semibold text-primary">
              {surah.name} ({surah.ar})
            </p>
            <p className="text-xs text-muted-foreground">{RECITERS[selectedReciter as keyof typeof RECITERS].name}</p>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={getAudioUrl(surah.num)}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          crossOrigin="anonymous"
          onError={(e) => {
            console.log(`[v0] Audio error for Surah ${surah.num}:`, getAudioUrl(surah.num))
            setIsPlaying(false)
          }}
        />

        <div className="flex justify-between items-center gap-4">
          <Button onClick={handlePrevious} disabled={currentSurah === 0} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">{surah.num} of 114</span>
          <Button onClick={handleNext} disabled={currentSurah === QURAN_DATA.length - 1} variant="outline" size="sm">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Surah Grid */}
      <div className="bg-background/50 rounded-lg p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Navigation - Select Surah:</p>
        <div className="grid grid-cols-7 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto">
          {QURAN_DATA.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSurah(idx)
                setIsPlaying(false)
              }}
              className={`p-2 rounded text-xs font-semibold transition-all ${
                currentSurah === idx
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-card hover:bg-primary/10 text-foreground border border-primary/20"
              }`}
              title={s.name}
            >
              {s.num}
            </button>
          ))}
        </div>
      </div>

      {/* Surah Info */}
      <div className="bg-card border border-primary/20 rounded-lg p-4">
        <h3 className="font-semibold text-primary mb-2">{surah.name}</h3>
        <p className="text-sm text-muted-foreground">
          <strong>Arabic:</strong> {surah.ar} | <strong>Verses:</strong> {surah.verses}
        </p>
      </div>
    </Card>
  )
}
