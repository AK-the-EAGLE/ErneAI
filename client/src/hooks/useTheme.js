import { useContext } from 'react'
import { ThemeContext } from '../context/themeContextObject.js'

export default function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider.')
  return theme
}
