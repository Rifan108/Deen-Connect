"use client"

import React, { useState } from "react"
import { ChevronDown, MapPin, Compass, Sparkles, Check } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Procedure {
  title: string
  description: string
  steps: {
    step: number
    action: string
    location: string
    dua: string
    meaning: string
  }[]
}

const PROCEDURES: Record<string, Procedure> = {
  hajj: {
    title: "The Greater Pilgrimage (Hajj)",
    description: "The fifth pillar of Islam, performed annually in the sacred month of Dhul-Hijjah across Makkah, Mina, Arafat, and Muzdalifah.",
    steps: [
      {
        step: 1,
        action: "Ihram & Niyyah (Entering Sacred State)",
        location: "At the Miqat boundary",
        dua: "لَبَّيْكَ اللَّهُمَّ حَجًّا",
        meaning: "Here I am, O Allah, here I am responding to Your call for Hajj. All praise, blessings, and sovereignty belong to You alone.",
      },
      {
        step: 2,
        action: "Day of Tarwiyah (Moving to Mina)",
        location: "Mina valley (8th Dhul-Hijjah)",
        dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ",
        meaning: "Devote the day and night to prayer, dhikr, and spiritual preparation for the Day of Arafah.",
      },
      {
        step: 3,
        action: "Standing at Arafat (The Pinnacle of Hajj)",
        location: "Plains of Arafat (9th Dhul-Hijjah)",
        dua: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        meaning: "The Prophet (ﷺ) said: 'Hajj is Arafah.' Spend the afternoon in earnest repentance, supplication, and tears.",
      },
      {
        step: 4,
        action: "Night in Muzdalifah & Gathering Pebbles",
        location: "Muzdalifah open plain",
        dua: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        meaning: "Combine Maghrib and Isha prayers under the open sky and rest until dawn.",
      },
      {
        step: 5,
        action: "Ramy al-Jamarat (Stoning the Pillars) & Sacrifice",
        location: "Jamarat Bridge, Mina (10th Dhul-Hijjah)",
        dua: "بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ، رَغْمًا لِلشَّيْطَانِ وَرِضًا لِلرَّحْمَنِ",
        meaning: "Cast pebbles rejecting spiritual temptation, followed by sacrificial offering (Qurbani) and shaving/trimming hair (Tahallul).",
      },
      {
        step: 6,
        action: "Tawaf al-Ifadah & Sa'i",
        location: "Masjid al-Haram, Kaaba",
        dua: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
        meaning: "Circumambulate the Holy Kaaba seven times and complete the walking between Mount Safa and Marwa.",
      },
      {
        step: 7,
        action: "Tawaf al-Wada' (Farewell Circumambulation)",
        location: "Before departing Makkah",
        dua: "اللَّهُمَّ لَا تَجْعَلْهُ آخِرَ الْعَهْدِ بِبَيْتِكَ الْحَرَامِ",
        meaning: "O Allah, do not make this my last visit to Your sacred House. The pilgrimage is fulfilled.",
      },
    ],
  },
  umrah: {
    title: "The Lesser Pilgrimage (Umrah)",
    description: "A profound spiritual journey to Makkah that can be performed at any time throughout the calendar year.",
    steps: [
      {
        step: 1,
        action: "Ihram & Talbiyah",
        location: "At designated Miqat",
        dua: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
        meaning: "Bathe, wear the two unstitched white cloths (for men), make intention, and continuously recite the Talbiyah.",
      },
      {
        step: 2,
        action: "Tawaf al-Umrah (7 Circuits around Kaaba)",
        location: "Mataf, Masjid al-Haram",
        dua: "بِسْمِ اللَّهِ، وَاللَّهُ أَكْبَرُ",
        meaning: "Begin each circuit at the Black Stone (Hajar al-Aswad), walk counter-clockwise with presence and supplication.",
      },
      {
        step: 3,
        action: "Maqam Ibrahim & Drinking Zamzam",
        location: "Behind Maqam Ibrahim",
        dua: "وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى",
        meaning: "Pray two rak'ahs behind Station of Ibrahim and drink blessed Zamzam water to full satiety.",
      },
      {
        step: 4,
        action: "Sa'i between Safa & Marwa (7 Laps)",
        location: "Mas'a gallery",
        dua: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
        meaning: "Commemorate Lady Hajar's desperate search for water for infant Ismail across seven traverses.",
      },
      {
        step: 5,
        action: "Halq or Taqsir (Shaving or Trimming Hair)",
        location: "Exit of Mas'a",
        dua: "الْحَمْدُ لِلَّهِ الَّذِي بَلَّغَنَا هَٰذَا",
        meaning: "Shave or clip hair to release from the state of Ihram. Your Umrah is complete with Allah's grace.",
      },
    ],
  },
}

export default function HajjUmrahGuide() {
  const [activeProcedure, setActiveProcedure] = useState<"hajj" | "umrah">("hajj")
  const [expandedStep, setExpandedStep] = useState<number | null>(1)

  const procedure = PROCEDURES[activeProcedure]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Sacred Pilgrimage • Ritual Journey
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Hajj & Umrah Interactive Guide
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            {procedure.description}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-card border border-border shadow-xs">
          {(["hajj", "umrah"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveProcedure(type)
                setExpandedStep(1)
              }}
              className={`px-5 py-1.5 rounded-full text-xs font-medium transition ${
                activeProcedure === type
                  ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#174C3D] shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "hajj" ? "Hajj Procedure" : "Umrah Guide"}
            </button>
          ))}
        </div>
      </div>

      {/* Step by Step Accordion Timeline */}
      <div className="space-y-4">
        {procedure.steps.map((step) => {
          const isExpanded = expandedStep === step.step
          return (
            <Card
              key={step.step}
              className={`border-border bg-card transition rounded-2xl overflow-hidden ${
                isExpanded ? "border-[#C8A96B]/50 shadow-xs" : "hover:border-[#C8A96B]/30"
              }`}
            >
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                className="w-full p-5 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-semibold shrink-0 ${
                      isExpanded
                        ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#123D32]"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    0{step.step}
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-base text-foreground">{step.action}</h4>
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C8A96B]" />
                      {step.location}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-border/60 space-y-4">
                  <div className="bg-muted/40 p-5 rounded-2xl text-center space-y-2">
                    <p className="font-arabic text-2xl text-[#123D32] dark:text-[#C8A96B] leading-relaxed" dir="rtl">
                      {step.dua}
                    </p>
                    <p className="text-xs text-muted-foreground italic max-w-xl mx-auto leading-relaxed">
                      "{step.meaning}"
                    </p>
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
