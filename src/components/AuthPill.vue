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

    <!-- Modal de autentificare -->
    <div v-if="showLoginModal" class="local-login-overlay" @click.self="closeLoginModal">
      <div
        class="local-login-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="t('authPill.local.title')"
      >
        <header class="local-login-header">
          <div>
            <h3>{{ activeLocalActionTitle }}</h3>
            <p class="local-login-subtitle">{{ t('authPill.local.subtitle') }}</p>
          </div>

          <!-- Taburi principale: SSO | Local (numai in mod dual) -->
          <div v-if="showDualMode" class="local-login-tabs" role="tablist" :aria-label="'Mod autentificare'">
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

          <!-- Sub-taburi Local: Autentificare | Inregistrare -->
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

        <!-- Sectiune SSO (mod dual) -->
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

        <!-- Disclaimer (numai pentru autentificare locala) -->
        <p
          v-if="(!showDualMode || dualTab === 'local') && localDisclaimer"
          class="local-disclaimer"
        >
          {{ localDisclaimer }}
        </p>

        <!-- Formular Local: Inregistrare -->
        <template v-if="(!showDualMode || dualTab === 'local') && activeLocalAction === 'register'">
          <label class="field-label" for="local-register-username">
            {{ t('authPill.local.username') }}
          </label>
          <input
            id="local-register-username"
            v-model.trim="registerForm.username"
            class="field-input"
            type="text"
            autocomplete="username"
          />

          <label class="field-label" for="local-register-email">
            {{ t('authPill.local.email') }}
          </label>
          <input
            id="local-register-email"
            v-model.trim="registerForm.email"
            class="field-input"
            type="email"
            autocomplete="email"
          />

          <label class="field-label" for="local-register-password">
            {{ t('authPill.local.password') }}
          </label>
          <input
            id="local-register-password"
            v-model="registerForm.password"
            class="field-input"
            type="password"
            autocomplete="new-password"
            @keydown.enter.prevent="submitLocalRegister"
          />
        </template>

        <!-- Formular Local: Autentificare -->
        <template v-else-if="!showDualMode || dualTab === 'local'">
          <label class="field-label" for="local-login-username">
            {{ t('authPill.local.username') }}
          </label>
          <input
            id="local-login-username"
            v-model.trim="loginForm.username"
            class="field-input"
            type="text"
            autocomplete="username"
          />

          <label class="field-label" for="local-login-password">
            {{ t('authPill.local.password') }}
          </label>
          <input
            id="local-login-password"
            v-model="loginForm.password"
            class="field-input"
            type="password"
            autocomplete="current-password"
            @keydown.enter.prevent="submitLocalLogin"
          />
        </template>

        <!-- Checkbox "Tine-ma minte" (numai pentru formular local) -->
        <label
          v-if="showSaveSession && (!showDualMode || dualTab === 'local')"
          class="remember-label"
        >
          <input type="checkbox" v-model="saveSession" />
          {{ t('authPill.local.saveSession') }}
        </label>

        <p v-if="loginError" class="local-login-error">{{ loginError }}</p>

        <!-- Butoane actiune (numai formular local) -->
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

        <!-- Buton anulare pentru tab SSO -->
        <div v-if="showDualMode && dualTab === 'sso'" class="local-login-actions">
          <button
            type="button"
            class="local-action local-action-cancel"
            @click="closeLoginModal"
          >
            {{ t('actions.cancel') }}
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
import { createLocalAuthLoginPlugin } from '@/services/server-auth-user-pass'

const masterAuthPlugin: AuthLoginService = useAuthLoginPlugin()
const isAuthenticated = masterAuthPlugin.isAuthenticated
const { t } = useI18n()

/* --- configuratie mediu si mod autentificare --- */
const authConfig = getAuthEnvironmentConfig(import.meta.env)
const authMode = getPreferredAuthMode(authConfig)

/*
 * Autentificarea locala este disponibila cand VITE_DISABLE_LOCAL_LOGIN nu este 'true'.
 * SSO este disponibil cand modul primar este 'auth0'.
 * Mod dual: ambele optiuni sunt disponibile simultan.
 */
const isLocalLoginAvailable = authConfig.VITE_DISABLE_LOCAL_LOGIN !== 'true'
const isSsoAvailable = authMode === 'auth0'
const showDualMode = isLocalLoginAvailable && isSsoAvailable

