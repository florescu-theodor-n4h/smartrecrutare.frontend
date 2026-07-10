<template>
  <!-- Buton android flotant -->
  <div
    class="chatbot-hover-wrap"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <button
      class="android"
      type="button"
      :aria-label="label"
      :aria-expanded="panelOpen"
      @click="togglePanel"
    >
      <span class="halo" aria-hidden="true"></span>
      <span class="body" aria-hidden="true">
        <span class="antenna antenna-left"></span>
        <span class="antenna antenna-right"></span>
        <span class="head">
          <span class="eye"></span>
          <span class="eye"></span>
        </span>
        <span class="torso"></span>
        <span class="wing wing-left"></span>
        <span class="wing wing-right"></span>
      </span>
    </button>

    <!-- Tooltip hover (ascuns cand panoul e deschis) -->
    <Transition name="tooltip">
      <div
        v-if="showTooltip && !panelOpen"
        class="chatbot-popover"
        role="tooltip"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <strong>{{ label }}</strong>
        <p>{{ t('chatbot.widgetHint') }}</p>
      </div>
    </Transition>
  </div>

  <!-- Panou chat flotant — randat la nivel de body prin Teleport -->
  <Teleport to="#floating_panels">
    <!--<Teleport to="body"> -->
    <Transition name="panel">
      <div
        v-if="panelOpen"
        class="widget-panel global_secondary_popups"
        role="dialog"
        :aria-label="t('chatbot.title')"
        :class="{ dark: themeStore.dark }"
      >
        <!-- Header panou -->
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-avatar" aria-hidden="true">🤖</span>
            <span>{{ t('chatbot.title') }}</span>
            <span v-if="loadingConversations" class="widget-loading" aria-live="polite">…</span>
          </div>
          <div class="widget-header-actions">
            <button
              class="widget-icon-btn"
              type="button"
              :title="t('chatbot.newConversation')"
              :disabled="creatingConversation"
              @click="createConversation"
            >
              ✦
            </button>
            <button
              class="widget-icon-btn"
              type="button"
              :title="t('actions.cancel')"
              @click="panelOpen = false"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Bara de conversatii (tab-uri orizontale) -->
        <div class="widget-convbar" role="tablist" :aria-label="t('chatbot.conversations')">
          <button
            v-for="conv in conversations"
            :key="convKey(conv)"
            role="tab"
            :aria-selected="isConvActive(conv)"
            :class="['widget-conv-tab', { active: isConvActive(conv) }]"
            @click="openConversation(conv)"
          >
            {{ convTitle(conv) }}
          </button>
          <span
            v-if="conversations.length === 0 && !loadingConversations"
            class="widget-conv-empty"
          >
            {{ t('chatbot.emptyConversations') }}
          </span>
        </div>

        <!-- Fereastra de chat -->
        <div class="widget-chat-wrap">
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import { useChat } from '@/composables/useChat'
import type { ConversationSummary } from '@/services/gptRobotApi'
import { useThemeStore } from '@/stores/theme.store'
const themeStore = useThemeStore()

defineProps<{
  label: string
}>()

const { t } = useI18n()

const {
  conversations,
  messages,
  loadingConversations,
  creatingConversation,
  loadingMessages,
  sending,
  messageError,
  activeConversationId,
  hasMoreMessages,
  activeConversationTitle,
  initialize,
  createConversation,
  openConversation,
  loadMoreMessages,
  sendMessage,
  conversationId,
} = useChat()

/* --- stare UI widget --- */
const panelOpen = ref(false)
const showTooltip = ref(false)

/* --- toggle panou fara redirect --- */
function togglePanel(): void {
  panelOpen.value = !panelOpen.value
  showTooltip.value = false
}

/* --- utilitare conversatii pentru bara de tab-uri --- */
function convKey(conv: ConversationSummary): string {
  const id = conv.conversationId ?? conv.id
  return id == null ? Math.random().toString(36) : String(id)
}

function isConvActive(conv: ConversationSummary): boolean {
  return conversationId(conv) === activeConversationId.value
}

function convTitle(conv: ConversationSummary): string {
  if (conv.title) return conv.title
  const id = conv.conversationId ?? conv.id
  return id != null ? `#${String(id)}` : t('chatbot.conversation')
}

/* Initializare la montare (partajata cu ChatbotView via stare singleton) */
onMounted(() => {
  void initialize()
})
</script>

<style scoped>
/* ---- Buton android ---- */
.chatbot-hover-wrap {
  position: fixed;
  right: 1.25rem;
  bottom: 2.25rem;
  z-index: 50;
}

.android {
  width: 92px;
  height: 92px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  animation: drift 2.8s ease-in-out infinite;
}

.halo {
  position: absolute;
  inset: 8px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(95, 229, 255, 0.2) 0%, rgba(95, 229, 255, 0) 70%);
  filter: blur(0.5px);
}

