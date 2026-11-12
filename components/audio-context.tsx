"use client"

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { ALL_SURAHS, type SurahDefinition } from "@/lib/quran-data"

export interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
  folder: string
}

export const RECITERS: Reciter[] = [
  { id: "afasy", name: "Mishary Rashid Al-Afasy", arabicName: "مشاري بن راشد العفاسي", style: "Murattal", folder: "Alafasy_128kbps" },
  { id: "abdul-basit", name: "Abdul Basit Abdul Samad", arabicName: "عبد الباسط عبد الصمد", style: "Murattal", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: "sudais", name: "Abdur-Rahman As-Sudais", arabicName: "عبد الرحمن السديس", style: "Murattal", folder: "Abdurrahmaan_As-Sudais_192kbps" },
  { id: "dussary", name: "Yasser Al-Dosari", arabicName: "ياسر الدوسري", style: "Haramain Style", folder: "Yasser_Ad-Dussary_128kbps" },
]

export type SurahMeta = SurahDefinition
export const SURAH_LIST = ALL_SURAHS

export interface AudioContextType {
  currentSurah: SurahMeta
  currentReciter: Reciter
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  repeatMode: "off" | "one" | "all"
  isMuted: boolean
  isPlayerVisible: boolean
  isMinimized: boolean
  audioError: string | null
  activeMode: "surah" | "ayah"
  currentAyahNumber: number | null
  lastSavedSession: { surah: number; time: number; reciter: string } | null
  playSurah: (surahNumber: number, reciterId?: string) => void
  playAyah: (surahNumber: number, ayahNumber: number, continuous?: boolean) => void
  togglePlay: () => void
  seekTo: (time: number) => void
  setVolumeLevel: (vol: number) => void
  toggleMute: () => void
  setSpeed: (rate: number) => void
  setRepeat: (mode: "off" | "one" | "all") => void
  selectReciter: (reciterId: string) => void
  nextSurah: () => void
  previousSurah: () => void
  closePlayer: () => void
  toggleMinimize: () => void
  resumeLastSession: () => void
}

