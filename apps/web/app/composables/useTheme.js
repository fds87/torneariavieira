import { ref, watch, onMounted } from 'vue'

const isDark = ref(true) // default DARK

function applyTheme(dark) {
  if (process.client) {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
}

function initTheme() {
  const saved = localStorage.getItem('theme')
  isDark.value = saved ? saved === 'dark' : true // sem preferência salva => dark
  applyTheme(isDark.value)
}

watch(isDark, applyTheme)

export function useTheme() {
  onMounted(initTheme)
  return { isDark, toggleTheme }
}
