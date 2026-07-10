<template>
  <div class="notifications" ref="root">
    <button class="bell" type="button" @click="toggleOpen" :aria-label="t('notifications.title')">
      <span aria-hidden="true">🔔</span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <div v-if="open" class="panel">
      <header class="panel-header">
        <h3>{{ t('notifications.title') }}</h3>
        <button class="refresh" type="button" @click="refresh" :disabled="loading">
          {{ t('notifications.refresh') }}
        </button>
      </header>

      <div v-if="loading" class="state">{{ t('messages.loading') }}</div>
      <div v-else-if="error" class="state error">{{ t(error) }}</div>
      <div v-else-if="items.length === 0" class="state">{{ t('notifications.empty') }}</div>

      <ul v-else>
        <li v-for="notification in items" :key="notificationKey(notification)">
          <article class="notification" :class="{ unread: !isRead(notification) }">
            <p>{{ resolveNotificationText(notification, t, te) }}</p>
            <footer>
              <small v-if="notification.createdAt">{{ formatTime(notification.createdAt) }}</small>
              <button
                v-if="!isRead(notification)"
                type="button"
                class="mark"
                @click="markAsRead(notification)"
              >
                {{ t('notifications.markRead') }}
              </button>
            </footer>
          </article>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications.store'
import {
  getNotificationId,
  isNotificationRead,
  resolveNotificationText,
} from '@/utils/notificationText'
import type { NotificationItem } from '@/services/notificationsApi'

const store = useNotificationsStore()
const { t, te } = useI18n()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const items = computed(() => store.items)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const unreadCount = computed(() => store.unreadCount)

onMounted(() => {
  store.fetchMine()
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

function toggleOpen(): void {
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node | null
  if (!target || !root.value) {
    return
  }

  if (!root.value.contains(target)) {
    open.value = false
  }
}

function refresh(): void {
  store.fetchMine()
}

function notificationKey(notification: NotificationItem): string {
  return getNotificationId(notification)
}

function isRead(notification: NotificationItem): boolean {
  return isNotificationRead(notification)
}

function markAsRead(notification: NotificationItem): void {
  store.markReadState(notification, true)
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
</script>

<style scoped>
.notifications {
  position: relative;
}
.bell {
  border: 1px solid #c8d3e8;
  background: #fff;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  position: relative;
}
.badge {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #d1242f;
  color: #fff;
  font-size: 0.7rem;
  display: grid;
  place-items: center;
  padding: 0 4px;
}
.panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: min(380px, 92vw);
  max-height: 420px;
  overflow: auto;
  /*background: #fff;*/
  background: var(--bg, #fff);
  border: 1px solid #d7dfef;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(20, 40, 80, 0.15);
  padding: 0.75rem;
  z-index: 20;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}
.refresh {
  border: 0;
  background: #edf1f8;
  border-radius: 8px;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
.notification {
  border: 1px solid #e3e9f5;
  border-radius: 8px;
  padding: 0.55rem;
  display: grid;
  gap: 0.35rem;
}
.notification.unread {
  border-color: #9fc0ff;
  background: #f4f8ff;
}
.notification footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mark {
  border: 0;
  border-radius: 8px;
  background: #0b5cff;
  color: #fff;
  padding: 0.3rem 0.55rem;
  cursor: pointer;
}
.state {
  color: #5f6f8f;
}
.error {
  color: #b3261e;
}
</style>
