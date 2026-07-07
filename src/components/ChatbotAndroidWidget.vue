<template>
  <button class="android" type="button" @click="openChat" :aria-label="label">
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  label: string
}>()

const router = useRouter()

function openChat(): void {
  router.push('/chatbot')
}
</script>

<style scoped>
.android {
  position: fixed;
  right: 1.25rem;
  bottom: 2.25rem;
  z-index: 50;
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
