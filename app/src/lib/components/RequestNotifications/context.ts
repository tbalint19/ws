import { writable, derived, type Readable } from "svelte/store"

export type Notification = {
  id: number
  text: string | null
  type: "success" | "error" | "info"
}

export type NotificationCTX = {
  notifications: Readable<Notification[]>
  notify: (notification: Omit<Notification, 'id'>) => void
  report: () => void
  warn: () => void
}

export const createNotificationContext = (): NotificationCTX => {
  const _notifications = writable<(Notification)[]>([])

  const notify = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random()
    _notifications.update(n => [...n, { ...notification, id }])
    setTimeout(() => _notifications.update(n => n.filter(n => n.id !== id)), 3000)
  }

  const report = () => notify({ text: null, type: "success" })

  const warn = () => notify({ text: null, type: "error" })

  const notifications = derived(_notifications, (v) => v)

  return {
    notifications,
    notify,
    report,
    warn
  }
}