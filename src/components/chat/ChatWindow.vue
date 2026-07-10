<template>
  <section class="chat-window">
    <header class="chat-header">
      <h2>{{ title }}</h2>
      <button
        v-if="showLoadMore"
        class="btn-secondary"
        @click="$emit('load-more')"
        :disabled="loading"
      >
        {{ loadMoreLabel }}
      </button>
    </header>

    <div class="messages" ref="messagesRef">
      <div v-if="loading" class="state">{{ loadingLabel }}</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="messages.length === 0" class="state">{{ emptyLabel }}</div>

      <article
        v-for="message in messages"
        :key="messageKey(message)"
        class="message"
        :class="messageRole(message)"
      >
        <div class="line">
          <strong>{{ roleLabel(message) }}</strong>
          <span v-if="message.createdAt" class="timestamp">{{
            formatTime(message.createdAt)
          }}</span>
        </div>
        <p>{{ messageText(message) }}</p>
      </article>
    </div>

    <form class="composer" @submit.prevent="send">
      <textarea
        v-model="draft"
        class="input"
        :placeholder="placeholder"
        :disabled="sending"
        @keydown="onKeydown"
      />
      <div class="composer-actions">
        <button class="btn" type="submit" :disabled="sending || !canSend">{{ sendLabel }}</button>
        <button
          v-if="retryText"
          class="btn-secondary"
          type="button"
          @click="$emit('retry', retryText)"
        >
          {{ retryLabel }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ConversationMessage } from '@/services/gptRobotApi'

const props = defineProps<{
  title: string
  loadingLabel: string
  emptyLabel: string
  placeholder: string
  sendLabel: string
  retryLabel: string
  loadMoreLabel: string
  loading: boolean
  sending: boolean
  showLoadMore: boolean
  error: string
  messages: ConversationMessage[]
}>()

const emit = defineEmits<{
  send: [message: string]
  retry: [message: string]
  'load-more': []
}>()

const draft = ref('')
const retryText = ref('')
const messagesRef = ref<HTMLDivElement | null>(null)

const canSend = computed(() => draft.value.trim().length > 0)

watch(
  () => props.messages,
  () => {
    const lastUserMessage = [...props.messages]
      .reverse()
      .find((message) => messageRole(message) === 'user')

    retryText.value = lastUserMessage ? messageText(lastUserMessage) : ''

    const container = messagesRef.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  },
  { deep: true },
)

function send(): void {
  const text = draft.value.trim()
  if (!text || props.sending) {
    return
  }

  emit('send', text)
  draft.value = ''
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

function messageKey(message: ConversationMessage): string {
  const value = message.messageId ?? message.id
  if (value != null) {
    return String(value)
  }

  return `${message.role ?? 'message'}-${message.createdAt ?? ''}-${messageText(message)}`
}

function messageText(message: ConversationMessage): string {
  if (typeof message.content === 'string') {
    return message.content
  }
  if (typeof message.text === 'string') {
    return message.text
  }
  return ''
}

function messageRole(message: ConversationMessage): string {
  return (message.role || 'assistant').toLowerCase()
}

function roleLabel(message: ConversationMessage): string {
  const role = messageRole(message)
  if (role === 'user') {
    return 'You'
  }
  if (role === 'assistant') {
    return 'Robot'
  }
  return role
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
.chat-window {
  border: 1px solid #e4e8f3;
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.messages {
  flex: 1;
  overflow: auto;
  border: 1px solid #dbe2f0;
  border-radius: 8px;
  /*background: #fff;*/
  background: var(--bg, #fff);
  padding: 0.75rem;
  display: grid;
  gap: 0.6rem;
}
.message {
  border: 1px solid #e7ebf3;
  border-radius: 8px;
  padding: 0.6rem;
  background: var(--bg, #fff);
}
.message.user {
  border-color: #c8d7ff;
  background: var(--bg, #fff);
}
.message.assistant {
  border-color: #cde5d4;
  background: var(--bg, #fff);
}
.line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.2rem;
}
.timestamp {
  color: #60708f;
  font-size: 0.8rem;
}
.composer {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.6rem;
}
.input {
  min-height: 90px;
  width: 100%;
  border: 1px solid color-mix(in srgb, #cfd8e8 60%, var(--card-bg));
  border-radius: 8px;
  padding: 0.6rem;
  resize: vertical;
  font: inherit;
}
.composer-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.btn,
.btn-secondary {
  border: 0;
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
}
.btn {
  /*background: #0b5cff;*/
  background: var(--card-bg, #0b5cff);
  color: white;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  /*background: #e9edf7;*/
  background: var(--card-bg, #e9edf7);
  color: var(--text, #22314f);
}
.state {
  color: var(--text, #5f6f8f);
}
.error {
  color: var(--muted, #b3261e);
}
.composer .input {
  background: var(--bg);
  color: inherit;
}
</style>
