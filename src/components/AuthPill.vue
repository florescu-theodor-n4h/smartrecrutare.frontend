<template>
  <div class="auth-wrap">
    <button v-if="!isAuthenticated" class="auth-pill login" @click="openLoginModal">
      <span class="dot"></span>
      <span class="text">{{ loginLabel }}</span>
    </button>

    <button v-else class="auth-pill logout" @click="logoutUser">
      <span class="dot"></span>
      <span class="text">{{ t('authPill.logout') }}</span>
    </button>

    <div v-if="showLoginModal" class="local-login-overlay" @click.self="closeLoginModal">
      <div
        class="local-login-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="t('authPill.local.title')"
      >
        <header class="local-login-header">
          <div class="header-intro">
            <h3>{{ activeLocalActionTitle }}</h3>
            <p class="local-login-subtitle">{{ t('authPill.local.subtitle') }}</p>
            <div class="method-chips">
              <span v-if="isSsoAvailable" class="method-chip">{{
                t('authPill.enterprise.methodSso')
              }}</span>
              <span v-if="isLocalLoginAvailable" class="method-chip">{{
                t('authPill.enterprise.methodLocal')
              }}</span>
            </div>
          </div>

          <button
            type="button"
            class="modal-close"
            :aria-label="t('authPill.enterprise.close')"
            @click="closeLoginModal"
          >
            ×
          </button>

          <div
            v-if="showDualMode"
            class="local-login-tabs"
            role="tablist"
            :aria-label="t('authPill.local.tabsLabel')"
          >
            <button
              type="button"
              class="tab-pill"
              :class="{ active: dualTab === 'sso' }"
              @click="dualTab = 'sso'"
            >
              {{ t('authPill.sso.tab') }}
            </button>
            <button
              type="button"
              class="tab-pill"
              :class="{ active: dualTab === 'local' }"
              @click="dualTab = 'local'"
            >
              {{ t('authPill.local.loginTab') }}
            </button>
          </div>

          <div
            v-if="!showDualMode || dualTab === 'local'"
            class="local-login-tabs"
            role="tablist"
            :aria-label="t('authPill.local.tabsLabel')"
          >
            <button
              type="button"
              class="tab-pill"
              :class="{ active: activeLocalAction === 'login' }"
              @click="activeLocalAction = 'login'"
            >
              {{ t('authPill.local.loginTab') }}
            </button>
            <button
              type="button"
              class="tab-pill"
              :class="{ active: activeLocalAction === 'register' }"
              @click="activeLocalAction = 'register'"
            >
              {{ t('authPill.local.registerTab') }}
            </button>
          </div>
        </header>

        <div class="quick-actions" v-if="!showDualMode || dualTab === 'local'">
          <button
            type="button"
            class="quick-action"
            :class="{ active: activeLocalAction === 'login' }"
            @click="switchToLogin"
          >
            {{ t('authPill.local.loginTab') }}
          </button>
          <button
            type="button"
            class="quick-action"
            :class="{ active: activeLocalAction === 'register' }"
            @click="switchToRegister"
          >
            {{ t('authPill.local.registerTab') }}
          </button>
          <button type="button" class="quick-action" @click="clearActiveForm">
            {{ t('authPill.enterprise.clear') }}
          </button>
        </div>

        <template v-if="showDualMode && dualTab === 'sso'">
          <div class="sso-section">
            <span class="sso-icon" aria-hidden="true">🌐</span>
            <p class="sso-description">{{ t('authPill.sso.description') }}</p>
            <button
              type="button"
              class="local-action local-action-submit sso-btn"
              :disabled="submittingLocalLogin"
              @click="submitSsoLogin"
            >
              {{ t('authPill.sso.button') }}
            </button>
          </div>
        </template>

        <p v-if="showLocalDisclaimer" class="local-disclaimer">{{ localDisclaimer }}</p>

        <template v-if="(!showDualMode || dualTab === 'local') && activeLocalAction === 'register'">
          <label class="field-label" for="local-register-username">{{
            t('authPill.local.username')
          }}</label>
          <input
            id="local-register-username"
            v-model.trim="registerForm.username"
            class="field-input"
            type="text"
            autocomplete="username"
          />

          <label class="field-label" for="local-register-email">{{
            t('authPill.local.email')
          }}</label>
          <input
            id="local-register-email"
            v-model.trim="registerForm.email"
            class="field-input"
            type="email"
            autocomplete="email"
          />

          <label class="field-label" for="local-register-password">{{
            t('authPill.local.password')
          }}</label>
          <div class="field-row">
            <input
              id="local-register-password"
              v-model="registerForm.password"
              class="field-input"
              :type="showRegisterPassword ? 'text' : 'password'"
              autocomplete="new-password"
              @keydown.enter.prevent="submitLocalRegister"
            />
            <button
              type="button"
              class="field-toggle"
              @click="showRegisterPassword = !showRegisterPassword"
            >
              {{
                showRegisterPassword
                  ? t('authPill.enterprise.hidePassword')
                  : t('authPill.enterprise.showPassword')
              }}
            </button>
          </div>
        </template>

        <template v-else-if="!showDualMode || dualTab === 'local'">
          <label class="field-label" for="local-login-username">{{
            t('authPill.local.username')
          }}</label>
          <input
            id="local-login-username"
            v-model.trim="loginForm.username"
            class="field-input"
            type="text"
            autocomplete="username"
          />

          <label class="field-label" for="local-login-password">{{
            t('authPill.local.password')
          }}</label>
          <div class="field-row">
            <input
              id="local-login-password"
              v-model="loginForm.password"
              class="field-input"
              :type="showLoginPassword ? 'text' : 'password'"
              autocomplete="current-password"
              @keydown.enter.prevent="submitLocalLogin"
            />
            <button
              type="button"
              class="field-toggle"
              @click="showLoginPassword = !showLoginPassword"
            >
              {{
                showLoginPassword
                  ? t('authPill.enterprise.hidePassword')
                  : t('authPill.enterprise.showPassword')
              }}
            </button>
          </div>
        </template>

        <label
          v-if="showSaveSession && (!showDualMode || dualTab === 'local')"
          class="remember-label"
        >
          <input type="checkbox" v-model="saveSession" />
          {{ t('authPill.local.saveSession') }}
        </label>

        <p v-if="loginError" class="local-login-error">{{ loginError }}</p>

        <p class="security-note">{{ t('authPill.enterprise.securityNote') }}</p>

        <div v-if="!showDualMode || dualTab === 'local'" class="local-login-actions">
          <button
            type="button"
            class="local-action local-action-cancel"
            :disabled="submittingLocalLogin"
            @click="closeLoginModal"
          >
            {{ t('actions.cancel') }}
          </button>
          <button
            type="button"
            class="local-action local-action-submit"
            :disabled="submittingLocalLogin"
            @click="activeLocalAction === 'register' ? submitLocalRegister() : submitLocalLogin()"
          >
            {{
              submittingLocalLogin
                ? t('messages.loading')
                : activeLocalAction === 'register'
                  ? t('authPill.local.registerSubmit')
                  : t('authPill.local.submit')
            }}
          </button>
        </div>

        <div v-if="showDualMode && dualTab === 'sso'" class="local-login-actions">
          <button type="button" class="local-action local-action-cancel" @click="closeLoginModal">
            {{ t('actions.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuthEnvironmentConfig, getPreferredAuthMode } from '@/services/auth'
import { AuthLoginService, useAuthLoginPlugin } from '@/services/auth.contract'
import { createSecondaryAuth0LoginService } from '@/services/auth_auth0'
import { createLocalAuthLoginPlugin } from '@/services/server-auth-user-pass'

const masterAuthPlugin: AuthLoginService = useAuthLoginPlugin()
const { t } = useI18n()

const authConfig = getAuthEnvironmentConfig(import.meta.env)
const authMode = getPreferredAuthMode(authConfig)
const isLocalMode = computed(() => authMode === 'local')
const isLocalLoginAvailable = authConfig.VITE_DISABLE_LOCAL_LOGIN !== 'true'
const secondarySsoService: AuthLoginService | null =
  authMode === 'local' ? createSecondaryAuth0LoginService() : null
const isSsoAvailable = authMode === 'auth0' || secondarySsoService !== null
const showDualMode = isLocalLoginAvailable && isSsoAvailable
const localService: AuthLoginService | null =
  authMode === 'auth0' && isLocalLoginAvailable ? createLocalAuthLoginPlugin() : null
const localAuthService = computed<AuthLoginService | null>(() =>
  isLocalMode.value ? masterAuthPlugin : localService,
)
const isAuthenticated = computed(
  () =>
    masterAuthPlugin.isAuthenticated.value || secondarySsoService?.isAuthenticated.value === true,
)

const showLoginModal = ref(false)
const submittingLocalLogin = ref(false)
const loginError = ref('')
const activeLocalAction = ref<'login' | 'register'>('login')
const dualTab = ref<'sso' | 'local'>(showDualMode ? 'sso' : 'local')
const saveSession = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', email: '', password: '' })

const loginLabel = computed(() =>
  isLocalMode.value ? t('authPill.local.open') : t('authPill.login'),
)
const activeLocalActionTitle = computed(() =>
  activeLocalAction.value === 'register'
    ? t('authPill.local.registerTitle')
    : t('authPill.local.title'),
)
const localDisclaimer = computed(() => {
  return localAuthService.value?.getDisclaimer() ?? ''
})
const showLocalDisclaimer = computed(() => localDisclaimer.value.length > 0)
const showSaveSession = computed(() => localAuthService.value?.isLocalPiniaSaveable() ?? false)

function openLoginModal(): void {
  if (!isLocalMode.value && !showDualMode) {
    void masterAuthPlugin.loginWithRedirect()
    return
  }

  loginError.value = ''
  switchToLogin()
  dualTab.value = showDualMode ? 'sso' : 'local'
  saveSession.value = false
  showLoginPassword.value = false
  showRegisterPassword.value = false
  showLoginModal.value = true
}

function logoutUser(): void {
  const activeService = secondarySsoService?.isAuthenticated.value
    ? secondarySsoService
    : masterAuthPlugin
  void activeService.logout({ logoutParams: { returnTo: window.location.origin } })
}

function closeLoginModal(forceOrEvent: boolean | Event = false): void {
  const force = typeof forceOrEvent === 'boolean' ? forceOrEvent : false

  if (submittingLocalLogin.value && !force) {
    return
  }

  masterAuthPlugin.setSavingUserIntention(false)
  showLoginModal.value = false
  loginError.value = ''
  clearForms()
}

function clearForms(): void {
  loginForm.value = { username: '', password: '' }
  registerForm.value = { username: '', email: '', password: '' }
}

function clearActiveForm(): void {
  loginError.value = ''
  if (activeLocalAction.value === 'register') {
    registerForm.value = { username: '', email: '', password: '' }
    showRegisterPassword.value = false
    return
  }

  loginForm.value = { username: '', password: '' }
  showLoginPassword.value = false
}

function switchToLogin(): void {
  activeLocalAction.value = 'login'
  loginError.value = ''
}

function switchToRegister(): void {
  activeLocalAction.value = 'register'
  loginError.value = ''
}

function onEscapeKey(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !showLoginModal.value) {
    return
  }

  closeLoginModal()
}

onMounted(() => {
  document.addEventListener('keydown', onEscapeKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEscapeKey)
})

/*
 * Inchide automat modalul cand autentificarea devine activa.
 * Acopera cazurile in care plugin-ul actualizeaza starea asincron
 * dupa rezolvarea promisiunii loginWithRedirect.
 */
watch(isAuthenticated, (authenticated) => {
  if (authenticated && showLoginModal.value) {
    closeLoginModal(true)
  }
})

async function submitSsoLogin(): Promise<void> {
  submittingLocalLogin.value = true
  try {
    const activeService = authMode === 'auth0' ? masterAuthPlugin : secondarySsoService
    await activeService?.loginWithRedirect()
  } finally {
    submittingLocalLogin.value = false
  }
}

async function submitLocalLogin(): Promise<void> {
  if (!loginForm.value.username || !loginForm.value.password) {
    loginError.value = t('authPill.local.validation')
    return
  }

  submittingLocalLogin.value = true
  loginError.value = ''
  const activeService = localAuthService.value

  if (!activeService) {
    loginError.value = t('authPill.local.loginFailed')
    submittingLocalLogin.value = false
    return
  }

  try {
    activeService.setSavingUserIntention(saveSession.value)
    await activeService.loginWithRedirect({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    if (localService) {
      masterAuthPlugin.saveLoginStatus(true)
    }
    closeLoginModal(true)
  } catch {
    loginError.value = t('authPill.local.loginFailed')
  } finally {
    submittingLocalLogin.value = false
  }
}

async function submitLocalRegister(): Promise<void> {
  if (!registerForm.value.username || !registerForm.value.email || !registerForm.value.password) {
    loginError.value = t('authPill.local.registerValidation')
    return
  }

  submittingLocalLogin.value = true
  loginError.value = ''
  const activeService = localAuthService.value

  if (!activeService) {
    loginError.value = t('authPill.local.registerFailed')
    submittingLocalLogin.value = false
    return
  }

  try {
    await activeService.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
    })
    closeLoginModal(true)
  } catch {
    loginError.value = t('authPill.local.registerFailed')
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

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.login {
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  color: white;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.logout {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
}

.auth-pill:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.05);
}

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
  width: min(480px, 100%);
  border-radius: 18px;
  padding: 1.2rem;
  border: 1px solid #cfd8ea;
  background: #ffffff;
  box-shadow: 0 20px 45px rgba(10, 20, 40, 0.25);
  display: grid;
  gap: 0.6rem;
}

.local-login-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.header-intro {
  display: grid;
  gap: 0.35rem;
}

.method-chips {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.method-chip {
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: #eef4ff;
  color: #2e4a78;
  border: 1px solid #cfddf8;
}

.modal-close {
  border: 1px solid #d3dced;
  border-radius: 8px;
  background: #fff;
  color: #516386;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  line-height: 1;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.quick-action {
  border: 1px solid #d3dced;
  border-radius: 999px;
  background: #f7f9fd;
  color: #334264;
  font-size: 0.8rem;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
}

.quick-action.active {
  background: #0b5cff;
  border-color: #0b5cff;
  color: #fff;
}

.local-login-tabs {
  display: flex;
  gap: 0.45rem;
}

.tab-pill {
  border: 1px solid #c7d1e6;
  background: #f6f8fc;
  color: #2f405f;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.tab-pill.active {
  background: #0b5cff;
  border-color: #0b5cff;
  color: #fff;
}

.local-login-modal h3 {
  margin: 0;
}

.local-login-subtitle {
  margin: 0;
  color: #5f6f8f;
}

.local-disclaimer {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: #f6f8fc;
  border: 1px solid #d9e3f3;
  color: #41506d;
  font-size: 0.85rem;
}

.sso-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  text-align: center;
}

.sso-icon {
  font-size: 2.5rem;
}

.sso-description {
  margin: 0;
  color: #5f6f8f;
  font-size: 0.9rem;
}

.sso-btn {
  width: 100%;
  max-width: 280px;
  justify-content: center;
  font-size: 1rem;
  padding: 0.65rem 1rem;
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

.field-row {
  display: flex;
  gap: 0.45rem;
}

.field-toggle {
  border: 1px solid #d3dced;
  border-radius: 10px;
  background: #f6f8fc;
  color: #334264;
  font-size: 0.78rem;
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  white-space: nowrap;
}

.field-input:focus {
  outline: 2px solid rgba(11, 92, 255, 0.28);
  outline-offset: 1px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #334264;
  cursor: pointer;
}

.local-login-error {
  margin: 0.2rem 0;
  color: #b3261e;
}

.security-note {
  margin: 0;
  font-size: 0.78rem;
  color: #5f6f8f;
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
