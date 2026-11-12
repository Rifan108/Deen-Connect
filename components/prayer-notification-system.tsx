"use client"

import { useEffect, useState } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Prayer {
  name: string
  time: string
}

export default function PrayerNotificationSystem() {
  const { requestPermission, sendNotification, permission } = useNotifications()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fetchTodaysPrayers = async () => {
      try {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, "0")
        const day = String(today.getDate()).padStart(2, "0")

        const response = await fetch(
          `/api/prayer-times?lat=24.7136&lng=46.6753&method=2&school=0`,
        )
        const data = await response.json()

        if (data.data?.timings) {
          const timings = data.data.timings
          const prayerList: Prayer[] = [
            { name: "Fajr", time: timings.Fajr },
            { name: "Dhuhr", time: timings.Dhuhr },
            { name: "Asr", time: timings.Asr },
            { name: "Maghrib", time: timings.Maghrib },
            { name: "Isha", time: timings.Isha },
          ]
          setPrayers(prayerList)
        }
      } catch (err) {
        console.log("[v0] Error fetching prayers:", err)
      }
    }

    fetchTodaysPrayers()
  }, [])

  useEffect(() => {
    if (!enabled || prayers.length === 0) return

    const checkPrayerTimes = () => {
      const now = new Date()
      const currentTime =
        now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")

      prayers.forEach((prayer) => {
        if (prayer.time === currentTime) {
          sendNotification({
            id: `prayer-${prayer.name}-${Date.now()}`,
            title: `It's time for ${prayer.name}`,
            body: `Don't forget to pray ${prayer.name} at ${prayer.time}`,
            type: "azan",
          })
        }
      })
    }

    const interval = setInterval(checkPrayerTimes, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [enabled, prayers, sendNotification])

  const handleEnableNotifications = async () => {
    if (permission !== "granted") {
      const result = await requestPermission()
      if (result === "granted") {
        setEnabled(true)
      }
    } else {
      setEnabled(!enabled)
    }
  }

  return (
    <Card className="p-6 bg-accent/10 border-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-accent" />
          <div>
            <h3 className="font-semibold text-foreground">Prayer Reminders</h3>
            <p className="text-sm text-muted-foreground">
              {enabled ? "Notifications enabled" : "Get reminders before each prayer"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleEnableNotifications}
          className={`${enabled ? "bg-accent text-white" : "bg-primary text-white"}`}
        >
          {enabled ? "Disable" : "Enable"}
        </Button>
      </div>
    </Card>
  )
}
