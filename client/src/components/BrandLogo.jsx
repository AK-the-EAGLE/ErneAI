import useTheme from '../hooks/useTheme.js'

const logoPaths = {
  light: '/logos/erne-ai-logo-light.png',
  dark: '/logos/erne-ai-logo-dark.png',
}

export default function BrandLogo() {
  const { theme } = useTheme()

  return (
    <img
      className="brand-logo"
      src={logoPaths[theme]}
      alt="Erne AI logo"
      width="165"
      height="49"
      draggable="false"
    />
  )
}
