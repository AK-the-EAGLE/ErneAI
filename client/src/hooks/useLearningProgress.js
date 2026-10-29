import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'

export default function useLearningProgress(learningLevel = 'beginner') {
  const currentLevelRef = useRef(learningLevel)
  const [visitedScenarios, setVisitedScenarios] = useState([])
  const [storageError, setStorageError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lessonProgress, setLessonProgress] = useState({
    level: learningLevel,
    completedLessons: [],
    currentLessonId: null,
    attempts: [],
    masteredVocabulary: [],
  })
  const [lessonProgressErrorState, setLessonProgressErrorState] = useState({ level: null, message: '' })
  const lessonProgressError = lessonProgressErrorState.level === learningLevel
    ? lessonProgressErrorState.message
    : ''
  const [lessonsLoading, setLessonsLoading] = useState(true)

  useLayoutEffect(() => {
    currentLevelRef.current = learningLevel
  }, [learningLevel])

  useEffect(() => {
    let active = true
    api.getProgress()
      .then((progress) => {
        if (active) setVisitedScenarios(progress.visitedScenarios)
      })
      .catch((error) => {
        if (active) setStorageError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    api.getLessonProgress()
      .then((progress) => {
        if (active) {
          setLessonProgress(progress)
          setLessonProgressErrorState({ level: learningLevel, message: '' })
        }
      })
      .catch((error) => {
        if (active) setLessonProgressErrorState({ level: learningLevel, message: error.message })
      })
      .finally(() => {
        if (active) setLessonsLoading(false)
      })

    return () => { active = false }
  }, [learningLevel])

  const refreshLessonProgress = useCallback(async () => {
    setLessonsLoading(true)
    setLessonProgressErrorState({ level: learningLevel, message: '' })
    try {
      const progress = await api.getLessonProgress()
      if (currentLevelRef.current === learningLevel) setLessonProgress(progress)
    } catch (error) {
      if (currentLevelRef.current === learningLevel) {
        setLessonProgressErrorState({ level: learningLevel, message: error.message })
      }
    } finally {
      if (currentLevelRef.current === learningLevel) setLessonsLoading(false)
    }
  }, [learningLevel])

  const markScenarioVisited = useCallback(async (scenario) => {
    if (visitedScenarios.includes(scenario)) return
    setStorageError('')
    try {
      const progress = await api.markScenarioVisited(scenario)
      setVisitedScenarios(progress.visitedScenarios)
    } catch (error) {
      setStorageError(error.message)
    }
  }, [visitedScenarios])

  const setCurrentLesson = useCallback(async (lessonId) => {
    setLessonProgressErrorState({ level: learningLevel, message: '' })
    try {
      const result = await api.setCurrentLesson(lessonId)
      setLessonProgress((previous) => ({ ...previous, level: learningLevel, currentLessonId: result.currentLessonId }))
      return result
    } catch (error) {
      setLessonProgressErrorState({ level: learningLevel, message: error.message })
      throw error
    }
  }, [learningLevel])

  const submitLessonAttempt = useCallback(async (lessonId, answers) => {
    setLessonProgressErrorState({ level: learningLevel, message: '' })
    try {
      const result = await api.submitLessonAttempt(lessonId, answers)
      setLessonProgress((previous) => ({
        ...previous,
        level: learningLevel,
        completedLessons: result.attempt.passed
          ? [...new Set([...previous.completedLessons, lessonId])]
          : previous.completedLessons,
        currentLessonId: result.currentLessonId,
        masteredVocabulary: result.masteredVocabulary ?? previous.masteredVocabulary,
        attempts: [result.attempt, ...previous.attempts].slice(0, 50),
      }))
      return result
    } catch (error) {
      setLessonProgressErrorState({ level: learningLevel, message: error.message })
      throw error
    }
  }, [learningLevel])

  return {
    visitedScenarios,
    storageError,
    loading,
    markScenarioVisited,
    level: lessonProgress.level,
    completedLessons: lessonProgress.completedLessons ?? [],
    currentLessonId: lessonProgress.currentLessonId,
    lessonAttempts: lessonProgress.attempts ?? [],
    masteredVocabulary: lessonProgress.masteredVocabulary,
    lessonProgressError,
    lessonsLoading: lessonsLoading || (
      lessonProgress.level !== learningLevel
      && !lessonProgressError
    ),
    refreshLessonProgress,
    setCurrentLesson,
    submitLessonAttempt,
  }
}
