import { useEffect, useRef } from 'react'

export default function ScrollReveal({ as: Element = 'div', className = '', children, style, ...props }) {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      element.classList.add('is-visible')
      return
    }

    element.classList.add('is-ready')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible')
        observer.unobserve(element)
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })

    observer.observe(element)
    return () => {
      observer.disconnect()
      element.classList.remove('is-ready', 'is-visible')
    }
  }, [])

  return (
    <Element {...props} ref={elementRef} className={`scroll-reveal${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </Element>
  )
}