/*
 * Serviciu local creat inline pentru login cu credentiale in mod dual (SSO primar).
 * In modul local, masterAuthPlugin este deja serviciul local.
 */
const localService: AuthLoginService | null = showDualMode ? createLocalAuthLoginPlugin() : null

/* --- stare modala --- */
const showLoginModal = ref(false)
const submittingLocalLogin = ref(false)
const loginError = ref('')
const activeLocalAction = ref<'login' | 'register'>('login')
const dualTab = ref<'sso' | 'local'>('sso')
const saveSession = ref(false)
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', email: '', password: '' })

/* --- expresii calculate --- */
const isLocalMode = computed(() => authMode === 'local')
const showSaveSession = computed(
  () => (showDualMode ? (localService?.isLocalPiniaSaveable() ?? false) : masterAuthPlugin.isLocalPiniaSaveable()),
)
const localDisclaimer = computed(() => {
  if (showDualMode) {
    return ''
  }
  return isLocalMode.value ? t('authPill.local.saveSession') : ''
})

const loginLabel = computed(() => t('authPill.login'))

const activeLocalActionTitle = computed(() =>
  activeLocalAction.value === 'register'
    ? t('authPill.local.registerTitle')
    : t('authPill.local.title'),
)

/* --- actiuni UI --- */
function openLoginModal(): void {
  if (!isLocalMode.value && !showDualMode) {
    /* Mod SSO pur: redirect direct, fara modal */
    void masterAuthPlugin.loginWithRedirect()
    return
  }
  loginError.value = ''
  activeLocalAction.value = 'login'
  dualTab.value = isSsoAvailable ? 'sso' : 'local'
  saveSession.value = false
  showLoginModal.value = true
}

function logoutUser(): void {
  void masterAuthPlugin.logout({ logoutParams: { returnTo: window.location.origin } })
}

function closeLoginModal(): void {
  if (submittingLocalLogin.value) return
  masterAuthPlugin.setSavingUserIntention(false)
  showLoginModal.value = false
  loginError.value = ''
}

/* --- autentificare SSO (cont extern) --- */
async function submitSsoLogin(): Promise<void> {
  submittingLocalLogin.value = true
  try {
    await masterAuthPlugin.loginWithRedirect()
  } finally {
    submittingLocalLogin.value = false
  }
}

