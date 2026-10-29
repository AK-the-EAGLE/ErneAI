import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { FaArrowRight, FaBookOpen, FaCheck, FaLock } from 'react-icons/fa'
import { curriculaByLevel } from '../../../shared/curricula.js'
import useAuth from '../hooks/useAuth.js'
import SupplementaryLesson from '../components/SupplementaryLesson.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'

export default function LessonsPage() {
  const { favorites, favoritesLoading, pendingFavoriteKeys, onToggleFavorite, progress } = useOutletContext()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const curriculum = curriculaByLevel.get(user.preferredLearningLevel ?? 'beginner')
  const lessons = curriculum.lessons
  const curriculumLessonIds = new Set(lessons.map(({ id }) => id))
  const completed = new Set(progress.completedLessons.filter((id) => curriculumLessonIds.has(id)))
  const completedCount = completed.size
  const nextLesson = lessons.find((lesson) => !completed.has(lesson.id))
  const totalVocabulary = lessons.reduce((total, lesson) => total + lesson.vocabulary.length, 0)
  const modules = curriculum.modules.map((title) => {
    const moduleLessons = lessons.filter((lesson) => lesson.module === title)
    return {
      title,
      description: moduleLessons.length === 1
        ? moduleLessons[0].objective
        : `${moduleLessons.length} lessons to explore this topic.`,
      lessonCount: moduleLessons.length,
    }
  })

  if (progress.lessonsLoading) {
    return <div className="portal-page learning-page"><p className="request-status" role="status">Loading your learning progress…</p></div>
  }

  if (progress.lessonProgressError) {
    return (
      <div className="portal-page learning-page">
        <div className="empty-state" role="alert">
          <span className="empty-mark"><FaBookOpen aria-hidden="true" /></span>
          <h1>Your lessons could not be loaded</h1>
          <p>{progress.lessonProgressError}</p>
          <button className="button button-dark" type="button" onClick={progress.refreshLessonProgress}>Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-page learning-page">
      <header className="learning-header learning-hero">
        <div className="learning-hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> {curriculum.label.toUpperCase()} KANNADA PATH</span>
          <h1>Learn Kannada,<br /><em>at your level.</em></h1>
          <p>{curriculum.description}</p>
        </div>
        <img
          className="learning-hero-illustration"
          src="/images/kannada-learning-hero.png"
          alt="Illustration of a learner exploring Kannada"
          decoding="async"
        />
      </header>

      <section className="learning-progress-card" aria-label="Course progress">
        <div className="learning-progress-stat">
          <span className="context-label">{curriculum.label.toUpperCase()} COURSE PROGRESS</span>
          <strong>{completedCount} of {lessons.length} lessons complete</strong>
        </div>
        <div className="learning-progress-stat">
          <span className="context-label">VOCABULARY MASTERED</span>
          <strong>{progress.masteredVocabulary.length} of {totalVocabulary} expressions</strong>
        </div>
        <div
          className="learning-progress-meter"
          role="progressbar"
          aria-label="Lessons completed"
          aria-valuemin="0"
          aria-valuemax={lessons.length}
          aria-valuenow={completedCount}
        >
          <i style={{ width: `${(completedCount / lessons.length) * 100}%` }} />
        </div>
      </section>

      <section className="learning-recommendation" aria-label="Recommended next lesson">
        <div className="learning-recommendation-copy">
          <span className="context-label">RECOMMENDED NEXT</span>
          <h2>{nextLesson ? nextLesson.title : 'You completed this learning path'}</h2>
          <p>{nextLesson?.objective ?? 'Your completed lessons and quiz history remain saved to your account.'}</p>
        </div>
        {nextLesson ? (
          <Link className="button button-dark learning-recommendation-action" to={`/learn/lessons/${nextLesson.id}`}>
            {progress.currentLessonId === nextLesson.id ? 'Continue lesson' : 'Start lesson'} <FaArrowRight aria-hidden="true" />
          </Link>
        ) : <span className="learning-recommendation-complete"><FaCheck aria-hidden="true" /> Path complete</span>}
      </section>

      <section className="learning-modules" aria-label="Course modules">
        <div className="learning-modules-heading">
          <span className="context-label">COURSE MODULES</span>
          <h2>Your learning path</h2>
        </div>
        <div className="learning-module-grid">
          {modules.map((module) => (
            <article className="learning-module-card" key={module.title}>
              <span className="learning-module-count">{module.lessonCount} {module.lessonCount === 1 ? 'lesson' : 'lessons'}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>

      <SupplementaryLesson
        level={curriculum.label}
        initialTopic={typeof location.state?.returnTopic === 'string' ? location.state.returnTopic : ''}
        onGenerated={(result, topic) => navigate(`/learn/lessons/${encodeURIComponent(result.id)}`, {
          state: { returnTopic: topic },
        })}
      />

      <div className="learning-path" aria-label="Kannada learning journey">
        {lessons.map((lesson, index) => {
          const isCompleted = completed.has(lesson.id)
          const isUnlocked = index === 0 || completed.has(lessons[index - 1].id)
          const isCurrent = !isCompleted && progress.currentLessonId === lesson.id
          const status = isCompleted ? 'Completed' : !isUnlocked ? 'Locked' : isCurrent ? 'In progress' : 'Available'
          const className = `lesson-path-card${isCompleted ? ' is-completed' : ''}${!isUnlocked ? ' is-locked' : ''}`

          return (
            <article className={className} key={lesson.id}>
              <span className="lesson-path-number" aria-hidden="true">{isCompleted ? <FaCheck /> : `0${index + 1}`}</span>
              <div className="lesson-path-copy">
                <span className="lesson-path-module">{lesson.module}</span>
                <h2>{lesson.title}</h2>
                <p>{lesson.objective}</p>
              </div>
              <span className={`lesson-path-status${isCompleted ? ' complete' : ''}${!isUnlocked ? ' locked' : ''}`}>
                {!isUnlocked && <FaLock aria-hidden="true" />}
                {status}
              </span>
              {isUnlocked
                ? <Link className="lesson-path-action" to={`/learn/lessons/${lesson.id}`} aria-label={`${isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'} lesson: ${lesson.title}`}>
                    {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'} <FaArrowRight aria-hidden="true" />
                  </Link>
                : <span className="lesson-path-action unavailable">Complete the previous lesson</span>}
              <FavoriteButton
                className="lesson-favorite-button"
                item={{ ...lesson, kind: 'lesson', key: `lesson:${lesson.id}` }}
                isFavorite={favorites.some((item) => item.key === `lesson:${lesson.id}`)}
                isPending={pendingFavoriteKeys.includes(`lesson:${lesson.id}`)}
                disabled={favoritesLoading}
                onToggleFavorite={onToggleFavorite}
              />
            </article>
          )
        })}
      </div>

      {progress.lessonAttempts.length > 0 && (
        <section className="lesson-attempt-history" aria-labelledby="lesson-history-heading">
          <div className="portal-section-heading">
            <div>
              <span className="context-label">YOUR RECENT RESULTS</span>
              <h2 id="lesson-history-heading">Quiz history</h2>
            </div>
            <span>Most recent attempts first</span>
          </div>
          <div className="lesson-history-list">
            {progress.lessonAttempts.slice(0, 8).map((attempt) => {
              const lesson = curriculaByLevel.get(attempt.curriculumLevel ?? 'beginner')
                ?.lessons.find(({ id }) => id === attempt.lessonId)
              return (
                <article className="lesson-history-item" key={attempt.id}>
                  <div>
                    <strong>{lesson?.title ?? 'Kannada lesson'}</strong>
                    <span>{(attempt.curriculumLevel ?? 'beginner').replace(/^\w/, (letter) => letter.toUpperCase())} · <time dateTime={attempt.attemptedAt}>{new Date(attempt.attemptedAt).toLocaleDateString()}</time></span>
                  </div>
                  <span>{attempt.score} / {attempt.total} first try</span>
                  <strong className={attempt.passed ? 'history-passed' : 'history-review'}>
                    {attempt.passed ? 'Passed' : 'Practice again'}
                  </strong>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
