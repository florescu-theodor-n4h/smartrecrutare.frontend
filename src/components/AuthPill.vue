<template>
  <div class="auth-wrap">
    <button v-if="!isAuthenticated" class="auth-pill login" @click="login">
      <span class="dot"></span>
      <span class="text">Sign in</span>
    </button>

    <button v-else class="auth-pill logout" @click="logoutUser">
      <span class="dot"></span>
      <span class="text">Logout</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated, loginWithRedirect, logout } = useAuth0()

function login() {
  loginWithRedirect()
}

function logoutUser() {
  logout({ logoutParams: { returnTo: window.location.origin } })
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
</style>
