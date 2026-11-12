"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const SURAHS = [
  { number: 1, name: "Al-Fatiha", verses: 7, meaning: "The Opening" },
  { number: 2, name: "Al-Baqarah", verses: 286, meaning: "The Cow" },
  { number: 3, name: "Ali Imran", verses: 200, meaning: "The Family of Imran" },
  { number: 4, name: "An-Nisa", verses: 176, meaning: "The Women" },
  { number: 5, name: "Al-Maidah", verses: 120, meaning: "The Table" },
  { number: 6, name: "Al-Anam", verses: 165, meaning: "The Livestock" },
  { number: 7, name: "Al-Araf", verses: 206, meaning: "The Heights" },
  { number: 8, name: "Al-Anfal", verses: 75, meaning: "The Spoils of War" },
  { number: 9, name: "At-Taubah", verses: 129, meaning: "The Repentance" },
  { number: 10, name: "Yunus", verses: 109, meaning: "Jonah" },
  { number: 11, name: "Hud", verses: 123, meaning: "Hud" },
  { number: 12, name: "Yusuf", verses: 111, meaning: "Joseph" },
  { number: 13, name: "Ar-Ra'd", verses: 43, meaning: "The Thunder" },
  { number: 14, name: "Ibrahim", verses: 52, meaning: "Abraham" },
  { number: 15, name: "Al-Hijr", verses: 99, meaning: "The Rocky Tract" },
  { number: 16, name: "An-Nahl", verses: 128, meaning: "The Bee" },
  { number: 17, name: "Al-Isra", verses: 111, meaning: "The Night Journey" },
  { number: 18, name: "Al-Kahf", verses: 110, meaning: "The Cave" },
  { number: 19, name: "Maryam", verses: 98, meaning: "Mary" },
  { number: 20, name: "Taha", verses: 135, meaning: "Taha" },
  { number: 21, name: "Al-Anbiya", verses: 112, meaning: "The Prophets" },
  { number: 22, name: "Al-Hajj", verses: 78, meaning: "The Pilgrimage" },
  { number: 23, name: "Al-Mu'minun", verses: 118, meaning: "The Believers" },
  { number: 24, name: "An-Nur", verses: 64, meaning: "The Light" },
  { number: 25, name: "Al-Furqan", verses: 77, meaning: "The Criterion" },
  { number: 26, name: "Ash-Shu'ara", verses: 227, meaning: "The Poets" },
  { number: 27, name: "An-Naml", verses: 93, meaning: "The Ant" },
  { number: 28, name: "Al-Qasas", verses: 88, meaning: "The Stories" },
  { number: 29, name: "Al-Ankabut", verses: 69, meaning: "The Spider" },
  { number: 30, name: "Ar-Rum", verses: 60, meaning: "The Romans" },
  { number: 31, name: "Luqman", verses: 34, meaning: "Luqman" },
  { number: 32, name: "As-Sajdah", verses: 30, meaning: "The Prostration" },
  { number: 33, name: "Al-Ahzab", verses: 73, meaning: "The Confederates" },
  { number: 34, name: "Saba", verses: 54, meaning: "Sheba" },
  { number: 35, name: "Fatir", verses: 45, meaning: "The Originator" },
  { number: 36, name: "Ya-Sin", verses: 83, meaning: "Ya-Sin" },
  { number: 37, name: "As-Saffat", verses: 182, meaning: "Those Who Set The Ranks" },
  { number: 38, name: "Sad", verses: 88, meaning: "Sad" },
  { number: 39, name: "Az-Zumar", verses: 75, meaning: "The Groups" },
  { number: 40, name: "Ghafir", verses: 85, meaning: "The Forgiver" },
  { number: 41, name: "Fussilat", verses: 54, meaning: "Clearly Expounded" },
  { number: 42, name: "Ash-Shura", verses: 53, meaning: "The Consultation" },
  { number: 43, name: "Az-Zukhruf", verses: 89, meaning: "The Ornaments Of Gold" },
  { number: 44, name: "Ad-Dukhan", verses: 59, meaning: "The Smoke" },
  { number: 45, name: "Al-Jathiyah", verses: 37, meaning: "The Crouching" },
  { number: 46, name: "Al-Ahqaf", verses: 35, meaning: "The Dunes" },
  { number: 47, name: "Muhammad", verses: 38, meaning: "Muhammad" },
  { number: 48, name: "Al-Fath", verses: 29, meaning: "The Victory" },
  { number: 49, name: "Al-Hujurat", verses: 18, meaning: "The Rooms" },
  { number: 50, name: "Qaf", verses: 45, meaning: "Qaf" },
  { number: 51, name: "Adh-Dhariyat", verses: 60, meaning: "The Scattering Winds" },
  { number: 52, name: "At-Tur", verses: 49, meaning: "The Mount" },
  { number: 53, name: "An-Najm", verses: 62, meaning: "The Star" },
  { number: 54, name: "Al-Qamar", verses: 55, meaning: "The Moon" },
  { number: 55, name: "Ar-Rahman", verses: 78, meaning: "The Beneficent" },
  { number: 56, name: "Al-Waqi'ah", verses: 96, meaning: "The Inevitable Reality" },
  { number: 57, name: "Al-Hadid", verses: 29, meaning: "The Iron" },
  { number: 58, name: "Al-Mujadilah", verses: 22, meaning: "The Disputer" },
  { number: 59, name: "Al-Hashr", verses: 24, meaning: "The Exile" },
  { number: 60, name: "Al-Mumtahanah", verses: 13, meaning: "The Woman to be Examined" },
  { number: 61, name: "As-Saff", verses: 14, meaning: "The Ranks" },
  { number: 62, name: "Al-Jumu'ah", verses: 11, meaning: "The Congregation" },
  { number: 63, name: "Al-Munafiqun", verses: 11, meaning: "The Hypocrites" },
  { number: 64, name: "At-Taghabun", verses: 18, meaning: "The Mutual Deception" },
  { number: 65, name: "At-Talaq", verses: 12, meaning: "The Divorce" },
  { number: 66, name: "At-Tahrim", verses: 12, meaning: "The Prohibition" },
  { number: 67, name: "Al-Mulk", verses: 30, meaning: "The Kingdom" },
  { number: 68, name: "Al-Qalam", verses: 52, meaning: "The Pen" },
  { number: 69, name: "Al-Haqqah", verses: 52, meaning: "The Reality" },
  { number: 70, name: "Al-Ma'arij", verses: 44, meaning: "The Ways Of Ascent" },
  { number: 71, name: "Nuh", verses: 28, meaning: "Noah" },
  { number: 72, name: "Al-Jinn", verses: 28, meaning: "The Jinns" },
  { number: 73, name: "Al-Muzzammil", verses: 20, meaning: "The Enshrouded One" },
  { number: 74, name: "Al-Muddaththir", verses: 56, meaning: "The Cloaked One" },
  { number: 75, name: "Al-Qiyamah", verses: 40, meaning: "The Resurrection" },
  { number: 76, name: "Al-Insan", verses: 31, meaning: "The Man" },
  { number: 77, name: "Al-Mursalat", verses: 50, meaning: "The Emissaries" },
  { number: 78, name: "An-Naba", verses: 40, meaning: "The Great News" },
  { number: 79, name: "An-Nazi'at", verses: 46, meaning: "Those Who Drag Forth" },
  { number: 80, name: "Abasa", verses: 42, meaning: "He Frowned" },
  { number: 81, name: "At-Takwir", verses: 29, meaning: "The Folding Up" },
  { number: 82, name: "Al-Infitar", verses: 19, meaning: "The Cleaving" },
  { number: 83, name: "At-Tatfif", verses: 36, meaning: "The Defrauders" },
  { number: 84, name: "Al-Inshiqaq", verses: 25, meaning: "The Splitting Asunder" },
  { number: 85, name: "Al-Buruj", verses: 22, meaning: "The Constellations" },
  { number: 86, name: "At-Tariq", verses: 17, meaning: "The Morning Star" },
  { number: 87, name: "Al-A'la", verses: 19, meaning: "The Most High" },
  { number: 88, name: "Al-Ghashiyah", verses: 26, meaning: "The Overwhelming" },
  { number: 89, name: "Al-Fajr", verses: 30, meaning: "The Daybreak" },
  { number: 90, name: "Al-Balad", verses: 20, meaning: "The City" },
  { number: 91, name: "Ash-Shams", verses: 15, meaning: "The Sun" },
  { number: 92, name: "Al-Lail", verses: 21, meaning: "The Night" },
  { number: 93, name: "Ad-Duha", verses: 11, meaning: "The Morning Brightness" },
  { number: 94, name: "Ash-Sharh", verses: 8, meaning: "The Opening" },
  { number: 95, name: "At-Tin", verses: 8, meaning: "The Fig" },
  { number: 96, name: "Al-Alaq", verses: 19, meaning: "The Clot" },
  { number: 97, name: "Al-Qadr", verses: 5, meaning: "The Power" },
  { number: 98, name: "Al-Bayyinah", verses: 8, meaning: "The Clear Proof" },
  { number: 99, name: "Az-Zilzal", verses: 8, meaning: "The Earthquake" },
  { number: 100, name: "Al-Adiyat", verses: 11, meaning: "The Courser" },
  { number: 101, name: "Al-Qari'ah", verses: 11, meaning: "The Calamity" },
  { number: 102, name: "At-Takathur", verses: 8, meaning: "The Rivalry In Worldly Increase" },
  { number: 103, name: "Al-Asr", verses: 3, meaning: "The Epoch" },
  { number: 104, name: "Al-Humazah", verses: 9, meaning: "The Slanderer" },
  { number: 105, name: "Al-Fil", verses: 5, meaning: "The Elephant" },
  { number: 106, name: "Quraysh", verses: 4, meaning: "Quraysh" },
  { number: 107, name: "Al-Ma'un", verses: 7, meaning: "The Small Kindnesses" },
  { number: 108, name: "Al-Kawthar", verses: 3, meaning: "The Abundance" },
  { number: 109, name: "Al-Kafirun", verses: 6, meaning: "The Disbelievers" },
  { number: 110, name: "An-Nasr", verses: 3, meaning: "The Succor" },
  { number: 111, name: "Al-Lahab", verses: 5, meaning: "The Flame" },
  { number: 112, name: "Al-Ikhlas", verses: 4, meaning: "The Sincerity" },
  { number: 113, name: "Al-Falaq", verses: 5, meaning: "The Daybreak" },
  { number: 114, name: "An-Nas", verses: 6, meaning: "The Mankind" },
]

