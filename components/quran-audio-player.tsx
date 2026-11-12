"use client"
import { useEffect, useState, useRef } from "react"
import { Play, Pause, Volume2, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Surah {
  number: number
  name: string
  reciter: string
  audioUrl: string
}

const surahs: Surah[] = [
  ...Array.from({ length: 114 }, (_, i) => {
    const surahNum = i + 1
    const reciters = [
      {
        name: "Abdul Rahman Al-Sudais",
        url: `https://quran.islamicislam.com/quran/abdul_rahman_al_sudais/00${surahNum}.mp3`,
      },
      {
        name: "Mishary Rashid Al-Afasy",
        url: `https://quran.islamicislam.com/quran/mishary_rashid_al_afasy/00${surahNum}.mp3`,
      },
    ]
    const reciterIndex = surahNum % 2
    return {
      number: surahNum,
      name: `Surah ${surahNum}`,
      reciter: reciters[reciterIndex].name,
      audioUrl: reciters[reciterIndex].url,
    }
  }),
]

export default function QuranAudioPlayer() {
  const [selectedSurah, setSelectedSurah] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !surahs[selectedSurah]) return

    const currentSurah = surahs[selectedSurah]
    setError(null)
    setLoading(true)

    audio.src = currentSurah.audioUrl
    audio.load()

    if (playing) {
      audio.play().catch((err) => {
        console.log("[v0] Playback failed:", err.message)
        setError("Failed to play audio. Please try another Surah.")
        setPlaying(false)
      })
    }
  }, [selectedSurah, playing])

  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((err) => {
        console.log("[v0] Audio playback error:", err.message)
        setError("Playback failed. Trying next Surah...")
        setPlaying(false)
      })
    }
    setPlaying(!playing)
  }

  const handlePrevious = () => {
    if (selectedSurah > 0) {
      setSelectedSurah(selectedSurah - 1)
      setPlaying(false)
    }
  }

  const handleNext = () => {
    if (selectedSurah < surahs.length - 1) {
      setSelectedSurah(selectedSurah + 1)
      setPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="space-y-6">
      <Card className="card-premium p-6">
        <h3 className="text-2xl font-bold text-primary mb-4">Quran Recitations - All 114 Surahs</h3>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-600 text-sm">{error}</div>
        )}

        {/* Audio Player */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              disabled={loading}
              className="button-premium bg-gradient-to-r from-primary to-accent text-white p-4 rounded-full hover:shadow-lg hover:shadow-primary/40 flex-shrink-0 disabled:opacity-50"
            >
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <div className="flex-1">
              <p className="font-semibold text-primary flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                {surahs[selectedSurah]?.name}
              </p>
              <p className="text-xs text-muted-foreground">{surahs[selectedSurah]?.reciter}</p>
              <audio
                ref={audioRef}
                onEnded={() => setPlaying(false)}
                onLoadedMetadata={() => {
                  setDuration(audioRef.current?.duration || 0)
                  setLoading(false)
                }}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onCanPlay={() => setLoading(false)}
                crossOrigin="anonymous"
                className="w-full mt-2 rounded"
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-sm text-muted-foreground text-center">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center gap-4">
            <Button
              onClick={handlePrevious}
              disabled={selectedSurah === 0}
              className="button-premium bg-transparent"
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              Surah {selectedSurah + 1} of {surahs.length}
            </p>
            <Button
              onClick={handleNext}
              disabled={selectedSurah === surahs.length - 1}
              className="button-premium bg-transparent"
              variant="outline"
              size="sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Surah Grid for Quick Selection */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">Quick Selection - All 114 Surahs</p>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto">
            {surahs.map((surah, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSurah(idx)
                  setPlaying(false)
                  setError(null)
                }}
                className={`p-2 rounded text-xs font-semibold transition-all ${
                  selectedSurah === idx
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "bg-card hover:bg-card/80 text-foreground border border-primary/20"
                }`}
              >
                {surah.number}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
