import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { FaArrowRight, FaBookmark, FaBookOpen, FaChartLine, FaComments } from 'react-icons/fa'
import useAuth from '../hooks/useAuth.js'
import ScenarioCard from '../components/ScenarioCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import { scenarios } from '../data/scenarios.js'

export default function Dashboard() {
  const [showDailyMeaning, setShowDailyMeaning] = useState(false)
  const { user } = useAuth()
  const { favorites, favoritesError, favoritesLoading, progress } = useOutletContext()
  const firstName = user.name?.trim().split(/\s+/)[0] || 'there'
  const lastScenarioId = progress.visitedScenarios[progress.visitedScenarios.length - 1]
  const lastScenario = scenarios.find((scenario) => scenario.id === lastScenarioId)
  const continueScenario = lastScenario ?? scenarios[0]
  const canContinue = !progress.loading && !progress.storageError

  return (
    <div className="portal-page dashboard-page">
      <header className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> YOUR KANNADA JOURNEY</span>
          <h1>Good to see you, {firstName}.</h1>
          <p>Choose an everyday moment and learn a few words to make it yours.</p>
          <div className="dashboard-hero-actions">
            <Link className="button button-light" to="/learn/lessons">Continue learning <FaBookOpen aria-hidden="true" /></Link>
            <Link className="button button-light" to="/explore">Explore useful phrases <FaArrowRight aria-hidden="true" /></Link>
            <Link className="button button-light" to="/practice">Practice a conversation <FaComments aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="dashboard-hero-art">
          <img
            className="dashboard-hero-illustration"
            src="/images/kannada-namaste.png"
            alt="Illustration of the Kannada namaste greeting"
          />
        </div>
      </header>
      <ScrollReveal as="section" className="progress-overview" aria-label="Your learning progress">
        <div className="progress-card" aria-busy={progress.loading}>
          <span className="progress-card-icon"><FaChartLine aria-hidden="true" /></span>
          <div>
            <span>Situations explored</span>
            <strong>{progress.loading || progress.storageError ? '—' : progress.visitedScenarios.length} <small>of {scenarios.length}</small></strong>
          </div>
          <div
            className="progress-meter"
            role={progress.storageError ? undefined : 'progressbar'}
            aria-label="Situations explored"
            aria-valuemin="0"
            aria-valuemax={scenarios.length}
            aria-valuenow={progress.loading || progress.storageError ? undefined : progress.visitedScenarios.length}
          >
            <i style={{ width: `${progress.loading || progress.storageError ? 0 : Math.min(100, (progress.visitedScenarios.length / scenarios.length) * 100)}%` }} />
          </div>
        </div>
        <Link className="progress-card progress-shortcut" to="/favorites" aria-busy={favoritesLoading}>
          <span className="progress-card-icon"><FaBookmark aria-hidden="true" /></span>
          <div>
            <span>Saved phrases</span>
            <strong>{favoritesLoading
              ? 'Loading your saved phrases'
              : favoritesError ? 'Saved phrases unavailable'
                : `${favorites.length} ${favorites.length === 1 ? 'phrase saved' : 'phrases saved'}`}</strong>
          </div>
          <FaArrowRight aria-hidden="true" />
        </Link>
      </ScrollReveal>
      <ScrollReveal as="section" className="daily-phrase">
        <div>
          <span className="context-label">A PHRASE TO BEGIN WITH</span>
          <p className="daily-phrase-kannada" lang="kn">ನಮಸ್ಕಾರ</p>
          {showDailyMeaning && <p className="daily-phrase-meaning">Namaskāra · Hello</p>}
        </div>
        <div className="daily-phrase-actions">
          <button type="button" className="phrase-meaning-toggle" aria-expanded={showDailyMeaning} onClick={() => setShowDailyMeaning((visible) => !visible)}>
            {showDailyMeaning ? 'Hide meaning' : 'Reveal meaning'}
          </button>
        </div>
      </ScrollReveal>
      <ScrollReveal as="section" className="portal-scenarios">
        <div className="portal-section-heading">
          <div>
            <span className="context-label">START SOMEWHERE REAL</span>
            <h2>What is today bringing?</h2>
          </div>
          <span>{scenarios.length} everyday situations</span>
        </div>
        <ScrollReveal as="div" className="scenario-grid scenario-card-group">
          {scenarios.map((scenario, index) => (
            <ScenarioCard key={scenario.id} scenario={scenario} index={index} to={`/explore/${scenario.id}`} />
          ))}
        </ScrollReveal>
      </ScrollReveal>
      <ScrollReveal as="section" className="continue-card">
        <div>
          <span className="context-label">{canContinue ? 'CONTINUE LEARNING' : 'YOUR PROGRESS'}</span>
          <h2>{!canContinue
            ? progress.storageError ? 'Your progress is unavailable.' : 'Finding your place.'
            : lastScenario ? `Pick up ${lastScenario.name.toLowerCase()} again.` : `Start with ${continueScenario.name.toLowerCase()}.`}</h2>
          <p>
            {!canContinue
              ? progress.storageError
                ? 'Your saved progress could not be loaded. You can still choose any learning situation or try a conversation.'
                : 'Your saved learning progress is loading. You can explore a situation while it loads.'
              : lastScenario ? 'Your last opened situation is ready when you are.' : 'Open a situation to explore phrases and start building your local progress.'}
            {' '}You can also try a guided conversation whenever you are ready.
          </p>
        </div>
        <Link className="button button-dark" to={canContinue ? `/explore/${continueScenario.id}` : '/practice'}>
          {!canContinue ? 'Try a conversation' : lastScenario ? 'Continue learning' : 'Explore phrases'} <FaArrowRight aria-hidden="true" />
        </Link>
      </ScrollReveal>
    </div>
  )
}
