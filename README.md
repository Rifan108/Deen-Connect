# Deen Connect (دين كونكت)

> **"Find Peace in Every Moment."**  
> An editorial-style premium Islamic digital platform designed with Apple-level minimalism, contemporary Islamic architectural sensibility, and respectful spiritual utility.

---

## Overview

**Deen Connect** is a digital sanctuary engineered for daily Islamic practice, Quran study, worship tracking, and spiritual growth. It departs completely from generic dashboard templates in favor of a timeless editorial aesthetic:

- **Refined Typography**: Editorial headings set in *Newsreader*, interface typography in *Plus Jakarta Sans*, and authentic Quranic calligraphy in *Amiri*.
- **Restrained Color Palette**: Deep forest green (`#123D32`), emerald accents (`#174C3D`), warm ivory (`#F7F5EF`), and champagne gold (`#C8A96B`), paired with a nocturnal sanctuary dark theme (`#101A16`).
- **Tactile Micro-Interactions**: Smooth GSAP entrance timelines, Framer Motion component transitions, and Web Audio acoustic feedback.
- **Privacy & Local Sovereignty**: User data (prayers, streaks, dhikr counts, hifz retention, bookmarks) stays entirely within the user's browser via resilient local storage.

---

## Key Features

### 1. Editorial Homepage & Prayer Timetable
- **Hero Sanctuary**: Asymmetrical composition featuring real-time upcoming prayer countdown, Hijri lunar date (`1447 AH`), and GPS/network city detection.
- **Prayer Timetable**: Complete 5-daily prayer timetable (Fajr, Dhuhr, Asr, Maghrib, Isha) with customizable calculation conventions (MWL, ISNA, Umm al-Qura, Egyptian, Karachi, Tehran, Gulf).
- **Categorized Feature Explorer**: 5 distinct layout treatments across Quran, Worship, Daily Practice, Islamic Tools, and Personal Growth.

### 2. Quranic Reader & Tafsir
- Dual-edition Medina Uthmani Arabic script + Saheeh International translation across all 114 Surahs.
- Dynamic ayah-by-ayah font scaling, bookmarking, and instant recitation playback.
- Classical scholarly Tafsir exegesis commentary and live global Quranic word search.

### 3. Persistent Quran Audio Player
- Fixed bottom dock and floating mini-pill with session memory across route transitions.
- 4 authentic reciters: Sheikh Mishary Rashid Al-Afasy, Sheikh Abdul Basit (Murattal & Mujawwad), and Sheikh Abdur-Rahman As-Sudais.
- Interactive scrub bar, 0.75x–2.0x playback speed, repeat mode, volume slider, and track jumping.

### 4. Tactile Dhikr Tasbih Counter
- Circular SVG dial with smooth radial progress ring.
- Acoustic wood-tap audio feedback via Web Audio API, subtle device haptics, and milestone celebration confetti.
- Preset Adhkar (SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah, etc.), custom target thresholds, and historical session logs.

### 5. Spiritual Analytics & Worship Tracker
- **Recharts-powered Insights**: 7-day prayer consistency graphs, Quran study minutes, Dhikr volume trends, and Hifz retention tracking.
- **Prayer Streak Ledger**: Daily check-ins with individual prayer completion and cumulative streak counters.
- **Memorization (Hifz) Tracker**: Surah mastery tracking with revision date logs and retention confidence sliders.

### 6. Specialized Islamic Tools
- **Zakat Calculator**: Multi-asset valuation (Cash, Gold, Silver, Investments, Business Stock) against real-time Nisab benchmarks.
- **Hajj & Umrah Guide**: Interactive ritual timeline with locations, rites, and transliterated supplications.
- **Authentic Daily Adhkar & Sunnah Traditions**: Morning and evening remembrance with translation, benefits, and source attribution.
- **Hijri Lunar Calendar**: Gregorian to Islamic lunar event mapping.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & React 19 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens |
| **Component Primitives** | [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Motion & Interaction** | [GSAP](https://greensock.com/gsap/) (ScrollTrigger) & [Framer Motion](https://www.framer.com/motion/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Icons & Typography** | [Lucide React](https://lucide.dev/), Newsreader, Plus Jakarta Sans, Amiri |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Validation** | React Hook Form & Zod |

---

## Getting Started

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Rifan108/Deen-Connect.git
cd Deen-Connect

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## Project Structure

```text
├── app/
│   ├── globals.css              # Design tokens, typography styles & theme variables
│   ├── layout.tsx               # Root layout, Google Fonts, Theme & Audio providers
│   ├── home/page.tsx            # Editorial GSAP hero & categorized feature explorer
│   ├── dashboard/page.tsx       # Spiritual consistency dashboard & Recharts widgets
│   ├── about/page.tsx           # Digital sanctuary manifesto & architectural pillars
│   ├── feature/page.tsx         # Unified feature routing shell
│   └── api/                     # Server routes (prayer-times, hijri-date)
├── components/
│   ├── audio-context.tsx        # Global audio state & reciter switcher
│   ├── persistent-audio-player.tsx # Persistent bottom player & minimized pill
│   ├── site-nav.tsx             # Editorial header & navigation drawer
│   ├── location-prayer-times.tsx# Prayer timetable & calculation settings modal
│   ├── quran-surah-reader.tsx   # Dual Uthmani Arabic + English reader
│   ├── dikr-counter.tsx         # Tactile Tasbih with Web Audio & SVG ring
│   ├── progress-analytics.tsx   # Recharts charts with local storage ledger
│   ├── zakat-calculator.tsx     # Nisab and asset valuation calculator
│   ├── memorization-tracker.tsx # Hifz retention & revision logging
│   └── ui/                      # shadcn/ui and Radix primitives
└── public/                      # Static brand assets & icons
```

---

## License

This project is licensed under the MIT License.
