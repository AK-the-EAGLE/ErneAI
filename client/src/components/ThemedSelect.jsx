import { Children, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaChevronDown } from 'react-icons/fa'

function optionLabel(children) {
  return Children.toArray(children).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return child
    if (isValidElement(child)) return optionLabel(child.props.children)
    return ''
  }).join('')
}

export default function ThemedSelect({
  className = '',
  wrapperClassName = '',
  density = 'default',
  id,
  value,
  defaultValue,
  onChange,
  children,
  disabled = false,
  ...props
}) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const listboxId = `${controlId}-options`
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const optionRefs = useRef([])
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuStyle, setMenuStyle] = useState({})
  const selectedValue = value ?? uncontrolledValue
  const options = Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === 'option')
    .map((child) => ({
      value: String(child.props.value ?? optionLabel(child.props.children)),
      label: optionLabel(child.props.children),
      disabled: Boolean(child.props.disabled),
    }))
  const selectedIndex = options.findIndex((option) => option.value === String(selectedValue))
  const selectedOption = options[selectedIndex]
  const classes = ['themed-select', density === 'compact' ? 'themed-select-compact' : '', className]
    .filter(Boolean)
    .join(' ')

  function enabledIndex(start, direction) {
    let index = start
    while (index >= 0 && index < options.length) {
      if (!options[index].disabled) return index
      index += direction
    }
    return -1
  }

  const closeMenu = useCallback((returnFocus = false) => {
    setIsOpen(false)
    setActiveIndex(-1)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  function openMenu(preferredIndex = selectedIndex) {
    if (disabled) return
    const firstEnabled = enabledIndex(0, 1)
    setActiveIndex(preferredIndex >= 0 && !options[preferredIndex]?.disabled ? preferredIndex : firstEnabled)
    setIsOpen(true)
  }

  function chooseOption(index) {
    const option = options[index]
    if (!option || option.disabled) return
    if (value === undefined) setUncontrolledValue(option.value)
    onChange?.({ target: { value: option.value }, currentTarget: { value: option.value } })
    closeMenu(true)
  }

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = window.innerHeight
    const left = Math.max(8, Math.min(rect.left, viewportWidth - rect.width - 8))
    const width = Math.min(rect.width, viewportWidth - 16)
    const roomBelow = viewportHeight - rect.bottom - 8
    const roomAbove = rect.top - 8
    const openAbove = roomBelow < 220 && roomAbove > roomBelow
    const maxHeight = Math.max(100, openAbove ? roomAbove : roomBelow)
    const estimatedHeight = Math.min(options.length * 40 + 8, maxHeight)
    const top = openAbove ? Math.max(8, rect.top - estimatedHeight - 6) : rect.bottom + 6
    setMenuStyle({ position: 'fixed', top, left, width, maxHeight, zIndex: 10000 })
  }, [options.length])

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      if (!isOpen) {
        const selectedPosition = selectedIndex < 0
          ? (direction === 1 ? -1 : options.length)
          : selectedIndex
        const nextIndex = enabledIndex(selectedPosition + direction, direction)
        openMenu(nextIndex >= 0 ? nextIndex : selectedIndex)
        return
      }
      let next = activeIndex + direction
      while (next >= 0 && next < options.length && options[next].disabled) next += direction
      if (next >= 0 && next < options.length) setActiveIndex(next)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      if (!isOpen) return
      event.preventDefault()
      setActiveIndex(enabledIndex(event.key === 'Home' ? 0 : options.length - 1, event.key === 'Home' ? 1 : -1))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isOpen) chooseOption(activeIndex)
      else openMenu()
      return
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      closeMenu(true)
      return
    }

    if (event.key === 'Tab' && isOpen) {
      closeMenu()
    }
  }

  useLayoutEffect(() => {
    if (isOpen) updateMenuPosition()
  }, [isOpen, updateMenuPosition])

  useEffect(() => {
    if (!isOpen) return undefined

    function dismissOutside(event) {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        closeMenu()
      }
    }

    function reposition() {
      updateMenuPosition()
    }

    document.addEventListener('pointerdown', dismissOutside)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [closeMenu, isOpen, updateMenuPosition])

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    const menu = menuRef.current
    const option = optionRefs.current[activeIndex]
    if (!menu || !option) return
    const optionTop = option.offsetTop
    const optionBottom = optionTop + option.offsetHeight
    if (optionTop < menu.scrollTop) menu.scrollTop = optionTop
    else if (optionBottom > menu.scrollTop + menu.clientHeight) {
      menu.scrollTop = optionBottom - menu.clientHeight
    }
  }, [activeIndex, isOpen])

  return (
    <span className={`themed-select-wrap${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <button
        {...props}
        ref={triggerRef}
        id={controlId}
        type="button"
        role="combobox"
        className={classes}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => isOpen ? closeMenu() : openMenu()}
        onKeyDown={handleKeyDown}
      >
        <span className="themed-select-value">{selectedOption?.label ?? ''}</span>
        <FaChevronDown className="themed-select-chevron" aria-hidden="true" />
      </button>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          className="themed-select-menu"
          role="listbox"
          aria-labelledby={controlId}
          style={menuStyle}
        >
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              ref={(element) => { optionRefs.current[index] = element }}
              id={`${listboxId}-${index}`}
              className={[
                'themed-select-option',
                selectedIndex === index ? 'is-selected' : '',
                activeIndex === index ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={selectedIndex === index}
              disabled={option.disabled}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onClick={() => chooseOption(index)}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </span>
  )
}