.body {
  position: absolute;
  inset: 14px;
  display: block;
}

.head {
  position: absolute;
  left: 50%;
  top: 8px;
  width: 40px;
  height: 24px;
  transform: translateX(-50%);
  border-radius: 16px;
  background: linear-gradient(160deg, #8ef2ff, #3cb0ff);
  box-shadow:
    0 0 18px rgba(103, 230, 255, 0.6),
    inset 0 -2px 0 rgba(5, 39, 69, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.eye {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #07243b;
  box-shadow: 0 0 10px rgba(6, 28, 46, 0.7);
}

.torso {
  position: absolute;
  left: 50%;
  top: 34px;
  width: 34px;
  height: 27px;
  transform: translateX(-50%);
  border-radius: 10px;
  background: linear-gradient(160deg, #49c8ff, #1e7ef0);
  box-shadow:
    0 6px 15px rgba(4, 43, 76, 0.45),
    inset 0 -2px 0 rgba(2, 25, 44, 0.35);
}

.antenna {
  position: absolute;
  top: 0;
  width: 2px;
  height: 12px;
  background: #8cf4ff;
  transform-origin: bottom;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8ef2ff;
  box-shadow: 0 0 10px rgba(142, 242, 255, 0.8);
}

.antenna-left {
  left: 33px;
  transform: rotate(-20deg);
}

.antenna-right {
  right: 33px;
  transform: rotate(20deg);
}

.wing {
  position: absolute;
  top: 38px;
  width: 16px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(160deg, #8ef2ff, #3cb0ff);
  opacity: 0.85;
  animation: flutter 0.8s ease-in-out infinite alternate;
}

.wing-left {
  left: 12px;
}
.wing-right {
  right: 12px;
}

/* ---- Tooltip hover ---- */
.chatbot-popover {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.75rem);
  width: 220px;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  background: rgba(9, 19, 36, 0.95);
  color: #e9f7ff;
  box-shadow: 0 18px 36px rgba(8, 15, 28, 0.28);
  border: 1px solid rgba(142, 242, 255, 0.2);
  pointer-events: auto;
}

.chatbot-popover p {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: rgba(233, 247, 255, 0.82);
}

/* ---- Panou chat flotant ---- */
.widget-panel {
  position: fixed;
  right: 1.25rem;
  bottom: calc(2.25rem + 92px + 1rem);
  width: 370px;
  max-width: calc(100vw - 2.5rem);
  height: 520px;
  max-height: calc(100vh - 9rem);
  z-index: 200;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 24px 60px rgba(5, 15, 30, 0.32),
    0 4px 16px rgba(5, 15, 30, 0.18);
  border: 1px solid rgba(142, 242, 255, 0.18);
  /*background: #fff;*/
  background: var(--bg, #fff);
}

/* Header */
.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  background: linear-gradient(135deg, #0b1f3a, #0b4080);
  color: #e9f7ff;
  flex-shrink: 0;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.widget-avatar {
  font-size: 1.25rem;
}

.widget-loading {
  opacity: 0.65;
  font-size: 0.8rem;
  animation: blink 1s step-end infinite;
}

.widget-header-actions {
  display: flex;
  gap: 0.35rem;
}

.widget-icon-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 0;
  border-radius: 8px;
  color: #e9f7ff;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.widget-icon-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}
.widget-icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Bara conversatii */
.widget-convbar {
  display: flex;
  gap: 0.3rem;
  padding: 0.45rem 0.75rem;
  overflow-x: auto;
  scrollbar-width: none;
  background: var(--card-bg, #f8faff);
  flex-shrink: 0;
  border-bottom: 1px solid #dce5f5;
}

.widget-convbar::-webkit-scrollbar {
  display: none;
}

.widget-conv-tab {
  background: transparent;
  border: 1px solid #c8d7f0;
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.78rem;
  white-space: nowrap;
  cursor: pointer;
  color: color-mix(in srgb, #2f4a7a 75%, var(--bg));
  transition: background 0.15s;
  flex-shrink: 0;
}

.widget-conv-tab.active {
  background: color-mix(in srgb, #0b5cff 85%, var(--bg));
  border-color: color-mix(in srgb, #0b5cff 85%, var(--bg));
  color: color-mix(in srgb, #fff 92%, var(--bg));
}

.widget-conv-tab:hover {
  background: color-mix(in srgb, #dce8ff 65%, var(--bg));
}

.widget-conv-empty {
  font-size: 0.8rem;
  color: #7a8fb5;
  white-space: nowrap;
  padding: 0.15rem 0;
}

/* Zona ChatWindow */
.widget-chat-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Suprascrie stiluri ChatWindow pentru mod compact */
.widget-chat-wrap :deep(.chat-window) {
  min-height: unset;
  height: 100%;
  border-radius: 0;
  border: 0;
  padding: 0;
}

.widget-chat-wrap :deep(.chat-header) {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e5ecf8;
  margin-bottom: 0;
  /*background: #f8faff;*/
  background: var(--card-bg, #f8faff);
}

.widget-chat-wrap :deep(.messages) {
  border-radius: 0;
  border: 0;
  border-bottom: 1px solid #e5ecf8;
  flex: 1;
  overflow-y: auto;
}

.widget-chat-wrap :deep(.composer) {
  padding: 0.5rem 0.75rem;
  margin-top: 0;
}

.widget-chat-wrap :deep(.input) {
  min-height: 56px;
}

/* ---- Animatii ---- */
@keyframes drift {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

@keyframes flutter {
  from {
    transform: scaleX(1);
    opacity: 0.7;
  }
  to {
    transform: scaleX(1.16);
    opacity: 1;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* Tranzitii panou */
.panel-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.22s ease;
}
.panel-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.18s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

/* Tranzitii tooltip */
.tooltip-enter-active {
  transition: opacity 0.15s ease;
}
.tooltip-leave-active {
  transition: opacity 0.1s ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.chatbot-hover-wrap {
  position: fixed;
  right: 1.25rem;
  bottom: 2.25rem;
  z-index: 50;
}

.android {
  width: 92px;
  height: 92px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  animation: drift 2.8s ease-in-out infinite;
}

.halo {
  position: absolute;
  inset: 8px;
  border-radius: 999px;
  /*background: radial-gradient(circle, rgba(95, 229, 255, 0.2) 0%, rgba(95, 229, 255, 0) 70%);*/
  background: radial-gradient(circle, rgb(95 229 255 / 20%) 0%, var(--bg) 70%);
  filter: blur(0.5px);
}

.body {
  position: absolute;
  inset: 14px;
  display: block;
}

.head {
  position: absolute;
  left: 50%;
  top: 8px;
  width: 40px;
  height: 24px;
  transform: translateX(-50%);
  border-radius: 16px;
  background: linear-gradient(160deg, #8ef2ff, var(--card-bg));
  box-shadow:
    0 0 18px rgba(103, 230, 255, 0.6),
    inset 0 -2px 0 rgba(5, 39, 69, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.eye {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, #1677b8 35%, var(--card-bg));
  box-shadow: 0 0 10px rgba(6, 28, 46, 0.7);
}

.torso {
  position: absolute;
  left: 50%;
  top: 34px;
  width: 34px;
  height: 27px;
  transform: translateX(-50%);
  border-radius: 10px;

  background: linear-gradient(
    160deg,
    color-mix(in srgb, #49c8ff 75%, var(--card-bg)),
    color-mix(in srgb, #1e7ef0 75%, var(--card-bg))
  );
  box-shadow:
    0 6px 15px rgba(4, 43, 76, 0.45),
    inset 0 -2px 0 rgba(2, 25, 44, 0.35);
}

.antenna {
  position: absolute;
  top: 0;
  width: 2px;
  height: 12px;
  background: #8cf4ff;
  transform-origin: bottom;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, #8cf4ff 75%, var(--bg));
  box-shadow: 0 0 10px rgba(142, 242, 255, 0.8);
}

.antenna-left {
  left: 33px;
  transform: rotate(-20deg);
}

.antenna-right {
  right: 33px;
  transform: rotate(20deg);
}

.wing {
  position: absolute;
  top: 38px;
  width: 16px;
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, #8ef2ff 75%, var(--bg));
  opacity: 0.85;
  animation: flutter 0.8s ease-in-out infinite alternate;
}

.wing-left {
  left: 12px;
}

.wing-right {
  right: 12px;
}

.chatbot-popover {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.75rem);
  width: 240px;
  border-radius: 16px;
  padding: 0.9rem 1rem;
  background: color-mix(in srgb, rgb(9 19 36 / 95%) 85%, var(--bg));
  color: #e9f7ff;
  box-shadow: 0 18px 36px rgba(8, 15, 28, 0.28);
  border: 1px solid rgba(142, 242, 255, 0.2);
}

.chatbot-popover p {
  margin: 0.35rem 0 0.75rem;
  line-height: 1.45;
  color: rgba(233, 247, 255, 0.82);
}

.chatbot-popover-action {
  border: 0;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #8ef2ff 75%, var(--bg)),
    color-mix(in srgb, #3cb0ff 75%, var(--bg))
  );
  color: #07243b;
  font-weight: 700;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

@keyframes drift {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

@keyframes flutter {
  from {
    transform: scaleX(1);
    opacity: 0.7;
  }
  to {
    transform: scaleX(1.16);
    opacity: 1;
  }
}
</style>
