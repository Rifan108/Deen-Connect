# Deen Connect (دين كونكت)

> **"Find Peace in Every Moment."**  
> An editorial-style, production-grade Islamic digital platform designed with architectural minimalism, verified geospatial location intelligence, authentic Islamic APIs, and real audio streaming.

---

## Production Architecture & Data Sovereignty

Deen Connect is built on the strict principle of **verifiable authenticity and zero simulated data**:
- **Centralized Location Context**: Real GPS via `navigator.geolocation` with Nominatim reverse-geocoding, worldwide city search, accuracy radius, and clear permission states.
- **Astronomical Prayer Calculations**: Powered by the official [AlAdhan API](https://aladhan.com/prayer-times-api) using actual coordinates, user-configurable calculation conventions (Karachi, MWL, ISNA, Umm Al-Qura, Egyptian, Tehran, etc.), Asr juristic school (Shafi / Hanafi), and second-by-second countdown.
- **Geodesic Qibla Direction**: Great-circle spherical trigonometry directly to the Holy Kaaba (`21.422487° N, 39.826206° E`), integrated with HTML5 device orientation magnetometer and static azimuth fallbacks for desktop.
- **Nearby Mosques Discovery**: Real geospatial places queries to OpenStreetMap Overpass API (`amenity=mosque`, `place_of_worship`, `religion=muslim`) across customizable radii (1km, 3km, 5km, 10km, 25km) rendered on an interactive Leaflet map.
- **Complete Quran (All 114 Surahs)**: Dedicated routes (`/quran` and `/quran/[surahSlug]`) with Medina Uthmani script and Saheeh International English translation via the AlQuran Cloud API.
- **Centralized Audio Recitation Engine**: Full-Surah and Ayah-by-Ayah streaming via authentic EveryAyah and QuranicAudio CDNs across 4 authentic Qaris (Mishary Al-Afasy, Abdul Basit Murattal & Mujawwad, Abdur-Rahman As-Sudais) with OS-level MediaSession API background controls.
- **Canonical Hadith System**: Full collection-wise, book-wise, and hadith-wise routing (`/hadith`, `/hadith/[collection]`, `/hadith/[collection]/[bookId]`, `/hadith/[collection]/[bookId]/[hadithNumber]`) covering Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, and Sunan Ibn Majah.
- **Authentic Adhkar & Sunnah**: Sourced from Hisn al-Muslim, Sahih al-Bukhari, and Sahih Muslim with repetition counts, Arabic, transliteration, and benefits.

---

## Routing Structure

```text
/                                -> Landing redirect to /home
/home                            -> Editorial Hero with GPS countdown & Category Explorer
/quran                           -> Quran Landing: 114 Surahs catalog, Juz tabs, bookmarks
/quran/[surahSlug]               -> Individual Surah Reader (e.g. /quran/al-fatihah, /quran/1)
/hadith                          -> Hadith Library: Kutub al-Sittah canonical collections
/hadith/[collection]             -> Thematic books catalog (e.g. /hadith/bukhari)
/hadith/[collection]/[bookId]    -> Narrations in book (e.g. /hadith/bukhari/1)
/hadith/[col]/[book]/[hadith]    -> Individual Hadith page (e.g. /hadith/bukhari/1/1)
/feature?type=prayer-times       -> Complete prayer timetable & calculation settings
/feature?type=qibla              -> Geodesic Qibla Compass
/feature?type=mosques            -> OpenStreetMap Nearby Mosques & Leaflet Map
/feature?type=dikr-counter       -> Tactile Tasbih Counter with acoustic knock
/feature?type=daily-dhikr        -> Authentic Morning, Evening, and Daily Adhkar
/feature?type=sunnah-tips        -> 8 categories of Prophetic traditions
/feature?type=zakat              -> Nisab and multi-asset Zakat valuation
/feature?type=hajj               -> Interactive Hajj & Umrah ritual guide
/feature?type=analytics          -> Recharts Spiritual Progress Dashboard
/dashboard                       -> Daily Consistency Dashboard & 5-Prayer Tracker
/about                           -> Digital Sanctuary Manifesto & Principles
/api/prayer-times                -> Server-side cached proxy to AlAdhan API
/api/hijri-date                  -> Lunar Hijri astronomical date resolution
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & React 19 |
| **Geospatial & Maps** | [Leaflet](https://leafletjs.com/), OpenStreetMap Overpass API, Nominatim |
| **Styling & Tokens** | [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens |
| **Component Primitives** | [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Motion & Interaction** | [GSAP](https://greensock.com/gsap/) (ScrollTrigger) & [Framer Motion](https://www.framer.com/motion/) |
| **Audio Streaming** | HTML5 Audio + Web Audio API + MediaSession API + EveryAyah CDN |
| **Content APIs** | AlAdhan API, AlQuran Cloud API, FawazAhmed0 Hadith Repository |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Typography** | Newsreader, Plus Jakarta Sans, Amiri |

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

### Production Build
```bash
npm run build
npm run start
```

---

## License

This project is licensed under the MIT License.
