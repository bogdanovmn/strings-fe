<template>
  <div class="form-view">
    <div class="heading-row">
      <BackButton fallback="/catalog" />
      <h1>{{ isEdit ? 'Изменить инструмент' : 'Новый инструмент' }}</h1>
    </div>

    <div v-if="loading" class="empty">Загрузка…</div>

    <form v-else class="form" @submit.prevent="save">
      <label>
        Название
        <input v-model="name" maxlength="100" placeholder="Например, Гитара 6" required />
      </label>

      <label>
        Количество ладов
        <input v-model.number="frets" type="number" :min="MIN_FRETS" :max="MAX_FRETS" required />
      </label>

      <div class="field-label">Строй</div>
      <StringTuningEditor v-model="tuning" />

      <div v-if="auth.isAdmin && !isEdit" class="global-row">
        <input id="global" v-model="global" type="checkbox" />
        <label for="global">Общий инструмент (доступен всем)</label>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="form-actions">
        <button type="submit" :disabled="!valid || saving">
          {{ saving ? 'Сохраняем…' : 'Сохранить' }}
        </button>
        <button type="button" class="cancel" @click="router.push('/catalog')">Отмена</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import StringTuningEditor from '@/components/StringTuningEditor.vue'
import { instrumentsStore } from '@/stores/instruments'
import { authStore } from '@/stores/auth'
import type { InstrumentRequest } from '@/api'
import { errorMessage, getInstrument, MAX_FRETS, MAX_MIDI, MAX_STRINGS, MIN_FRETS, MIN_MIDI, MIN_STRINGS } from '@/api'

const props = defineProps<{ id?: string }>()

const router = useRouter()
const auth = authStore()
const instrumentsStoreInstance = instrumentsStore()

const name = ref('')
const frets = ref(24)
const tuning = ref<number[]>([40, 45, 50, 55, 59, 64])
const global = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const isEdit = computed(() => Boolean(props.id))

const valid = computed(() =>
  name.value.trim().length > 0
  && Number.isInteger(frets.value)
  && frets.value >= MIN_FRETS
  && frets.value <= MAX_FRETS
  && tuning.value.length >= MIN_STRINGS
  && tuning.value.length <= MAX_STRINGS
  && tuning.value.every(midi => midi >= MIN_MIDI && midi <= MAX_MIDI)
)

async function save() {
  if (!valid.value) return
  saving.value = true
  error.value = null
  const request: InstrumentRequest = {
    name: name.value.trim(),
    frets: frets.value,
    tuning: [...tuning.value]
  }
  if (!isEdit.value && auth.isAdmin) {
    request.global = global.value
  }
  try {
    if (isEdit.value && props.id) {
      await instrumentsStoreInstance.update(props.id, request)
    } else {
      await instrumentsStoreInstance.create(request)
    }
    router.push('/catalog')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!props.id) return
  loading.value = true
  try {
    const item = await getInstrument(props.id)
    name.value = item.name
    frets.value = item.frets
    tuning.value = [...item.tuning]
    global.value = item.global
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.heading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

h1 {
  font-size: 1.35rem;
}

.form {
  max-width: 560px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.form > label,
.field-label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.field-label {
  margin-top: 0.5rem;
  margin-bottom: 0.4rem;
}

.form input[type='text'],
.form input[type='number'],
.form input:not([type]) {
  width: 100%;
}

.form input[type='text'],
.form input[type='number'],
.form input:not([type]) {
  padding: 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-bottom: 1rem;
  min-height: 42px;
}

.global-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.8rem 0;
}

.global-row label {
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.form-actions button {
  padding: 0.55rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  min-height: 42px;
  font-size: 1rem;
}

.form-actions button[type='submit'] {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.form-actions button[type='submit']:disabled {
  opacity: 0.55;
  cursor: default;
}

.cancel {
  background: var(--color-bg);
  color: var(--color-text);
}

.error {
  padding: 0.6rem 0.8rem;
  margin: 0.5rem 0;
  border-radius: 6px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.empty {
  padding: 2rem 1rem;
  color: var(--color-muted);
  text-align: center;
}
</style>
