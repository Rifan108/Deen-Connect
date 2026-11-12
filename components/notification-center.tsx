"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { X, Bell } from "lucide-react"

export default function NotificationCenter() {
  const { notifications, clearNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-primary text-white p-4 rounded-lg shadow-lg animate-slide-in flex items-start justify-between"
        >
          <div className="flex items-start gap-3 flex-1">
            <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">{notif.title}</h3>
              <p className="text-sm opacity-90">{notif.body}</p>
            </div>
          </div>
          <button
            onClick={() => clearNotification(notif.id)}
            className="text-white/70 hover:text-white ml-2 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
