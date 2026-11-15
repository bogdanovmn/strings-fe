<template>
  <div class="home">
    <h1>Strings</h1>
    <p class="lead">
      Аппликатуры гамм и арпеджио, аккорды на грифах струнных инструментов,
      подбор лада под последовательность аккордов.
    </p>
    <div class="cta">
      <button class="btn-primary" @click="handleLogin">Войти</button>
    </div>

    <div class="features">
      <div class="feature">
        <h2>Аппликатуры</h2>
        <p>Гаммы и арпеджио в выбранном окне ладов, с табулатурой и схемой грифа.</p>
      </div>
      <div class="feature">
        <h2>Аккорды в ладу</h2>
        <p>Все аккорды на ступенях лада, ноты которых целиком входят в лад.</p>
      </div>
      <div class="feature">
        <h2>Подбор лада</h2>
        <p>Обратный поиск: какие лады и тональности подходят под набор аккордов.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLogin() {
  router.push('/login')
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2.5rem 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  letter-spacing: 0.06em;
}

.lead {
  max-width: 640px;
  margin: 0 auto 1.5rem;
  font-size: 1.05rem;
  color: var(--color-muted);
}

.cta {
  margin-top: 1.5rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.7rem 1.8rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  text-decoration: none;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  cursor: pointer;
  min-height: 44px;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 2.5rem;
  text-align: left;
}

.feature {
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.feature h2 {
  font-size: 1.05rem;
  margin-bottom: 0.35rem;
}

.feature p {
  color: var(--color-muted);
  font-size: 0.92rem;
}

@media (min-width: 768px) {
  .home {
    padding: 3.5rem 2rem;
  }

  h1 {
    font-size: 2.4rem;
  }

  .features {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}
</style>
