// Theme management store for dark/light mode switching
import { defineStore } from 'pinia'

export interface ThemeState {
  isDarkMode: boolean
  isInitialized: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDarkMode: false,
    isInitialized: false
  }),

  getters: {
    currentTheme: (state): 'dark' | 'light' => {
      return state.isDarkMode ? 'dark' : 'light'
    },
    
    logoSrc: (state): string => {
      return state.isDarkMode ? '/logo-dark.svg' : '/logo.svg'
    }
  },

  actions: {
    // Initialize theme from localStorage or system preference
    initializeTheme() {
      if (process.client && !this.isInitialized) {
        // Check localStorage first
        const savedTheme = localStorage.getItem('isDarkMode')
        
        if (savedTheme !== null) {
          this.isDarkMode = savedTheme === 'true'
        } else {
          // Fall back to system preference
          this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        
        // Apply theme to document
        this.applyTheme()
        this.isInitialized = true
      }
    },

    // Toggle between dark and light mode
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.saveTheme()
      this.applyTheme()
    },

    // Set specific theme
    setTheme(isDark: boolean) {
      this.isDarkMode = isDark
      this.saveTheme()
      this.applyTheme()
    },

    // Apply theme to document
    applyTheme() {
      if (process.client) {
        const htmlElement = document.documentElement
        
        if (this.isDarkMode) {
          htmlElement.classList.add('dark')
        } else {
          htmlElement.classList.remove('dark')
        }
      }
    },

    // Save theme preference to localStorage
    saveTheme() {
      if (process.client) {
        localStorage.setItem('isDarkMode', this.isDarkMode.toString())
      }
    },

    // Listen for system theme changes
    watchSystemTheme() {
      if (process.client) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        mediaQuery.addEventListener('change', (e) => {
          // Only update if user hasn't manually set a preference
          const savedTheme = localStorage.getItem('isDarkMode')
          if (savedTheme === null) {
            this.isDarkMode = e.matches
            this.applyTheme()
          }
        })
      }
    }
  }
})
