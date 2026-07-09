import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import { getAuthEnvironmentConfig, getPreferredAuthMode } from '@/services/auth'
import HomeView from '../views/HomeView.vue'

const authConfig = getAuthEnvironmentConfig(import.meta.env)
const authMode = getPreferredAuthMode(authConfig)
const dashboardAuthGuard = authMode === 'auth0' ? authGuard : undefined

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: dashboardAuthGuard,
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('../views/JobsView.vue'),
    },
    {
      path: '/candidates',
      name: 'candidates',
      component: () => import('../views/CandidatesView.vue'),
    },
    {
      path: '/chatbot',
      name: 'chatbot',
      component: () => import('../views/ChatbotView.vue'),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/FooterPageView.vue'),
      meta: { footerPageKey: 'terms' },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/FooterPageView.vue'),
      meta: { footerPageKey: 'privacy' },
    },
    {
      path: '/cookies',
      name: 'cookies',
      component: () => import('../views/FooterPageView.vue'),
      meta: { footerPageKey: 'cookies' },
    },
    {
      path: '/support',
      name: 'support',
      component: () => import('../views/FooterPageView.vue'),
      meta: { footerPageKey: 'support' },
    },
    {
      path: '/roadmap',
      name: 'roadmap',
      component: () => import('../views/FooterPageView.vue'),
      meta: { footerPageKey: 'roadmap' },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/employers',
      name: 'employers',
      component: () => import('../views/EmployersView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminLocalUsersView.vue'),
    },
    //  404 Ultimul
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/PaginaNegasita.vue'),
    },
  ],
})

export default router
