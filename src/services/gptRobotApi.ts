import { httpClient } from '@/services/httpClient'

export interface ConversationSummary {
  id?: string | number
  conversationId?: string | number
  title?: string
  version?: number
  messageCount?: number
  totalMessages?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface ConversationMessage {
  id?: string | number
  messageId?: string | number
  conversationId?: string | number
  role?: string
  content?: string
  text?: string
  version?: number
  createdAt?: string
  updatedAt?: string
  parentId?: string | number | null
  [key: string]: unknown
}

export interface PagedMessagesResponse {
  items?: ConversationMessage[]
  content?: ConversationMessage[]
  total?: number
  totalCount?: number
  page?: number
  size?: number
  [key: string]: unknown
}

export interface ListMessagesParams {
  page?: number
  size?: number
}

export const gptRobotApi = {
  listConversations() {
    return httpClient.get<ConversationSummary[]>('/bot/gpt-robot/conversations')
  },

  createConversation(payload: Record<string, unknown> = {}) {
    return httpClient.post<ConversationSummary>('/bot/gpt-robot/conversations', payload)
  },

  getConversation(conversationId: string | number) {
    return httpClient.get<ConversationSummary>(`/bot/gpt-robot/conversations/${conversationId}`)
  },

  updateConversation(conversationId: string | number, payload: Record<string, unknown>) {
    return httpClient.put<ConversationSummary>(
      `/bot/gpt-robot/conversations/${conversationId}`,
      payload,
    )
  },

  deleteConversation(conversationId: string | number) {
    return httpClient.delete(`/bot/gpt-robot/conversations/${conversationId}`)
  },

  getConversationPrompt(conversationId: string | number) {
    return httpClient.get<Record<string, unknown>>(
      `/bot/gpt-robot/conversations/${conversationId}/prompt`,
    )
  },

  updateConversationPrompt(conversationId: string | number, payload: Record<string, unknown>) {
    return httpClient.put<Record<string, unknown>>(
      `/bot/gpt-robot/conversations/${conversationId}/prompt`,
      payload,
    )
  },

  listMessages(conversationId: string | number, params: ListMessagesParams = {}) {
    return httpClient.get<PagedMessagesResponse>(
      `/bot/gpt-robot/conversations/${conversationId}/messages`,
      { params },
    )
  },

  createMessage(conversationId: string | number, payload: Record<string, unknown>) {
    return httpClient.post<ConversationMessage>(
      `/bot/gpt-robot/conversations/${conversationId}/messages`,
      payload,
    )
  },

  getMessage(conversationId: string | number, messageId: string | number) {
    return httpClient.get<ConversationMessage>(
      `/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`,
    )
  },

  updateMessage(
    conversationId: string | number,
    messageId: string | number,
    payload: Record<string, unknown>,
  ) {
    return httpClient.put<ConversationMessage>(
      `/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`,
      payload,
    )
  },

  deleteMessage(conversationId: string | number, messageId: string | number) {
    return httpClient.delete(`/bot/gpt-robot/conversations/${conversationId}/messages/${messageId}`)
  },

  countMessages(conversationId: string | number) {
    return httpClient.get<number | Record<string, unknown>>(
      `/bot/gpt-robot/conversations/${conversationId}/messages/count`,
    )
  },

  sendUserChat(payload: Record<string, unknown>) {
    return httpClient.post<Record<string, unknown>>('/bot/gpt-robot/user-chat', payload)
  },
}
