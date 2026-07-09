import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  gptRobotApi,
  type ConversationMessage,
  type ConversationSummary,
  type PagedMessagesResponse,
} from '@/services/gptRobotApi'

/* --------------------------------------------------------------------------
 * Stare singleton la nivel de modul — partajata intre ChatbotView si widget.
 * Astfel ambele componente afiseaza aceeasi conversatie activa.
 * -------------------------------------------------------------------------- */
const ACTIVE_CONVERSATION_KEY = 'chatbot.activeConversationId'
const PAGE_SIZE = 20

const initialized = ref(false)
const conversations = ref<ConversationSummary[]>([])
const messages = ref<ConversationMessage[]>([])
const loadingConversations = ref(false)
const creatingConversation = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const conversationError = ref('')
const messageError = ref('')
const activeConversationId = ref(
  typeof localStorage !== 'undefined' ? (localStorage.getItem(ACTIVE_CONVERSATION_KEY) ?? '') : '',
)
const messagesPage = ref(0)
const hasMoreMessages = ref(false)

/* --- utilitare identity --- */
function conversationId(conversation: ConversationSummary): string {
  const value = conversation.conversationId ?? conversation.id
  return value == null ? '' : String(value)
}

function messageId(message: ConversationMessage): string {
  const value = message.messageId ?? message.id
  return value == null ? '' : String(value)
}

function persistActiveConversation(): void {
  if (typeof localStorage === 'undefined') return
  if (activeConversationId.value) {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId.value)
  } else {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
  }
}

/* --- normalizare date --- */
function normalizeConversations(data: unknown): ConversationSummary[] {
  if (Array.isArray(data)) return data as ConversationSummary[]
  if (!data || typeof data !== 'object') return []
  const record = data as Record<string, unknown>
  if (Array.isArray(record.conversations)) return record.conversations as ConversationSummary[]
  if (Array.isArray(record.content)) return record.content as ConversationSummary[]
  if (Array.isArray(record.items)) return record.items as ConversationSummary[]
  return []
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
  const total =
    typeof data.total === 'number'
      ? data.total
      : typeof data.totalCount === 'number'
        ? data.totalCount
        : items.length
  return { items, total }
}

function normalizeAssistantMessage(data: Record<string, unknown>): ConversationMessage | null {
  const directText = findFirstString(data, ['response', 'reply', 'answer', 'message'])
  const nestedMessage = findNestedObject(data, ['assistantMessage', 'message'])
  if (nestedMessage && typeof nestedMessage === 'object') {
    const content = findFirstString(nestedMessage as Record<string, unknown>, ['content', 'text'])
    if (content) {
      return { ...(nestedMessage as ConversationMessage), role: 'assistant', content }
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

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeResponse = (error as { response?: { data?: unknown } }).response
    const payload = maybeResponse?.data
    if (typeof payload === 'string' && payload.trim()) return payload
    if (payload && typeof payload === 'object') {
      const msg = findFirstString(payload as Record<string, unknown>, ['message', 'error'])
      if (msg) return msg
      const validation = (payload as { errors?: unknown }).errors
      if (validation && typeof validation === 'object') {
        return Object.values(validation as Record<string, unknown>)
          .map((v) => String(v))
          .join('; ')
      }
    }
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function findFirstString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return ''
}

function findNestedString(source: Record<string, unknown>, path: string[]): string {
  let cursor: unknown = source
  for (const key of path) {
    if (!cursor || typeof cursor !== 'object') return ''
    cursor = (cursor as Record<string, unknown>)[key]
  }
  return typeof cursor === 'string' ? cursor : ''
}

function findNestedObject(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = source[key]
    if (value && typeof value === 'object') return value
  }
  return null
}

/* --------------------------------------------------------------------------
 * Composabila exportata — apelata in setup-ul fiecarei componente.
 * -------------------------------------------------------------------------- */
export function useChat() {
  const { t } = useI18n()

  /* Titlul conversatiei active afisat in header */
  const activeConversationTitle = computed(() => {
    const active = conversations.value.find(
      (item) => conversationId(item) === activeConversationId.value,
    )
    if (active?.title) return active.title
    return activeConversationId.value
      ? `${t('chatbot.conversation')} #${activeConversationId.value}`
      : t('chatbot.noConversationSelected')
  })

  /* Incarca lista de conversatii; selecteaza prima daca nu exista activa */
  async function loadConversations(): Promise<void> {
    loadingConversations.value = true
    conversationError.value = ''
    try {
      const res = await gptRobotApi.listConversations()
      conversations.value = normalizeConversations(res.data)
      if (!activeConversationId.value && conversations.value.length > 0) {
        const first = conversations.value[0]
        if (first) {
          activeConversationId.value = conversationId(first)
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

  /* Creeaza o conversatie noua si o activeaza */
  async function createConversation(): Promise<void> {
    creatingConversation.value = true
    conversationError.value = ''
    try {
      const res = await gptRobotApi.createConversation({
        title: t('chatbot.newConversation'),
        currentPrompt: '',
      })
      await loadConversations()
      const id = conversationId(res.data)
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

  /* Deschide o conversatie existenta */
  async function openConversation(conversation: ConversationSummary): Promise<void> {
    const id = conversationId(conversation)
    if (!id || id === activeConversationId.value) return
    activeConversationId.value = id
    persistActiveConversation()
    await loadMessages(0)
  }

  /* Incarca mesajele pentru conversatia activa */
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

  /* Trimite un mesaj si proceseaza raspunsul asistentului */
  async function sendMessage(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed || sending.value) return

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
      const convFromResponse =
        findFirstString(data, ['conversationId', 'conversatieId']) ||
        findNestedString(data, ['conversation', 'id'])

      if (convFromResponse) {
        activeConversationId.value = convFromResponse
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
      messages.value = messages.value.filter(
        (item) => item.messageId !== userLocalMessage.messageId,
      )
      messageError.value = extractErrorMessage(err, t('chatbot.errors.sendMessage'))
    } finally {
      sending.value = false
    }
  }

  /* Initializeaza starea chat la prima montare; ignorata la apeluri ulterioare */
  async function initialize(): Promise<void> {
    if (initialized.value) return
    initialized.value = true
    await loadConversations()
    if (activeConversationId.value) {
      await loadMessages(0)
    }
  }

  return {
    conversations,
    messages,
    loadingConversations,
    creatingConversation,
    loadingMessages,
    sending,
    conversationError,
    messageError,
    activeConversationId,
    hasMoreMessages,
    activeConversationTitle,
    initialize,
    loadConversations,
    createConversation,
    openConversation,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    /* utilitare pentru liste */
    conversationId,
    messageId,
  }
}
