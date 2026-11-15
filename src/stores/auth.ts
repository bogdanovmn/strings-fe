import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { tokenStorage } from '@bogdanovmn/ssofw'

export const authStore = defineStore('authStore', () => {
  const isAuthenticated = ref(false)
  const userName = ref<string | null>(null)
  const isAdmin = ref(false)

  function update() {
    isAuthenticated.value = tokenStorage.defined()
    userName.value = tokenStorage.claims?.userName || null
    isAdmin.value = tokenStorage.claims?.isAdmin('strings') ?? false
  }

  const initials = computed(() => {
    const name = userName.value?.trim()
    if (!name) return ''
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('')
  })

  update()

  return { isAuthenticated, userName, isAdmin, initials, update }
})
