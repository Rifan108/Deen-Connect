"use client"

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"

export interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
}

export const RECITERS: Reciter[] = [
  { id: "afasy", name: "Mishary Rashid Al-Afasy", arabicName: "مشاري بن راشد العفاسي", style: "Murattal" },
  { id: "sudais", name: "Abdur-Rahman As-Sudais", arabicName: "عبد الرحمن السديس", style: "Murattal" },
  { id: "abdul-basit", name: "Abdul Basit Abdul Samad", arabicName: "عبد الباسط عبد الصمد", style: "Murattal" },
  { id: "dussary", name: "Yasser Al-Dosari", arabicName: "ياسر الدوسري", style: "Haramain Style" },
]

export interface SurahMeta {
  number: number
  name: string
  arabicName: string
  englishName: string
  versesCount: number
  revelationType: string
}

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, name: "Al-Fatiha", arabicName: "الفاتحة", englishName: "The Opening", versesCount: 7, revelationType: "Meccan" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", englishName: "The Cow", versesCount: 286, revelationType: "Medinan" },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", englishName: "Family of Imran", versesCount: 200, revelationType: "Medinan" },
  { number: 4, name: "An-Nisa", arabicName: "النساء", englishName: "The Women", versesCount: 176, revelationType: "Medinan" },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", englishName: "The Table Spread", versesCount: 120, revelationType: "Medinan" },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", englishName: "The Cattle", versesCount: 165, revelationType: "Meccan" },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", englishName: "The Heights", versesCount: 206, revelationType: "Meccan" },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", englishName: "The Spoils of War", versesCount: 75, revelationType: "Medinan" },
  { number: 9, name: "At-Tawbah", arabicName: "التوبة", englishName: "The Repentance", versesCount: 129, revelationType: "Medinan" },
  { number: 10, name: "Yunus", arabicName: "يونس", englishName: "Jonah", versesCount: 109, revelationType: "Meccan" },
  { number: 11, name: "Hud", arabicName: "هود", englishName: "Hud", versesCount: 123, revelationType: "Meccan" },
  { number: 12, name: "Yusuf", arabicName: "يوسف", englishName: "Joseph", versesCount: 111, revelationType: "Meccan" },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", englishName: "The Thunder", versesCount: 43, revelationType: "Medinan" },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", englishName: "Abraham", versesCount: 52, revelationType: "Meccan" },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", englishName: "The Rocky Tract", versesCount: 99, revelationType: "Meccan" },
  { number: 16, name: "An-Nahl", arabicName: "النحل", englishName: "The Bee", versesCount: 128, revelationType: "Meccan" },
  { number: 17, name: "Al-Isra", arabicName: "الإسراء", englishName: "The Night Journey", versesCount: 111, revelationType: "Meccan" },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", englishName: "The Cave", versesCount: 110, revelationType: "Meccan" },
  { number: 19, name: "Maryam", arabicName: "مريم", englishName: "Mary", versesCount: 98, revelationType: "Meccan" },
  { number: 20, name: "Ta-Ha", arabicName: "طه", englishName: "Ta-Ha", versesCount: 135, revelationType: "Meccan" },
  { number: 21, name: "Al-Anbiya", arabicName: "الأنبياء", englishName: "The Prophets", versesCount: 112, revelationType: "Meccan" },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", englishName: "The Pilgrimage", versesCount: 78, revelationType: "Medinan" },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", englishName: "The Believers", versesCount: 118, revelationType: "Meccan" },
  { number: 24, name: "An-Nur", arabicName: "النور", englishName: "The Light", versesCount: 64, revelationType: "Medinan" },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", englishName: "The Criterion", versesCount: 77, revelationType: "Meccan" },
  { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", englishName: "The Poets", versesCount: 227, revelationType: "Meccan" },
  { number: 27, name: "An-Naml", arabicName: "النمل", englishName: "The Ant", versesCount: 93, revelationType: "Meccan" },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", englishName: "The Stories", versesCount: 88, revelationType: "Meccan" },
  { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", englishName: "The Spider", versesCount: 69, revelationType: "Meccan" },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", englishName: "The Romans", versesCount: 60, revelationType: "Meccan" },
  { number: 31, name: "Luqman", arabicName: "لقمان", englishName: "Luqman", versesCount: 34, revelationType: "Meccan" },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", englishName: "The Prostration", versesCount: 30, revelationType: "Meccan" },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", englishName: "The Combined Forces", versesCount: 73, revelationType: "Medinan" },
  { number: 34, name: "Saba", arabicName: "سبأ", englishName: "Sheba", versesCount: 54, revelationType: "Meccan" },
  { number: 35, name: "Fatir", arabicName: "فاطر", englishName: "The Originator", versesCount: 45, revelationType: "Meccan" },
  { number: 36, name: "Ya-Sin", arabicName: "يس", englishName: "Ya-Sin", versesCount: 83, revelationType: "Meccan" },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", englishName: "Those Who Set the Ranks", versesCount: 182, revelationType: "Meccan" },
  { number: 38, name: "Sad", arabicName: "ص", englishName: "The Letter Sad", versesCount: 88, revelationType: "Meccan" },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", englishName: "The Troops", versesCount: 75, revelationType: "Meccan" },
  { number: 40, name: "Ghafir", arabicName: "غافر", englishName: "The Forgiver", versesCount: 85, revelationType: "Meccan" },
  { number: 41, name: "Fussilat", arabicName: "فصلت", englishName: "Explained in Detail", versesCount: 54, revelationType: "Meccan" },
  { number: 42, name: "Ash-Shura", arabicName: "الشورى", englishName: "Consultation", versesCount: 53, revelationType: "Meccan" },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", englishName: "Ornaments of Gold", versesCount: 89, revelationType: "Meccan" },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", englishName: "The Smoke", versesCount: 59, revelationType: "Meccan" },
  { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", englishName: "The Crouching", versesCount: 37, revelationType: "Meccan" },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", englishName: "The Wind-Curved Sandhills", versesCount: 35, revelationType: "Meccan" },
  { number: 47, name: "Muhammad", arabicName: "محمد", englishName: "Muhammad", versesCount: 38, revelationType: "Medinan" },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", englishName: "The Victory", versesCount: 29, revelationType: "Medinan" },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", englishName: "The Rooms", versesCount: 18, revelationType: "Medinan" },
  { number: 50, name: "Qaf", arabicName: "ق", englishName: "The Letter Qaf", versesCount: 45, revelationType: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", englishName: "The Winnowing Winds", versesCount: 60, revelationType: "Meccan" },
  { number: 52, name: "At-Tur", arabicName: "الطور", englishName: "The Mount", versesCount: 49, revelationType: "Meccan" },
  { number: 53, name: "An-Najm", arabicName: "النجم", englishName: "The Star", versesCount: 62, revelationType: "Meccan" },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", englishName: "The Moon", versesCount: 55, revelationType: "Meccan" },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", englishName: "The Beneficent", versesCount: 78, revelationType: "Medinan" },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", englishName: "The Inevitable", versesCount: 96, revelationType: "Meccan" },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", englishName: "The Iron", versesCount: 29, revelationType: "Medinan" },
  { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", englishName: "The Pleading Woman", versesCount: 22, revelationType: "Medinan" },
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", englishName: "The Exile", versesCount: 24, revelationType: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", englishName: "She that is to be Examined", versesCount: 13, revelationType: "Medinan" },
  { number: 61, name: "As-Saff", arabicName: "الصف", englishName: "The Ranks", versesCount: 14, revelationType: "Medinan" },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", englishName: "The Congregation", versesCount: 11, revelationType: "Medinan" },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", englishName: "The Hypocrites", versesCount: 11, revelationType: "Medinan" },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", englishName: "The Mutual Disillusion", versesCount: 18, revelationType: "Medinan" },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", englishName: "The Divorce", versesCount: 12, revelationType: "Medinan" },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", englishName: "The Prohibition", versesCount: 12, revelationType: "Medinan" },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", englishName: "The Sovereignty", versesCount: 30, revelationType: "Meccan" },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", englishName: "The Pen", versesCount: 52, revelationType: "Meccan" },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", englishName: "The Reality", versesCount: 52, revelationType: "Meccan" },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", englishName: "The Ascending Stairways", versesCount: 44, revelationType: "Meccan" },
  { number: 71, name: "Nuh", arabicName: "نوح", englishName: "Noah", versesCount: 28, revelationType: "Meccan" },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", englishName: "The Jinn", versesCount: 28, revelationType: "Meccan" },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", englishName: "The Enshrouded One", versesCount: 20, revelationType: "Meccan" },
  { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", englishName: "The Cloaked One", versesCount: 56, revelationType: "Meccan" },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", englishName: "The Resurrection", versesCount: 40, revelationType: "Meccan" },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", englishName: "Man", versesCount: 31, revelationType: "Medinan" },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", englishName: "The Emissaries", versesCount: 50, revelationType: "Meccan" },
  { number: 78, name: "An-Naba", arabicName: "النبأ", englishName: "The Tidings", versesCount: 40, revelationType: "Meccan" },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", englishName: "Those Who Drag Forth", versesCount: 46, revelationType: "Meccan" },
  { number: 80, name: "'Abasa", arabicName: "عبس", englishName: "He Frowned", versesCount: 42, revelationType: "Meccan" },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", englishName: "The Overthrowing", versesCount: 29, revelationType: "Meccan" },
  { number: 82, name: "Al-Infitar", arabicName: "الانفطار", englishName: "The Cleaving", versesCount: 19, revelationType: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", englishName: "Defrauding", versesCount: 36, revelationType: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", englishName: "The Splitting Open", versesCount: 25, revelationType: "Meccan" },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", englishName: "The Mansions of the Stars", versesCount: 22, revelationType: "Meccan" },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", englishName: "The Morning Star", versesCount: 17, revelationType: "Meccan" },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", englishName: "The Most High", versesCount: 19, revelationType: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", englishName: "The Overwhelming", versesCount: 26, revelationType: "Meccan" },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", englishName: "The Dawn", versesCount: 30, revelationType: "Meccan" },
  { number: 90, name: "Al-Balad", arabicName: "البلد", englishName: "The City", versesCount: 20, revelationType: "Meccan" },
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", englishName: "The Sun", versesCount: 15, revelationType: "Meccan" },
  { number: 92, name: "Al-Layl", arabicName: "الليل", englishName: "The Night", versesCount: 21, revelationType: "Meccan" },
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", englishName: "The Morning Hours", versesCount: 11, revelationType: "Meccan" },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", englishName: "The Relief", versesCount: 8, revelationType: "Meccan" },
  { number: 95, name: "At-Tin", arabicName: "التين", englishName: "The Fig", versesCount: 8, revelationType: "Meccan" },
  { number: 96, name: "Al-'Alaq", arabicName: "العلق", englishName: "The Clot", versesCount: 19, revelationType: "Meccan" },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", englishName: "The Power", versesCount: 5, revelationType: "Meccan" },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", englishName: "The Clear Proof", versesCount: 8, revelationType: "Medinan" },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", englishName: "The Earthquake", versesCount: 8, revelationType: "Medinan" },
  { number: 100, name: "Al-'Adiyat", arabicName: "العاديات", englishName: "The Courser", versesCount: 11, revelationType: "Meccan" },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", englishName: "The Calamity", versesCount: 11, revelationType: "Meccan" },
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", englishName: "The Rivalry in World Increase", versesCount: 8, revelationType: "Meccan" },
  { number: 103, name: "Al-'Asr", arabicName: "العصر", englishName: "The Declining Day", versesCount: 3, revelationType: "Meccan" },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", englishName: "The Traducer", versesCount: 9, revelationType: "Meccan" },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", englishName: "The Elephant", versesCount: 5, revelationType: "Meccan" },
  { number: 106, name: "Quraysh", arabicName: "قريش", englishName: "Quraysh", versesCount: 4, revelationType: "Meccan" },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", englishName: "The Small Kindnesses", versesCount: 7, revelationType: "Meccan" },
  { number: 108, name: "Al-Kawthar", arabicName: "الكوثر", englishName: "The Abundance", versesCount: 3, revelationType: "Meccan" },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", englishName: "The Disbelievers", versesCount: 6, revelationType: "Meccan" },
  { number: 110, name: "An-Nasr", arabicName: "النصر", englishName: "The Divine Support", versesCount: 3, revelationType: "Medinan" },
  { number: 111, name: "Al-Masad", arabicName: "المسد", englishName: "The Palm Fiber", versesCount: 5, revelationType: "Meccan" },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", englishName: "The Sincerity", versesCount: 4, revelationType: "Meccan" },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", englishName: "The Daybreak", versesCount: 5, revelationType: "Meccan" },
  { number: 114, name: "An-Nas", arabicName: "الناس", englishName: "Mankind", versesCount: 6, revelationType: "Meccan" },
]

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
  lastSavedSession: { surah: number; time: number; reciter: string } | null
  playSurah: (surahNumber: number, reciterId?: string) => void
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

  const currentSurah = SURAH_LIST.find((s) => s.number === currentSurahNum) || SURAH_LIST[0]
  const currentReciter = RECITERS.find((r) => r.id === selectedReciterId) || RECITERS[0]

  const getAudioUrl = useCallback((surah: number, reciterId: string) => {
    const pad = String(surah).padStart(3, "0")
    const map: Record<string, string> = {
      afasy: `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${pad}.mp3`,
      sudais: `https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/${pad}.mp3`,
      "abdul-basit": `https://download.quranicaudio.com/quran/abdul_basit_murattal/${pad}.mp3`,
      dussary: `https://download.quranicaudio.com/quran/yasser_ad-dussary/${pad}.mp3`,
    }
    return map[reciterId] || map.afasy
  }, [])

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
      // Throttled persistence
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
  }, [])

  // Sync Audio source when Surah or Reciter changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const newUrl = getAudioUrl(currentSurahNum, selectedReciterId)
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
  }, [currentSurahNum, selectedReciterId, getAudioUrl])

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      if (audio.paused) {
        const currentUrl = getAudioUrl(currentSurahNum, selectedReciterId)
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
  }, [isPlaying, currentSurahNum, selectedReciterId, getAudioUrl])

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
    setCurrentSurahNum(Math.max(1, Math.min(114, surahNumber)))
    if (reciterId) setSelectedReciterId(reciterId)
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
      setIsPlaying(true)
    }
  }

  const previousSurah = () => {
    if (currentSurahNum > 1) {
      setCurrentSurahNum(currentSurahNum - 1)
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
        lastSavedSession,
        playSurah,
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

