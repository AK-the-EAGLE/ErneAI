import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContextObject.js'

function getInitialTheme() {
  const savedTheme = document.documentElement.dataset.theme
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme

  try {
    const storedTheme = window.localStorage.getItem('erne-ai-theme')
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme
  } catch {
    // The system preference still works when browser storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101a17' : '#f8f7f2'
  }, [theme])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)

    try {
      window.localStorage.setItem('erne-ai-theme', nextTheme)
      setStorageError('')
    } catch {
      setStorageError('Your theme choice could not be saved in this browser.')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, storageError }}>
      {children}
    </ThemeContext.Provider>
  )
}
