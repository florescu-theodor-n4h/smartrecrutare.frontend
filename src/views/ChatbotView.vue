<template>
  <div class="chatbot-page">
    <h1>{{ t('chatbot.title') }}</h1>
    <div class="grid">
      <ConversationList
        :title="t('chatbot.conversations')"
        :create-label="t('chatbot.newConversation')"
        :loading-label="t('messages.loading')"
        :empty-label="t('chatbot.emptyConversations')"
        :loading="loadingConversations"
        :creating="creatingConversation"
        :error="conversationError"
        :active-id="activeConversationId"
        :conversations="conversations"
        @create="createConversation"
        @select="openConversation"
      />

      <ChatWindow
        :title="activeConversationTitle"
        :loading-label="t('messages.loading')"
        :empty-label="t('chatbot.emptyMessages')"
        :placeholder="t('chatbot.inputPlaceholder')"
        :send-label="t('chatbot.send')"
        :retry-label="t('chatbot.retry')"
        :load-more-label="t('chatbot.loadMore')"
        :loading="loadingMessages"
        :sending="sending"
        :show-load-more="hasMoreMessages"
        :error="messageError"
        :messages="messages"
        @send="sendMessage"
        @retry="sendMessage"
        @load-more="loadMoreMessages"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConversationList from '@/components/chat/ConversationList.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import {
  gptRobotApi,
  type ConversationMessage,
  type ConversationSummary,
  type PagedMessagesResponse,
} from '@/services/gptRobotApi'

const { t } = useI18n()
const ACTIVE_CONVERSATION_KEY = 'chatbot.activeConversationId'
const PAGE_SIZE = 20

const conversations = ref<ConversationSummary[]>([])
const messages = ref<ConversationMessage[]>([])

const loadingConversations = ref(false)
const creatingConversation = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)

const conversationError = ref('')
const messageError = ref('')

const activeConversationId = ref(localStorage.getItem(ACTIVE_CONVERSATION_KEY) || '')
const messagesPage = ref(0)
const hasMoreMessages = ref(false)

const activeConversationTitle = computed(() => {
  const active = conversations.value.find(
    (item) => conversationId(item) === activeConversationId.value,
  )

  if (active?.title) {
    return active.title
  }

  return activeConversationId.value
    ? `${t('chatbot.conversation')} #${activeConversationId.value}`
    : t('chatbot.noConversationSelected')
})

onMounted(async () => {
  await loadConversations()

  if (activeConversationId.value) {
    await loadMessages(0)
  }
})

async function loadConversations(): Promise<void> {
  loadingConversations.value = true
  conversationError.value = ''

  try {
    const res = await gptRobotApi.listConversations()
    conversations.value = Array.isArray(res.data) ? res.data : []

    if (!activeConversationId.value && conversations.value.length > 0) {
      const firstConversation = conversations.value[0]
      if (firstConversation) {
        activeConversationId.value = conversationId(firstConversation)
        persistActiveConversation()
        await loadMessages(0)
      }
    }
  } catch (err) {
    console.error(err)
    conversationError.value = t('chatbot.errors.loadConversations')
  } finally {
    loadingConversations.value = false
  }
}

async function createConversation(): Promise<void> {
  creatingConversation.value = true
  conversationError.value = ''

  try {
    const response = await gptRobotApi.createConversation({})
    const created = response.data

    await loadConversations()

    const id = conversationId(created)
    if (id) {
      activeConversationId.value = id
      persistActiveConversation()
      await loadMessages(0)
    }
  } catch (err) {
    console.error(err)
    conversationError.value = extractErrorMessage(err, t('chatbot.errors.createConversation'))
  } finally {
    creatingConversation.value = false
  }
}

async function openConversation(conversation: ConversationSummary): Promise<void> {
  const id = conversationId(conversation)
  if (!id || id === activeConversationId.value) {
    return
  }

  activeConversationId.value = id
  persistActiveConversation()
  await loadMessages(0)
}

async function loadMessages(page: number): Promise<void> {
  if (!activeConversationId.value) {
    messages.value = []
    return
  }

  loadingMessages.value = true
  messageError.value = ''

  try {
    const res = await gptRobotApi.listMessages(activeConversationId.value, {
      page,
      size: PAGE_SIZE,
    })

    const normalized = normalizePagedMessages(res.data)
    messagesPage.value = page
    hasMoreMessages.value = normalized.total > (page + 1) * PAGE_SIZE

    if (page === 0) {
      messages.value = normalized.items
    } else {
      const known = new Set(messages.value.map((item) => messageId(item)))
      const older = normalized.items.filter((item) => !known.has(messageId(item)))
      messages.value = [...older, ...messages.value]
    }
  } catch (err) {
    console.error(err)
    messageError.value = extractErrorMessage(err, t('chatbot.errors.loadMessages'))
  } finally {
    loadingMessages.value = false
  }
}

