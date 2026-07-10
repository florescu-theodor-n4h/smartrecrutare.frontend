<template>
  <div class="admin-page">
    <!-- Header principal -->
    <header class="toolbar">
      <div>
        <h1>{{ $t('admin.title') }}</h1>
        <p class="subtitle">{{ $t('admin.subtitle') }}</p>
      </div>
      <button @click="openCreate" class="btn">{{ $t('actions.create') }}</button>
    </header>

    <!-- Stare incarcare / eroare lista -->
    <p v-if="loading" class="state-msg">{{ $t('messages.loading') }}</p>
    <p v-else-if="listError" class="state-msg error">{{ listError }}</p>

    <template v-else>
      <!-- Tabel utilizatori -->
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ $t('admin.username') }}</th>
              <th>{{ $t('admin.email') }}</th>
              <th>{{ $t('admin.status') }}</th>
              <th>{{ $t('admin.roles') }}</th>
              <th>{{ $t('admin.lastLogin') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="col-id">{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td class="col-status">
                <span :class="['badge', user.enabled ? 'badge-green' : 'badge-gray']">
                  {{ user.enabled ? $t('admin.enabled') : $t('admin.disabled') }}
                </span>
                <span v-if="user.locked" class="badge badge-red ml-1">
                  {{ $t('admin.locked') }}
                </span>
              </td>
              <td class="col-roles">
                <span v-for="role in user.roles" :key="role" class="badge badge-blue mr-1">{{
                  role
                }}</span>
              </td>
              <td>{{ formatDate(user.lastLoginAt) }}</td>
              <td>
                <button @click="openEdit(user)" class="btn-small">
                  {{ $t('actions.edit') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="users.length === 0" class="state-msg">{{ $t('admin.noData') }}</p>
    </template>

    <!-- Paginare -->
    <div v-if="totalPagini > 1" class="pagination">
      <button :disabled="pagina === 0" @click="changePage(pagina - 1)" class="btn-ghost">
        &laquo;
      </button>
      <span>{{ pagina + 1 }} / {{ totalPagini }}</span>
      <button
        :disabled="pagina + 1 >= totalPagini"
        @click="changePage(pagina + 1)"
        class="btn-ghost"
      >
        &raquo;
      </button>
    </div>

    <!-- Modal creare utilizator -->
    <div v-if="createModalOpen" class="modal" @click.self="closeCreate">
      <div class="modal-content">
        <h3>{{ $t('actions.create') }} {{ $t('admin.user') }}</h3>

        <label>{{ $t('admin.username') }} *</label>
        <input v-model="createForm.username" autocomplete="off" />

        <label>{{ $t('admin.email') }} *</label>
        <input v-model="createForm.email" type="email" autocomplete="off" />

        <label>{{ $t('admin.password') }} *</label>
        <input v-model="createForm.password" type="password" autocomplete="new-password" />

        <label>{{ $t('admin.roles') }}</label>
        <div class="roles-grid">
          <label v-for="role in ALL_ROLES" :key="role" class="checkbox-label">
            <input type="checkbox" :value="role" v-model="createForm.roles" />
            {{ role }}
          </label>
        </div>

        <p v-if="createError" class="state-msg error">{{ createError }}</p>

        <div class="modal-actions">
          <button @click="submitCreate" class="btn" :disabled="creating">
            {{ $t('actions.save') }}
          </button>
          <button @click="closeCreate" class="btn-ghost">{{ $t('actions.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- Modal editare utilizator -->
    <div v-if="editUser" class="modal" @click.self="closeEdit">
      <div class="modal-content modal-wide">
        <!-- Header modal editare -->
        <div class="edit-header">
          <div>
            <strong>{{ editUser.username }}</strong>
            <span class="user-id">#{{ editUser.id }}</span>
          </div>
          <button @click="closeEdit" class="btn-icon" :aria-label="$t('actions.cancel')">✕</button>
        </div>

        <!-- Taburi -->
        <div class="tabs" role="tablist">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            role="tab"
            :aria-selected="activeTab === tab.key"
            :class="['tab', { active: activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            {{ $t(tab.label) }}
          </button>
        </div>

        <!-- Tab: Profil -->
        <div v-if="activeTab === 'profile'" class="tab-content" role="tabpanel">
          <label>{{ $t('admin.username') }}</label>
          <input v-model="profileForm.username" />

          <label>{{ $t('admin.email') }}</label>
          <input v-model="profileForm.email" type="email" />

          <div class="toggles">
            <label class="toggle-label">
              <input type="checkbox" v-model="profileForm.enabled" />
              {{ $t('admin.enabled') }}
            </label>
            <label class="toggle-label">
              <input type="checkbox" v-model="profileForm.locked" />
              {{ $t('admin.locked') }}
            </label>
          </div>

          <p v-if="profileError" class="state-msg error">{{ profileError }}</p>
          <button @click="saveProfile" class="btn" :disabled="savingProfile">
            {{ $t('actions.save') }}
          </button>
        </div>

        <!-- Tab: Roluri -->
        <div v-if="activeTab === 'roles'" class="tab-content" role="tabpanel">
          <p class="tab-desc">{{ $t('admin.rolesDescription') }}</p>
          <div class="roles-grid">
            <label v-for="role in ALL_ROLES" :key="role" class="checkbox-label">
              <input type="checkbox" :value="role" v-model="rolesForm" />
              {{ role }}
            </label>
          </div>

          <p v-if="rolesError" class="state-msg error">{{ rolesError }}</p>
          <button @click="saveRoles" class="btn" :disabled="savingRoles">
            {{ $t('actions.save') }}
          </button>
        </div>

        <!-- Tab: Parola -->
        <div v-if="activeTab === 'password'" class="tab-content" role="tabpanel">
          <label>{{ $t('admin.newPassword') }} *</label>
          <input
            v-model="passwordForm"
            type="password"
            autocomplete="new-password"
            :placeholder="$t('admin.passwordMinLengthHint')"
          />

          <p v-if="passwordError" class="state-msg error">{{ passwordError }}</p>
          <p v-if="passwordOk" class="state-msg success">{{ $t('admin.passwordChanged') }}</p>

          <button @click="savePassword" class="btn" :disabled="savingPassword">
            {{ $t('admin.resetPassword') }}
          </button>
        </div>

        <!-- Tab: Angajatori gestionati -->
        <div v-if="activeTab === 'employers'" class="tab-content" role="tabpanel">
          <p class="tab-desc">{{ $t('admin.managedEmployersDescription') }}</p>

          <ul class="employer-list">
            <li v-for="eid in editUser.managedEmployerIds" :key="eid" class="employer-item">
              <span>Employer #{{ eid }}</span>
              <button
                @click="removeEmployer(eid)"
                class="btn-small danger"
                :disabled="savingEmployers"
              >
                {{ $t('actions.delete') }}
              </button>
            </li>
            <li v-if="editUser.managedEmployerIds.length === 0" class="state-msg">
              {{ $t('admin.noManagedEmployers') }}
            </li>
          </ul>

          <div class="add-employer">
            <input
              v-model.number="newEmployerId"
              type="number"
              min="1"
              :placeholder="$t('admin.employerIdPlaceholder')"
            />
            <button @click="addEmployer" class="btn" :disabled="savingEmployers || !newEmployerId">
              {{ $t('admin.assignEmployer') }}
            </button>
          </div>

          <p v-if="employersError" class="state-msg error">{{ employersError }}</p>
        </div>

        <!-- Informatii audit (doar citire) -->
        <div class="audit-info">
          <span v-if="editUser.creatLa">
            {{ $t('admin.createdAt') }}: {{ formatDate(editUser.creatLa) }}
            <template v-if="editUser.creatDe"> · {{ editUser.creatDe }}</template>
          </span>
          <span v-if="editUser.modificatLa">
            {{ $t('admin.modifiedAt') }}: {{ formatDate(editUser.modificatLa) }}
            <template v-if="editUser.modificatDe"> · {{ editUser.modificatDe }}</template>
          </span>
          <span v-if="editUser.versiune !== undefined"> v{{ editUser.versiune }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import {
  localUsersApi,
  type LocalUserResponse,
  type LocalUserCreateRequest,
  type LocalUserUpdateRequest,
  type LocalUserRolesRequest,
} from '@/services/localUsersApi'
import { LOCAL_USER_ROLES, type LocalUserRole } from '@/services/api-primitives'

const { t } = useI18n()

/* --- constante --- */
const ALL_ROLES = LOCAL_USER_ROLES

const TABS = [
  { key: 'profile', label: 'admin.tabs.profile' },
  { key: 'roles', label: 'admin.tabs.roles' },
  { key: 'password', label: 'admin.tabs.password' },
  { key: 'employers', label: 'admin.tabs.employers' },
] as const

type TabKey = (typeof TABS)[number]['key']

const PAGE_SIZE = 20

/* --- stare lista --- */
const users = ref<LocalUserResponse[]>([])
const loading = ref(false)
const listError = ref('')
const pagina = ref(0)
const totalPagini = ref(1)

/* --- stare modal creare --- */
const createModalOpen = ref(false)
const createForm = ref<LocalUserCreateRequest>({ username: '', email: '', password: '', roles: [] })
const createError = ref('')
const creating = ref(false)

/* --- stare modal editare --- */
const editUser: Ref<LocalUserResponse | null> = ref(null)
const activeTab = ref<TabKey>('profile')

/* --- tab profil --- */
const profileForm = ref<LocalUserUpdateRequest>({})
const profileError = ref('')
const savingProfile = ref(false)

/* --- tab roluri --- */
const rolesForm = ref<LocalUserRole[]>([])
const rolesError = ref('')
const savingRoles = ref(false)

/* --- tab parola --- */
const passwordForm = ref('')
const passwordError = ref('')
const passwordOk = ref(false)
const savingPassword = ref(false)

/* --- tab angajatori gestionati --- */
const newEmployerId = ref<number | null>(null)
const employersError = ref('')
const savingEmployers = ref(false)

/* --- utilitare --- */
function formatDate(date: string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

/* --- incarcare lista utilizatori cu paginare --- */
async function load(page = 0): Promise<void> {
  loading.value = true
  listError.value = ''
  try {
    const res = await localUsersApi.listLocalUsers({ page, size: PAGE_SIZE })
    const data = res.data
    users.value = Array.isArray(data.continut) ? data.continut : []
    pagina.value = typeof data.pagina === 'number' ? data.pagina : page
    totalPagini.value = typeof data.totalPagini === 'number' ? data.totalPagini : 1
  } catch {
    listError.value = t('messages.error')
  } finally {
    loading.value = false
  }
}

function changePage(page: number): void {
  void load(page)
}

/* --- deschide modal creare --- */
function openCreate(): void {
  createForm.value = { username: '', email: '', password: '', roles: [] }
  createError.value = ''
  createModalOpen.value = true
}

function closeCreate(): void {
  createModalOpen.value = false
}

/* --- trimite cerere de creare utilizator --- */
async function submitCreate(): Promise<void> {
  const { username, email, password } = createForm.value
  if (!username.trim() || !email.trim() || !password.trim()) {
    createError.value = t('admin.createValidation')
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await localUsersApi.createLocalUser(createForm.value)
    await load(pagina.value)
    closeCreate()
  } catch {
    createError.value = t('messages.error')
  } finally {
    creating.value = false
  }
}

/* --- deschide modal editare cu datele utilizatorului selectat --- */
function openEdit(user: LocalUserResponse): void {
  editUser.value = { ...user }
  activeTab.value = 'profile'
  profileForm.value = {
    username: user.username,
    email: user.email,
    enabled: user.enabled,
    locked: user.locked,
  }
  rolesForm.value = [...user.roles]
  passwordForm.value = ''
  passwordOk.value = false
  profileError.value = ''
  rolesError.value = ''
  passwordError.value = ''
  employersError.value = ''
  newEmployerId.value = null
}

function closeEdit(): void {
  editUser.value = null
}

function switchTab(key: TabKey): void {
  activeTab.value = key
}

/* --- salveaza profilul utilizatorului (username, email, enabled, locked) --- */
async function saveProfile(): Promise<void> {
  if (!editUser.value?.id) return
  savingProfile.value = true
  profileError.value = ''
  try {
    const res = await localUsersApi.updateLocalUser(editUser.value.id, profileForm.value)
    editUser.value = res.data
    await load(pagina.value)
  } catch {
    profileError.value = t('messages.error')
  } finally {
    savingProfile.value = false
  }
}

/* --- inlocuieste rolurile utilizatorului --- */
async function saveRoles(): Promise<void> {
  if (!editUser.value?.id) return
  savingRoles.value = true
  rolesError.value = ''
  try {
    const payload: LocalUserRolesRequest = { roles: rolesForm.value }
    const res = await localUsersApi.updateLocalUserRoles(editUser.value.id, payload)
    editUser.value = res.data
    await load(pagina.value)
  } catch {
    rolesError.value = t('messages.error')
  } finally {
    savingRoles.value = false
  }
}

/* --- reseteaza parola utilizatorului (minim 10 caractere conform API) --- */
async function savePassword(): Promise<void> {
  if (!editUser.value?.id) return
  const pw = passwordForm.value.trim()
  if (pw.length < 10) {
    passwordError.value = t('admin.passwordMinLength')
    return
  }
  savingPassword.value = true
  passwordError.value = ''
  passwordOk.value = false
  try {
    await localUsersApi.updateLocalUserPassword(editUser.value.id, { password: pw })
    passwordOk.value = true
    passwordForm.value = ''
  } catch {
    passwordError.value = t('messages.error')
  } finally {
    savingPassword.value = false
  }
}

/* --- atribuie un angajator managerului local --- */
async function addEmployer(): Promise<void> {
  if (!editUser.value?.id || !newEmployerId.value) return
  savingEmployers.value = true
  employersError.value = ''
  try {
    const res = await localUsersApi.assignManagedEmployer(editUser.value.id, {
      employerId: newEmployerId.value,
    })
    editUser.value = res.data
    newEmployerId.value = null
    await load(pagina.value)
  } catch {
    employersError.value = t('messages.error')
  } finally {
    savingEmployers.value = false
  }
}

/* --- sterge atribuirea unui angajator pentru manager --- */
async function removeEmployer(employerId: number): Promise<void> {
  if (!editUser.value?.id) return
  savingEmployers.value = true
  employersError.value = ''
  try {
    const res = await localUsersApi.unassignManagedEmployer(editUser.value.id, employerId)
    editUser.value = res.data
    await load(pagina.value)
  } catch {
    employersError.value = t('messages.error')
  } finally {
    savingEmployers.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<!-- se adauga stilul comun de modal-->
<style scoped src="@/assets/shared_popup_modal.css"></style>

<style scoped>
.admin-page {
  padding: 1rem;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.toolbar h1 {
  margin: 0 0 0.2rem;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.65;
}

/* Butoane */
.btn {
  background: #0b5cff;
  color: #fff;
  border: 0;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-small {
  border: 0;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  background: #e5e7eb;
  color: #111;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--color-border, #d1d5db);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-ghost:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-icon {
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: var(--color-text, #111);
}

.btn-icon:hover {
  background: var(--color-border, #e5e7eb);
}

.danger {
  background: #ef4444;
  color: #fff;
}

/* Stari */
.state-msg {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.error {
  color: #b91c1c;
}

.success {
  color: #065f46;
}

/* Tabel */
.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th,
.table td {
  text-align: left;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  vertical-align: middle;
}

.table th {
  font-weight: 600;
  background: var(--card-bg, #f9fafb);
  white-space: nowrap;
}

.col-id {
  color: #6b7280;
  font-size: 0.8rem;
  width: 3rem;
}

.col-status,
.col-roles {
  white-space: nowrap;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-green {
  background: #d1fae5;
  color: #065f46;
}
.badge-gray {
  background: #e5e7eb;
  color: #374151;
}
.badge-red {
  background: #fee2e2;
  color: #991b1b;
}
.badge-blue {
  background: #dbeafe;
  color: #1e40af;
}

.ml-1 {
  margin-left: 0.25rem;
}
.mr-1 {
  margin-right: 0.25rem;
}

/* Paginare */
.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

/* Header modal editare */
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.user-id {
  margin-left: 0.4rem;
  color: #6b7280;
  font-size: 0.85rem;
}

/* Taburi */
.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid var(--color-border, #e5e7eb);
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tab {
  background: transparent;
  border: 0;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  font-size: 0.875rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  color: var(--color-text, #374151);
}

.tab.active {
  border-bottom-color: #0b5cff;
  color: #0b5cff;
  font-weight: 600;
}

/* Continut tab */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.tab-desc {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Roluri grid */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.4rem;
  padding: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: normal;
  cursor: pointer;
}

/* Toggles enabled/locked */
.toggles {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: normal;
  cursor: pointer;
}

/* Lista angajatori gestionati */
.employer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 2rem;
}

.employer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  font-size: 0.875rem;
}

.add-employer {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.add-employer input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  background: var(--bg, #fff);
  color: var(--color-text, #111);
}

/* Informatii audit */
.audit-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
