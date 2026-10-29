import { FaBookmark, FaRegBookmark } from 'react-icons/fa'

export default function FavoriteButton({
  item,
  isFavorite,
  isPending = false,
  disabled = false,
  className = '',
  onToggleFavorite,
}) {
  const label = item.english ?? item.title ?? 'learning item'

  return (
    <button
      className={`save-button${isFavorite ? ' saved' : ''}${className ? ` ${className}` : ''}`}
      type="button"
      aria-label={isFavorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      aria-pressed={isFavorite}
      aria-busy={isPending}
      disabled={isPending || disabled}
      onClick={() => onToggleFavorite(item)}
    >
      {isFavorite ? <FaBookmark aria-hidden="true" /> : <FaRegBookmark aria-hidden="true" />}
    </button>
  )
}
