import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import HomeView from '../views/HomeView.vue'

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
      beforeEnter: authGuard,
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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
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
