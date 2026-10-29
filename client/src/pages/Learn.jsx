import { useEffect, useRef, useState } from 'react'
import { FaArrowRight, FaSearch, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PhraseCard from '../components/PhraseCard.jsx'
import ScenarioCard from '../components/ScenarioCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import { api } from '../services/api.js'
import { scenarios } from '../data/scenarios.js'

export default function Learn({ favorites, favoritesLoading, pendingFavoriteKeys, onToggleFavorite, scenarioId }) {
  const [customSituation, setCustomSituation] = useState('')
  const [customResult, setCustomResult] = useState({ situation: '', phrases: [], error: '', loading: false })
  const [scenarioResult, setScenarioResult] = useState({ key: '', phrases: [], error: '' })
  const [scenarioRetry, setScenarioRetry] = useState(0)
  const [searchState, setSearchState] = useState({ scenarioId: '', value: '' })
  const [scenarioGenerationStates, setScenarioGenerationStates] = useState({})
  const [scenarioGeneratedResult, setScenarioGeneratedResult] = useState(null)
  const [heroIllustrationFailed, setHeroIllustrationFailed] = useState(false)
  const customRequestRef = useRef(false)
  const scenarioRequestsRef = useRef(new Map())
  const scenarioRequestVersionsRef = useRef(new Map())
  const previousScenarioIdRef = useRef(scenarioId)
  const currentScenarioIdRef = useRef(scenarioId)
  currentScenarioIdRef.current = scenarioId
  const selectedScenario = scenarios.find((scenario) => scenario.id === scenarioId)
  const scenarioRequestKey = `${scenarioId ?? ''}:${scenarioRetry}`
  const scenarioLoading = Boolean(scenarioId) && scenarioResult.key !== scenarioRequestKey
  const scenarioError = scenarioLoading ? '' : scenarioResult.error
  const scenarioPhrases = scenarioLoading ? [] : scenarioResult.phrases
  const search = searchState.scenarioId === scenarioId ? searchState.value : ''
  const scenarioGenerationState = scenarioGenerationStates[scenarioId] ?? {
    loading: false,
    query: '',
    error: '',
  }
  const activeGeneratedResult = scenarioGeneratedResult?.scenarioId === scenarioId
    ? scenarioGeneratedResult
    : null

  useEffect(() => {
    const previousScenarioId = previousScenarioIdRef.current
    if (previousScenarioId === scenarioId) return

    if (previousScenarioId) {
      scenarioRequestVersionsRef.current.set(
        previousScenarioId,
        (scenarioRequestVersionsRef.current.get(previousScenarioId) ?? 0) + 1,
      )
      scenarioRequestsRef.current.delete(previousScenarioId)
      updateScenarioGenerationState(previousScenarioId, {
        loading: false,
        query: '',
        error: '',
      })
    }

    previousScenarioIdRef.current = scenarioId
    setScenarioGeneratedResult(null)
    setSearchState({ scenarioId, value: '' })
  }, [scenarioId])

  useEffect(() => {
    if (!scenarioId) return undefined

    const controller = new AbortController()
    let active = true

    api.generatePhrases({ scenarioId }, controller.signal)
      .then((result) => {
        if (!active) return
        if (!Array.isArray(result.phrases) || result.phrases.length === 0) {
          setScenarioResult({ key: scenarioRequestKey, phrases: [], error: 'The AI returned no phrases for this situation. Try again.' })
          return
        }
        setScenarioResult({ key: scenarioRequestKey, phrases: result.phrases, error: '' })
      })
      .catch((requestError) => {
        if (active) setScenarioResult({ key: scenarioRequestKey, phrases: [], error: requestError.message })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [scenarioId, scenarioRequestKey])

  function updateScenarioGenerationState(id, updates) {
    setScenarioGenerationStates((current) => ({
      ...current,
      [id]: {
        loading: false,
        query: '',
        error: '',
        ...current[id],
        ...updates,
      },
    }))
  }

  async function generateCustomSituation(situation) {
    if (customRequestRef.current) return
    const trimmed = situation.trim()

    if (!trimmed) {
      setCustomResult({ situation, phrases: [], error: 'Enter a situation before generating phrases.', loading: false })
      return
    }
    if (trimmed.length > 160) {
      setCustomResult({ situation, phrases: [], error: 'Keep your situation to 160 characters or fewer.', loading: false })
      return
    }

    customRequestRef.current = true
    setCustomResult({ situation: trimmed, phrases: [], error: '', loading: true })
    try {
      const result = await api.generatePhrases({ situation: trimmed })
      if (!Array.isArray(result.phrases) || result.phrases.length === 0) {
        setCustomResult({ situation: trimmed, phrases: [], error: 'The AI returned no phrases. Try again.', loading: false })
        return
      }
      setCustomResult({ situation: result.situation ?? trimmed, phrases: result.phrases, error: '', loading: false })
    } catch (requestError) {
      setCustomResult({ situation: trimmed, phrases: [], error: requestError.message, loading: false })
    } finally {
      customRequestRef.current = false
    }
  }

  function submitCustomSituation(event) {
    event.preventDefault()
    generateCustomSituation(customSituation)
  }

  async function generateScenarioPhrases(query) {
    if (!scenarioId || scenarioRequestsRef.current.has(scenarioId)) return

    const trimmed = query.trim()
    if (!trimmed) {
      updateScenarioGenerationState(scenarioId, {
        query: '',
        error: 'Enter a search or phrase request before generating.',
      })
      return
    }
    if (trimmed.length > 100) {
      updateScenarioGenerationState(scenarioId, {
        query: trimmed,
        error: 'Keep your phrase request to 100 characters or fewer.',
      })
      return
    }

    const requestVersion = (scenarioRequestVersionsRef.current.get(scenarioId) ?? 0) + 1
    scenarioRequestVersionsRef.current.set(scenarioId, requestVersion)
    scenarioRequestsRef.current.set(scenarioId, requestVersion)
    updateScenarioGenerationState(scenarioId, {
      loading: true,
      query: trimmed,
      error: '',
    })
    try {
      const result = await api.generatePhrases({ scenarioId, query: trimmed })
      if (!Array.isArray(result.phrases) || result.phrases.length === 0) {
        if (scenarioRequestVersionsRef.current.get(scenarioId) === requestVersion
          && currentScenarioIdRef.current === scenarioId) {
          updateScenarioGenerationState(scenarioId, {
            loading: false,
            error: 'The AI returned no phrases for this request. Try again.',
          })
        }
        return
      }

      if (scenarioRequestVersionsRef.current.get(scenarioId) === requestVersion
        && currentScenarioIdRef.current === scenarioId) {
        setScenarioGeneratedResult({ scenarioId, query: trimmed, phrases: result.phrases })
        updateScenarioGenerationState(scenarioId, { loading: false, error: '' })
      }
    } catch (requestError) {
      if (scenarioRequestVersionsRef.current.get(scenarioId) === requestVersion
        && currentScenarioIdRef.current === scenarioId) {
        updateScenarioGenerationState(scenarioId, {
          loading: false,
          error: requestError.message,
        })
      }
    } finally {
      if (scenarioRequestsRef.current.get(scenarioId) === requestVersion) {
        scenarioRequestsRef.current.delete(scenarioId)
      }
    }
  }

  function submitScenarioSearch(event) {
    event.preventDefault()
    generateScenarioPhrases(search)
  }

  function clearScenarioSearch(event) {
    event?.preventDefault()
    event?.stopPropagation()
    const requestVersion = (scenarioRequestVersionsRef.current.get(scenarioId) ?? 0) + 1
    scenarioRequestVersionsRef.current.set(scenarioId, requestVersion)
    scenarioRequestsRef.current.delete(scenarioId)
    setScenarioGeneratedResult(null)
    setSearchState({ scenarioId, value: '' })
    updateScenarioGenerationState(scenarioId, { loading: false, query: '', error: '' })
  }

  function renderPhrase(phrase) {
    const key = `phrase:${phrase.id}`
    return (
      <PhraseCard
        key={phrase.id}
        phrase={phrase}
        isFavorite={favorites.some((item) => item.key === key)}
        isPending={pendingFavoriteKeys.includes(key)}
        isFavoriteStateLoading={favoritesLoading}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  const normalizedSearch = search.trim().toLocaleLowerCase()
  const visibleScenarioPhrases = scenarioPhrases.filter((phrase) => (
    [phrase.kannada, phrase.transliteration, phrase.english, phrase.context]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch))
  ))

  return (
    <div className="portal-page learn-page page-width">
      {!scenarioId ? (
        <>
          <header className={`page-intro explore-page-intro${heroIllustrationFailed ? ' no-art' : ''}`}>
            <div className="explore-hero-copy">
              <span className="eyebrow"><span className="eyebrow-line" /> EXPLORE PHRASES</span>
              <h1>Useful Kannada,<br /><em>for real moments.</em></h1>
              <p>Choose an everyday situation or describe your own to generate useful, level-appropriate Kannada phrases.</p>
            </div>
            {!heroIllustrationFailed && (
              <div className="explore-hero-art">
                <img
                  src="/images/explore-phrases-hero.png"
                  alt="Illustration of everyday Kannada conversations"
                  decoding="async"
                  onError={() => setHeroIllustrationFailed(true)}
                />
              </div>
            )}
          </header>

          <section className="explore-custom-section" aria-labelledby="custom-situation-heading">
            <h2 id="custom-situation-heading">What situation do you need Kannada for?</h2>
            <form className="learn-controls explore-situation-form" onSubmit={submitCustomSituation}>
              <label className="search-field">
                <FaSearch aria-hidden="true" />
                <span className="sr-only">Describe the situation you need Kannada for</span>
                <input
                  value={customSituation}
                  onChange={(event) => {
                    setCustomSituation(event.target.value)
                    if (customResult.error) setCustomResult((current) => ({ ...current, error: '' }))
                  }}
                  placeholder="e.g. Talking to an auto driver..."
                  maxLength={160}
                  aria-describedby="custom-situation-help"
                />
                <button
                  type="button"
                  className="clear-search"
                  aria-label="Clear situation"
                  onClick={() => setCustomSituation('')}
                  hidden={!customSituation}
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </label>
              <button className="button button-dark" type="submit" disabled={customResult.loading}>
                {customResult.loading ? <><span className="loading-spinner" aria-hidden="true" /> Generating…</> : 'Generate phrases'}
              </button>
            </form>
            <p id="custom-situation-help" className="learn-note">Your saved learning level is applied automatically.</p>

            {customResult.loading && (
              <p className="request-status" role="status" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" /> Generating phrases for “{customResult.situation}”…
              </p>
            )}
            {customResult.error && (
              <div className="empty-state" role="alert">
                <span className="empty-mark"><FaSearch aria-hidden="true" /></span>
                <h2>Could not generate phrases</h2>
                <p>{customResult.error}</p>
                {customResult.situation.trim() && (
                  <button
                    className="button button-dark"
                    type="button"
                    disabled={customResult.loading}
                    onClick={() => generateCustomSituation(customResult.situation)}
                  >
                    Try again <FaArrowRight aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
            {customResult.phrases.length > 0 && !customResult.loading && (
              <section className="explore-generated-results" aria-labelledby="custom-phrases-heading">
                <div className="phrase-results-heading">
                  <h2 id="custom-phrases-heading">Phrases for “{customResult.situation}”</h2>
                  <span>{customResult.phrases.length} {customResult.phrases.length === 1 ? 'phrase' : 'phrases'}</span>
                </div>
                <ScrollReveal as="div" className="phrase-grid phrase-card-group">
                  {customResult.phrases.map(renderPhrase)}
                </ScrollReveal>
              </section>
            )}
          </section>

          <section className="explore-scenarios-section" aria-labelledby="explore-scenarios-heading">
            <div className="phrase-results-heading">
              <h2 id="explore-scenarios-heading">Choose a situation</h2>
              <span>{scenarios.length} everyday moments</span>
            </div>
            <ScrollReveal as="div" className="scenario-grid scenario-card-group">
              {scenarios.map((scenario, index) => (
                <ScenarioCard key={scenario.id} scenario={scenario} index={index} to={`/explore/${scenario.id}`} />
              ))}
            </ScrollReveal>
          </section>
          <p className="learn-note">Phrase content supports language practice and is not professional or medical advice.</p>
        </>
      ) : (
        <>
          <header className="page-intro">
            <Link className="text-link" to="/explore">← All situations</Link>
            <span className="eyebrow"><span className="eyebrow-line" /> {selectedScenario?.name}</span>
            <h1>Words for this<br /><em>moment.</em></h1>
            <p>{selectedScenario?.description} Generated phrases are matched to your saved learning level.</p>
          </header>
          <form className="learn-controls explore-phrase-search" onSubmit={submitScenarioSearch}>
            <div className="search-field">
              <FaSearch aria-hidden="true" />
              <label className="sr-only" htmlFor="scenario-phrase-search">Search phrases by Kannada, transliteration, or English</label>
              <input
                id="scenario-phrase-search"
                value={search}
                onChange={(event) => {
                  const value = event.target.value
                  setSearchState({ scenarioId, value })
                  if (!value) clearScenarioSearch()
                  if (scenarioGenerationState.error) {
                    updateScenarioGenerationState(scenarioId, { error: '' })
                  }
                }}
                placeholder="Search or request a phrase"
                maxLength={100}
                aria-describedby="scenario-search-help"
              />
              <button
                type="button"
                className="clear-search"
                aria-label="Clear search"
                onClick={clearScenarioSearch}
                hidden={!search}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            <button className="button button-dark" type="submit" disabled={scenarioGenerationState.loading}>
              {scenarioGenerationState.loading ? <><span className="loading-spinner" aria-hidden="true" /> Generating…</> : 'Generate phrases'}
            </button>
            <p className="learn-note explore-search-note" id="scenario-search-help">
              Typing filters existing phrases. Submit a request to ask AI for new phrases.
            </p>
          </form>
          <div className="phrase-results-heading">
            <div>
              {activeGeneratedResult && (
                <p className="explore-results-context">Results for: {activeGeneratedResult.query}</p>
              )}
              <h2>{activeGeneratedResult ? 'Generated phrases' : `Existing phrases for ${selectedScenario?.name}`}</h2>
            </div>
            <div className="explore-results-actions">
              <span>
                {scenarioLoading ? 'Generating…' : `${
                  activeGeneratedResult ? activeGeneratedResult.phrases.length : visibleScenarioPhrases.length
                } ${
                  (activeGeneratedResult ? activeGeneratedResult.phrases.length : visibleScenarioPhrases.length) === 1
                    ? 'phrase'
                    : 'phrases'
                }`}
              </span>
              {activeGeneratedResult && (
                <button className="text-link explore-back-to-phrases" type="button" onClick={clearScenarioSearch}>
                  Back to all phrases
                </button>
              )}
            </div>
          </div>
          {scenarioLoading ? (
            <p className="request-status" role="status" aria-live="polite">
              <span className="loading-spinner" aria-hidden="true" /> Generating phrases for {selectedScenario?.name}…
            </p>
          ) : scenarioError ? (
            <div className="empty-state" role="alert">
              <span className="empty-mark"><FaSearch aria-hidden="true" /></span>
              <h2>Could not generate phrases</h2>
              <p>{scenarioError}</p>
              <button className="button button-dark" type="button" onClick={() => setScenarioRetry((count) => count + 1)}>
                Try again <FaArrowRight aria-hidden="true" />
              </button>
            </div>
          ) : (activeGeneratedResult?.phrases ?? visibleScenarioPhrases).length > 0 ? (
            <ScrollReveal as="div" className="phrase-grid phrase-card-group">
              {(activeGeneratedResult?.phrases ?? visibleScenarioPhrases).map(renderPhrase)}
            </ScrollReveal>
          ) : (
            <div className="empty-state">
              <span className="empty-mark"><FaSearch aria-hidden="true" /></span>
              <h2>{scenarioPhrases.length ? 'No matching existing phrases' : 'No phrases were returned'}</h2>
              <p>{scenarioPhrases.length ? 'Try another search or generate new phrases for this request.' : 'Try again, or enter a phrase request above to ask AI for new phrases.'}</p>
              {scenarioPhrases.length ? (
                <button className="button button-dark" type="button" disabled={scenarioGenerationState.loading} onClick={() => generateScenarioPhrases(search)}>
                  Generate phrases <FaArrowRight aria-hidden="true" />
                </button>
              ) : (
                <button className="button button-dark" type="button" onClick={() => setScenarioRetry((count) => count + 1)}>
                  Try again <FaArrowRight aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {scenarioGenerationState.loading && (
            <p className="request-status" role="status" aria-live="polite">
              <span className="loading-spinner" aria-hidden="true" /> Generating phrases for “{scenarioGenerationState.query}” in {selectedScenario?.name}…
            </p>
          )}
          {scenarioGenerationState.error && (
            <div className="empty-state" role="alert">
              <span className="empty-mark"><FaSearch aria-hidden="true" /></span>
              <h2>Could not generate phrases</h2>
              <p>{scenarioGenerationState.error}</p>
              {scenarioGenerationState.query && (
                <button className="button button-dark" type="button" disabled={scenarioGenerationState.loading} onClick={() => generateScenarioPhrases(scenarioGenerationState.query)}>
                  Try again <FaArrowRight aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          <p className="learn-note">Phrase content supports language practice and is not professional or medical advice.</p>
        </>
      )}
    </div>
  )
}
