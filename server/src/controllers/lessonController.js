import SupplementaryLesson from '../models/SupplementaryLesson.js'
import LessonAttempt from '../models/LessonAttempt.js'
import { HttpError } from '../middleware/errorHandler.js'
import { generateSupplementaryLessonContent } from '../services/aiService.js'
import { curriculaByLevel } from '../../../shared/curricula.js'
import { normalizeSupplementaryLesson } from '../../../shared/lessonAdapters.js'

function supplementaryLessonResponse(record) {
  return {
    id: record._id.toString(),
    lesson: record.lesson,
    level: record.level,
    topic: record.topic,
  }
}

export async function generateSupplementaryLesson(request, response) {
  const { topic } = request.body
  if (typeof topic !== 'string' || topic.trim().length < 2 || topic.trim().length > 80) {
    throw new HttpError(400, 'Enter a lesson topic between 2 and 80 characters.')
  }

  const level = request.user.preferredLearningLevel ?? 'beginner'
  const normalizedTopic = topic.normalize('NFKC').trim().replace(/\s+/g, ' ')
  if (normalizedTopic.length < 2 || normalizedTopic.length > 80) {
    throw new HttpError(400, 'Enter a lesson topic between 2 and 80 characters.')
  }
  const topicKey = normalizedTopic.toLocaleLowerCase('en-US')
  const cachedLesson = await SupplementaryLesson.findOne({
    user: request.user.id,
    level,
    topicKey,
  }).lean()
  if (cachedLesson) {
    response.json({ data: { ...supplementaryLessonResponse(cachedLesson), cached: true } })
    return
  }

  const completedLessons = await LessonAttempt.distinct('lessonId', {
    user: request.user.id,
    passed: true,
    curriculumLevel: level,
  })
  const coveredLessons = curriculaByLevel.get(level).lessons
    .filter(({ id }) => completedLessons.includes(id))
    .map(({ title }) => title)

  const lesson = await generateSupplementaryLessonContent({
    level,
    topic: normalizedTopic,
    coveredLessons,
  })
  let savedLesson
  try {
    savedLesson = await SupplementaryLesson.create({
      user: request.user.id,
      level,
      topicKey,
      topic: normalizedTopic,
      lesson,
    })
  } catch (error) {
    if (error?.code !== 11000) throw error
    savedLesson = await SupplementaryLesson.findOne({
      user: request.user.id,
      level,
      topicKey,
    }).lean()
    if (!savedLesson) throw error
    response.json({ data: { ...supplementaryLessonResponse(savedLesson), cached: true } })
    return
  }

  response.status(201).json({
    data: { ...supplementaryLessonResponse(savedLesson), cached: false },
  })
}

export async function getSupplementaryLesson(request, response) {
  const record = await SupplementaryLesson.findOne({
    _id: request.params.lessonId,
    user: request.user.id,
  }).lean()
  if (!record) throw new HttpError(404, 'Supplementary lesson not found.')
  response.json({ data: supplementaryLessonResponse(record) })
}
