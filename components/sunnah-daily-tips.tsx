"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Heart,
  Smile,
  Utensils,
  Moon,
  Droplets,
  Users,
  Compass,
} from "lucide-react"

export interface SunnahTradition {
  id: string
  title: string
  arabicText?: string
  description: string
  source: string
  grade: string
  category: string
  practicalTip: string
}

const SUNNAH_TRADITIONS: SunnahTradition[] = [
  // 1. Daily Life
  {
    id: "dl-1",
    title: "Entering and Leaving the Home with Dhikr",
    arabicText: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    description: "The Prophet (ﷺ) instructed to say upon stepping outside: 'In the name of Allah, I trust in Allah; there is no power and no strength except with Allah.' An angel responds: 'You are guided, defended, and protected.'",
    source: "Sunan Abi Dawud • 5095 • Jami' at-Tirmidhi • 3426",
    grade: "Sahih (Al-Albani)",
    category: "Daily Life",
    practicalTip: "Make it a habit at your front doorway before stepping outside.",
  },
  // 2. Eating and Drinking
  {
    id: "ed-1",
    title: "Eating with the Right Hand and Mentioning Allah",
    arabicText: "سَمِّ اللَّهَ، وَكُلْ بِيَمِينِكَ، وَكُلْ مِمَّا يَلِيكَ",
    description: "The Messenger of Allah (ﷺ) said to Umar ibn Abi Salama: 'Say the name of Allah, eat with your right hand, and eat from what is directly before you.'",
    source: "Sahih al-Bukhari • 5376 • Sahih Muslim • 2022",
    grade: "Muttafaq 'Alayh (Authentic Consensus)",
    category: "Eating and Drinking",
    practicalTip: "Pause before your first bite to consciously utter 'Bismillah'.",
  },
  {
    id: "ed-2",
    title: "Drinking in Three Calming Breaths While Seated",
    description: "The Messenger of Allah (ﷺ) would breathe outside the vessel three times while drinking, remarking that it is more thirst-quenching, healthier, and wholesome.",
    source: "Sahih Muslim • 2028",
    grade: "Sahih",
    category: "Eating and Drinking",
    practicalTip: "Sit down when hydrating and sip in three distinct pauses.",
  },
  // 3. Sleeping
  {
    id: "sl-1",
    title: "Performing Wudu and Resting on the Right Side",
    description: "The Prophet (ﷺ) advised: 'When you go to bed, perform ablution as you would for prayer, then lie down on your right side.'",
    source: "Sahih al-Bukhari • 247 • Sahih Muslim • 2710",
    grade: "Muttafaq 'Alayh",
    category: "Sleeping",
    practicalTip: "Recite Ayat al-Kursi and the last two verses of Al-Baqarah before sleeping.",
  },
  // 4. Cleanliness
  {
    id: "cl-1",
    title: "Using the Miswak (Natural Tooth-Stick)",
    description: "The Messenger of Allah (ﷺ) said: 'Were it not that I would overburden my community, I would have ordered them to use the miswak before every prayer.'",
    source: "Sahih al-Bukhari • 887 • Sahih Muslim • 252",
    grade: "Muttafaq 'Alayh",
    category: "Cleanliness",
    practicalTip: "Maintain oral purity throughout the day, especially before Salah.",
  },
  // 5. Kindness
  {
    id: "kn-1",
    title: "Smiling as Voluntary Charity (Sadaqah)",
    arabicText: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    description: "The Prophet (ﷺ) said: 'Your smiling in the face of your brother is charity for you.'",
    source: "Jami' at-Tirmidhi • 1956",
    grade: "Sahih (Al-Albani)",
    category: "Kindness",
    practicalTip: "Greet family members and strangers with an open, genuine countenance.",
  },
  // 6. Worship
  {
    id: "ws-1",
    title: "Offering Two Rak'ahs of Duha (Mid-Morning Prayer)",
    description: "The Prophet (ﷺ) recommended praying the Duha voluntary prayer, which serves as daily gratitude for each of the 360 joints in the human body.",
    source: "Sahih Muslim • 720",
    grade: "Sahih",
    category: "Worship",
    practicalTip: "Pray 2 or 4 rak'ahs roughly 20 minutes after sunrise until before Dhuhr.",
  },
  // 7. Social Conduct
  {
    id: "sc-1",
    title: "Spreading the Greeting of Peace (Salam)",
    arabicText: "أَفْشُوا السَّلَامَ بَيْنَكُمْ",
    description: "The Messenger of Allah (ﷺ) stated: 'You will not enter Paradise until you believe, and you will not believe until you love one another. Shall I guide you to something which, if done, will foster mutual love? Spread peace (salam) among yourselves.'",
    source: "Sahih Muslim • 54",
    grade: "Sahih",
    category: "Social Conduct",
    practicalTip: "Initiate greetings with people you know and those you do not know.",
  },
  // 8. Personal Character
  {
    id: "pc-1",
    title: "Restraining Anger and Exercising Self-Control",
    description: "A man asked the Prophet (ﷺ): 'Advise me.' The Prophet repeated three times: 'Do not become angry.' He also taught that the truly strong person is the one who controls himself during fury.",
    source: "Sahih al-Bukhari • 6114 • 6116",
    grade: "Sahih",
    category: "Personal Character",
    practicalTip: "When feeling anger rise, seek refuge with Allah ('A'udhu billah') and change your posture.",
  },
]

const CATEGORIES = [
  "All Categories",
  "Daily Life",
  "Eating and Drinking",
  "Sleeping",
  "Cleanliness",
  "Kindness",
  "Worship",
  "Social Conduct",
  "Personal Character",
]

export default function SunnahDailyTips() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const filtered =
    selectedCategory === "All Categories"
      ? SUNNAH_TRADITIONS
      : SUNNAH_TRADITIONS.filter((t) => t.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
              selectedCategory === cat
                ? "bg-[#123D32] text-[#F7F5EF] border-[#C8A96B] dark:bg-[#C8A96B] dark:text-[#101A16] shadow-xs font-semibold"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-serif text-2xl font-normal text-foreground">
            Prophetic Sunnah Etiquettes
          </h3>
          <p className="text-xs text-muted-foreground">
            Authentic practical habits from the life of Prophet Muhammad (ﷺ) with verified references.
          </p>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {filtered.length} Traditions
        </span>
      </div>

      {/* Traditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="p-6 rounded-3xl bg-card border border-border hover:border-[#C8A96B]/50 transition-all space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted font-semibold">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {item.grade}
                </span>
              </div>

              <h4 className="font-serif text-lg font-medium text-foreground">{item.title}</h4>

              {item.arabicText && (
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-right">
                  <p className="font-arabic text-lg text-[#123D32] dark:text-[#C8A96B]" dir="rtl">
                    {item.arabicText}
                  </p>
                </div>
              )}

              <p className="text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-border/60">
              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Practical Living:</span> {item.practicalTip}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">{item.source}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
