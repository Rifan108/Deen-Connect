"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Disc3,
  SlidersHorizontal,
} from "lucide-react"
import { useAudioPlayer, RECITERS } from "@/components/audio-context"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function PersistentAudioPlayer() {
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
    isPlayerVisible,
    isMinimized,
    audioError,
    activeMode,
    currentAyahNumber,
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
  } = useAudioPlayer()

  const [showReciters, setShowReciters] = useState(false)
  const [showSpeed, setShowSpeed] = useState(false)

  if (!isPlayerVisible) return null

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      {isMinimized ? (
        // Minimized floating pill
        <motion.div
          key="minimized-player"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#123D32] text-[#F7F5EF] px-4 py-2.5 rounded-full shadow-2xl border border-[#C8A96B]/30 backdrop-blur-lg"
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={toggleMinimize}>
            <div className={`w-8 h-8 rounded-full bg-[#174C3D] flex items-center justify-center border border-[#C8A96B]/40 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }}>
              <Disc3 className="w-4 h-4 text-[#C8A96B]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-serif font-bold text-[#F7F5EF] line-clamp-1">
                {currentSurah.number}. {currentSurah.name}
              </p>
              <p className="text-[10px] text-[#A9B9A7]">{currentReciter.name.split(" ")[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-[#C8A96B] text-[#123D32] flex items-center justify-center hover:scale-105 active:scale-95 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={toggleMinimize}
              className="p-1 text-[#A9B9A7] hover:text-[#F7F5EF] transition"
              title="Expand player"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={closePlayer}
              className="p-1 text-[#A9B9A7] hover:text-rose-400 transition"
              title="Close player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ) : (
        // Full Persistent Bottom Dock
        <motion.div
          key="full-player"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-[#123D32]/95 text-[#F7F5EF] border-t border-[#C8A96B]/25 backdrop-blur-xl shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
        >
          {/* Subtle Top Progress Scrub Bar */}
          <div
            className="group relative h-1.5 w-full bg-[#174C3D] cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pos = (e.clientX - rect.left) / rect.width
              seekTo(pos * duration)
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#A9B9A7] via-[#C8A96B] to-[#C8A96B] transition-all relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F7F5EF] shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Left: Surah & Reciter Details */}
              <div className="flex items-center gap-3.5 w-full md:w-1/3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br from-[#174C3D] to-[#223128] border border-[#C8A96B]/30 flex items-center justify-center flex-shrink-0 shadow-inner ${
                    isPlaying ? "ring-2 ring-[#C8A96B]/40" : ""
                  }`}
                >
                  <span className="font-serif text-[#C8A96B] text-xs font-bold">{currentSurah.number}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-semibold text-[#F7F5EF] text-sm truncate">
                      {currentSurah.name}
                      {activeMode === "ayah" && currentAyahNumber !== null && (
                        <span className="text-[#C8A96B] font-mono text-xs ml-1.5 font-normal">
                          (Ayah {currentAyahNumber})
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] font-serif text-[#C8A96B] font-arabic" dir="rtl">
                      {currentSurah.arabicName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A9B9A7]">
                    <span className="truncate">{currentReciter.name}</span>
                    <span>•</span>
                    <button
                      onClick={() => setShowReciters(!showReciters)}
                      className="text-[#C8A96B] hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      Change reciter
                    </button>
                  </div>
                </div>
              </div>

              {/* Center: Playback Controls & Timers */}
              <div className="flex flex-col items-center gap-1.5 w-full md:w-1/3">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Repeat toggle */}
                  <button
                    onClick={() => {
                      if (repeatMode === "off") setRepeat("one")
                      else if (repeatMode === "one") setRepeat("all")
                      else setRepeat("off")
                    }}
                    className={`p-1.5 rounded-md transition ${
                      repeatMode !== "off"
                        ? "text-[#C8A96B] bg-[#174C3D]"
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
                    className="p-1.5 text-[#A9B9A7] hover:text-[#F7F5EF] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Previous Surah"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  {/* Main Play / Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-[#C8A96B] text-[#123D32] flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-[#C8A96B]/20"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Next Surah */}
                  <button
                    onClick={nextSurah}
                    disabled={currentSurah.number >= 114}
                    className="p-1.5 text-[#A9B9A7] hover:text-[#F7F5EF] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Next Surah"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  {/* Playback Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeed(!showSpeed)}
                      className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-[#174C3D] border border-white/10 text-[#C8A96B] hover:bg-[#223128] transition"
                    >
                      {playbackRate}x
                    </button>

                    {showSpeed && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#174C3D] border border-[#C8A96B]/30 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 z-50">
                        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setSpeed(rate)
                              setShowSpeed(false)
                            }}
                            className={`px-3 py-1 text-xs font-mono rounded text-left transition ${
                              playbackRate === rate
                                ? "bg-[#C8A96B] text-[#123D32] font-semibold"
                                : "text-[#F7F5EF] hover:bg-white/10"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Micro Time Display */}
                <div className="flex items-center gap-2 text-[11px] text-[#A9B9A7] font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                  {audioError && <span className="text-rose-400 font-sans ml-2 text-xs">{audioError}</span>}
                </div>
              </div>

              {/* Right: Volume & Drawer Actions */}
              <div className="flex items-center justify-end gap-3 w-full md:w-1/3">
                <div className="hidden sm:flex items-center gap-2 w-32">
                  <button
                    onClick={toggleMute}
                    className="text-[#A9B9A7] hover:text-[#F7F5EF] transition p-1"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-300" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setVolumeLevel(val[0] / 100)}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                  <button
                    onClick={toggleMinimize}
                    className="p-1.5 text-[#A9B9A7] hover:text-[#F7F5EF] rounded-md hover:bg-white/5 transition"
                    title="Minimize player"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closePlayer}
                    className="p-1.5 text-[#A9B9A7] hover:text-rose-400 rounded-md hover:bg-white/5 transition"
                    title="Close player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Reciter Picker Dropdown / Drawer */}
            <AnimatePresence>
              {showReciters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10 mt-3 pt-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wider font-semibold text-[#A9B9A7]">
                      Select Authentic Reciter
                    </p>
                    <button
                      onClick={() => setShowReciters(false)}
                      className="text-xs text-[#C8A96B] hover:underline"
                    >
                      Done
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {RECITERS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          selectReciter(r.id)
                          setShowReciters(false)
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          currentReciter.id === r.id
                            ? "bg-[#174C3D] border-[#C8A96B] text-[#F7F5EF]"
                            : "bg-[#101A16]/50 border-white/10 text-[#A9B9A7] hover:bg-white/5 hover:text-[#F7F5EF]"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold">{r.name}</p>
                          <p className="text-[10px] text-[#A9B9A7]">{r.style}</p>
                        </div>
                        <span className="text-xs font-arabic text-[#C8A96B]">{r.arabicName.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

