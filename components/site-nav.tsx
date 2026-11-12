"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Compass,
  BookOpen,
  Clock,
  Heart,
  BarChart3,
  Layers,
  Menu,
  X,
  Sun,
  Moon,
  Volume2,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAudioPlayer } from "@/components/audio-context"
import { useLocation } from "@/lib/location-context"
import { LocationSelectorDialog } from "@/components/location-selector-dialog"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/home", label: "Overview" },
  { href: "/quran", label: "Quran" },
  { href: "/hadith", label: "Hadith" },
  { href: "/feature?type=prayer-times", label: "Prayer Times" },
  { href: "/feature?type=qibla", label: "Qibla" },
  { href: "/feature?type=mosques", label: "Mosques" },
  { href: "/feature?type=dikr-counter", label: "Tasbih" },
  { href: "/feature?type=analytics", label: "Analytics" },
  { href: "/about", label: "About" },
]

export function SiteNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isPlaying, currentSurah, toggleMinimize, isPlayerVisible } = useAudioPlayer()
  const { locationDetails, status } = useLocation()

  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-[0_4px_20px_rgba(18,61,50,0.03)]"
          : "bg-background/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Mark */}
          <Link href="/home" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#123D32] dark:bg-[#174C3D] border border-[#C8A96B]/40 flex items-center justify-center text-[#F7F5EF] shadow-sm transition-transform group-hover:scale-105">
              <span className="font-serif font-bold text-sm tracking-wider text-[#C8A96B]">د</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-tight font-medium text-foreground group-hover:text-[#123D32] dark:group-hover:text-[#C8A96B] transition-colors">
                Deen Connect
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground">
                Digital Sanctuary
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    active
                      ? "bg-[#123D32] text-[#F7F5EF] dark:bg-[#174C3D] dark:text-[#F7F5EF] shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Global Location Pill */}
            <LocationSelectorDialog>
              <button
                type="button"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-[#C8A96B]/50 transition bg-card/60 shadow-xs"
                title="Change or view detected location"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
                <span className="font-sans font-medium line-clamp-1 max-w-[120px]">
                  {locationDetails?.city || "Set Location"}
                </span>
              </button>
            </LocationSelectorDialog>
            {/* Audio Indicator if audio playing */}
            {isPlayerVisible && (
              <button
                onClick={toggleMinimize}
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#123D32]/10 dark:bg-[#C8A96B]/10 border border-[#C8A96B]/30 text-xs font-medium text-foreground hover:bg-[#123D32]/15 transition"
                title="Open audio player"
              >
                <span className={`w-2 h-2 rounded-full bg-[#C8A96B] ${isPlaying ? "animate-pulse" : ""}`} />
                <span className="font-serif text-[11px] truncate max-w-[100px]">
                  Surah {currentSurah.name}
                </span>
                <Volume2 className="w-3.5 h-3.5 text-[#C8A96B]" />
              </button>
            )}

            {/* Quick Action: Dashboard */}
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-medium border-border hover:border-[#C8A96B] hover:bg-[#123D32]/5 dark:hover:bg-[#174C3D]/20 transition"
              >
                Dashboard
              </Button>
            </Link>

            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#C8A96B]/40 hover:bg-muted transition"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-[#C8A96B]" /> : <Moon className="w-4 h-4 text-[#123D32]" />}
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition"
              aria-label="Open mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-border bg-background/95 backdrop-blur-lg px-4 pt-3 pb-6"
          >
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
                <LocationSelectorDialog>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl text-xs font-medium border-border"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C8A96B]" />
                      <span>Location: {locationDetails?.city || "Set Location"}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Change</span>
                  </Button>
                </LocationSelectorDialog>

                <Link href="/dashboard" className="w-full" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] rounded-xl text-xs font-medium">
                    Open Spiritual Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

