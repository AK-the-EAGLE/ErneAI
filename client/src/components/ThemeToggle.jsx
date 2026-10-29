import { FaMoon, FaSun } from 'react-icons/fa'
import useTheme from '../hooks/useTheme.js'

export default function ThemeToggle({ onToggle }) {
  const { theme, toggleTheme, storageError } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <div className="theme-toggle-wrap">
      <button
        className="theme-toggle"
        type="button"
        onClick={() => {
          toggleTheme()
          onToggle?.()
        }}
        aria-label={`Switch to ${nextTheme} theme`}
        title={`Switch to ${nextTheme} theme`}
      >
        {theme === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
      </button>
      {storageError && <span className="sr-only" role="status">{storageError}</span>}
    </div>
  )
}
