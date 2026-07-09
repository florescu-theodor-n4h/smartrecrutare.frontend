<template>
  <div class="auth-wrap">
    <button v-if="!isAuthenticated" class="auth-pill login" @click="login">
      <span class="dot"></span>
      <span class="text">{{ loginLabel }}</span>
    </button>

    <button v-else class="auth-pill logout" @click="logoutUser">
      <span class="dot"></span>
      <span class="text">{{ t('authPill.logout') }}</span>
    </button>

    <div v-if="showLocalLoginModal" class="local-login-overlay" @click.self="closeLocalLoginModal">
      <div
        class="local-login-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="t('authPill.local.title')"
      >
        <h3>{{ t('authPill.local.title') }}</h3>
        <p class="local-login-subtitle">{{ t('authPill.local.subtitle') }}</p>

        <label class="field-label" for="local-login-username">
          {{ t('authPill.local.username') }}
        </label>
        <input
          id="local-login-username"
          v-model.trim="credentials.username"
          class="field-input"
          type="text"
          autocomplete="username"
        />

        <label class="field-label" for="local-login-password">
          {{ t('authPill.local.password') }}
        </label>
        <input
          id="local-login-password"
          v-model="credentials.password"
          class="field-input"
          type="password"
          autocomplete="current-password"
          @keydown.enter.prevent="submitLocalLogin"
        />

        <p v-if="localLoginError" class="local-login-error">{{ localLoginError }}</p>

        <div class="local-login-actions">
          <button
            type="button"
            class="local-action local-action-cancel"
            :disabled="submittingLocalLogin"
            @click="closeLocalLoginModal"
          >
            {{ t('actions.cancel') }}
          </button>
          <button
            type="button"
            class="local-action local-action-submit"
            :disabled="submittingLocalLogin"
            @click="submitLocalLogin"
          >
            {{ submittingLocalLogin ? t('messages.loading') : t('authPill.local.submit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuthEnvironmentConfig, getPreferredAuthMode } from '@/services/auth'
import { useAuthLoginPlugin, AuthLoginService } from '@/services/auth.contract'
//import { useAuth0 } from '@auth0/auth0-vue'

const masterAuthPlugin: AuthLoginService = useAuthLoginPlugin()
const isAuthenticated = masterAuthPlugin.isAuthenticated
const { t } = useI18n()

const authConfig = getAuthEnvironmentConfig(import.meta.env)
const authMode = getPreferredAuthMode(authConfig)
const isLocalMode = computed(() => authMode === 'local')

const showLocalLoginModal = ref(false)
const submittingLocalLogin = ref(false)
const localLoginError = ref('')
const credentials = ref({
  username: '',
  password: '',
})

const loginLabel = computed(() =>
  isLocalMode.value ? t('authPill.local.open') : t('authPill.login'),
)

function login() {
  if (isLocalMode.value) {
    localLoginError.value = ''
    showLocalLoginModal.value = true
    return
  }

  void masterAuthPlugin.loginWithRedirect()
}

function logoutUser() {
  void masterAuthPlugin.logout({ logoutParams: { returnTo: window.location.origin } })
}

function closeLocalLoginModal(): void {
  if (submittingLocalLogin.value) {
    return
  }

  showLocalLoginModal.value = false
  localLoginError.value = ''
}

async function submitLocalLogin(): Promise<void> {
  if (!credentials.value.username || !credentials.value.password) {
    localLoginError.value = t('authPill.local.validation')
    return
  }

  submittingLocalLogin.value = true
  localLoginError.value = ''

  try {
    await masterAuthPlugin.loginWithRedirect({
      username: credentials.value.username,
      password: credentials.value.password,
    })
    showLocalLoginModal.value = false
  } catch {
    localLoginError.value = t('authPill.local.loginFailed')
  } finally {
    submittingLocalLogin.value = false
  }
}
</script>

<style scoped>
.auth-wrap {
  display: flex;
  align-items: center;
}

/* shared pill */
.auth-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

/* animated glowing dot */
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

/* login style */
.login {
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  color: white;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

/* logout style */
.logout {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
}

/* hover interaction */
.auth-pill:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.05);
}

/* press effect */
.auth-pill:active {
  transform: translateY(0px) scale(0.98);
  filter: brightness(0.95);
}

.local-login-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 18, 30, 0.55);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.local-login-modal {
  width: min(460px, 100%);
  border-radius: 18px;
  padding: 1.2rem;
  border: 1px solid #cfd8ea;
  background: #ffffff;
  box-shadow: 0 20px 45px rgba(10, 20, 40, 0.25);
  display: grid;
  gap: 0.6rem;
}

.local-login-modal h3 {
  margin: 0;
}

.local-login-subtitle {
  margin: 0;
  color: #5f6f8f;
}

.field-label {
  font-size: 0.86rem;
  color: #334264;
}

.field-input {
  width: 100%;
  border: 1px solid #c7d1e6;
  border-radius: 10px;
  padding: 0.58rem 0.68rem;
  font: inherit;
}

.field-input:focus {
  outline: 2px solid rgba(11, 92, 255, 0.28);
  outline-offset: 1px;
}

.local-login-error {
  margin: 0.2rem 0;
  color: #b3261e;
}

.local-login-actions {
  margin-top: 0.3rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
}

.local-action {
  border-radius: 10px;
  border: 1px solid #c7d1e6;
  padding: 0.48rem 0.85rem;
  font: inherit;
  cursor: pointer;
}

.local-action-cancel {
  background: #f6f8fc;
  color: #2f405f;
}

.local-action-submit {
  background: #0b5cff;
  border-color: #0b5cff;
  color: #fff;
}

.local-action:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
