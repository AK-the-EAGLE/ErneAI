import { test } from 'node:test'
import assert from 'node:assert/strict'
import Favorite from '../src/models/Favorite.js'
import Phrase from '../src/models/Phrase.js'
import Progress from '../src/models/Progress.js'
import { addFavorite, listFavorites, removeFavorite } from '../src/controllers/favoriteController.js'
import { getProgress, updateProgress } from '../src/controllers/progressController.js'
import { listPhrases } from '../src/controllers/phraseController.js'
import { allLessonsById } from '../../shared/curricula.js'

const userId = '507f1f77bcf86cd799439011'

function createResponse() {
  return {
    body: null,
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('adding generated phrases to Favorites returns stable phrase records', async () => {
  const originalPhraseFindById = Phrase.findById
  const originalFavoriteCreate = Favorite.create
  const originalFavoriteFindOne = Favorite.findOne
  const phraseId = '507f1f77bcf86cd799439012'
  const favoriteId = '507f1f77bcf86cd799439013'
  const phrase = {
    id: phraseId,
    _id: phraseId,
    kannada: 'ನಮಸ್ಕಾರ',
    transliteration: 'Namaskāra',
    english: 'Hello',
    scenario: 'generated',
    situation: 'Talking to an auto driver.',
    context: 'Ask about the fare before starting the trip.',
    difficulty: 'essential',
  }
  const favorite = { id: favoriteId, createdAt: new Date('2026-10-29T00:00:00.000Z') }
  let createCount = 0
  let findOneQuery

  try {
    await assert.rejects(
      addFavorite({ user: { id: userId }, body: { phraseId: 'invalid' } }, createResponse()),
      (error) => error.status === 400,
    )

    Phrase.findById = async () => null
    await assert.rejects(
      addFavorite({ user: { id: userId }, body: { phraseId } }, createResponse()),
      (error) => error.status === 404,
    )

    Phrase.findById = async (id) => {
      assert.equal(id, phraseId)
      return phrase
    }
    Favorite.create = async (value) => {
      createCount += 1
      assert.deepEqual(value, { user: userId, kind: 'phrase', phrase: phraseId })
      if (createCount === 2) {
        const duplicateError = new Error('duplicate key')
        duplicateError.code = 11000
        throw duplicateError
      }
      return favorite
    }
    Favorite.findOne = async (query) => {
      findOneQuery = query
      return favorite
    }

    const firstResponse = createResponse()
    await addFavorite({ user: { id: userId }, body: { phraseId } }, firstResponse)
    assert.equal(firstResponse.statusCode, 201)
    assert.equal(firstResponse.body.data.id, phraseId)
    assert.equal(firstResponse.body.data.context, 'Ask about the fare before starting the trip.')
    assert.equal(firstResponse.body.data.scenarioName, 'Talking to an auto driver.')
    assert.equal(firstResponse.body.data.key, `phrase:${phraseId}`)
    assert.equal(firstResponse.body.data.kind, 'phrase')
    assert.equal(firstResponse.body.data.favoriteId, favoriteId)
    assert.equal(firstResponse.body.data.savedAt, favorite.createdAt)

    const duplicateResponse = createResponse()
    await addFavorite({ user: { id: userId }, body: { phraseId } }, duplicateResponse)
    assert.equal(duplicateResponse.statusCode, 200)
    assert.equal(duplicateResponse.body.data.id, phraseId)
    assert.deepEqual(findOneQuery, { user: userId, kind: 'phrase', phrase: phraseId })
    assert.equal(createCount, 2)
  } finally {
    Phrase.findById = originalPhraseFindById
    Favorite.create = originalFavoriteCreate
    Favorite.findOne = originalFavoriteFindOne
  }
})

test('lesson favorites validate curriculum IDs and make duplicate saves idempotent', async () => {
  const originalFavoriteCreate = Favorite.create
  const originalFavoriteFindOne = Favorite.findOne
  const lesson = allLessonsById.get('advanced-register')
  const secondLesson = allLessonsById.get('greetings')
  const createValues = []
  const savedFavorites = new Map()
  let duplicateQuery

  assert.ok(lesson)
  assert.ok(secondLesson)
  assert.notEqual(lesson.id, secondLesson.id)

  try {
    await assert.rejects(
      addFavorite({ user: { id: userId }, body: { type: 'lesson', lessonId: 'not-a-lesson' } }, createResponse()),
      (error) => error.status === 404,
    )

    Favorite.create = async (value) => {
      createValues.push(value)
      if (savedFavorites.has(value.lessonId)) {
        const duplicateError = new Error('duplicate key')
        duplicateError.code = 11000
        throw duplicateError
      }
      const favorite = {
        id: `favorite-${value.lessonId}`,
        createdAt: new Date('2026-10-29T00:00:00.000Z'),
      }
      savedFavorites.set(value.lessonId, favorite)
      return favorite
    }
    Favorite.findOne = async (query) => {
      duplicateQuery = query
      return savedFavorites.get(query.lessonId)
    }

    const firstResponse = createResponse()
    await addFavorite({ user: { id: userId }, body: { type: 'lesson', lessonId: lesson.id } }, firstResponse)
    assert.equal(firstResponse.statusCode, 201)
    assert.equal(firstResponse.body.data.key, `lesson:${lesson.id}`)
    assert.equal(firstResponse.body.data.kind, 'lesson')
    assert.equal(firstResponse.body.data.curriculumLevel, lesson.level)
    assert.deepEqual(createValues[0], {
      user: userId,
      kind: 'lesson',
      lessonId: lesson.id,
      curriculumLevel: lesson.level,
    })

    const secondResponse = createResponse()
    await addFavorite({ user: { id: userId }, body: { type: 'lesson', lessonId: secondLesson.id } }, secondResponse)
    assert.equal(secondResponse.statusCode, 201)
    assert.equal(secondResponse.body.data.id, secondLesson.id)
    assert.equal(savedFavorites.size, 2)

    const duplicateResponse = createResponse()
    await addFavorite({ user: { id: userId }, body: { type: 'lesson', lessonId: lesson.id } }, duplicateResponse)
    assert.equal(duplicateResponse.statusCode, 200)
    assert.deepEqual(duplicateQuery, { user: userId, kind: 'lesson', lessonId: lesson.id })
    assert.equal(savedFavorites.size, 2)
  } finally {
    Favorite.create = originalFavoriteCreate
    Favorite.findOne = originalFavoriteFindOne
  }
})

test('favorite listing includes saved lessons and omits unavailable items', async () => {
  const originalFind = Favorite.find
  const lesson = allLessonsById.get('advanced-register')
  const secondLesson = allLessonsById.get('greetings')
  const phrase = {
    id: '507f1f77bcf86cd799439012',
    kannada: 'ನಮಸ್ಕಾರ',
    transliteration: 'Namaskāra',
    english: 'Hello',
    scenario: 'generated',
    situation: 'Talking to an auto driver.',
    context: 'Ask about the fare before starting the trip.',
    difficulty: 'essential',
  }
  const savedAt = new Date('2026-10-29T00:00:00.000Z')
  let capturedQuery

  Favorite.find = (query) => {
    capturedQuery = query
    return {
      populate() { return this },
      sort() {
        return {
          then(resolve, reject) {
            return Promise.resolve([
              { id: 'phrase-favorite', kind: 'phrase', phrase, createdAt: savedAt },
              { id: 'lesson-favorite', kind: 'lesson', lessonId: lesson.id, createdAt: savedAt },
              { id: 'second-lesson-favorite', kind: 'lesson', lessonId: secondLesson.id, createdAt: savedAt },
              { id: 'deleted-lesson-favorite', kind: 'lesson', lessonId: 'deleted-lesson', createdAt: savedAt },
            ]).then(resolve, reject)
          },
        }
      },
    }
  }

  try {
    const response = createResponse()
    await listFavorites({ user: { id: userId } }, response)
    assert.deepEqual(capturedQuery, { user: userId })
    assert.equal(response.body.data.length, 3)
    assert.equal(response.body.data[0].kind, 'phrase')
    assert.equal(response.body.data[0].scenarioName, 'Talking to an auto driver.')
    assert.equal(response.body.data[1].key, `lesson:${lesson.id}`)
    assert.equal(response.body.data[2].key, `lesson:${secondLesson.id}`)
    assert.equal(response.body.data[1].savedAt, savedAt)
  } finally {
    Favorite.find = originalFind
  }
})

test('removing a lesson favorite leaves other lesson favorites untouched', async () => {
  const originalFindOneAndDelete = Favorite.findOneAndDelete
  const savedFavorites = [
    { id: 'first-favorite', lessonId: 'advanced-register' },
    { id: 'second-favorite', lessonId: 'greetings' },
  ]
  let capturedQuery

  Favorite.findOneAndDelete = async (query) => {
    capturedQuery = query
    const index = savedFavorites.findIndex((favorite) => favorite.id === query._id)
    return index < 0 ? null : savedFavorites.splice(index, 1)[0]
  }

  try {
    const response = createResponse()
    await removeFavorite({
      user: { id: userId },
      params: { favoriteId: 'first-favorite' },
    }, response)
    assert.deepEqual(capturedQuery, { user: userId, _id: 'first-favorite' })
    assert.deepEqual(response.body, { data: { removed: true } })
    assert.deepEqual(savedFavorites, [{ id: 'second-favorite', lessonId: 'greetings' }])
  } finally {
    Favorite.findOneAndDelete = originalFindOneAndDelete
  }
})

test('favorite unique indexes are partial and scoped to each item type', () => {
  const indexes = Favorite.schema.indexes()
  assert.ok(indexes.some(([keys, options]) => (
    keys.user === 1 && keys.kind === 1 && keys.phrase === 1
    && options.unique
    && options.partialFilterExpression.phrase.$type === 'objectId'
  )))
  assert.ok(indexes.some(([keys, options]) => (
    keys.user === 1 && keys.kind === 1 && keys.lessonId === 1
    && options.unique
    && options.partialFilterExpression.lessonId.$type === 'string'
  )))
})

test('favorite reads and deletes are scoped to the authenticated user', async () => {
  const originalFind = Favorite.find
  const originalFindOneAndDelete = Favorite.findOneAndDelete
  const capturedQueries = []

  Favorite.find = (query) => {
    capturedQueries.push(query)
    return {
      populate() { return this },
      sort() { return this },
      then(resolve, reject) { return Promise.resolve([]).then(resolve, reject) },
    }
  }
  Favorite.findOneAndDelete = async (query) => {
    capturedQueries.push(query)
    return null
  }

  try {
    const response = createResponse()
    await listFavorites({ user: { id: userId } }, response)
    assert.deepEqual(response.body, { data: [] })

    await assert.rejects(
      removeFavorite({ user: { id: userId }, params: { favoriteId: '507f1f77bcf86cd799439012' } }, createResponse()),
      (error) => error.status === 404,
    )
    assert.deepEqual(capturedQueries, [
      { user: userId },
      { user: userId, _id: '507f1f77bcf86cd799439012' },
    ])
  } finally {
    Favorite.find = originalFind
    Favorite.findOneAndDelete = originalFindOneAndDelete
  }
})

test('progress reads and updates use the authenticated user and idempotent upsert', async () => {
  const originalFindOne = Progress.findOne
  const originalFindOneAndUpdate = Progress.findOneAndUpdate
  let updateCall

  Progress.findOne = (query) => {
    assert.deepEqual(query, { user: userId })
    return { lean: async () => null }
  }
  Progress.findOneAndUpdate = async (...args) => {
    updateCall = args
    return { visitedScenarios: ['shopping'] }
  }

  try {
    const response = createResponse()
    await getProgress({ user: { id: userId } }, response)
    assert.deepEqual(response.body, { data: { visitedScenarios: [] } })

    await updateProgress({ user: { id: userId }, body: { scenario: 'shopping' } }, response)
    assert.deepEqual(response.body, { data: { visitedScenarios: ['shopping'] } })
    assert.deepEqual(updateCall, [
      { user: userId },
      { $addToSet: { visitedScenarios: 'shopping' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ])
  } finally {
    Progress.findOne = originalFindOne
    Progress.findOneAndUpdate = originalFindOneAndUpdate
  }
})

test('phrase search escapes regular-expression input and caps returned records', async () => {
  const originalFind = Phrase.find
  let filter
  let limit

  Phrase.find = (query) => {
    filter = query
    return {
      sort() { return this },
      limit(value) {
        limit = value
        return { lean: async () => [] }
      },
    }
  }

  try {
    const response = createResponse()
    await listPhrases({ query: { search: '.*' } }, response)
    assert.equal(filter.$or[0].kannada.source, '\\.\\*')
    assert.equal(limit, 100)
    assert.deepEqual(response.body, { data: [] })
  } finally {
    Phrase.find = originalFind
  }
})
