"use client"

import { useEffect, useState } from "react"

interface Notification {
  id: string
  title: string
  body: string
  type: "azan" | "quote" | "reminder"
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) return

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const sendNotification = (notification: Notification) => {
    if (permission === "granted") {
      new Notification(notification.title, {
        body: notification.body,
        icon: "/icon.svg",
      })
    }
    // Also show in-app notification
    setNotifications((prev) => [...prev, notification])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }, 5000)
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    permission,
    requestPermission,
    sendNotification,
    clearNotification,
  }
}
