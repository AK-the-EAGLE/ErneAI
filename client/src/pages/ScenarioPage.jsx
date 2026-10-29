import { Navigate, useParams } from 'react-router-dom'

export default function ScenarioPage() {
  const { scenarioId } = useParams()

  if (!scenarioId) return <Navigate to="/explore" replace />
  return <Navigate to={`/explore/${scenarioId}`} replace />
}
