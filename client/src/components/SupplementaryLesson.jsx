import { useRef, useState } from 'react'
import { api } from '../services/api.js'

export default function SupplementaryLesson({ level, initialTopic = '', onGenerated }) {
  const [topic, setTopic] = useState(initialTopic)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestInFlight = useRef(false)

  async function generateLesson(event) {
    event.preventDefault()
    if (requestInFlight.current) return

    requestInFlight.current = true
    setLoading(true)
    setError('')
    try {
      const submittedTopic = topic.trim()
      const result = await api.generateSupplementaryLesson(submittedTopic)
      if (typeof result.id !== 'string' || !result.id) {
        throw new Error('The saved lesson could not be opened. Please try again.')
      }
      onGenerated(result, submittedTopic)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      requestInFlight.current = false
      setLoading(false)
    }
  }

  return (
    <section className="supplementary-generator" aria-labelledby="supplementary-generator-heading">
      <div className="supplementary-generator-heading">
        <div>
          <span className="context-label">GROQ-POWERED EXTRA PRACTICE</span>
          <h2 id="supplementary-generator-heading">Explore a topic you care about</h2>
          <p>Generate one extra {level} lesson. It will open in the same interactive lesson experience as your course.</p>
        </div>
      </div>
      <form className="supplementary-topic-form" onSubmit={generateLesson}>
        <label htmlFor="supplementary-topic">Lesson topic</label>
        <div>
          <input
            id="supplementary-topic"
            name="topic"
            type="text"
            value={topic}
            maxLength={80}
            minLength={2}
            required
            placeholder="For example, talking about the weather"
            onChange={(event) => setTopic(event.target.value)}
            disabled={loading}
          />
          <button className="button button-dark" type="submit" disabled={loading || topic.trim().length < 2}>
            {loading ? 'Creating lesson…' : 'Create lesson'}
          </button>
        </div>
      </form>
      {error && <p className="supplementary-error" role="alert">{error}</p>}
    </section>
  )
}
