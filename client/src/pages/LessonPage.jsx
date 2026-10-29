import { useEffect, useState } from 'react'
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaCheck, FaRedoAlt } from 'react-icons/fa'
import { allLessonsById, curriculaByLevel } from '../../../shared/curricula.js'
import { normalizeSupplementaryLesson } from '../../../shared/lessonAdapters.js'
import FavoriteButton from '../components/FavoriteButton.jsx'
import ThemedSelect from '../components/ThemedSelect.jsx'
import { api } from '../services/api.js'

function emptyAnswer(question) {
  if (question.type === 'matching' || question.type === 'order') return []
  return ''
}

function answerIsCorrect(question, answer) {
  if (question.type === 'choice' || question.type === 'review') return answer === question.answer
  if (question.type === 'fill') {
    return typeof answer === 'string'
      && answer.normalize('NFC').trim() === question.answer.normalize('NFC')
  }
  if (question.type === 'order') {
    return answer.length === question.answer.length
      && answer.every((id, index) => id === question.answer[index])
  }
  if (question.type === 'matching') {
    const pairs = new Map(answer.map(({ leftId, rightId }) => [leftId, rightId]))
    return pairs.size === question.answer.length
      && question.answer.every(({ leftId, rightId }) => pairs.get(leftId) === rightId)
  }
  return false
}

function freshHistory(lesson) {
  return lesson.exercises.map(() => [])
}

