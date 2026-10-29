import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'

export default function useFavorites(userId) {
  const [favoriteState, setFavoriteState] = useState({ userId: null, items: [] })
  const [noticeState, setNoticeState] = useState({ userId: null, error: '', message: '' })
  const [pendingKeys, setPendingKeys] = useState([])
  const [loadState, setLoadState] = useState({ userId: null, loaded: false, loading: false })
  const requestVersions = useRef(new Map())
  const pendingRequests = useRef(new Set())

  const favorites = favoriteState.userId === userId ? favoriteState.items : []
  const favoritesError = noticeState.userId === userId ? noticeState.error : ''
  const favoritesMessage = noticeState.userId === userId ? noticeState.message : ''
  const pendingFavoriteKeys = pendingKeys
    .filter((key) => key.startsWith(`${userId}:`))
    .map((key) => key.slice(userId.length + 1))
  const favoritesLoading = loadState.userId !== userId || !loadState.loaded || loadState.loading

  useEffect(() => {
    const versions = requestVersions.current
    const request = (versions.get(userId) ?? 0) + 1
    versions.set(userId, request)
    api.getFavorites()
      .then((savedFavorites) => {
        if (versions.get(userId) === request) {
          setFavoriteState({ userId, items: savedFavorites })
        }
      })
      .catch((error) => {
        if (versions.get(userId) === request) {
          setNoticeState({ userId, error: error.message, message: '' })
        }
      })
      .finally(() => {
        if (versions.get(userId) === request) {
          setLoadState({ userId, loaded: true, loading: false })
        }
      })
    return () => {
      versions.set(userId, (versions.get(userId) ?? 0) + 1)
    }
  }, [userId])

  const refreshFavorites = useCallback(async () => {
    const versions = requestVersions.current
    const request = (versions.get(userId) ?? 0) + 1
    versions.set(userId, request)
    setLoadState({ userId, loaded: false, loading: true })
    setNoticeState({ userId, error: '', message: '' })
    try {
      const savedFavorites = await api.getFavorites()
      if (versions.get(userId) === request) {
        setFavoriteState({ userId, items: savedFavorites })
      }
    } catch (error) {
      if (versions.get(userId) === request) {
        setNoticeState({ userId, error: error.message, message: '' })
      }
    } finally {
      if (versions.get(userId) === request) {
        setLoadState({ userId, loaded: true, loading: false })
      }
    }
  }, [userId])

  const toggleFavorite = useCallback(async (phrase) => {
    const itemKey = phrase.key ?? `${phrase.kind ?? 'phrase'}:${phrase.id}`
    const pendingKey = `${userId}:${itemKey}`
    if (pendingRequests.current.has(pendingKey)) return

    pendingRequests.current.add(pendingKey)
    setPendingKeys((current) => [...new Set([...current, pendingKey])])
    setNoticeState({ userId, error: '', message: '' })

    const savedItem = favoriteState.userId === userId
      ? favoriteState.items.find((item) => item.key === itemKey)
      : null

    try {
      if (savedItem) {
        await api.removeFavorite(savedItem.favoriteId)
        requestVersions.current.set(userId, (requestVersions.current.get(userId) ?? 0) + 1)
        setFavoriteState((current) => ({
          ...current,
          items: current.userId === userId ? current.items.filter((item) => item.key !== itemKey) : current.items,
        }))
        setNoticeState({ userId, error: '', message: 'Removed from your favorites.' })
      } else {
        const savedPhrase = await api.addFavorite(phrase)
        requestVersions.current.set(userId, (requestVersions.current.get(userId) ?? 0) + 1)
        setFavoriteState((current) => ({
          ...current,
          items: current.userId === userId
            ? [savedPhrase, ...current.items.filter((item) => item.key !== savedPhrase.key)]
            : current.items,
        }))
        setNoticeState({ userId, error: '', message: 'Saved to your favorites.' })
      }
    } catch (error) {
      setNoticeState({ userId, error: error.message, message: '' })
    } finally {
      pendingRequests.current.delete(pendingKey)
      setPendingKeys((current) => current.filter((key) => key !== pendingKey))
    }
  }, [favoriteState, userId])

  return {
    favorites,
    favoritesError,
    favoritesMessage,
    favoritesLoading,
    pendingFavoriteKeys,
    refreshFavorites,
    toggleFavorite,
  }
}
