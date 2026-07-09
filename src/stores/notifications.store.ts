import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { notificationsApi, type NotificationItem } from '@/services/notificationsApi'
import { getNotificationId, isNotificationRead } from '@/utils/notificationText'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<NotificationItem[]>([])
  const loading = ref(false)
  const error = ref('')

  const unreadCount = computed(
    () => items.value.filter((notification) => !isNotificationRead(notification)).length,
  )

  async function fetchMine(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const res = await notificationsApi.getMyNotifications()
      items.value = Array.isArray(res.data) ? res.data : []
    } catch (err) {
      console.error(err)
      error.value = 'notifications.loadFailed'
    } finally {
      loading.value = false
    }
  }

  async function markReadState(notification: NotificationItem, read: boolean): Promise<void> {
    const id = getNotificationId(notification)
    if (!id) {
      return
    }

    const previous = { ...notification }
    notification.read = read
    notification.citita = read

    const versiuneCurenta = typeof notification.versiune === 'number' ? notification.versiune : 0

    try {
      await notificationsApi.updateReadState(id, { versiune: versiuneCurenta })
    } catch (err) {
      console.error(err)
      notification.read = previous.read
      notification.citita = previous.citita
      error.value = 'notifications.updateFailed'
    }
  }

  return {
    items,
    loading,
    error,
    unreadCount,
    fetchMine,
    markReadState,
  }
})