export default function LessonPage() {
  const { lessonId } = useParams()
  const location = useLocation()
  const curriculumLesson = allLessonsById.get(lessonId)
  const [supplementaryState, setSupplementaryState] = useState({
    lessonId: '',
    lesson: null,
    loading: false,
    error: '',
  })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (curriculumLesson) return undefined

    let active = true
    api.getSupplementaryLesson(lessonId)
      .then((result) => {
        if (active) {
          setSupplementaryState({
            lessonId,
            lesson: normalizeSupplementaryLesson(result),
            loading: false,
            error: '',
          })
        }
      })
      .catch((error) => {
        if (active) {
          setSupplementaryState({ lessonId, lesson: null, loading: false, error: error.message })
        }
      })

    return () => { active = false }
  }, [curriculumLesson, lessonId, retryCount])

  const lesson = curriculumLesson
    ?? (supplementaryState.lessonId === lessonId ? supplementaryState.lesson : null)
  if (!lesson) {
    if (supplementaryState.lessonId !== lessonId || supplementaryState.loading) {
      return <div className="portal-page learning-page"><p className="request-status" role="status">Loading your lesson…</p></div>
    }

    return (
      <div className="portal-page learning-page">
        <Link className="lesson-back-link" to="/learn/lessons"><FaArrowLeft aria-hidden="true" /> All lessons</Link>
        <div className="empty-state" role="alert">
          <h1>Your lesson could not be loaded</h1>
          <p>{supplementaryState.error || 'This lesson is unavailable.'}</p>
          <button
            className="button button-dark"
            type="button"
            onClick={() => {
              setSupplementaryState((current) => ({ ...current, loading: true, error: '' }))
              setRetryCount((count) => count + 1)
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
  return <LessonSession key={lesson.id} lesson={lesson} returnTopic={location.state?.returnTopic} />
}

function LessonSession({ lesson, returnTopic }) {
  const {
    favorites,
    favoritesLoading,
    onToggleFavorite,
    pendingFavoriteKeys,
    progress,
  } = useOutletContext()
  const [phase, setPhase] = useState('teach')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState(() => emptyAnswer(lesson.exercises[0]))
  const [answerHistory, setAnswerHistory] = useState(() => freshHistory(lesson))
  const [feedback, setFeedback] = useState(null)
  const [answerError, setAnswerError] = useState('')
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [savedAttempt, setSavedAttempt] = useState(null)

  const completed = new Set(progress.completedLessons)
  const curriculum = curriculaByLevel.get(progress.level ?? 'beginner')
  const lessonIndex = curriculum.lessons.findIndex(({ id }) => id === lesson.id)
  const isUnlocked = lesson.level === curriculum.level && (
    lesson.isSupplementary || lessonIndex === 0 || completed.has(curriculum.lessons[lessonIndex - 1]?.id)
  )
  const isCompleted = completed.has(lesson.id)
  const favoriteKey = `lesson:${lesson.id}`
  const returnToLessonsState = lesson.isSupplementary
    ? { returnTopic: returnTopic ?? lesson.topic ?? '' }
    : undefined

  if (progress.lessonsLoading) {
    return <div className="portal-page learning-page"><p className="request-status" role="status">Loading your lesson progress…</p></div>
  }

  if (progress.lessonProgressError) {
    return (
      <div className="portal-page learning-page">
        <Link className="lesson-back-link" to="/learn/lessons" state={returnToLessonsState}><FaArrowLeft aria-hidden="true" /> All lessons</Link>
        <div className="empty-state" role="alert">
          <h1>Your lesson could not be loaded</h1>
          <p>{progress.lessonProgressError}</p>
          <button className="button button-dark" type="button" onClick={progress.refreshLessonProgress}>Try again</button>
        </div>
      </div>
    )
  }

  if (lesson.level !== curriculum.level) {
    return (
      <div className="portal-page learning-page">
        <Link className="lesson-back-link" to="/learn/lessons" state={returnToLessonsState}><FaArrowLeft aria-hidden="true" /> Your learning path</Link>
        <div className="lesson-locked-card">
          <h1>Your learning level has changed</h1>
          <p>This lesson belongs to a different learning level. Your saved attempts remain in your history, and your current {curriculum.label.toLowerCase()} path is ready to continue.</p>
          <Link className="button button-dark" to="/learn/lessons">View current learning path</Link>
        </div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="portal-page learning-page">
        <Link className="lesson-back-link" to="/learn/lessons" state={returnToLessonsState}><FaArrowLeft aria-hidden="true" /> All lessons</Link>
        <div className="lesson-locked-card">
          <h1>This lesson is locked for now</h1>
          <p>Complete the previous lesson to continue your learning journey.</p>
          <Link className="button button-dark" to="/learn/lessons">Back to the course</Link>
        </div>
      </div>
    )
  }

  const question = lesson.exercises[questionIndex]
  const firstTryScore = answerHistory.filter((attempts) => attempts[0]?.correct).length

  async function beginExercises() {
    setStarting(true)
    setAnswerError('')
    try {
      await progress.setCurrentLesson(lesson.id)
      setPhase('exercise')
    } catch {
      setAnswerError('Your current lesson could not be saved. Try again before continuing.')
    } finally {
      setStarting(false)
    }
  }

  function checkAnswer() {
    if (answerHistory[questionIndex].length >= 10) {
      setAnswerError('Restart the lesson to begin a fresh set of attempts.')
      return
    }
    if (question.type === 'fill' && !answer.trim()) {
      setAnswerError('Enter an answer before checking it.')
      return
    }
    if (question.type === 'matching' && answer.length !== question.leftItems.length) {
      setAnswerError('Match each item before checking your answers.')
      return
    }
    if (question.type === 'order' && answer.length !== question.items.length) {
      setAnswerError('Use each word to build the complete sentence.')
      return
    }
    if ((question.type === 'choice' || question.type === 'review') && !answer) {
      setAnswerError('Choose an answer before checking it.')
      return
    }

    const correct = answerIsCorrect(question, answer)
    setAnswerError('')
    setFeedback({
      correct,
      explanation: question.explanation,
      attemptsUsed: answerHistory[questionIndex].length + 1,
    })
    setAnswerHistory((previous) => previous.map((attempts, index) => (
      index === questionIndex ? [...attempts, answer] : attempts
    )))
  }

  function retryQuestion() {
    setAnswer(emptyAnswer(question))
    setFeedback(null)
    setAnswerError('')
  }

  function continueExercises() {
    if (questionIndex === lesson.exercises.length - 1) {
      setPhase('review')
      return
    }
    const nextIndex = questionIndex + 1
    setQuestionIndex(nextIndex)
    setAnswer(emptyAnswer(lesson.exercises[nextIndex]))
    setFeedback(null)
    setAnswerError('')
  }

  function setMatch(leftId, rightId) {
    setAnswer((previous) => {
      const pairs = previous.filter((pair) => pair.leftId !== leftId && pair.rightId !== rightId)
      return rightId ? [...pairs, { leftId, rightId }] : pairs
    })
  }

  function addOrderItem(itemId) {
    setAnswer((previous) => previous.includes(itemId) ? previous : [...previous, itemId])
  }

  function removeOrderItem(itemId) {
    setAnswer((previous) => previous.filter((id) => id !== itemId))
  }

  async function saveAttempt() {
    setSubmitting(true)
    setSubmissionError('')
    try {
      const result = await progress.submitLessonAttempt(
        lesson.id,
        lesson.exercises.map((exercise, index) => ({
          questionId: exercise.id,
          attempts: answerHistory[index],
        })),
      )
      setSavedAttempt(result.attempt)
      setPhase('result')
    } catch (error) {
      setSubmissionError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  function restartLesson() {
    setQuestionIndex(0)
    setAnswer(emptyAnswer(lesson.exercises[0]))
    setAnswerHistory(freshHistory(lesson))
    setFeedback(null)
    setSubmissionError('')
    setSavedAttempt(null)
    setPhase('teach')
  }

  return (
    <div className="portal-page learning-page lesson-page">
      <Link className="lesson-back-link" to="/learn/lessons" state={returnToLessonsState}><FaArrowLeft aria-hidden="true" /> All lessons</Link>
      <header className="lesson-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> {lesson.isSupplementary ? 'EXTRA PRACTICE' : `LESSON ${String(lesson.order).padStart(2, '0')} · ${lesson.module.toUpperCase()}`}</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.objective}</p>
        </div>
        <FavoriteButton
          className="lesson-detail-favorite"
          item={{ id: lesson.id, title: lesson.title, kind: 'lesson', key: favoriteKey }}
          isFavorite={favorites.some((item) => item.key === favoriteKey)}
          isPending={pendingFavoriteKeys.includes(favoriteKey)}
          disabled={favoritesLoading}
          onToggleFavorite={onToggleFavorite}
        />
      </header>
      <div className="lesson-progress-row">
        <span>{phase === 'exercise' ? `Exercise ${questionIndex + 1} of ${lesson.exercises.length}` : phase === 'review' ? 'Review before completion' : phase === 'result' ? 'Lesson result' : 'Learn the expressions'}</span>
        <div
          className="lesson-progress-meter"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin="0"
          aria-valuemax={lesson.exercises.length + 2}
          aria-valuenow={phase === 'teach' ? 1 : phase === 'exercise' ? questionIndex + 2 : lesson.exercises.length + 2}
        >
          <i style={{ width: `${(phase === 'teach' ? 1 : phase === 'exercise' ? questionIndex + 2 : lesson.exercises.length + 2) / (lesson.exercises.length + 2) * 100}%` }} />
        </div>
      </div>

      {phase === 'teach' && (
        <section className="lesson-teaching-card" aria-labelledby="lesson-teaching-title">
          <div className="lesson-card-heading">
            <span className="context-label">LEARN THE BUILDING BLOCKS</span>
            <h2 id="lesson-teaching-title">A few useful expressions</h2>
            <p>{lesson.introduction}</p>
          </div>
          {lesson.readingGuide && (
            <aside className="lesson-reading-guide">
              <span className="context-label">{lesson.readingGuide.title}</span>
              <p>{lesson.readingGuide.explanation}</p>
              <div className="lesson-reading-examples">
                {lesson.readingGuide.examples.map((example) => (
                  <div key={example.kannada}>
                    <strong lang="kn">{example.kannada}</strong>
                    <span>{example.transliteration}</span>
                    <small>{example.meaning}</small>
                  </div>
                ))}
              </div>
            </aside>
          )}
          <div className="lesson-vocabulary-list">
            {lesson.vocabulary.map((item) => (
              <article className="lesson-vocabulary-item" key={item.id}>
                <div className="lesson-word">
                  <span lang="kn">{item.kannada}</span>
                  <span>{item.transliteration}</span>
                  <strong>{item.english}</strong>
                </div>
                <p>{item.usage}</p>
                <div className="lesson-example">
                  <span lang="kn">{item.example.kannada}</span>
                  <span>{item.example.transliteration}</span>
                  <span>{item.example.english}</span>
                </div>
              </article>
            ))}
          </div>
          <aside className="lesson-context">
            <span className="context-label">WHEN YOU MIGHT USE THIS</span>
            <p>{lesson.context}</p>
          </aside>
          {answerError && <p className="lesson-action-error" role="alert">{answerError}</p>}
          <button className="button button-dark lesson-primary-action" type="button" onClick={beginExercises} disabled={starting}>
            {starting ? 'Saving your place…' : 'Practice these expressions'} <FaArrowRight aria-hidden="true" />
          </button>
        </section>
      )}

      {phase === 'exercise' && question && (
        <section className="lesson-exercise-card" aria-labelledby="lesson-question">
          <span className="context-label">{question.type === 'review' ? 'QUICK REVIEW' : 'YOUR TURN'}</span>
          <h2 id="lesson-question">{question.prompt}</h2>
          <div className="lesson-answer-area">
            {(question.type === 'choice' || question.type === 'review') && (
              <div className="lesson-choice-list" role="radiogroup" aria-label={question.prompt}>
                {question.options.map((option) => (
                  <button
                    className={`lesson-choice${answer === option.id ? ' selected' : ''}`}
                    type="button"
                    role="radio"
                    aria-checked={answer === option.id}
                    key={option.id}
                    onClick={() => { setAnswer(option.id); setAnswerError('') }}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'fill' && (
              <label className="lesson-fill-row">
                <span className="sr-only">{question.prompt}</span>
                <span lang="kn">{question.before}</span>
                <input lang="kn" value={answer} maxLength={300} onChange={(event) => { setAnswer(event.target.value); setAnswerError('') }} />
                <span lang="kn">{question.after}</span>
              </label>
            )}

            {question.type === 'matching' && (
              <div className="lesson-match-list">
                {question.leftItems.map((item) => (
                  <label className="lesson-match-row" key={item.id}>
                    <span lang="kn">{item.text}</span>
                    <span aria-hidden="true">→</span>
                    <ThemedSelect
                      value={answer.find((pair) => pair.leftId === item.id)?.rightId ?? ''}
                      aria-label={`Match ${item.text}`}
                      onChange={(event) => { setMatch(item.id, event.target.value); setAnswerError('') }}
                    >
                      <option value="">Choose a match</option>
                      {question.rightItems.map((option) => <option key={option.id} value={option.id}>{option.text}</option>)}
                    </ThemedSelect>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'order' && (
              <div className="lesson-order-area">
                <div className="lesson-order-selected" aria-live="polite">
                  {answer.length
                    ? answer.map((id, index) => {
                        const item = question.items.find(({ id: itemId }) => itemId === id)
                        return <button type="button" key={id} onClick={() => removeOrderItem(id)} aria-label={`Remove ${item.text} from position ${index + 1}`}>{item.text} ×</button>
                      })
                    : <span>Choose words in the order you want them to appear.</span>}
                </div>
                <div className="lesson-order-options" aria-label="Available words">
                  {question.items.map((item) => (
                    <button type="button" key={item.id} disabled={answer.includes(item.id)} onClick={() => addOrderItem(item.id)}>{item.text}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {question.hint && <p className="lesson-hint">Hint: {question.hint}</p>}
          {answerError && <p className="lesson-action-error" role="alert">{answerError}</p>}
          {feedback && (
            <div className={`lesson-feedback${feedback.correct ? ' is-correct' : ' is-incorrect'}`} role="status" aria-live="polite">
              <strong>{feedback.correct ? 'That’s right!' : 'Not quite yet.'}</strong>
              <p>{feedback.explanation}</p>
            </div>
          )}
          <div className="lesson-exercise-actions">
            {feedback?.correct
              ? <button className="button button-dark" type="button" onClick={continueExercises}>Continue <FaArrowRight aria-hidden="true" /></button>
              : feedback
                ? feedback.attemptsUsed >= 10
                  ? <button className="button button-dark" type="button" onClick={restartLesson}><FaRedoAlt aria-hidden="true" /> Restart lesson</button>
                  : <button className="button button-dark" type="button" onClick={retryQuestion}><FaRedoAlt aria-hidden="true" /> Try again</button>
                : <button className="button button-dark" type="button" onClick={checkAnswer}>Check answer <FaCheck aria-hidden="true" /></button>}
          </div>
        </section>
      )}

      {phase === 'review' && (
        <section className="lesson-review-card">
          <span className="context-label">REVIEW BEFORE YOU FINISH</span>
          <h2>What you learned</h2>
          <ul>{lesson.summary.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="lesson-score-preview">Correct on the first try: <strong>{firstTryScore} of {lesson.exercises.length}</strong></p>
          <p className="lesson-review-note">Your answers are checked and saved to your learning progress when you finish. Correct any answer you missed before reaching this review.</p>
          {submissionError && <p className="lesson-action-error" role="alert">{submissionError}</p>}
          <button className="button button-dark lesson-primary-action" type="button" onClick={saveAttempt} disabled={submitting}>
            {submitting ? 'Saving your result…' : 'Finish and save progress'} <FaCheck aria-hidden="true" />
          </button>
        </section>
      )}

      {phase === 'result' && savedAttempt && (
        <section className={`lesson-result-card${savedAttempt.passed ? ' passed' : ''}`} role="status">
          <span className="lesson-result-icon"><FaCheck aria-hidden="true" /></span>
          <span className="context-label">{savedAttempt.passed ? 'LESSON COMPLETED' : 'KEEP PRACTICING'}</span>
          <h2>{savedAttempt.passed ? 'You made real progress.' : 'One more round will help it stick.'}</h2>
          <p>Your first-try score: <strong>{savedAttempt.score} of {savedAttempt.total}</strong></p>
          {savedAttempt.passed
            ? <p>{lesson.isSupplementary
              ? 'Your result is saved to your learning progress. Return to your learning path to continue.'
              : 'This lesson is saved as complete. Your next lesson is now available.'}</p>
            : <p>This attempt was saved, but you need at least 70% correct on the first try. Review the lesson and try again.</p>}
          {savedAttempt.passed
            ? <Link
                className="button button-dark"
                to={lesson.isSupplementary || !curriculum.lessons[lessonIndex + 1]
                  ? '/learn/lessons'
                  : `/learn/lessons/${curriculum.lessons[lessonIndex + 1].id}`}
                state={returnToLessonsState}
              >
                {lesson.isSupplementary
                  ? 'View learning path'
                  : curriculum.lessons[lessonIndex + 1] ? 'Continue to next lesson' : 'View course progress'} <FaArrowRight aria-hidden="true" />
              </Link>
            : <button className="button button-dark" type="button" onClick={restartLesson}><FaRedoAlt aria-hidden="true" /> Practice again</button>}
        </section>
      )}

      {isCompleted && phase === 'teach' && <p className="lesson-completed-note"><FaCheck aria-hidden="true" /> You have already completed this lesson. Review it or practice again.</p>}
    </div>
  )
}
