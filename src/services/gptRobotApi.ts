import { httpClient } from '@/services/httpClient'

type Uuid = string | number

type CreateConversationRequest = {
  title: string
  currentPrompt: string
}

type UpdateConversationRequest = {
  title: string
  currentPrompt: string
  version: number
}

type UpdatePromptRequest = {
  currentPrompt: string
  version: number
}

type CreateMessageRequest = {
  parentMessageId?: Uuid
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
}

type UpdateMessageRequest = {
  parentMessageId?: Uuid
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  version: number
}

type UserChatRequest = {
  conversationId?: Uuid
  parentMessageId?: Uuid
  title?: string
  currentPrompt?: string
} & ({ message: string } | { text: string })

type MessageCountResponse = {
  conversationId: Uuid
  count: number
}

interface ConversationSummary {
  id?: Uuid
  conversationId?: Uuid
  title?: string
  version?: number
  messageCount?: number
  totalMessages?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

interface ConversationMessage {
  id?: Uuid
  messageId?: Uuid
  conversationId?: Uuid
  role?: string
  content?: string
  text?: string
  version?: number
  createdAt?: string
  updatedAt?: string
  parentMessageId?: Uuid | null
  [key: string]: unknown
}

interface PagedMessagesResponse {
  items?: ConversationMessage[]
  content?: ConversationMessage[]
  total?: number
  totalCount?: number
  page?: number
  size?: number
  [key: string]: unknown
}

interface ListMessagesParams {
  page?: number
  size?: number
}

type VersionQuery = {
  params: {
    version: number
  }
}

function withVersion(version: number): VersionQuery {
  return {
    params: {
      version,
    },
  }
}

const gptRobotApi = {
  listConversations(params: { page?: number; size?: number } = {}) {
    if (params.page === undefined && params.size === undefined) {
      return httpClient.get<
        ConversationSummary[] | { conversations?: ConversationSummary[]; page?: Record<string, number> }
      >('/bot/gpt-robot/conversations')
    }

    return httpClient.get<
      ConversationSummary[] | { conversations?: ConversationSummary[]; page?: Record<string, number> }
    >('/bot/gpt-robot/conversations', { params })
  },

  createConversation(payload: Partial<CreateConversationRequest> = {}) {
    return httpClient.post<ConversationSummary>('/bot/gpt-robot/conversations', payload)
  },

  getConversation(conversationId: Uuid) {
    return httpClient.get<ConversationSummary>(`/bot/gpt-robot/conversations/${conversationId}`)
  },

  updateConversation(conversationId: Uuid, payload: Partial<UpdateConversationRequest>) {
    return httpClient.put<ConversationSummary>(
      `/bot/gpt-robot/conversations/${conversationId}`,
      payload,
    )
  },

  deleteConversation(conversationId: Uuid, version?: number) {
    return version === undefined
      ? httpClient.delete(`/bot/gpt-robot/conversations/${conversationId}`)
      : httpClient.delete(`/bot/gpt-robot/conversations/${conversationId}`, withVersion(version))
  },

  getConversationPrompt(conversationId: Uuid) {
    return httpClient.get<{ conversationId: Uuid; currentPrompt: string; version: number }>(
      `/bot/gpt-robot/conversations/${conversationId}/prompt`,
    )
  },

  updateConversationPrompt(conversationId: Uuid, payload: Partial<UpdatePromptRequest>) {
    return httpClient.put<{ conversationId: Uuid; currentPrompt: string; version: number }>(
      `/bot/gpt-robot/conversations/${conversationId}/prompt`,
      payload,
    )
  },

  listMessages(conversationId: Uuid, params: ListMessagesParams = {}) {
    return httpClient.get<PagedMessagesResponse>(
      `/bot/gpt-robot/conversations/${conversationId}/messages`,
      { params },
    )
  },

  createMessage(conversationId: Uuid, payload: Partial<CreateMessageRequest>) {
    return httpClient.post<ConversationMessage>(
      `/bot/gpt-robot/conversations/${conversationId}/messages`,
      payload,
    )
  },

  getMessage(conversationId: Uuid, messageId: Uuid) {
    return httpClient.get<ConversationMessage>(
      `/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`,
    )
  },

  updateMessage(
    conversationId: Uuid,
    messageId: Uuid,
    payload: Partial<UpdateMessageRequest>,
  ) {
    return httpClient.put<ConversationMessage>(
      `/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`,
      payload,
    )
  },

  deleteMessage(conversationId: Uuid, messageId: Uuid, version?: number) {
    return version === undefined
      ? httpClient.delete(`/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`)
      : httpClient.delete(
          `/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`,
          withVersion(version),
        )
  },

  countMessages(conversationId: Uuid) {
    return httpClient.get<MessageCountResponse>(
      `/bot/gpt-robot/conversations/${conversationId}/messages/count`,
    )
  },

  sendUserChat(payload: UserChatRequest) {
    return httpClient.post<{
      conversation?: ConversationSummary
      userMessage?: ConversationMessage
      assistantMessage?: ConversationMessage
    }>('/bot/gpt-robot/user-chat', payload)
  },

  optionsGptRobot() {
    return httpClient.options('/bot/gpt-robot')
  },
}

export type { ConversationMessage, ConversationSummary, ListMessagesParams, PagedMessagesResponse }
export { gptRobotApi }
