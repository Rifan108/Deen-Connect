import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AudioPlayerProvider } from "@/components/audio-context"
import { PersistentAudioPlayer } from "@/components/persistent-audio-player"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Deen Connect — A Sanctuary for Quran, Prayer & Spiritual Practice",
  description:
    "An editorial Islamic digital platform crafted for Quran study, accurate prayer times, mindful remembrance, and personal spiritual growth.",
  keywords: ["Quran", "Prayer Times", "Adhan", "Tasbih", "Dhikr", "Zakat Calculator", "Hajj Guide", "Islamic Calendar"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#123D32" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AudioPlayerProvider>
            {children}
            <PersistentAudioPlayer />
            <Toaster position="bottom-right" richColors />
          </AudioPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
