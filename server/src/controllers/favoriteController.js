import mongoose from 'mongoose'
import Favorite from '../models/Favorite.js'
import Phrase from '../models/Phrase.js'
import SupplementaryLesson from '../models/SupplementaryLesson.js'
import { toPhrase } from './phraseController.js'
import { HttpError } from '../middleware/errorHandler.js'
import { allLessonsById } from '../../../shared/curricula.js'

export async function listFavorites(request, response) {
  const favorites = await Favorite.find({ user: request.user.id }).populate('phrase').sort({ createdAt: -1 })
  const generatedLessonIds = favorites
    .filter((favorite) => favorite.kind === 'lesson' && !allLessonsById.has(favorite.lessonId))
    .map((favorite) => favorite.lessonId)
    .filter((id) => mongoose.isValidObjectId(id))
  const generatedLessons = generatedLessonIds.length
    ? await SupplementaryLesson.find({
        _id: { $in: generatedLessonIds },
        user: request.user.id,
      }).lean()
    : []
  const generatedLessonsById = new Map(generatedLessons.map((lesson) => [lesson._id.toString(), lesson]))

  response.json({
    data: favorites.flatMap((favorite) => {
      if (favorite.kind === 'lesson') {
        const lesson = allLessonsById.get(favorite.lessonId)
        const generatedLesson = generatedLessonsById.get(favorite.lessonId)
        const savedLesson = lesson ?? (generatedLesson ? {
          id: generatedLesson._id.toString(),
          title: generatedLesson.lesson.title,
          module: 'Supplementary lesson',
          objective: generatedLesson.lesson.objective,
          level: generatedLesson.level,
        } : null)
        return savedLesson ? [{
          id: savedLesson.id,
          key: `lesson:${savedLesson.id}`,
          kind: 'lesson',
          title: savedLesson.title,
          module: savedLesson.module,
          objective: savedLesson.objective,
          curriculumLevel: savedLesson.level,
          favoriteId: favorite.id,
          savedAt: favorite.createdAt,
        }] : []
      }
      return favorite.phrase ? [{
        ...toPhrase(favorite.phrase),
        key: `phrase:${favorite.phrase.id}`,
        kind: 'phrase',
        favoriteId: favorite.id,
        savedAt: favorite.createdAt,
      }] : []
    }),
  })
}

function phraseFavoriteResponse(phrase, favorite) {
  return {
    ...toPhrase(phrase),
    key: `phrase:${phrase.id}`,
    kind: 'phrase',
    favoriteId: favorite.id,
    savedAt: favorite.createdAt,
  }
}

function lessonFavoriteResponse(lesson, favorite) {
  return {
    id: lesson.id,
    key: `lesson:${lesson.id}`,
    kind: 'lesson',
    title: lesson.title,
    module: lesson.module,
    objective: lesson.objective,
    curriculumLevel: lesson.level,
    favoriteId: favorite.id,
    savedAt: favorite.createdAt,
  }
}

export async function addFavorite(request, response) {
  const { type = 'phrase' } = request.body
  if (!['phrase', 'lesson'].includes(type)) throw new HttpError(400, 'Choose a supported favorite type.')

  if (type === 'lesson') {
    const { lessonId } = request.body
    if (typeof lessonId !== 'string' || lessonId.length > 100) {
      throw new HttpError(400, 'A valid lesson ID is required.')
    }
    let lesson = allLessonsById.get(lessonId)
    if (!lesson && mongoose.isValidObjectId(lessonId)) {
      const generatedLesson = await SupplementaryLesson.findOne({
        _id: lessonId,
        user: request.user.id,
      }).lean()
      if (generatedLesson) {
        lesson = {
          id: generatedLesson._id.toString(),
          title: generatedLesson.lesson.title,
          module: 'Supplementary lesson',
          objective: generatedLesson.lesson.objective,
          level: generatedLesson.level,
        }
      }
    }
    if (!lesson) throw new HttpError(404, 'Lesson not found.')

    try {
      const favorite = await Favorite.create({
        user: request.user.id,
        kind: 'lesson',
        lessonId: lesson.id,
        curriculumLevel: lesson.level,
      })
      response.status(201).json({ data: lessonFavoriteResponse(lesson, favorite) })
    } catch (error) {
      if (error.code === 11000) {
        const favorite = await Favorite.findOne({ user: request.user.id, kind: 'lesson', lessonId: lesson.id })
        if (favorite) {
          response.status(200).json({ data: lessonFavoriteResponse(lesson, favorite) })
          return
        }
      }
      throw error
    }
    return
  }

  const { phraseId } = request.body
  if (typeof phraseId !== 'string' || !mongoose.isValidObjectId(phraseId)) {
    throw new HttpError(400, 'A valid phrase ID is required.')
  }
  const phrase = await Phrase.findById(phraseId)
  if (!phrase) throw new HttpError(404, 'Phrase not found.')
  try {
    const favorite = await Favorite.create({ user: request.user.id, kind: 'phrase', phrase: phrase.id })
    response.status(201).json({ data: phraseFavoriteResponse(phrase, favorite) })
  } catch (error) {
    if (error.code === 11000) {
      const favorite = await Favorite.findOne({ user: request.user.id, kind: 'phrase', phrase: phrase.id })
      if (favorite) {
        response.status(200).json({ data: phraseFavoriteResponse(phrase, favorite) })
        return
      }
    }
    throw error
  }
}

export async function removeFavorite(request, response) {
  const favorite = await Favorite.findOneAndDelete({ user: request.user.id, _id: request.params.favoriteId })
  if (!favorite) throw new HttpError(404, 'Favorite not found.')
  response.json({ data: { removed: true } })
}
