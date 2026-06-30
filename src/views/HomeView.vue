<script setup lang="ts">
import ComponentHomePage from '../components/ComponentHomePage.vue'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t } = useI18n()
const sectionRefs = {
  about: ref<HTMLElement | null>(null),
  services: ref<HTMLElement | null>(null),
  vision: ref<HTMLElement | null>(null),
}

function scrollToSection(section: keyof typeof sectionRefs) {
  const target = sectionRefs[section].value
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <main class="home-page">
    <ComponentHomePage titlu="SmartRecruit" caption="Recrutare cu atenție și experiență">
      <template #sidebar>
        <div class="home-sidebar">
          <strong>{{ t('home.hero.sidebarTitle') }}</strong>
          <p>{{ t('home.hero.sidebarText') }}</p>
          <button class="scroll-button" @click="scrollToSection('about')">
            {{ t('home.scrollDown') }}
          </button>
        </div>
      </template>

      <section class="hero-card">
        <span class="hero-label">{{ t('home.hero.label') }}</span>
        <h2>{{ t('home.hero.title') }}</h2>
        <p class="hero-subtitle">{{ t('home.hero.subtitle') }}</p>
        <p class="hero-description">{{ t('home.hero.description') }}</p>
      </section>

      <section class="feature-grid">
        <article :ref="sectionRefs.about" class="feature-block">
          <h3>{{ t('home.sections.about.title') }}</h3>
          <p>{{ t('home.sections.about.text') }}</p>
          <button class="feature-cta" @click="scrollToSection('services')">
            {{ t('home.hero.cta') }}
          </button>
        </article>

        <article :ref="sectionRefs.services" class="feature-block accent">
          <h3>{{ t('home.sections.services.title') }}</h3>
          <p>{{ t('home.sections.services.text') }}</p>
          <button class="feature-cta" @click="scrollToSection('vision')">
            {{ t('home.hero.cta') }}
          </button>
        </article>

        <article :ref="sectionRefs.vision" class="feature-block">
          <h3>{{ t('home.sections.vision.title') }}</h3>
          <p>{{ t('home.sections.vision.text') }}</p>
          <button class="feature-cta" @click="scrollToSection('about')">
            {{ t('home.hero.cta') }}
          </button>
        </article>
      </section>
    </ComponentHomePage>
  </main>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: 1.5rem;
}

.hero-card {
  padding: 2rem;
  border-radius: 24px;
  /*background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(236, 239, 241, 0.95));*/
  background: linear-gradient(135deg, var(--bg), var(--card-bg));
  box-shadow: 0 18px 40px rgba(22, 28, 36, 0.08);
}

.hero-label {
  display: inline-flex;
  margin-bottom: 1rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(34, 95, 223, 0.08);
  color: #1f3fa0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}

.hero-card h2 {
  margin-top: 0;
  font-size: clamp(2rem, 2.4vw, 3rem);
  line-height: 1.05;
}

.hero-subtitle {
  margin: 1rem 0 1.25rem;
  font-size: 1.05rem;
  color: #475057;
  max-width: 42rem;
}

.hero-description {
  margin: 0;
  color: #4d5f6e;
  line-height: 1.8;
  max-width: 56rem;
}

.home-sidebar {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background: rgba(18, 65, 158, 0.07);
  border-radius: 18px;
}

.scroll-button {
  margin-top: 1rem;
  align-self: start;
  padding: 0.9rem 1.25rem;
  border: none;
  border-radius: 999px;
  color: white;
  background: linear-gradient(135deg, #2753e8, #4f6cf2);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.scroll-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(39, 83, 232, 0.2);
}

.feature-grid {
  display: grid;
  gap: 1.5rem;
}

.feature-block {
  padding: 1.75rem;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--bg) 92%, white),
    color-mix(in srgb, var(--card-bg) 90%, var(--bg))
  );
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

/* subtle muted element that derives from system palette */
.feature-block .muted {
  background: color-mix(in srgb, var(--muted) 10%, transparent);
  color: var(--muted);
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--muted) 18%, transparent);
}

/*se adauga un accent mov pe elementele importante*/
.feature-block.accent {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, #2a3e7e 21%, transparent),
    color-mix(
      in srgb,
      color-mix(in srgb, var(--bg) 72%, var(--muted)),
      color-mix(in srgb, rgb(97, 13, 180) 28%, var(--bg))
    )
  );
}

.feature-block h3 {
  margin-top: 0;
  font-size: 1.5rem;
}

.feature-block p {
  color: #5b6974;
  line-height: 1.75;
}

.feature-cta {
  margin-top: 1.25rem;
  border: 1px solid transparent;
  padding: 0.9rem 1.3rem;
  border-radius: 999px;
  background: #1f3fa0;
  color: white;
  cursor: pointer;
}

.feature-cta:hover {
  background: #17346f;
}

@media (min-width: 900px) {
  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
