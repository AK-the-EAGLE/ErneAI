import { useEffect } from 'react'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { scenarios } from '../data/scenarios.js'
import Learn from './Learn.jsx'

export default function ExplorePage() {
  const { scenarioId } = useParams()
  const {
    favorites,
    favoritesLoading,
    pendingFavoriteKeys,
    onToggleFavorite,
    progress: { loading: progressLoading, markScenarioVisited },
  } = useOutletContext()
  const scenario = scenarios.find((item) => item.id === scenarioId)

  useEffect(() => {
    if (scenario && !progressLoading) markScenarioVisited(scenario.id)
  }, [markScenarioVisited, progressLoading, scenario])

  if (scenarioId && !scenarios.some((scenario) => scenario.id === scenarioId)) {
    return <Navigate to="/explore" replace />
  }

  return (
    <Learn
      favorites={favorites}
      favoritesLoading={favoritesLoading}
      pendingFavoriteKeys={pendingFavoriteKeys}
      onToggleFavorite={onToggleFavorite}
      scenarioId={scenarioId}
    />
  )
}