async function loadMoreMessages(): Promise<void> {
  await loadMessages(messagesPage.value + 1)
}

async function sendMessage(text: string): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed || sending.value) {
    return
  }

  messageError.value = ''
  sending.value = true

  const userLocalMessage: ConversationMessage = {
    messageId: `local-${Date.now()}`,
    role: 'user',
    content: trimmed,
    createdAt: new Date().toISOString(),
  }

  messages.value = [...messages.value, userLocalMessage]

  try {
    const response = await gptRobotApi.sendUserChat({
      conversationId: activeConversationId.value || undefined,
      message: trimmed,
    })

    const data = response.data
    const conversationFromResponse =
      findFirstString(data, ['conversationId', 'conversatieId']) ||
      findNestedString(data, ['conversation', 'id'])

    if (conversationFromResponse) {
      activeConversationId.value = conversationFromResponse
      persistActiveConversation()
    }

    const assistantMessage = normalizeAssistantMessage(data)
    if (assistantMessage) {
      messages.value = [...messages.value, assistantMessage]
    } else {
      await loadMessages(0)
    }

    await loadConversations()
  } catch (err) {
    console.error(err)
    messages.value = messages.value.filter((item) => item.messageId !== userLocalMessage.messageId)
    messageError.value = extractErrorMessage(err, t('chatbot.errors.sendMessage'))
  } finally {
    sending.value = false
  }
}

function normalizePagedMessages(data: PagedMessagesResponse): {
  items: ConversationMessage[]
  total: number
} {
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.content)
      ? data.content
      : Array.isArray(data)
        ? (data as ConversationMessage[])
        : []

  const totalCandidate =
    typeof data.total === 'number'
      ? data.total
      : typeof data.totalCount === 'number'
        ? data.totalCount
        : items.length

  return {
    items,
    total: totalCandidate,
  }
}

function normalizeAssistantMessage(data: Record<string, unknown>): ConversationMessage | null {
  const directText = findFirstString(data, ['response', 'reply', 'answer', 'message'])
  const nestedMessage = findNestedObject(data, ['assistantMessage', 'message'])

  if (nestedMessage && typeof nestedMessage === 'object') {
    const content = findFirstString(nestedMessage as Record<string, unknown>, ['content', 'text'])
    if (content) {
      return {
        ...(nestedMessage as ConversationMessage),
        role: 'assistant',
        content,
      }
    }
  }

  if (directText) {
    return {
      messageId: `assistant-${Date.now()}`,
      role: 'assistant',
      content: directText,
      createdAt: new Date().toISOString(),
    }
  }

  return null
}

function conversationId(conversation: ConversationSummary): string {
  const value = conversation.conversationId ?? conversation.id
  return value == null ? '' : String(value)
}

function messageId(message: ConversationMessage): string {
  const value = message.messageId ?? message.id
  return value == null ? '' : String(value)
}

function persistActiveConversation(): void {
  if (activeConversationId.value) {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId.value)
  } else {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeResponse = (error as { response?: { data?: unknown } }).response
    const payload = maybeResponse?.data

    if (typeof payload === 'string' && payload.trim()) {
      return payload
    }

    if (payload && typeof payload === 'object') {
      const message = findFirstString(payload as Record<string, unknown>, ['message', 'error'])
      if (message) {
        return message
      }

      const validation = (payload as { errors?: unknown }).errors
      if (validation && typeof validation === 'object') {
        return Object.values(validation as Record<string, unknown>)
          .map((value) => String(value))
          .join('; ')
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function findFirstString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return ''
}

function findNestedString(source: Record<string, unknown>, path: string[]): string {
  let cursor: unknown = source

  for (const key of path) {
    if (!cursor || typeof cursor !== 'object') {
      return ''
    }
    cursor = (cursor as Record<string, unknown>)[key]
  }

  return typeof cursor === 'string' ? cursor : ''
}

function findNestedObject(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = source[key]
    if (value && typeof value === 'object') {
      return value
    }
  }

  return null
}
</script>

<style scoped>
.chatbot-page {
  padding: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  gap: 1rem;
  margin-top: 1rem;
}
@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
