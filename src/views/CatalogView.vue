<template>
  <div class="catalog">
    <div class="heading-row">
      <BackButton fallback="/" />
      <h1>Справочники</h1>
    </div>
    <p class="subtitle">
      Общие справочники доступны всем. Свои инструменты, лады и аккорды видите только вы.
    </p>

    <p v-if="error" class="error">{{ error }}</p>

    <section class="catalog-section">
      <div class="section-head">
        <h2>Инструменты</h2>
        <router-link class="add-btn" to="/catalog/instruments/new">+ Инструмент</router-link>
      </div>

      <div v-if="instrumentsStoreInstance.isLoading && instruments.length === 0" class="empty">Загрузка…</div>
      <div v-else-if="instruments.length === 0" class="empty">Пока нет доступных инструментов.</div>
      <div v-else class="item-list">
        <div v-for="item in instruments" :key="item.id" class="item-row">
          <div class="item-main">
            <strong>{{ item.name }}</strong>
            <span class="meta">
              {{ item.frets }} ладов · строй:
              {{ item.tuning.map(noteName).join(' ') }}
            </span>
          </div>
          <span class="badge">{{ item.global ? 'общий' : 'мой' }}</span>
          <div v-if="canEdit(item.global)" class="item-actions">
            <router-link :to="`/catalog/instruments/${item.id}/edit`">Изменить</router-link>
            <button type="button" @click="removeInstrument(item)">Удалить</button>
          </div>
        </div>
      </div>
    </section>

    <section class="catalog-section">
      <div class="section-head">
        <h2>Лады</h2>
        <router-link class="add-btn" to="/catalog/modes/new">+ Лад</router-link>
      </div>

      <div v-if="modesStoreInstance.isLoading && modes.length === 0" class="empty">Загрузка…</div>
      <div v-else-if="modes.length === 0" class="empty">Пока нет доступных ладов.</div>
      <div v-else class="item-list">
        <div v-for="item in modes" :key="item.id" class="item-row">
          <div class="item-main">
            <strong>{{ item.name }}</strong>
            <span class="meta">{{ formula(item.intervals) }}</span>
          </div>
          <span class="badge">{{ item.global ? 'общий' : 'мой' }}</span>
          <div v-if="canEdit(item.global)" class="item-actions">
            <router-link :to="`/catalog/modes/${item.id}/edit`">Изменить</router-link>
            <button type="button" @click="removeMode(item)">Удалить</button>
          </div>
        </div>
      </div>
    </section>

    <section class="catalog-section">
      <div class="section-head">
        <h2>Аккорды</h2>
        <router-link class="add-btn" to="/catalog/chords/new">+ Аккорд</router-link>
      </div>

      <div v-if="chordsStoreInstance.isLoading && chords.length === 0" class="empty">Загрузка…</div>
      <div v-else-if="chords.length === 0" class="empty">Пока нет доступных аккордов.</div>
      <div v-else class="item-list">
        <div v-for="item in chords" :key="item.id" class="item-row">
          <div class="item-main">
            <strong>{{ item.name }}</strong>
            <span class="meta">{{ formula(item.intervals) }}</span>
          </div>
          <span class="badge">{{ item.global ? 'общий' : 'мой' }}</span>
          <div v-if="canEdit(item.global)" class="item-actions">
            <router-link :to="`/catalog/chords/${item.id}/edit`">Изменить</router-link>
            <button type="button" @click="removeChord(item)">Удалить</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { instrumentsStore } from '@/stores/instruments'
import { modesStore } from '@/stores/modes'
import { chordsStore } from '@/stores/chords'
import { authStore } from '@/stores/auth'
import type { Chord, Instrument, Mode } from '@/api'
import { errorMessage, noteName } from '@/api'

const auth = authStore()
const instrumentsStoreInstance = instrumentsStore()
const modesStoreInstance = modesStore()
const chordsStoreInstance = chordsStore()

const error = ref<string | null>(null)

const instruments = computed(() => instrumentsStoreInstance.instruments)
const modes = computed(() => modesStoreInstance.modes)
const chords = computed(() => chordsStoreInstance.chords)

function canEdit(global: boolean): boolean {
  return !global || auth.isAdmin
}

function formula(intervals: number[]): string {
  const cumulative = [0]
  intervals.forEach((step, index) => cumulative.push(cumulative[index] + step))
  return cumulative.join(' · ')
}

async function loadAll(): Promise<void> {
  error.value = null
  await Promise.all([
    instrumentsStoreInstance.load(true),
    modesStoreInstance.load(true),
    chordsStoreInstance.load(true)
  ])
}

async function removeInstrument(item: Instrument) {
  if (!window.confirm(`Удалить инструмент «${item.name}»?`)) return
  try {
    await instrumentsStoreInstance.remove(item.id)
  } catch (e) {
    error.value = errorMessage(e)
  }
}

async function removeMode(item: Mode) {
  if (!window.confirm(`Удалить лад «${item.name}»?`)) return
  try {
    await modesStoreInstance.remove(item.id)
  } catch (e) {
    error.value = errorMessage(e)
  }
}

async function removeChord(item: Chord) {
  if (!window.confirm(`Удалить аккорд «${item.name}»?`)) return
  try {
    await chordsStoreInstance.remove(item.id)
  } catch (e) {
    error.value = errorMessage(e)
  }
}

onMounted(loadAll)
</script>

<style scoped>
.heading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.35rem;
}

.subtitle {
  color: var(--color-muted);
  margin-bottom: 1.25rem;
  font-size: 0.92rem;
}

.catalog-section {
  margin-bottom: 2rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}

.section-head h2 {
  font-size: 1.15rem;
}

.add-btn {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.88rem;
}

.add-btn:hover {
  background: var(--color-primary-soft);
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.item-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-right: auto;
  min-width: 0;
}

.item-main strong {
  overflow-wrap: anywhere;
}

.meta {
  color: var(--color-muted);
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.badge {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--color-primary-soft);
  color: var(--color-text);
  white-space: nowrap;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.item-actions a {
  color: var(--color-primary);
}

.item-actions button {
  border: none;
  background: none;
  color: var(--color-danger);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem;
}

.error {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.empty {
  padding: 1.25rem 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-muted);
  text-align: center;
  font-size: 0.9rem;
}
</style>
