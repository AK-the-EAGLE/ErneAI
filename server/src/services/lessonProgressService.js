import { allLessons, allLessonsById } from '../../../shared/curricula.js'
import { HttpError } from '../middleware/errorHandler.js'

export function isLessonUnlocked(lessonId, completedLessons, level) {
  const lesson = allLessonsById.get(lessonId)
  if (!lesson || (level && lesson.level !== level)) return false
  if (completedLessons.includes(lessonId)) return true
  const lessons = allLessons.filter(({ level: lessonLevel }) => lessonLevel === lesson.level)
  const index = lessons.findIndex((item) => item.id === lessonId)
  if (index < 0) return false
  return index === 0 || completedLessons.includes(lessons[index - 1].id)
}

function isCorrectAnswer(question, answer) {
  if (question.type === 'choice' || question.type === 'review') {
    return answer === question.answer
  }
  if (question.type === 'fill') {
    return typeof answer === 'string'
      && answer.normalize('NFC').trim() === question.answer.normalize('NFC')
  }
  if (question.type === 'order') {
    return Array.isArray(answer)
      && answer.length === question.answer.length
      && answer.every((id, index) => id === question.answer[index])
  }
  if (question.type === 'matching') {
    if (!Array.isArray(answer) || answer.length !== question.answer.length) return false
    const pairs = new Map(answer.map(({ leftId, rightId }) => [leftId, rightId]))
    return pairs.size === question.answer.length
      && question.answer.every(({ leftId, rightId }) => pairs.get(leftId) === rightId)
  }
  return false
}

function validateAnswerShape(question, answer) {
  if (question.type === 'choice' || question.type === 'review') {
    if (typeof answer !== 'string' || !question.options.some(({ id }) => id === answer)) {
      throw new HttpError(400, 'Choose one of the available answers.')
    }
    return
  }
  if (question.type === 'fill') {
    if (typeof answer !== 'string' || answer.length > 300) {
      throw new HttpError(400, 'Enter a valid fill-in answer.')
    }
    return
  }
  if (question.type === 'order') {
    if (
      !Array.isArray(answer)
      || answer.length > question.items.length
      || answer.some((id) => !question.items.some((item) => item.id === id))
      || new Set(answer).size !== answer.length
    ) throw new HttpError(400, 'Choose valid words for the sentence.')
    return
  }
  if (question.type === 'matching') {
    const leftIds = new Set(question.leftItems.map(({ id }) => id))
    const rightIds = new Set(question.rightItems.map(({ id }) => id))
    if (
      !Array.isArray(answer)
      || answer.length > question.leftItems.length
      || answer.some((pair) => (
        !pair
        || typeof pair !== 'object'
        || !leftIds.has(pair.leftId)
        || !rightIds.has(pair.rightId)
      ))
      || new Set(answer.map(({ leftId }) => leftId)).size !== answer.length
      || new Set(answer.map(({ rightId }) => rightId)).size !== answer.length
    ) throw new HttpError(400, 'Choose valid matching pairs.')
    return
  }
  throw new HttpError(400, 'This exercise type is not supported.')
}

export function evaluateLessonDefinition(lesson, submissions) {
  if (!lesson) throw new HttpError(404, 'Choose a supported lesson.')
  if (!Array.isArray(submissions) || submissions.length !== lesson.exercises.length) {
    throw new HttpError(400, 'Complete every exercise before submitting the lesson.')
  }

  const submissionsById = new Map()
  for (const submission of submissions) {
    if (
      !submission
      || typeof submission.questionId !== 'string'
      || submissionsById.has(submission.questionId)
      || !Array.isArray(submission.attempts)
      || submission.attempts.length < 1
      || submission.attempts.length > 10
    ) throw new HttpError(400, 'The lesson answers are invalid.')
    submissionsById.set(submission.questionId, submission)
  }

  let score = 0
  let allQuestionsResolved = true
  const answers = lesson.exercises.map((question) => {
    const submission = submissionsById.get(question.id)
    if (!submission) throw new HttpError(400, 'Complete every exercise before submitting the lesson.')

    const attempts = submission.attempts.map((answer) => {
      validateAnswerShape(question, answer)
      return { answer, correct: isCorrectAnswer(question, answer) }
    })
    if (attempts[0].correct) score += 1
    const finalCorrect = attempts.at(-1).correct
    if (!finalCorrect) allQuestionsResolved = false
    return { questionId: question.id, attempts, finalCorrect }
  })

  const passed = allQuestionsResolved && score / lesson.exercises.length >= 0.7
  return { score, total: lesson.exercises.length, passed, answers }
}

export function evaluateLessonAttempt(lessonId, submissions) {
  const lesson = allLessonsById.get(lessonId)
  if (!lesson) throw new HttpError(404, 'Choose a supported lesson.')
  return evaluateLessonDefinition(lesson, submissions)
}
