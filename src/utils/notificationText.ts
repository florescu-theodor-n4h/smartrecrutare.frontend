import type { NotificationItem } from '@/services/notificationsApi'
import type { ComposerTranslation } from 'vue-i18n'

export function getNotificationId(notification: NotificationItem): string {
  const id = notification.notificareId ?? notification.id
  return id == null ? '' : String(id)
}

export function isNotificationRead(notification: NotificationItem): boolean {
  return notification.read === true || notification.citita === true
}

export function getNotificationPlaceholders(
  notification: NotificationItem,
): Record<string, unknown> | undefined {
  return notification.substitutions ?? notification.placeholders ?? notification.data
}

export function resolveNotificationText(
  notification: NotificationItem,
  t: ComposerTranslation,
  te: (key: string) => boolean,
): string {
  const messageKey = notification.mesajId

  if (messageKey && te(messageKey)) {
    return t(messageKey, getNotificationPlaceholders(notification) ?? {})
  }

  if (typeof notification.message === 'string') {
    return notification.message
  }

  if (messageKey) {
    return messageKey
  }

  return t('notifications.fallbackMessage')
}
