import mongoose from 'mongoose'
import Progress from '../models/Progress.js'
import LessonAttempt from '../models/LessonAttempt.js'
import SupplementaryLesson from '../models/SupplementaryLesson.js'
import { scenarioIds } from '../config/scenarios.js'
import { HttpError } from '../middleware/errorHandler.js'
import { curriculaByLevel, allLessons, allLessonsById } from '../../../shared/curricula.js'
import { normalizeSupplementaryLesson } from '../../../shared/lessonAdapters.js'
import { evaluateLessonDefinition, isLessonUnlocked } from '../services/lessonProgressService.js'

async function findLessonForUser(lessonId, userId) {
  const curriculumLesson = allLessonsById.get(lessonId)
  if (curriculumLesson) return curriculumLesson
  if (!mongoose.isValidObjectId(lessonId)) return null

  const supplementaryLesson = await SupplementaryLesson.findOne({
    _id: lessonId,
    user: userId,
  }).lean()
  if (!supplementaryLesson) return null

  return normalizeSupplementaryLesson({
    id: supplementaryLesson._id,
    level: supplementaryLesson.level,
    topic: supplementaryLesson.topic,
    lesson: supplementaryLesson.lesson,
  })
}

export async function getProgress(request, response) {
  const progress = await Progress.findOne({ user: request.user.id }).lean()
  response.json({ data: { visitedScenarios: progress?.visitedScenarios ?? [] } })
}

export async function updateProgress(request, response) {
  const { scenario } = request.body
  if (!scenarioIds.includes(scenario)) throw new HttpError(400, 'Choose a supported scenario.')

  const progress = await Progress.findOneAndUpdate(
    { user: request.user.id },
    { $addToSet: { visitedScenarios: scenario } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  response.json({ data: { visitedScenarios: progress.visitedScenarios } })
}

async function getCompletedLessons(userId, level) {
  const levelFilter = [{ curriculumLevel: level }]
  if (level === 'beginner') levelFilter.push({ curriculumLevel: { $exists: false } })
  return LessonAttempt.distinct('lessonId', {
    user: userId,
    passed: true,
    $or: levelFilter,
  })
}

export async function getLessonProgress(request, response) {
  const level = request.user.preferredLearningLevel ?? 'beginner'
  const [progress, completedLessons, attempts] = await Promise.all([
    Progress.findOne({ user: request.user.id }).lean(),
    getCompletedLessons(request.user.id, level),
    LessonAttempt.find({ user: request.user.id })
      .sort({ attemptedAt: -1 })
      .limit(50)
      .lean(),
  ])
  const curriculum = curriculaByLevel.get(level)
  const completedLessonSet = new Set(completedLessons)
  const levelVocabulary = curriculum.lessons
    .filter(({ id }) => completedLessonSet.has(id))
    .flatMap(({ vocabulary }) => vocabulary.map(({ id }) => id))
  const beginnerVocabularyIds = new Set(curriculaByLevel.get('beginner').lessons
    .flatMap(({ vocabulary }) => vocabulary.map(({ id }) => id)))
  const legacyBeginnerVocabulary = level === 'beginner'
    ? (progress?.masteredVocabulary ?? []).filter((id) => beginnerVocabularyIds.has(id))
    : []
  const currentLessonId = progress?.currentLessonLevel === level
    || (!progress?.currentLessonLevel && level === 'beginner')
    ? progress?.currentLessonId ?? null
    : null
  response.json({
    data: {
      level,
      completedLessons,
      currentLessonId,
      masteredVocabulary: [...new Set([...levelVocabulary, ...legacyBeginnerVocabulary])],
      attempts: attempts.map(({ _id, lessonId, curriculumLevel = 'beginner', score, total, passed, attemptedAt }) => ({
        id: _id.toString(),
        lessonId,
        curriculumLevel,
        score,
        total,
        passed,
        attemptedAt,
      })),
    },
  })
}

export async function setCurrentLesson(request, response) {
  const { lessonId } = request.body
  const lesson = typeof lessonId === 'string'
    ? await findLessonForUser(lessonId, request.user.id)
    : null
  if (!lesson) throw new HttpError(400, 'Choose a supported lesson.')
  const level = request.user.preferredLearningLevel ?? 'beginner'
  if (lesson.level !== level) throw new HttpError(409, 'This lesson is not part of your current learning level.')

  if (!lesson.isSupplementary) {
    const completedLessons = await getCompletedLessons(request.user.id, level)
    if (!isLessonUnlocked(lessonId, completedLessons, level)) {
      throw new HttpError(409, 'Complete the previous lesson to unlock this one.')
    }
  }

  const progress = await Progress.findOneAndUpdate(
    { user: request.user.id },
    { $set: { currentLessonId: lessonId, currentLessonLevel: level } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  response.json({ data: { currentLessonId: progress.currentLessonId } })
}

export async function submitLessonAttempt(request, response) {
  const { lessonId } = request.params
  const lesson = await findLessonForUser(lessonId, request.user.id)
  if (!lesson) throw new HttpError(404, 'Choose a supported lesson.')
  const level = request.user.preferredLearningLevel ?? 'beginner'
  if (lesson.level !== level) throw new HttpError(409, 'This lesson is not part of your current learning level.')

  const completedLessons = lesson.isSupplementary
    ? []
    : await getCompletedLessons(request.user.id, level)
  if (!lesson.isSupplementary && !isLessonUnlocked(lessonId, completedLessons, level)) {
    throw new HttpError(409, 'Complete the previous lesson to unlock this one.')
  }

  const result = evaluateLessonDefinition(lesson, request.body.answers)
  const attempt = await LessonAttempt.create({
    user: request.user.id,
    lessonId,
    curriculumLevel: level,
    ...result,
  })

  const completedLessonIds = new Set(completedLessons)
  let currentLessonId = lessonId
  if (result.passed) {
    completedLessonIds.add(lessonId)
    if (!lesson.isSupplementary) {
      const levelLessons = allLessons.filter(({ level: lessonLevel }) => lessonLevel === level)
      const nextLesson = levelLessons[levelLessons.findIndex((item) => item.id === lessonId) + 1]
      currentLessonId = nextLesson?.id ?? lessonId
    }
    await Progress.findOneAndUpdate(
      { user: request.user.id },
      {
        $set: { currentLessonId, currentLessonLevel: level },
        $addToSet: { masteredVocabulary: { $each: lesson.vocabulary.map(({ id }) => id) } },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
  }
  const masteredVocabulary = allLessons
    .filter((item) => item.level === level && completedLessonIds.has(item.id))
    .flatMap(({ vocabulary }) => vocabulary.map(({ id }) => id))

  response.status(201).json({
    data: {
      attempt: {
        id: attempt._id.toString(),
        lessonId: attempt.lessonId,
        curriculumLevel: attempt.curriculumLevel,
        score: attempt.score,
        total: attempt.total,
        passed: attempt.passed,
        answers: attempt.answers,
        attemptedAt: attempt.attemptedAt,
      },
      currentLessonId,
      masteredVocabulary,
    },
  })
}
