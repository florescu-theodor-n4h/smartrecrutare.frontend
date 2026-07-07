import { httpClient } from '@/services/httpClient'

export interface NotificationItem {
  id?: string | number
  notificareId?: string | number
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

export const notificationsApi = {
  getMyNotifications() {
    return httpClient.get<NotificationItem[]>('/api/analytics/notifications/me')
  },

  updateReadState(notificareId: string | number, payload: Record<string, unknown>) {
    return httpClient.put<NotificationItem>(
      `/api/analytics/notifications/me/${notificareId}/read-state`,
      payload,
    )
  },

  adminListNotifications() {
    return httpClient.get<NotificationItem[]>('/api/admin/analytics/notifications')
  },

  adminPublishNotification(payload: Record<string, unknown>) {
    return httpClient.post<NotificationItem>('/api/admin/analytics/notifications', payload)
  },
}
