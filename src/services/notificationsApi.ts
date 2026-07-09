import { httpClient } from '@/services/httpClient'

interface NotificationItem {
  id?: string | number
  notificareId?: string | number
  versiune?: number
  mesajId?: string
  substitutions?: Record<string, unknown>
  placeholders?: Record<string, unknown>
  data?: Record<string, unknown>
  read?: boolean
  citita?: boolean
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

type NotificationReadStateRequest = {
  versiune: number
  read?: boolean
}

type NotificationPublishRequest = {
  destinatar: string
  mesajId: string
  substituenti?: Record<string, unknown>
  substitutions?: Record<string, unknown>
  placeholders?: Record<string, unknown>
  [key: string]: unknown
}

const notificationsApi = {
  getMyNotifications() {
    return httpClient.get<NotificationItem[]>('/api/analytics/notifications/me')
  },

  updateReadState(notificareId: string | number, payload: NotificationReadStateRequest) {
    return httpClient.put<NotificationItem>(
      `/api/analytics/notifications/me/${notificareId}/read-state`,
      payload,
    )
  },

  adminListNotifications() {
    return httpClient.get<NotificationItem[]>('/api/admin/analytics/notifications')
  },

  adminPublishNotification(payload: NotificationPublishRequest) {
    return httpClient.post<NotificationItem>('/api/admin/analytics/notifications', payload)
  },
}

export type { NotificationItem, NotificationPublishRequest, NotificationReadStateRequest }
export { notificationsApi }
