import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { Chord, ChordRequest } from '@/api'

export const chordsStore = defineStore('chordsStore', () => {
  const chords = ref<Chord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(force = false): Promise<void> {
    if (!force && chords.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      chords.value = await api.listChords()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить аккорды'
    } finally {
      isLoading.value = false
    }
  }

  function byId(id: string): Chord | undefined {
    return chords.value.find(item => item.id === id)
  }

  async function create(request: ChordRequest): Promise<Chord> {
    const created = await api.createChord(request)
    await load(true)
    return created
  }

  async function update(id: string, request: ChordRequest): Promise<void> {
    await api.updateChord(id, request)
    await load(true)
  }

  async function remove(id: string): Promise<void> {
    await api.deleteChord(id)
    chords.value = chords.value.filter(item => item.id !== id)
  }

  return { chords, isLoading, error, load, byId, create, update, remove }
})
