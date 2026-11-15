import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { ChordInMode, ChordTonicRequest, ModeMatch } from '@/api'

export const matchingStore = defineStore('matchingStore', () => {
  const chordsInMode = ref<ChordInMode[]>([])
  const modeMatches = ref<ModeMatch[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadChordsInMode(modeId: string, tonic: number): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      chordsInMode.value = await api.getChordsInMode(modeId, tonic)
    } catch (e) {
      chordsInMode.value = []
      error.value = e instanceof Error ? e.message : 'Не удалось подобрать аккорды'
    } finally {
      isLoading.value = false
    }
  }

  async function findModes(chords: ChordTonicRequest[]): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      modeMatches.value = await api.matchModes(chords)
    } catch (e) {
      modeMatches.value = []
      error.value = e instanceof Error ? e.message : 'Не удалось подобрать лады'
    } finally {
      isLoading.value = false
    }
  }

  return { chordsInMode, modeMatches, isLoading, error, loadChordsInMode, findModes }
})
