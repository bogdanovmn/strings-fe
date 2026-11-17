import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { Instrument, InstrumentRequest } from '@/api'

export const instrumentsStore = defineStore('instrumentsStore', () => {
  const instruments = ref<Instrument[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(force = false): Promise<void> {
    if (!force && instruments.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      instruments.value = await api.listInstruments()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить инструменты'
    } finally {
      isLoading.value = false
    }
  }

  function byId(id: string): Instrument | undefined {
    return instruments.value.find(item => item.id === id)
  }

  async function create(request: InstrumentRequest): Promise<Instrument> {
    const created = await api.createInstrument(request)
    await load(true)
    return created
  }

  async function update(id: string, request: InstrumentRequest): Promise<void> {
    await api.updateInstrument(id, request)
    await load(true)
  }

  async function setEnabled(id: string, enabled: boolean): Promise<void> {
    await api.updateInstrumentEnabled(id, enabled)
    const item = instruments.value.find(entry => entry.id === id)
    if (item) item.enabled = enabled
  }

  async function remove(id: string): Promise<void> {
    await api.deleteInstrument(id)
    instruments.value = instruments.value.filter(item => item.id !== id)
  }

  return { instruments, isLoading, error, load, byId, create, update, setEnabled, remove }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(instrumentsStore, import.meta.hot))
}
