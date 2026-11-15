import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { Mode, ModeRequest } from '@/api'

export const modesStore = defineStore('modesStore', () => {
  const modes = ref<Mode[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(force = false): Promise<void> {
    if (!force && modes.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      modes.value = await api.listModes()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить лады'
    } finally {
      isLoading.value = false
    }
  }

  function byId(id: string): Mode | undefined {
    return modes.value.find(item => item.id === id)
  }

  async function create(request: ModeRequest): Promise<Mode> {
    const created = await api.createMode(request)
    await load(true)
    return created
  }

  async function update(id: string, request: ModeRequest): Promise<void> {
    await api.updateMode(id, request)
    await load(true)
  }

  async function remove(id: string): Promise<void> {
    await api.deleteMode(id)
    modes.value = modes.value.filter(item => item.id !== id)
  }

  return { modes, isLoading, error, load, byId, create, update, remove }
})
