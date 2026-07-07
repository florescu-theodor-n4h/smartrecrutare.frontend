<template>
  <aside class="conversation-list">
    <div class="header">
      <h2>{{ title }}</h2>
      <button class="btn" @click="$emit('create')" :disabled="creating">{{ createLabel }}</button>
    </div>

    <div v-if="loading" class="state">{{ loadingLabel }}</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="conversations.length === 0" class="state">{{ emptyLabel }}</div>

    <ul v-else>
      <li v-for="conversation in conversations" :key="conversationKey(conversation)">
        <button
          class="item"
          :class="{ active: isActive(conversation) }"
          @click="$emit('select', conversation)"
        >
          <span class="name">{{ conversationTitle(conversation) }}</span>
          <span class="meta">{{ conversationCount(conversation) }}</span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { ConversationSummary } from '@/services/gptRobotApi'

const props = defineProps<{
  title: string
  createLabel: string
  loadingLabel: string
  emptyLabel: string
  loading: boolean
  creating: boolean
  error: string
  activeId: string
  conversations: ConversationSummary[]
}>()

defineEmits<{
  create: []
  select: [conversation: ConversationSummary]
}>()

function conversationKey(conversation: ConversationSummary): string {
  const value = conversation.conversationId ?? conversation.id
  return value == null ? Math.random().toString(36) : String(value)
}

function isActive(conversation: ConversationSummary): boolean {
  const value = conversation.conversationId ?? conversation.id
  return value != null && String(value) === props.activeId
}

function conversationTitle(conversation: ConversationSummary): string {
  return (
    conversation.title ||
    ((conversation.conversationId ?? conversation.id)
      ? `#${String(conversation.conversationId ?? conversation.id)}`
      : 'Conversation')
  )
}

function conversationCount(conversation: ConversationSummary): number {
  const value = conversation.messageCount ?? conversation.totalMessages
  return typeof value === 'number' ? value : 0
}
</script>

<style scoped>
.conversation-list {
  border: 1px solid #e4e8f3;
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--card-bg);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.btn {
  border: 0;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  background: #0b5cff;
  color: #fff;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}
.item {
  width: 100%;
  border: 1px solid #dbe2f0;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.item.active {
  border-color: #0b5cff;
  background: #edf3ff;
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta {
  color: #5f6f8f;
  font-size: 0.85rem;
}
.state {
  color: #5f6f8f;
  padding: 0.75rem 0.25rem;
}
.error {
  color: #b3261e;
}
@media (max-width: 860px) {
  .conversation-list {
    margin-bottom: 1rem;
  }
}
</style>