const AudioPlayerContext = createContext<AudioContextType | null>(null)

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(1)
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null)
  const [activeMode, setActiveMode] = useState<"surah" | "ayah">("surah")
  const [continuousAyah, setContinuousAyah] = useState<boolean>(true)
  const [selectedReciterId, setSelectedReciterId] = useState<string>("afasy")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolume] = useState<number>(0.85)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off")
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(false)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [lastSavedSession, setLastSavedSession] = useState<{ surah: number; time: number; reciter: string } | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  const currentSurah = ALL_SURAHS.find((s) => s.number === currentSurahNum) || ALL_SURAHS[0]
  const currentReciter = RECITERS.find((r) => r.id === selectedReciterId) || RECITERS[0]

  // Construct audio stream URL
  const getAudioUrl = useCallback(
    (surah: number, reciterId: string, mode: "surah" | "ayah", ayahNum: number | null) => {
      const padSurah = String(surah).padStart(3, "0")
      const rec = RECITERS.find((r) => r.id === reciterId) || RECITERS[0]

      if (mode === "ayah" && ayahNum !== null) {
        const padAyah = String(ayahNum).padStart(3, "0")
        return `https://everyayah.com/data/${rec.folder}/${padSurah}${padAyah}.mp3`
      }

      // Full Surah audio
      const map: Record<string, string> = {
        afasy: `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${padSurah}.mp3`,
        sudais: `https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/${padSurah}.mp3`,
        "abdul-basit": `https://download.quranicaudio.com/quran/abdul_basit_murattal/${padSurah}.mp3`,
        dussary: `https://download.quranicaudio.com/quran/yasser_ad-dussary/${padSurah}.mp3`,
      }
      return map[reciterId] || map.afasy
    },
    []
  )

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("deen_connect_audio_session")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.surah) {
          setLastSavedSession(parsed)
          setCurrentSurahNum(parsed.surah)
          if (parsed.reciter) setSelectedReciterId(parsed.reciter)
        }
      }
    } catch (e) {
      console.warn("Could not load saved audio session", e)
    }
  }, [])

  // Persistent audio element creation
  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setAudioError(null)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
      if (Math.floor(audio.currentTime) % 5 === 0 && audio.currentTime > 2) {
        localStorage.setItem(
          "deen_connect_audio_session",
          JSON.stringify({
            surah: currentSurahNum,
            time: Math.floor(audio.currentTime),
            reciter: selectedReciterId,
          })
        )
      }
    }

    const handleEnded = () => {
      if (activeMode === "ayah" && currentAyahNumber !== null) {
        if (repeatMode === "one") {
          audio.currentTime = 0
          audio.play().catch(() => setIsPlaying(false))
        } else if (continuousAyah && currentAyahNumber < currentSurah.versesCount) {
          // Play next ayah
          const nextAyah = currentAyahNumber + 1
          setCurrentAyahNumber(nextAyah)
          const nextUrl = getAudioUrl(currentSurahNum, selectedReciterId, "ayah", nextAyah)
          audio.src = nextUrl
          audio.load()
          audio.play().catch(() => setIsPlaying(false))
        } else {
          setIsPlaying(false)
        }
        return
      }

      // Full Surah ended
      if (repeatMode === "one") {
        audio.currentTime = 0
        audio.play().catch(() => setIsPlaying(false))
      } else if (repeatMode === "all" || currentSurahNum < 114) {
        const next = currentSurahNum < 114 ? currentSurahNum + 1 : 1
        setCurrentSurahNum(next)
      } else {
        setIsPlaying(false)
      }
    }

    const handleError = () => {
      setAudioError("Unable to stream this audio track. Please check connection.")
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audioRef.current = null
    }
  }, [activeMode, currentAyahNumber, continuousAyah, currentSurah.versesCount, currentSurahNum, repeatMode, selectedReciterId, getAudioUrl])

  // MediaSession API integration for OS / background controls
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return

    try {
      const title =
        activeMode === "ayah" && currentAyahNumber !== null
          ? `Surah ${currentSurah.name} • Verse ${currentAyahNumber}`
          : `Surah ${currentSurah.name} (${currentSurah.arabicName})`

      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: currentReciter.name,
        album: "The Noble Quran • Deen Connect",
        artwork: [
          { src: "/apple-icon.png", sizes: "192x192", type: "image/png" },
        ],
      })

      navigator.mediaSession.setActionHandler("play", () => {
        setIsPlaying(true)
      })
      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false)
      })
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        previousSurah()
      })
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        nextSurah()
      })
    } catch (e) {
      console.warn("MediaSession assignment failed", e)
    }
  }, [currentSurah, currentReciter, activeMode, currentAyahNumber])

  // Sync Audio source when Surah, Ayah, or Reciter changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const newUrl = getAudioUrl(currentSurahNum, selectedReciterId, activeMode, currentAyahNumber)
    if (audio.src !== newUrl) {
      audio.pause()
      audio.src = newUrl
      audio.playbackRate = playbackRate
      audio.volume = isMuted ? 0 : volume
      audio.load()

      if (isPlaying) {
        const p = audio.play()
        playPromiseRef.current = p
        p.catch((e) => {
          console.warn("Playback error on src update:", e)
          setIsPlaying(false)
        })
      }
    }
  }, [currentSurahNum, selectedReciterId, activeMode, currentAyahNumber, getAudioUrl])

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      if (audio.paused) {
        const currentUrl = getAudioUrl(currentSurahNum, selectedReciterId, activeMode, currentAyahNumber)
        if (audio.src !== currentUrl) {
          audio.src = currentUrl
          audio.load()
        }
        const p = audio.play()
        playPromiseRef.current = p
        p.catch((e) => {
          console.warn("Playback error:", e)
          setIsPlaying(false)
        })
      }
    } else {
      if (!audio.paused) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              if (!audio.paused) audio.pause()
            })
            .catch(() => {})
        } else {
          audio.pause()
        }
      }
    }
  }, [isPlaying, currentSurahNum, selectedReciterId, activeMode, currentAyahNumber, getAudioUrl])

  // Volume & rate sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const playSurah = (surahNumber: number, reciterId?: string) => {
    setActiveMode("surah")
    setCurrentAyahNumber(null)
    setCurrentSurahNum(Math.max(1, Math.min(114, surahNumber)))
    if (reciterId) setSelectedReciterId(reciterId)
    setIsPlayerVisible(true)
    setIsMinimized(false)
    setIsPlaying(true)
  }

  const playAyah = (surahNumber: number, ayahNumber: number, continuous = true) => {
    setActiveMode("ayah")
    setCurrentSurahNum(Math.max(1, Math.min(114, surahNumber)))
    setCurrentAyahNumber(ayahNumber)
    setContinuousAyah(continuous)
    setIsPlayerVisible(true)
    setIsMinimized(false)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlayerVisible(true)
    setIsPlaying((prev) => !prev)
  }

  const seekTo = (time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    setVolume(clamped)
    if (clamped > 0 && isMuted) setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate)
  }

  const setRepeat = (mode: "off" | "one" | "all") => {
    setRepeatMode(mode)
  }

  const selectReciter = (reciterId: string) => {
    setSelectedReciterId(reciterId)
  }

  const nextSurah = () => {
    if (currentSurahNum < 114) {
      setCurrentSurahNum(currentSurahNum + 1)
      setCurrentAyahNumber(null)
      setActiveMode("surah")
      setIsPlaying(true)
    }
  }

  const previousSurah = () => {
    if (currentSurahNum > 1) {
      setCurrentSurahNum(currentSurahNum - 1)
      setCurrentAyahNumber(null)
      setActiveMode("surah")
      setIsPlaying(true)
    }
  }

  const closePlayer = () => {
    if (audioRef.current) audioRef.current.pause()
    setIsPlaying(false)
    setIsPlayerVisible(false)
  }

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev)
  }

  const resumeLastSession = () => {
    if (lastSavedSession) {
      setCurrentSurahNum(lastSavedSession.surah)
      if (lastSavedSession.reciter) setSelectedReciterId(lastSavedSession.reciter)
      setActiveMode("surah")
      setCurrentAyahNumber(null)
      setIsPlayerVisible(true)
      setIsMinimized(false)
      setIsPlaying(true)
      if (audioRef.current && lastSavedSession.time > 0) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = lastSavedSession.time
            setCurrentTime(lastSavedSession.time)
          }
        }, 300)
      }
    }
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSurah,
        currentReciter,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        repeatMode,
        isMuted,
        isPlayerVisible,
        isMinimized,
        audioError,
        activeMode,
        currentAyahNumber,
        lastSavedSession,
        playSurah,
        playAyah,
        togglePlay,
        seekTo,
        setVolumeLevel,
        toggleMute,
        setSpeed,
        setRepeat,
        selectReciter,
        nextSurah,
        previousSurah,
        closePlayer,
        toggleMinimize,
        resumeLastSession,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider")
  }
  return context
}
