import { useCallback, useEffect, useState } from 'react'
import * as authService from '../services/authService.js'
import { AuthContext } from './authContextObject.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const updateSessionFromServer = useCallback(async (isStillMounted = () => true) => {
    try {
      const restoredUser = await authService.restoreSession()
      if (isStillMounted()) {
        setUser(restoredUser)
        setAuthError('')
      }
    } catch (error) {
      if (isStillMounted()) {
        setUser(null)
        setAuthError(error.status === 401 ? '' : error.message)
      }
    } finally {
      if (isStillMounted()) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    Promise.resolve().then(() => {
      if (isMounted) updateSessionFromServer(() => isMounted)
    })

    return () => { isMounted = false }
  }, [updateSessionFromServer])

  const restoreSession = useCallback(async () => {
    setLoading(true)
    setAuthError('')
    await updateSessionFromServer()
  }, [updateSessionFromServer])

  async function login(email, password) {
    const signedInUser = await authService.login(email, password)
    setUser(signedInUser)
    setAuthError('')
    return signedInUser
  }

  async function signup(profile) {
    const newUser = await authService.signup(profile)
    setUser(newUser)
    setAuthError('')
    return newUser
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  const value = { user, loading, authError, restoreSession, login, signup, logout, setUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
