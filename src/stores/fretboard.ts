import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { Fingerings, FretboardGrid, FretboardSettings } from '@/api'

// Used until the backend settings are loaded (mirrors strings.fretboard in application.yml).
const DEFAULT_SETTINGS: FretboardSettings = {
  minSpan: 2,
  maxSpan: 5,
  defaultScaleSpan: 5,
  defaultChordSpan: 3
}

export const fretboardStore = defineStore('fretboardStore', () => {
  const grid = ref<FretboardGrid | null>(null)
  const fingerings = ref<Fingerings | null>(null)
  const settings = ref<FretboardSettings>(DEFAULT_SETTINGS)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const gridCache = new Map<string, FretboardGrid>()
  let requestId = 0
  let settingsLoaded = false

  async function loadSettings(): Promise<void> {
    if (settingsLoaded) return
    try {
      settings.value = await api.getFretboardSettings()
      settingsLoaded = true
    } catch {
      // Keep the fallback limits so the form stays usable.
    }
  }

  async function loadGrid(instrumentId: string): Promise<void> {
    const cached = gridCache.get(instrumentId)
    if (cached) {
      grid.value = cached
      return
    }
    grid.value = await api.getFretboard(instrumentId)
    gridCache.set(instrumentId, grid.value)
  }

  async function run(loader: () => Promise<Fingerings>): Promise<void> {
    const currentRequest = ++requestId
    isLoading.value = true
    error.value = null
    try {
      const result = await loader()
      if (currentRequest === requestId) {
        fingerings.value = result
      }
    } catch (e) {
      if (currentRequest === requestId) {
        fingerings.value = null
        error.value = e instanceof Error ? e.message : 'Не удалось построить аппликатуры'
      }
    } finally {
      if (currentRequest === requestId) {
        isLoading.value = false
      }
    }
  }

  function loadScales(query: api.ScaleQuery): Promise<void> {
    return run(() => api.getScales(query))
  }

  function loadArpeggios(query: api.ArpeggioQuery): Promise<void> {
    return run(() => api.getArpeggios(query))
  }

  function loadChordShapes(query: api.ChordShapesQuery): Promise<void> {
    return run(() => api.getChordShapes(query))
  }

  function reset(): void {
    requestId++
    fingerings.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    grid,
    fingerings,
    settings,
    isLoading,
    error,
    loadSettings,
    loadGrid,
    loadScales,
    loadArpeggios,
    loadChordShapes,
    reset
  }
})
