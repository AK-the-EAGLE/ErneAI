import FavoriteButton from './FavoriteButton.jsx'

export default function PhraseCard({
  phrase,
  isFavorite,
  isPending = false,
  isFavoriteStateLoading = false,
  onToggleFavorite,
}) {
  return (
    <article className="phrase-card">
      <div className="phrase-card-top">
        <span className="phrase-type">{phrase.type}</span>
        <span className="phrase-level">{phrase.level}</span>
      </div>
      <p className="phrase-kannada" lang="kn">{phrase.kannada}</p>
      <div className="phrase-details">
        <p className="phrase-transliteration">{phrase.transliteration}</p>
        <p className="phrase-english">{phrase.english}</p>
        {phrase.context && <p className="phrase-context">{phrase.context}</p>}
      </div>
      {phrase.scenarioName && <span className="phrase-scenario">{phrase.scenarioName}</span>}
      <div className="phrase-card-bottom">
        <FavoriteButton
          item={{ ...phrase, kind: 'phrase', key: `phrase:${phrase.id}` }}
          isFavorite={isFavorite}
          isPending={isPending}
          disabled={isFavoriteStateLoading}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </article>
  )
}
