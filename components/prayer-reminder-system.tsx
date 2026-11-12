"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, MapPin, Quote } from "lucide-react"

interface Reminder {
  id: string
  title: string
  time: string
  enabled: boolean
  type: "prayer" | "islamic" | "daily"
}

const dailyHadithQuotes = [
  { hadith: "Cleanliness is half of faith.", type: "Hadith" },
  { hadith: "The best of you are those who are best to their families.", type: "Hadith" },
  { hadith: "Seek knowledge from the cradle to the grave.", type: "Hadith" },
  { hadith: "A good word is like a good tree.", type: "Quran - Surah Ibrahim" },
  { hadith: "Indeed, with hardship comes ease.", type: "Quran - Surah Al-Inshirah" },
  { hadith: "The most complete of the believers in faith are the best of them in character.", type: "Hadith" },
  { hadith: "Do not let your tongue tire of remembering Allah.", type: "Hadith" },
  { hadith: "Kindness is a mark of faith.", type: "Hadith" },
]

import { useLocation } from "@/lib/location-context"
import { convertTo12Hour } from "@/lib/location"

export default function PrayerReminderSystem() {
  const { coords, locationDetails, status, requestGpsLocation } = useLocation()
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "fajr", title: "Fajr Prayer", time: "05:30 AM", enabled: true, type: "prayer" },
    { id: "dhuhr", title: "Dhuhr Prayer", time: "12:30 PM", enabled: true, type: "prayer" },
    { id: "asr", title: "Asr Prayer", time: "03:45 PM", enabled: true, type: "prayer" },
    { id: "maghrib", title: "Maghrib Prayer", time: "06:15 PM", enabled: true, type: "prayer" },
    { id: "isha", title: "Isha Prayer", time: "07:45 PM", enabled: true, type: "prayer" },
    { id: "daily-dikr", title: "Daily Dikr Reminder", time: "08:00 AM", enabled: true, type: "islamic" },
    { id: "daily-hadith", title: "Daily Hadith Quote", time: "09:00 AM", enabled: true, type: "islamic" },
    { id: "daily-quote", title: "Daily Islamic Quote", time: "06:00 PM", enabled: true, type: "daily" },
  ])

  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [todayHadith, setTodayHadith] = useState(dailyHadithQuotes[0])

  const updateReminderTimes = (timings: Record<string, string>) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === "fajr" && timings.Fajr) return { ...r, time: convertTo12Hour(timings.Fajr) }
        if (r.id === "dhuhr" && timings.Dhuhr) return { ...r, time: convertTo12Hour(timings.Dhuhr) }
        if (r.id === "asr" && timings.Asr) return { ...r, time: convertTo12Hour(timings.Asr) }
        if (r.id === "maghrib" && timings.Maghrib) return { ...r, time: convertTo12Hour(timings.Maghrib) }
        if (r.id === "isha" && timings.Isha) return { ...r, time: convertTo12Hour(timings.Isha) }
        return r
      })
    )
  }

  const fetchAndSyncPrayerTimes = async (lat: number, lon: number) => {
    try {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")
      const dateKey = `${year}-${month}-${day}`

      // Check cache first
      const saved = localStorage.getItem("deen_connect_timings")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.date === dateKey && parsed.timings) {
          updateReminderTimes(parsed.timings)
          return
        }
      }

      // Get calculation method from localStorage
      const method = typeof window !== "undefined" ? localStorage.getItem("deen_connect_method") || "2" : "2"
      // Fetch fresh from API
      const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=${method}`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = await res.json()
        if (data?.data?.timings) {
          const timings = data.data.timings
          updateReminderTimes(timings)

          // Save to cache
          const apiPrayers = [
            { name: "Fajr", time: convertTo12Hour(timings.Fajr), icon: "🌙" },
            { name: "Dhuhr", time: convertTo12Hour(timings.Dhuhr), icon: "☀️" },
            { name: "Asr", time: convertTo12Hour(timings.Asr), icon: "🌤️" },
            { name: "Maghrib", time: convertTo12Hour(timings.Maghrib), icon: "🌅" },
            { name: "Isha", time: convertTo12Hour(timings.Isha), icon: "🌙" },
          ]
          localStorage.setItem("deen_connect_timings", JSON.stringify({
            date: dateKey,
            timings: timings,
            prayers: apiPrayers,
          }))
        }
      }
    } catch (e) {
      console.warn("Error fetching or parsing timings in reminder system:", e)
    }
  }

  useEffect(() => {
    if (coords) {
      setLocationEnabled(true)
      fetchAndSyncPrayerTimes(coords.latitude, coords.longitude)
    }
  }, [coords])

  useEffect(() => {
    const today = new Date().getDate()
    setTodayHadith(dailyHadithQuotes[today % dailyHadithQuotes.length])

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationEnabled(true)
      }
    }

    const reminderInterval = setInterval(() => {
      const now = new Date()
      const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })

      reminders.forEach((reminder) => {
        if (reminder.enabled && reminder.time === currentTime && notificationEnabled) {
          sendReminderNotification(reminder)
        }
      })
    }, 60000) // Check every minute

    return () => clearInterval(reminderInterval)
  }, [reminders, notificationEnabled])

  const sendReminderNotification = (reminder: Reminder) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Deen Connect - ${reminder.title}`, {
        body: `It's time for ${reminder.title} at ${reminder.time}`,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23008B6B'/></svg>",
        tag: reminder.id,
        requireInteraction: true,
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationEnabled(true)
        new Notification("Deen Connect - Prayer Reminders Active", {
          body: "You will receive notifications for prayer times and daily reminders.",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23008B6B'/></svg>",
        })
      }
    }
  }

  const requestLocationPermission = async () => {
    const success = await requestGpsLocation()
    if (success) {
      setLocationEnabled(true)
    }
  }

  const toggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const groupedReminders = {
    prayer: reminders.filter((r) => r.type === "prayer"),
    islamic: reminders.filter((r) => r.type === "islamic"),
    daily: reminders.filter((r) => r.type === "daily"),
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!notificationEnabled && (
          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Enable Notifications</p>
                    <p className="text-sm text-muted-foreground">Get prayer time alerts</p>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={requestNotificationPermission}>
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!locationEnabled && (
          <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Enable Location</p>
                    <p className="text-sm text-muted-foreground">For accurate prayer times</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={requestLocationPermission}>
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-accent/50 bg-gradient-to-br from-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div>
              <p className="text-lg font-serif text-foreground italic">{todayHadith.hadith}</p>
              <p className="text-sm text-muted-foreground mt-2">{todayHadith.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Reminders */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded" />
          Prayer Time Reminders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groupedReminders.prayer.map((reminder) => (
            <Card key={reminder.id} className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">{reminder.time}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={reminder.enabled ? "default" : "outline"}
                    onClick={() => toggleReminder(reminder.id)}
                    className="gap-2"
                  >
                    {reminder.enabled ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Islamic Reminders */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-accent rounded" />
          Islamic Daily Reminders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groupedReminders.islamic.map((reminder) => (
            <Card key={reminder.id} className="border-accent/20 hover:border-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">{reminder.time}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={reminder.enabled ? "default" : "outline"}
                    onClick={() => toggleReminder(reminder.id)}
                    className="gap-2"
                  >
                    {reminder.enabled ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Daily Reminders */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-green-600 rounded" />
          Daily Task Reminders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groupedReminders.daily.map((reminder) => (
            <Card key={reminder.id} className="border-green-500/20 hover:border-green-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">{reminder.time}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={reminder.enabled ? "default" : "outline"}
                    onClick={() => toggleReminder(reminder.id)}
                    className="gap-2"
                  >
                    {reminder.enabled ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
