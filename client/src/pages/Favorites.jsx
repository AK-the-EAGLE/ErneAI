import { useState } from 'react'
import { FaArrowRight, FaBookOpen, FaBookmark, FaPlus, FaSearch, FaTimes } from 'react-icons/fa'
import { Link, useOutletContext } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton.jsx'
import PhraseCard from '../components/PhraseCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import ThemedSelect from '../components/ThemedSelect.jsx'

const englishCollator = new Intl.Collator(undefined, { sensitivity: 'base' })

export default function Favorites() {
  const {
    favorites,
    favoritesError,
    favoritesLoading,
    favoritesMessage,
    pendingFavoriteKeys,
    onRefreshFavorites,
    onToggleFavorite,
  } = useOutletContext()
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')
  const [kindFilter, setKindFilter] = useState('all')

  const normalizedSearch = search.trim().toLocaleLowerCase()
  const phraseCount = favorites.filter((item) => item.kind === 'phrase').length
  const lessonCount = favorites.filter((item) => item.kind === 'lesson').length
  const filteredFavorites = favorites.filter((item) => (
    (kindFilter === 'all' || item.kind === kindFilter)
    && [
      item.kannada,
      item.transliteration,
      item.english,
      item.context,
      item.type,
      item.scenarioName,
      item.title,
      item.module,
      item.objective,
      item.curriculumLevel,
  ].some((value) => value?.toLocaleLowerCase().includes(normalizedSearch))))
  const visibleFavorites = [...filteredFavorites].sort((first, second) => {
    if (sortOrder === 'alphabetical') {
      return englishCollator.compare(first.english ?? first.title, second.english ?? second.title)
    }
    return new Date(second.savedAt ?? 0).getTime() - new Date(first.savedAt ?? 0).getTime()
  })

  return (
    <div className="portal-page favorites-page page-width">
      <header className="page-intro favorites-intro">
        <span className="eyebrow"><span className="eyebrow-line" /> YOUR LITTLE COLLECTION</span>
        <h1>Keep your learning<br /><em>close by.</em></h1>
        <p>Keep useful phrases and lessons together. Your saved items stay connected to your account, ready when you want to revisit them.</p>
      </header>

      {favoritesMessage && <p className="favorites-message" role="status" aria-live="polite">{favoritesMessage}</p>}

      {favoritesLoading ? (
        <section className="favorites-loading" aria-label="Loading saved learning" aria-busy="true">
          <p className="sr-only" role="status">Loading saved learning…</p>
          <div className="favorites-skeleton-grid" aria-hidden="true">
            {[0, 1, 2].map((item) => <div className="favorites-skeleton-card" key={item}><i /><i /><i /><i /></div>)}
          </div>
        </section>
      ) : favoritesError ? (
        <div className="empty-state favorites-error" role="alert">
          <span className="empty-mark"><FaBookmark aria-hidden="true" /></span>
          <h2>Your saved learning could not be loaded</h2>
          <p>{favoritesError}</p>
          <button className="button button-dark" type="button" onClick={onRefreshFavorites}>Try again</button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state favorites-empty">
          <span className="empty-mark"><FaBookmark aria-hidden="true" /></span>
          <h2>A useful idea is worth keeping.</h2>
          <p>Save a phrase or lesson while you are learning and it will show up here.</p>
          <Link className="button button-dark" to="/explore">
            <FaPlus aria-hidden="true" /> Explore phrases
          </Link>
        </div>
      ) : (
        <>
          <div className="favorites-toolbar">
            <div className="phrase-results-heading">
              <h2>Your saved learning</h2>
              <span aria-live="polite">{favorites.length} {favorites.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="favorites-controls">
              <label className="search-field favorites-search">
                <FaSearch aria-hidden="true" />
                <span className="sr-only">Search saved learning</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Kannada or English"
                />
                <button
                  type="button"
                  className="clear-search"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                  hidden={!search}
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </label>
              <label className="favorites-sort-label">
                <span>Sort by</span>
                <ThemedSelect density="compact" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <option value="recent">Recently saved</option>
                  <option value="alphabetical">English A–Z</option>
                </ThemedSelect>
              </label>
            </div>
          </div>
          <div className="favorites-kind-filter" role="group" aria-label="Filter favorite types">
            <button type="button" aria-pressed={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
              All <span>{favorites.length}</span>
            </button>
            <button type="button" aria-pressed={kindFilter === 'phrase'} onClick={() => setKindFilter('phrase')}>
              Phrases <span>{phraseCount}</span>
            </button>
            <button type="button" aria-pressed={kindFilter === 'lesson'} onClick={() => setKindFilter('lesson')}>
              Lessons <span>{lessonCount}</span>
            </button>
          </div>
          {visibleFavorites.length > 0 ? (
            <ScrollReveal as="div" className="phrase-grid phrase-card-group">
              {visibleFavorites.map((item) => item.kind === 'lesson' ? (
                <article className="favorite-lesson-card" key={item.key}>
                  <div className="favorite-lesson-heading">
                    <span className="favorite-lesson-icon"><FaBookOpen aria-hidden="true" /></span>
                    <span className="context-label">{item.curriculumLevel.toUpperCase()} LESSON</span>
                  </div>
                  <span className="favorite-lesson-module">{item.module}</span>
                  <h3>{item.title}</h3>
                  <p>{item.objective}</p>
                  <div className="favorite-lesson-actions">
                    <Link className="button button-dark" to={`/learn/lessons/${item.id}`}>
                      Revisit lesson <FaArrowRight aria-hidden="true" />
                    </Link>
                    <FavoriteButton
                      item={item}
                      isFavorite
                      isPending={pendingFavoriteKeys.includes(item.key)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </div>
                </article>
              ) : (
                <PhraseCard
                  key={item.key}
                  phrase={item}
                  isFavorite
                  isPending={pendingFavoriteKeys.includes(item.key)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </ScrollReveal>
          ) : (
            <div className="empty-state favorites-no-matches">
              <span className="empty-mark"><FaSearch aria-hidden="true" /></span>
              <h2>{normalizedSearch ? `No saved items match “${search}”` : `No saved ${kindFilter === 'phrase' ? 'phrases' : 'lessons'} yet`}</h2>
              <p>{normalizedSearch ? 'Try another Kannada or English term, or clear your search.' : 'Choose another filter to see the rest of your saved learning.'}</p>
              {normalizedSearch
                ? <button className="button button-dark" type="button" onClick={() => setSearch('')}>Clear search <FaArrowRight aria-hidden="true" /></button>
                : <button className="button button-dark" type="button" onClick={() => setKindFilter('all')}>Show all saved items <FaArrowRight aria-hidden="true" /></button>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
