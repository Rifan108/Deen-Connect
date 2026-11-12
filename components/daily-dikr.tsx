"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  Sparkles,
  BookOpen,
  Volume2,
  Check,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Heart,
  ShieldCheck,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface DhikrEntry {
  id: string
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
  count: number
  benefit?: string
}

export interface DhikrCategory {
  id: string
  name: string
  arabicName: string
  icon: any
  adhkar: DhikrEntry[]
}

const AUTHENTIC_ADHKAR_CATEGORIES: DhikrCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    arabicName: "أذكار الصباح",
    icon: Sunrise,
    adhkar: [
      {
        id: "m-1",
        title: "Sayyid al-Istighfar (The Master of Forgiveness)",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa'innahu la yaghfiru-dhunuba illa anta.",
        translation: "O Allah, You are my Lord; there is no deity worthy of worship except You. You created me and I am Your servant, and I abide by Your covenant and promise as best as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your blessings upon me, and I confess my sins to You, so forgive me, for indeed none forgives sins except You.",
        reference: "Sahih al-Bukhari • 6306",
        count: 1,
        benefit: "Whoever recites this with conviction in the morning and dies before evening will be among the people of Paradise.",
      },
      {
        id: "m-2",
        title: "Praise of Allah by Number of His Creation",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
        transliteration: "Subhan Allahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.",
        translation: "Glory be to Allah and praise be to Him, according to the number of His creation, according to His pleasure, according to the weight of His Throne, and according to the ink of His words.",
        reference: "Sahih Muslim • 2726",
        count: 3,
        benefit: "Recited three times in the morning; outweighs prolonged hours of remembrance.",
      },
      {
        id: "m-3",
        title: "Protection Against All Calamity",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
        translation: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
        reference: "Sunan Abi Dawud • 5088 • Jami' at-Tirmidhi • 3388 (Sahih)",
        count: 3,
        benefit: "Nothing shall harm the one who recites this thrice in the morning and evening.",
      },
    ],
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    arabicName: "أذكار المساء",
    icon: Sunset,
    adhkar: [
      {
        id: "e-1",
        title: "Evening Sovereignty & Protection",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadir.",
        translation: "We have reached the evening and with it the whole kingdom belongs to Allah, all praise belongs to Allah, there is no god but Allah alone, without partner. To Him belongs the dominion and to Him belongs praise, and He has power over all things.",
        reference: "Sahih Muslim • 2723",
        count: 1,
      },
      {
        id: "e-2",
        title: "Refuge in the Perfect Words of Allah",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq.",
        translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        reference: "Sahih Muslim • 2709",
        count: 3,
        benefit: "No fever or venomous creature shall harm whoever recites it thrice at dusk.",
      },
      {
        id: "e-3",
        title: "Abundance of Forgiveness",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhan Allahi wa bihamdihi.",
        translation: "Glory be to Allah and all praise is His.",
        reference: "Sahih Muslim • 2692",
        count: 100,
        benefit: "No one will bring anything better on the Day of Resurrection except one who said the same or more.",
      },
    ],
  },
  {
    id: "after-salah",
    name: "After Salah Adhkar",
    arabicName: "أذكار بعد الصلاة",
    icon: Moon,
    adhkar: [
      {
        id: "s-1",
        title: "Initial Istighfar & Peace",
        arabic: "أَسْتَغْفِرُ اللَّهَ (ثَلَاثاً) • اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ",
        transliteration: "Astaghfirullah (3 times). Allahumma Antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
        translation: "I ask Allah for forgiveness (3 times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.",
        reference: "Sahih Muslim • 591",
        count: 1,
      },
      {
        id: "s-2",
        title: "Tasbih, Tahmid, Takbir",
        arabic: "سُبْحَانَ اللَّهِ (٣٣) • الْحَمْدُ لِلَّهِ (٣٣) • اللَّهُ أَكْبَرُ (٣٣)",
        transliteration: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x).",
        translation: "Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (33x). Completed with: 'La ilaha illallahu wahdahu la sharika lah...'",
        reference: "Sahih Muslim • 597",
        count: 33,
        benefit: "Sins forgiven even if they are like the foam of the sea.",
      },
      {
        id: "s-3",
        title: "Ayat al-Kursi (The Throne Verse)",
        arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm...",
        translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...",
        reference: "Sunan an-Nasa'i • Al-Sunan al-Kubra 9848 (Sahih)",
        count: 1,
        benefit: "Nothing stands between the one who recites it after each obligatory prayer and entering Paradise except death.",
      },
    ],
  },
  {
    id: "sleep",
    name: "Sleeping Adhkar",
    arabicName: "أذكار النوم",
    icon: Moon,
    adhkar: [
      {
        id: "sl-1",
        title: "Lying Upon the Right Side",
        arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        transliteration: "Bismika Rabbi wada'tu janbi wa bika arfa'uh, fa-in amsakta nafsi farhamha, wa-in arsaltaha fahfazha bima tahfazu bihi 'ibadakas-salihin.",
        translation: "In Your name, my Lord, I lay down my side and by Your name I arise. If You keep my soul, have mercy on it, and if You send it back, protect it as You protect Your righteous servants.",
        reference: "Sahih al-Bukhari • 6320 • Sahih Muslim • 2714",
        count: 1,
      },
      {
        id: "sl-2",
        title: "The Mu'awwidhat (Three Quls)",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ • قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        transliteration: "Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas.",
        translation: "Reciting the 3 protective Surahs into cupped hands, blowing lightly, and wiping over the entire body starting with the head and face.",
        reference: "Sahih al-Bukhari • 5017",
        count: 3,
      },
    ],
  },
  {
    id: "waking",
    name: "Waking-up Adhkar",
    arabicName: "أذكار الاستيقاظ",
    icon: Sun,
    adhkar: [
      {
        id: "w-1",
        title: "Gratitude for Life Returned",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
        translation: "All praise is for Allah Who gave us life after having caused us to die, and to Him is the final return and resurrection.",
        reference: "Sahih al-Bukhari • 6312",
        count: 1,
      },
      {
        id: "w-2",
        title: "Health & Vitality Preserved",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ",
        transliteration: "Alhamdu lillahil-ladhi 'afani fi jasadi, wa radda 'alayya ruhi, wa adhina li bidhikrih.",
        translation: "Praise be to Allah Who has restored my physical health, returned my soul to me, and granted me permission to remember Him.",
        reference: "Jami' at-Tirmidhi • 3401 (Hasan)",
        count: 1,
      },
    ],
  },
  {
    id: "general",
    name: "General Adhkar",
    arabicName: "أذكار عامة",
    icon: Heart,
    adhkar: [
      {
        id: "g-1",
        title: "Light on the Tongue, Heavy on the Scales",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
        transliteration: "Subhan Allahi wa bihamdihi, Subhan Allahil-'Azim.",
        translation: "Glory be to Allah and His is the praise; Glory be to Allah, the Supreme.",
        reference: "Sahih al-Bukhari • 6682 • Sahih Muslim • 2694",
        count: 100,
        benefit: "Two phrases that are light on the tongue, heavy on the scales, and beloved to the Most Merciful.",
      },
      {
        id: "g-2",
        title: "Hawqalah (Treasure of Paradise)",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah.",
        translation: "There is no power and no strength except with Allah.",
        reference: "Sahih al-Bukhari • 6384 • Sahih Muslim • 2704",
        count: 10,
        benefit: "One of the subterranean treasures beneath the Throne of Allah.",
      },
    ],
  },
]

