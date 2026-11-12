"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Play, Pause, ChevronDown, ChevronUp, Sparkles, BookOpen, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Dikr {
  title: string
  occasion: string
  text: string
  transliteration: string
  translation: string
  source: string
  audioUrl: string
  duaId: string
}

export default function DailyDikr() {
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [expandedDikr, setExpandedDikr] = useState<number | null>(0)
  const [playingDuaId, setPlayingDuaId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const categories = [
    {
      name: "Mosque",
      icon: "🕌",
      dikrs: [
        {
          title: "Entering the Mosque",
          occasion: "When stepping through the mosque threshold",
          text: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
          transliteration: "Allahumma iftah lee abwaba rahmatika",
          translation: "O Allah, open for me the gates of Your mercy.",
          source: "Sahih Muslim • 713",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3",
          duaId: "mosque-1",
        },
        {
          title: "Leaving the Mosque",
          occasion: "When departing the sacred house of Allah",
          text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
          transliteration: "Allahumma inni as'aluka min fadlika",
          translation: "O Allah, I ask You from Your boundless bounty.",
          source: "Sahih Muslim • 713",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3",
          duaId: "mosque-2",
        },
      ],
    },
    {
      name: "Morning & Evening",
      icon: "🌅",
      dikrs: [
        {
          title: "Sayyid al-Istighfar (Chief of Forgiveness)",
          occasion: "Morning and evening daily protection",
          text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
          transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka...",
          translation: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I abide by Your covenant as best as I am able.",
          source: "Sahih al-Bukhari • 6306",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
          duaId: "morning-1",
        },
        {
          title: "Evening Refuge",
          occasion: "At dusk",
          text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
          transliteration: "Amsayna wa-amsal-mulku lillah, wal-hamdulillahi",
          translation: "We have reached the evening, and in the evening all sovereignty belongs to Allah, and all praise is for Allah.",
          source: "Sahih Muslim • 2723",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3",
          duaId: "evening-1",
        },
      ],
    },
    {
      name: "Sleep & Waking",
      icon: "🌙",
      dikrs: [
        {
          title: "Before Sleeping",
          occasion: "Retiring to rest",
          text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ",
          transliteration: "Bismika Rabbi wada'tu janbi wa bika arfa'uh",
          translation: "In Your name my Lord I lie down, and in Your name I arise.",
          source: "Sahih al-Bukhari • 6320",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3",
          duaId: "sleep-1",
        },
        {
          title: "Upon Waking",
          occasion: "Beginning the new day",
          text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
          transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
          translation: "All praise is for Allah who restored us to life after causing us to sleep, and to Him is the resurrection.",
          source: "Sahih al-Bukhari • 6312",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3",
          duaId: "wake-1",
        },
      ],
    },
    {
      name: "Home & Travel",
      icon: "🚗",
      dikrs: [
        {
          title: "Supplication for Travel",
          occasion: "Mounting a vehicle or traveling",
          text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
          transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrinin wa inna ila Rabbina lamunqalibun",
          translation: "Glory to Him who has subjected this to us, and we could never have had it by our own efforts. And indeed to our Lord we will return.",
          source: "Sahih Muslim • 1342",
          audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3",
          duaId: "travel-1",
        },
      ],
    },
  ]

  const playDuaAudio = (duaId: string, url: string) => {
    if (playingDuaId === duaId) {
      if (audioRef.current) {
        audioRef.current.pause()
        setPlayingDuaId(null)
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.addEventListener("ended", () => setPlayingDuaId(null))
      audio.play().catch(() => setPlayingDuaId(null))
      setPlayingDuaId(duaId)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Daily Supplications • Hisn al-Muslim
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Essential Daily Adhkar
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Authentic supplications from the Prophet (ﷺ) for morning, evening, mosque, travel, and rest.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedCategory(idx)
              setExpandedDikr(0)
            }}
            className={`px-4 py-2 rounded-full font-medium transition text-xs flex items-center gap-2 whitespace-nowrap border ${
              selectedCategory === idx
                ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Supplication Accordion Cards */}
      <div className="space-y-3">
        {categories[selectedCategory].dikrs.map((dikr, idx) => {
          const isExpanded = expandedDikr === idx
          return (
            <Card
              key={idx}
              className={`p-6 border-border bg-card transition cursor-pointer rounded-2xl ${
                isExpanded ? "border-[#C8A96B]/50 shadow-xs" : "hover:border-[#C8A96B]/30"
              }`}
              onClick={() => setExpandedDikr(isExpanded ? null : idx)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-medium text-foreground text-lg">{dikr.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{dikr.occasion}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-border space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-muted/40 p-5 rounded-2xl text-right" dir="rtl">
                    <p className="font-arabic text-2xl text-[#123D32] dark:text-[#C8A96B] leading-loose">
                      {dikr.text}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-mono font-semibold text-[#C8A96B]">{dikr.transliteration}</p>
                    <p className="text-sm text-foreground/90 leading-relaxed font-sans">{dikr.translation}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border/50">
                    <span className="font-mono text-[11px]">{dikr.source}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playDuaAudio(dikr.duaId, dikr.audioUrl)}
                      className="rounded-full text-xs gap-1.5 border-border hover:border-[#C8A96B]"
                    >
                      {playingDuaId === dikr.duaId ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Pause Audio
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Listen Recitation
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
