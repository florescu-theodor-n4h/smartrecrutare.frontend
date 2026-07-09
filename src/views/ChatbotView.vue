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
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ConversationList from '@/components/chat/ConversationList.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import { useChat } from '@/composables/useChat'

const { t } = useI18n()

const {
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
  createConversation,
  openConversation,
  loadMoreMessages,
  sendMessage,
} = useChat()

onMounted(() => {
  void initialize()
})
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