export default function QuranSurahPages() {
  const [currentSurah, setCurrentSurah] = useState(0)

  const handlePrevious = () => {
    setCurrentSurah((prev) => (prev > 0 ? prev - 1 : SURAHS.length - 1))
  }

  const handleNext = () => {
    setCurrentSurah((prev) => (prev < SURAHS.length - 1 ? prev + 1 : 0))
  }

  const surah = SURAHS[currentSurah]

  return (
    <div className="space-y-6">
      {/* Surah Navigation */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
          {SURAHS.map((s, index) => (
            <Button
              key={s.number}
              variant={currentSurah === index ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSurah(index)}
              className="text-xs"
            >
              {s.number}
            </Button>
          ))}
        </div>
      </Card>

      {/* Current Surah Display */}
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-serif font-bold text-primary">Surah {surah.number}</h2>
          <h3 className="text-2xl font-serif text-accent">{surah.name}</h3>
          <p className="text-muted-foreground">
            {surah.meaning} - {surah.verses} Verses
          </p>
        </div>

        {/* Quranic Text Placeholder */}
        <div className="bg-background p-6 rounded-lg border border-primary/10 text-center text-muted-foreground mb-6 min-h-48">
          <p className="text-lg leading-relaxed text-right font-serif">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            <br />
            [Quranic text for Surah {surah.number} would be displayed here]
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button onClick={handlePrevious} variant="outline" className="gap-2 bg-transparent">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentSurah + 1} / {SURAHS.length}
          </span>
          <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
