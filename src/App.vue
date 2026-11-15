<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">Strings</router-link>
      </div>

      <button
        v-if="auth.isAuthenticated"
        class="burger-btn"
        type="button"
        :title="mobileOpen ? 'Закрыть меню' : 'Открыть меню'"
        :aria-label="mobileOpen ? 'Закрыть меню' : 'Открыть меню'"
        :aria-expanded="mobileOpen"
        aria-controls="main-nav"
        @click="mobileOpen = !mobileOpen"
      >
        <AppIcon :name="mobileOpen ? 'close' : 'menu'" />
      </button>

      <div
        id="main-nav"
        class="nav-links"
        :class="{
          'nav-menu': auth.isAuthenticated,
          'is-collapsed': auth.isAuthenticated && !mobileOpen
        }"
        @click="mobileOpen = false"
      >
        <template v-if="auth.isAuthenticated">
          <router-link to="/playground">
            <AppIcon name="shapes" />
            <span>Аппликатуры</span>
          </router-link>
          <router-link to="/modes/chords">
            <AppIcon name="chord" />
            <span>Аккорды в ладу</span>
          </router-link>
          <router-link to="/match">
            <AppIcon name="search" />
            <span>Подбор лада</span>
          </router-link>
          <router-link to="/catalog">
            <AppIcon name="catalog" />
            <span>Справочники</span>
          </router-link>
          <span v-if="auth.isAdmin" class="admin-badge" title="Администратор">admin</span>
          <router-link v-if="auth.userName" to="/catalog" class="user-name full" :title="auth.userName">{{ auth.userName }}</router-link>
          <router-link v-if="auth.userName" to="/catalog" class="user-name short" :title="auth.userName">{{ auth.initials }}</router-link>
          <button class="icon-btn" title="Выйти" aria-label="Выйти" @click="handleLogout">
            <AppIcon name="logout" />
          </button>
        </template>
        <template v-else>
          <button class="icon-btn" title="Войти" aria-label="Войти" @click="handleLogin">
            <AppIcon name="login" />
          </button>
        </template>
      </div>
    </nav>

    <main class="content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-links">
        <router-link to="/faq">FAQ</router-link>
      </div>
      <span class="footer-version">версия: {{ backendVersion || '—' }} / {{ frontendVersion }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import { logout } from '@/logout'
import { getBackendVersion } from '@/api'
import AppIcon from '@/components/AppIcon.vue'
import { SsoService } from '@bogdanovmn/ssofw'

const route = useRoute()
const router = useRouter()
const auth = authStore()
const ssoService = inject<SsoService>('ssoService')!
const backendVersion = ref<string | null>(null)
const frontendVersion = import.meta.env.FRONTEND_VERSION
const mobileOpen = ref(false)

onMounted(() => {
  auth.update()
  loadBackendVersion()
})

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})

async function loadBackendVersion() {
  try {
    const data = await getBackendVersion()
    backendVersion.value = data.version
  } catch (error) {
    backendVersion.value = null
  }
}

function handleLogin() {
  router.push('/login')
}

async function handleLogout() {
  await logout(ssoService)
  router.push('/')
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
}

.navbar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-nav);
  color: var(--color-on-primary);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-brand a {
  color: var(--color-on-primary);
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: bold;
  letter-spacing: 0.04em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-nav-link);
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.4rem 0.25rem;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-on-primary);
}

.burger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid var(--color-nav-hover);
  border-radius: 8px;
  background: transparent;
  color: var(--color-on-primary);
  cursor: pointer;
}

.burger-btn:hover {
  background: var(--color-nav-hover);
}

.admin-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--color-badge);
  color: var(--color-nav);
}

.user-name {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
  color: var(--color-nav-link);
}

.user-name:hover {
  color: var(--color-on-primary);
}

.user-name.short {
  display: none;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.icon-btn:hover {
  background: var(--color-nav-hover);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

.content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  min-width: 0;
  margin: 1rem auto;
  padding: 0 1rem;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-top: 2rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
  color: var(--color-muted);
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-muted);
  text-decoration: none;
  padding: 0.4rem 0.25rem;
}

.footer-links a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.footer-version {
  font-size: 0.8rem;
  color: var(--color-muted);
  opacity: 0.65;
}

@media (max-width: 599px) {
  .user-name.full {
    display: none;
  }

  .user-name.short {
    display: inline;
  }
}

@media (max-width: 767px) {
  .burger-btn {
    display: inline-flex;
  }

  .nav-links.nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 30;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0.2rem;
    padding: 0.6rem 1rem 1rem;
    border-top: 1px solid var(--color-nav-hover);
    background: var(--color-nav);
    box-shadow: 0 12px 28px var(--color-overlay);
  }

  .nav-links.nav-menu:not(.is-collapsed) {
    display: flex;
  }

  .nav-links.nav-menu a {
    padding: 0.65rem 0.5rem;
    border-radius: 6px;
  }

  .nav-links.nav-menu a:hover,
  .nav-links.nav-menu a.router-link-active {
    background: var(--color-nav-hover);
  }

  .nav-links.nav-menu .admin-badge,
  .nav-links.nav-menu .user-name {
    align-self: flex-start;
  }

  .nav-links.nav-menu .icon-btn {
    align-self: flex-start;
    margin-top: 0.35rem;
  }
}

@media (min-width: 768px) {
  .navbar {
    padding: 1rem 2rem;
  }

  .nav-brand a {
    font-size: 1.4rem;
  }

  .nav-links {
    gap: 1.25rem;
  }

  .content {
    margin: 2rem auto;
    padding: 0 2rem;
  }

  .footer {
    padding: 1rem 2rem;
  }
}
</style>
