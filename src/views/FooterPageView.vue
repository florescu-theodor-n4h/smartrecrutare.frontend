<template>
  <main class="legal-page">
    <section class="document-shell">
      <p class="kicker">{{ t('footer.pages.kicker') }}</p>
      <h1>{{ t(`footerPages.${pageKey}.title`) }}</h1>
      <p class="lead">{{ t(`footerPages.${pageKey}.lead`) }}</p>

      <article v-for="section in sections" :key="section.title" class="section-block">
        <h2>{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </article>

      <aside v-if="notice" class="notice-box">
        <strong>{{ t('footer.pages.noticeTitle') }}</strong>
        <p>{{ notice }}</p>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

type FooterPageKey = 'terms' | 'privacy' | 'cookies' | 'support' | 'roadmap'

type PageSection = {
  title: string
  paragraphs: string[]
}

const route = useRoute()
const { t } = useI18n()

const pageKey = computed(() => String(route.meta.footerPageKey || 'terms') as FooterPageKey)

const sections = computed<PageSection[]>(() => {
  const key = pageKey.value
  return [
    {
      title: t(`footerPages.${key}.section1.title`),
      paragraphs: [t(`footerPages.${key}.section1.p1`), t(`footerPages.${key}.section1.p2`)],
    },
    {
      title: t(`footerPages.${key}.section2.title`),
      paragraphs: [t(`footerPages.${key}.section2.p1`), t(`footerPages.${key}.section2.p2`)],
    },
  ]
})

const notice = computed(() => t(`footerPages.${pageKey.value}.notice`))
</script>

<style scoped>
.legal-page {
  display: grid;
  justify-items: center;
  padding: 1rem 0;
}

.document-shell {
  width: min(900px, 100%);
  padding: 1.5rem 1.75rem;
  border: 1px solid #cbbf9a;
  background: linear-gradient(180deg, #fffef7, #f7f0df);
  color: #2f2416;
  box-shadow: 0 18px 40px rgba(57, 40, 18, 0.08);
}

.kicker {
  margin: 0 0 0.5rem;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7b6238;
}

h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 3vw, 3rem);
}

.lead {
  margin: 0 0 1.5rem;
  font-size: 1.05rem;
  line-height: 1.8;
}

.section-block {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #d7c9a9;
}

.section-block h2 {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
}

.section-block p {
  margin: 0 0 0.85rem;
  line-height: 1.8;
}

.notice-box {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px dashed #aa8c58;
  background: rgba(255, 248, 221, 0.75);
}

.notice-box p {
  margin: 0.5rem 0 0;
}
</style>
