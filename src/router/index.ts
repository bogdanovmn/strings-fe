import { createRouter, createWebHistory } from 'vue-router'
import { tokenStorage } from '@bogdanovmn/ssofw'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory('/strings/'),
  routes: [
    { path: '/', component: HomeView },
    { path: '/faq', component: () => import('@/views/FaqView.vue') },
    {
      path: '/login',
      redirect: () => {
        const ssoUrl = import.meta.env.VITE_SSO_FRONT_URL
        const redirectUri = `${window.location.origin}/strings/sso-callback`
        window.location.href = `${ssoUrl}/login?from=${encodeURIComponent(redirectUri)}`
        return '/'
      }
    },
    { path: '/sso-callback', component: () => import('@/views/SsoCallbackView.vue') },
    { path: '/playground', component: () => import('@/views/PlaygroundView.vue'), meta: { private: true } },
    { path: '/modes/chords', component: () => import('@/views/ChordsInModeView.vue'), meta: { private: true } },
    { path: '/match', component: () => import('@/views/MatchModesView.vue'), meta: { private: true } },
    { path: '/catalog', component: () => import('@/views/CatalogView.vue'), meta: { private: true } },
    {
      path: '/catalog/instruments/new',
      component: () => import('@/views/InstrumentFormView.vue'),
      meta: { private: true }
    },
    {
      path: '/catalog/instruments/:id/edit',
      component: () => import('@/views/InstrumentFormView.vue'),
      meta: { private: true },
      props: true
    },
    {
      path: '/catalog/modes/new',
      component: () => import('@/views/ModeFormView.vue'),
      meta: { private: true }
    },
    {
      path: '/catalog/modes/:id/edit',
      component: () => import('@/views/ModeFormView.vue'),
      meta: { private: true },
      props: true
    },
    {
      path: '/catalog/chords/new',
      component: () => import('@/views/ChordFormView.vue'),
      meta: { private: true }
    },
    {
      path: '/catalog/chords/:id/edit',
      component: () => import('@/views/ChordFormView.vue'),
      meta: { private: true },
      props: true
    }
  ]
})

router.beforeEach((to) => {
  const isAuthenticated = tokenStorage.defined()
  if (to.meta.private && !isAuthenticated) {
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    return { path: '/' }
  }
  if (to.path === '/' && isAuthenticated) {
    return { path: '/playground' }
  }
})

export default router
