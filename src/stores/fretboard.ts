import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { Fingerings, FretboardGrid } from '@/api'

export const fretboardStore = defineStore('fretboardStore', () => {
  const grid = ref<FretboardGrid | null>(null)
  const fingerings = ref<Fingerings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const gridCache = new Map<string, FretboardGrid>()
  let requestId = 0

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

  return { grid, fingerings, isLoading, error, loadGrid, loadScales, loadArpeggios, loadChordShapes, reset }
})