export default function DailyDhikr() {
  const [activeCatIndex, setActiveCatIndex] = useState(0)
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({})

  const currentCategory = AUTHENTIC_ADHKAR_CATEGORIES[activeCatIndex]

  // Tactile clicker for adhkar count
  const handleTapCount = (id: string, targetCount: number) => {
    const current = completedCounts[id] || 0
    if (current < targetCount) {
      const next = current + 1
      setCompletedCounts((prev) => ({ ...prev, [id]: next }))
      if (next === targetCount) {
        toast.success("Prescribed repetition target fulfilled!")
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate([30, 20, 30])
        }
      }
    }
  }

  const resetCount = (id: string) => {
    setCompletedCounts((prev) => ({ ...prev, [id]: 0 }))
  }

  const copyDhikr = (entry: DhikrEntry) => {
    const text = `${entry.arabic}\n\n${entry.transliteration}\n\n"${entry.translation}"\n\nReference: ${entry.reference}`
    navigator.clipboard.writeText(text)
    toast.success("Supplication copied to clipboard")
  }

  return (
    <div className="space-y-6">
      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AUTHENTIC_ADHKAR_CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon
          const isActive = idx === activeCatIndex

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCatIndex(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition flex items-center gap-2 border ${
                isActive
                  ? "bg-[#123D32] text-[#F7F5EF] border-[#C8A96B] dark:bg-[#C8A96B] dark:text-[#101A16] shadow-sm font-semibold"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-serif text-2xl font-normal text-foreground">
            {currentCategory.name}{" "}
            <span className="font-arabic text-xl text-[#C8A96B]" dir="rtl">
              {currentCategory.arabicName}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Authentic supplications referenced directly from Sahih al-Bukhari, Sahih Muslim, and Hisn al-Muslim.
          </p>
        </div>
      </div>

      {/* Adhkar Cards */}
      <div className="space-y-4">
        {currentCategory.adhkar.map((entry) => {
          const currentCount = completedCounts[entry.id] || 0
          const isDone = currentCount >= entry.count

          return (
            <Card
              key={entry.id}
              className={`p-6 sm:p-7 rounded-3xl transition border ${
                isDone
                  ? "bg-[#123D32]/5 dark:bg-[#C8A96B]/10 border-emerald-500/40"
                  : "bg-card border-border hover:border-border/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-medium text-foreground">{entry.title}</h4>
                  <p className="text-xs font-mono text-[#69766E] dark:text-[#A9B9A7]">
                    {entry.reference}
                  </p>
                </div>

                {/* Counter & Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTapCount(entry.id, entry.count)}
                    disabled={isDone}
                    className={`h-9 px-4 rounded-full text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs ${
                      isDone
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] active:scale-95"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>
                      {currentCount} / {entry.count} {entry.count > 1 ? "reps" : "rep"}
                    </span>
                  </button>

                  {currentCount > 0 && (
                    <button
                      type="button"
                      onClick={() => resetCount(entry.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                      title="Reset count"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => copyDhikr(entry)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                    title="Copy supplication"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="py-5 text-right">
                <p
                  className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-foreground font-normal tracking-wide"
                  dir="rtl"
                >
                  {entry.arabic}
                </p>
              </div>

              {/* Transliteration & Translation */}
              <div className="space-y-2 pt-3 border-t border-border/40 text-xs sm:text-sm">
                <p className="font-sans italic text-muted-foreground">{entry.transliteration}</p>
                <p className="font-sans text-foreground/90 leading-relaxed">"{entry.translation}"</p>
              </div>

              {/* Scholarly Benefit / Virtue if recorded */}
              {entry.benefit && (
                <div className="mt-4 p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8A96B] shrink-0 mt-0.5" />
                  <span>{entry.benefit}</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
