"use client"

import React, { useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Search,
  Disc3,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useAudioPlayer, RECITERS, SURAH_LIST } from "@/components/audio-context"

export default function AudioQuranPlayer() {
  const {
    currentSurah,
    currentReciter,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    repeatMode,
    isMuted,
    audioError,
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
  } = useAudioPlayer()

  const [searchQuery, setSearchQuery] = useState("")

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery.trim()
  )

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-border">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          Acoustic Sanctuary • Recitation
        </span>
        <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
          Noble Quran Audio Player
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xl">
          Listen to authentic, reverent Murattal recitations by renowned international Qaris with continuous playback across your entire session.
        </p>
      </div>

      {/* Main Player Display Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authentic Reciters Selection */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 border-border bg-card/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Authentic Reciters
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B]">
                Murattal Studio
              </span>
            </div>

            <div className="space-y-2">
              {RECITERS.map((r) => {
                const isSelected = currentReciter.id === r.id
                return (
                  <button
                    key={r.id}
                    onClick={() => selectReciter(r.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-[#123D32] text-[#F7F5EF] border-[#123D32] dark:bg-[#174C3D]"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <div>
                      <p className="font-serif font-semibold text-sm">{r.name}</p>
                      <p className={`text-[11px] ${isSelected ? "text-[#A9B9A7]" : "text-muted-foreground"}`}>
                        {r.style}
                      </p>
                    </div>
                    <span className={`font-arabic text-sm ${isSelected ? "text-[#C8A96B]" : "text-muted-foreground"}`}>
                      {r.arabicName.split(" ")[0]}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Audio Stage & Large Deck */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-8 border-border bg-gradient-to-b from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] rounded-3xl shadow-xl space-y-6">
            {/* Top Deck Info */}
            <div className="flex items-center justify-between text-xs text-[#A9B9A7]">
              <span className="font-mono uppercase tracking-widest text-[10px]">
                Surah {currentSurah.number} of 114
              </span>
              <span className="font-arabic text-sm text-[#C8A96B]" dir="rtl">
                {currentSurah.arabicName}
              </span>
            </div>

            {/* Current Surah Title */}
            <div className="text-center py-4 space-y-2">
              <div
                className={`w-16 h-16 rounded-full mx-auto bg-[#174C3D] border border-[#C8A96B]/40 flex items-center justify-center shadow-inner ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "12s" }}
              >
                <Disc3 className="w-8 h-8 text-[#C8A96B]" />
              </div>
              <h3 className="font-serif text-3xl font-light text-[#F7F5EF] tracking-tight">
                {currentSurah.name}
              </h3>
              <p className="text-xs text-[#A9B9A7]">
                Recited by <span className="text-[#F7F5EF] font-medium">{currentReciter.name}</span>
              </p>
            </div>

            {/* Scrubbable Audio Track */}
            <div className="space-y-2">
              <div
                className="group relative h-2 bg-[#101A16]/50 rounded-full cursor-pointer overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pos = (e.clientX - rect.left) / rect.width
                  seekTo(pos * duration)
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#A9B9A7] to-[#C8A96B] rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-[#A9B9A7]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls Deck */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Repeat Button */}
              <button
                onClick={() => {
                  if (repeatMode === "off") setRepeat("one")
                  else if (repeatMode === "one") setRepeat("all")
                  else setRepeat("off")
                }}
                className={`p-2 rounded-full transition ${
                  repeatMode !== "off"
                    ? "bg-[#C8A96B] text-[#123D32]"
                    : "text-[#A9B9A7] hover:text-[#F7F5EF]"
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>

              {/* Previous Surah */}
              <button
                onClick={previousSurah}
                disabled={currentSurah.number <= 1}
                className="p-2 text-[#A9B9A7] hover:text-[#F7F5EF] disabled:opacity-30 transition"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Central Big Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[#C8A96B] text-[#123D32] flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl shadow-[#C8A96B]/25"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              {/* Next Surah */}
              <button
                onClick={nextSurah}
                disabled={currentSurah.number >= 114}
                className="p-2 text-[#A9B9A7] hover:text-[#F7F5EF] disabled:opacity-30 transition"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Playback Speed selector */}
              <div className="flex items-center gap-1 bg-[#101A16]/50 rounded-full px-2.5 py-1 text-xs font-mono text-[#C8A96B] border border-white/10">
                {[1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded transition ${
                      playbackRate === spd ? "bg-[#C8A96B] text-[#123D32] font-bold" : "hover:text-[#F7F5EF]"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-3 pt-2 max-w-xs mx-auto">
              <button onClick={toggleMute} className="text-[#A9B9A7] hover:text-[#F7F5EF]">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(val) => setVolumeLevel(val[0] / 100)}
                className="w-40"
              />
            </div>

            {audioError && (
              <p className="text-center text-rose-300 text-xs font-medium">{audioError}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Surah Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-serif text-lg text-foreground font-medium">All 114 Surahs</h4>
            <p className="text-xs text-muted-foreground">Select any Surah to begin immediate playback</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter Surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-border bg-card focus:outline-none focus:ring-1 focus:ring-[#C8A96B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredSurahs.map((s) => {
            const isCurrent = currentSurah.number === s.number
            return (
              <button
                key={s.number}
                onClick={() => playSurah(s.number)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-20 ${
                  isCurrent
                    ? "bg-[#123D32] text-[#F7F5EF] border-[#C8A96B] dark:bg-[#174C3D] shadow-md"
                    : "bg-card border-border hover:border-[#C8A96B]/50 hover:bg-muted/60 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono ${isCurrent ? "text-[#C8A96B]" : "text-muted-foreground"}`}>
                    {s.number}
                  </span>
                  <span className={`font-arabic text-xs ${isCurrent ? "text-[#C8A96B]" : "text-muted-foreground"}`} dir="rtl">
                    {s.arabicName}
                  </span>
                </div>
                <div>
                  <p className="font-serif font-medium text-xs truncate">{s.name}</p>
                  <p className={`text-[10px] truncate ${isCurrent ? "text-[#A9B9A7]" : "text-muted-foreground"}`}>
                    {s.versesCount} verses
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
