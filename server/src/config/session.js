const durationUnits = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
}

export function getSessionSettings() {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  const match = /^([1-9]\d*)(s|m|h|d)$/.exec(expiresIn)
  const maxAge = match ? Number(match[1]) * durationUnits[match[2]] : NaN

  if (!Number.isSafeInteger(maxAge)) {
    throw new Error('JWT_EXPIRES_IN must be a positive duration such as 30m, 12h, or 7d.')
  }

  return { expiresIn, maxAge }
}