/* --- autentificare locala cu credentiale --- */
async function submitLocalLogin(): Promise<void> {
  if (!loginForm.value.username || !loginForm.value.password) {
    loginError.value = t('authPill.local.validation')
    return
  }

  submittingLocalLogin.value = true
  loginError.value = ''

  /* Serviciu activ: local dedicat (mod dual) sau masterPlugin (mod local pur) */
  const activeService = localService ?? masterAuthPlugin

  try {
    activeService.setSavingUserIntention(saveSession.value)
    await activeService.loginWithRedirect({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    if (localService) {
      /* In mod dual, actualizam starea masterPlugin din Pinia */
      masterAuthPlugin.saveLoginStatus(true)
    }
    closeLoginModal()
  } catch {
    loginError.value = t('authPill.local.loginFailed')
  } finally {
    submittingLocalLogin.value = false
  }
}

/* --- inregistrare cont local --- */
async function submitLocalRegister(): Promise<void> {
  if (!registerForm.value.username || !registerForm.value.email || !registerForm.value.password) {
    loginError.value = t('authPill.local.registerValidation')
    return
  }

  submittingLocalLogin.value = true
  loginError.value = ''

  const activeService = localService ?? masterAuthPlugin

  try {
    await activeService.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
    })
    closeLoginModal()
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

.local-login-modal h3 { margin: 0; }
.local-login-subtitle { margin: 0; color: #5f6f8f; }

.local-disclaimer {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: #f6f8fc;
  border: 1px solid #d9e3f3;
  color: #41506d;
  font-size: 0.85rem;
}

/* Sectiune SSO */
.sso-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  text-align: center;
}

.sso-icon { font-size: 2.5rem; }

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

.field-label { font-size: 0.86rem; color: #334264; }

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

/* Checkbox "Tine-ma minte" */
.remember-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #334264;
  cursor: pointer;
}

.local-login-error { margin: 0.2rem 0; color: #b3261e; }

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

.local-action-cancel { background: #f6f8fc; color: #2f405f; }
.local-action-submit { background: #0b5cff; border-color: #0b5cff; color: #fff; }
.local-action:disabled { opacity: 0.7; cursor: default; }
</style>


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
        <header class="local-login-header">
          <div>
            <h3>{{ activeLocalActionTitle }}</h3>
            <p class="local-login-subtitle">{{ t('authPill.local.subtitle') }}</p>
          </div>
          <div class="local-login-tabs" role="tablist" :aria-label="t('authPill.local.tabsLabel')">
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

        <p v-if="localDisclaimer" class="local-disclaimer">{{ localDisclaimer }}</p>

        <template v-if="activeLocalAction === 'register'">
          <label class="field-label" for="local-register-username">
            {{ t('authPill.local.username') }}
          </label>
          <input
            id="local-register-username"
            v-model.trim="registerForm.username"
            class="field-input"
            type="text"
            autocomplete="username"
          />

          <label class="field-label" for="local-register-email">
            {{ t('authPill.local.email') }}
          </label>
          <input
            id="local-register-email"
            v-model.trim="registerForm.email"
            class="field-input"
            type="email"
            autocomplete="email"
          />

          <label class="field-label" for="local-register-password">
            {{ t('authPill.local.password') }}
          </label>
          <input
            id="local-register-password"
            v-model="registerForm.password"
            class="field-input"
            type="password"
            autocomplete="new-password"
            @keydown.enter.prevent="submitLocalRegister"
          />
        </template>

        <template v-else>
          <label class="field-label" for="local-login-username">
            {{ t('authPill.local.username') }}
          </label>
          <input
            id="local-login-username"
            v-model.trim="loginForm.username"
            class="field-input"
            type="text"
            autocomplete="username"
          />

          <label class="field-label" for="local-login-password">
            {{ t('authPill.local.password') }}
          </label>
          <input
            id="local-login-password"
            v-model="loginForm.password"
            class="field-input"
            type="password"
            autocomplete="current-password"
            @keydown.enter.prevent="submitLocalLogin"
          />
        </template>

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
const activeLocalAction = ref<'login' | 'register'>('login')
const loginForm = ref({
  username: '',
  password: '',
})
const registerForm = ref({
  username: '',
  email: '',
  password: '',
})

const localDisclaimer = computed(() => (isLocalMode.value ? masterAuthPlugin.getDisclaimer() : ''))

const loginLabel = computed(() =>
  isLocalMode.value ? t('authPill.local.open') : t('authPill.login'),
)

const activeLocalActionTitle = computed(() =>
  activeLocalAction.value === 'register'
    ? t('authPill.local.registerTitle')
    : t('authPill.local.title'),
)

function login() {
  if (isLocalMode.value) {
    masterAuthPlugin.setSavingUserIntention(true)
    localLoginError.value = ''
    activeLocalAction.value = 'login'
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

  masterAuthPlugin.setSavingUserIntention(false)
  showLocalLoginModal.value = false
  localLoginError.value = ''
}

async function submitLocalLogin(): Promise<void> {
  if (!loginForm.value.username || !loginForm.value.password) {
    localLoginError.value = t('authPill.local.validation')
    return
  }

  submittingLocalLogin.value = true
  localLoginError.value = ''

  try {
    await masterAuthPlugin.loginWithRedirect({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    masterAuthPlugin.setSavingUserIntention(false)
    showLocalLoginModal.value = false
  } catch {
    localLoginError.value = t('authPill.local.loginFailed')
  } finally {
    submittingLocalLogin.value = false
  }
}

async function submitLocalRegister(): Promise<void> {
  if (!registerForm.value.username || !registerForm.value.email || !registerForm.value.password) {
    localLoginError.value = t('authPill.local.registerValidation')
    return
  }

  submittingLocalLogin.value = true
  localLoginError.value = ''

  try {
    await masterAuthPlugin.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
    })
    masterAuthPlugin.setSavingUserIntention(false)
    showLocalLoginModal.value = false
  } catch {
    localLoginError.value = t('authPill.local.registerFailed')
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

.local-login-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
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
