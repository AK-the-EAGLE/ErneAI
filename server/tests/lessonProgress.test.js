import { test } from 'node:test'
import assert from 'node:assert/strict'
import LessonAttempt from '../src/models/LessonAttempt.js'
import Progress from '../src/models/Progress.js'
import { getLessonProgress, setCurrentLesson, submitLessonAttempt } from '../src/controllers/progressController.js'
import { allLessons, curriculaByLevel, allVocabularyIds } from '../../shared/curricula.js'
import { evaluateLessonAttempt } from '../src/services/lessonProgressService.js'

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

function correctAnswer(question) {
  if (question.type === 'matching') return question.answer.map((pair) => ({ ...pair }))
  if (question.type === 'order') return [...question.answer]
  return question.answer
}

function incorrectAnswer(question) {
  if (question.type === 'choice' || question.type === 'review') {
    return question.options.find(({ id }) => id !== question.answer).id
  }
  if (question.type === 'fill') return 'ತಪ್ಪು'
  if (question.type === 'order') return [...question.answer].reverse()
  if (question.type === 'matching') {
    const [first, second, ...rest] = question.answer
    return [
      { leftId: first.leftId, rightId: second.rightId },
      { leftId: second.leftId, rightId: first.rightId },
      ...rest.map((pair) => ({ ...pair })),
    ]
  }
  throw new Error(`Unknown exercise type: ${question.type}`)
}

function completeAnswers(lesson) {
  return lesson.exercises.map((question) => ({
    questionId: question.id,
    attempts: [correctAnswer(question)],
  }))
}

test('lesson curriculum has unique ordered lessons and valid exercise references', () => {
  assert.equal(curriculaByLevel.get('beginner').lessons.length, 8)
  assert.equal(curriculaByLevel.get('intermediate').lessons.length, 4)
  assert.equal(curriculaByLevel.get('advanced').lessons.length, 4)
  assert.deepEqual(curriculaByLevel.get('beginner').lessons.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(curriculaByLevel.get('intermediate').lessons.map(({ order }) => order), [1, 2, 3, 4])
  assert.deepEqual(curriculaByLevel.get('advanced').lessons.map(({ order }) => order), [1, 2, 3, 4])
  assert.equal(new Set(allLessons.map(({ id }) => id)).size, allLessons.length)
  assert.ok(allLessons.every(({ id }) => /^[a-z0-9-]+$/.test(id)))
  assert.equal(new Set(allVocabularyIds).size, allVocabularyIds.length)

  for (const lesson of allLessons) {
    assert.ok(lesson.objective && lesson.context && lesson.vocabulary.length > 0 && lesson.summary.length > 0)
    assert.equal(new Set(lesson.exercises.map(({ id }) => id)).size, lesson.exercises.length)
    assert.ok(lesson.exercises.length >= 5)
    for (const item of lesson.vocabulary) {
      assert.ok(item.kannada && item.transliteration && item.english && item.usage)
      assert.ok(item.example.kannada && item.example.transliteration && item.example.english)
    }
    for (const question of lesson.exercises) {
      if (question.type === 'matching') {
        const leftIds = new Set(question.leftItems.map(({ id }) => id))
        const rightIds = new Set(question.rightItems.map(({ id }) => id))
        assert.ok(question.answer.every(({ leftId, rightId }) => leftIds.has(leftId) && rightIds.has(rightId)))
      }
      if (question.type === 'choice' || question.type === 'review') {
        assert.ok(question.options.some(({ id }) => id === question.answer), `${lesson.id} ${question.id} has a missing choice answer`)
      }
    }
  }
  assert.ok(curriculaByLevel.get('beginner').lessons[0].readingGuide)
  assert.ok(curriculaByLevel.get('intermediate').lessons.some(({ vocabulary }) => vocabulary.some(({ kannada }) => kannada === 'ಆದ್ದರಿಂದ')))
  assert.ok(curriculaByLevel.get('advanced').lessons.some(({ reading }) => reading))
  assert.ok(curriculaByLevel.get('advanced').lessons.some(({ vocabulary }) => vocabulary.some(({ usage }) => /informal/i.test(usage))))
  assert.ok(allLessons.some((lesson) => lesson.exercises.some((question) => (
    question.type === 'matching'
    && question.leftItems.some(({ text }) => text === 'Yes')
    && question.rightItems.some(({ text }) => text === 'ಹೌದು')
  ))))
})

test('all supported exercise types are evaluated and correctly answered lessons pass', () => {
  for (const lesson of allLessons) {
    const result = evaluateLessonAttempt(lesson.id, completeAnswers(lesson))
    assert.equal(result.score, lesson.exercises.length, lesson.id)
    assert.equal(result.total, lesson.exercises.length, lesson.id)
    assert.equal(result.passed, true, lesson.id)
    assert.equal(result.answers.length, lesson.exercises.length, lesson.id)
    assert.ok(result.answers.every(({ finalCorrect }) => finalCorrect), lesson.id)
  }
})

test('scores first attempts and saves a failed result even after retries', () => {
  const lesson = curriculaByLevel.get('beginner').lessons[0]
  const answers = completeAnswers(lesson)
  answers[0].attempts = [incorrectAnswer(lesson.exercises[0]), correctAnswer(lesson.exercises[0])]
  answers[1].attempts = [incorrectAnswer(lesson.exercises[1]), correctAnswer(lesson.exercises[1])]
  const result = evaluateLessonAttempt(lesson.id, answers)

  assert.equal(result.score, lesson.exercises.length - 2)
  assert.equal(result.passed, false)
  assert.equal(result.answers[0].attempts.length, 2)
  assert.equal(result.answers[0].finalCorrect, true)
})

test('a learner can pass at the 70 percent first-try threshold after correcting one answer', () => {
  const lesson = curriculaByLevel.get('beginner').lessons[0]
  const answers = completeAnswers(lesson)
  answers[0].attempts = [incorrectAnswer(lesson.exercises[0]), correctAnswer(lesson.exercises[0])]
  const result = evaluateLessonAttempt(lesson.id, answers)

  assert.equal(result.score, 4)
  assert.equal(result.passed, true)
})

test('lesson evaluator rejects missing, duplicate, malformed and invalid answers', () => {
  const lesson = curriculaByLevel.get('beginner').lessons[0]
  const valid = completeAnswers(lesson)

  assert.throws(() => evaluateLessonAttempt(lesson.id, valid.slice(1)), { status: 400 })
  assert.throws(() => evaluateLessonAttempt(lesson.id, [...valid, valid[0]]), { status: 400 })

  const invalidChoice = completeAnswers(lesson)
  invalidChoice[0].attempts = ['not-an-option']
  assert.throws(() => evaluateLessonAttempt(lesson.id, invalidChoice), { status: 400 })

  const invalidMatching = completeAnswers(lesson)
  invalidMatching[1].attempts = [[null]]
  assert.throws(() => evaluateLessonAttempt(lesson.id, invalidMatching), { status: 400 })

  assert.throws(() => evaluateLessonAttempt('unknown-lesson', valid), { status: 404 })
})

test('lesson progress and attempts are always queried for the authenticated user', async () => {
  const originalProgressFindOne = Progress.findOne
  const originalAttemptDistinct = LessonAttempt.distinct
  const originalAttemptFind = LessonAttempt.find
  const queries = []
  Progress.findOne = (query) => {
    queries.push(query)
    return { lean: async () => ({
      currentLessonId: 'greetings',
      masteredVocabulary: ['namaskara', 'adv-request'],
    }) }
  }
  LessonAttempt.distinct = async (field, query) => {
    assert.equal(field, 'lessonId')
    queries.push(query)
    return ['greetings']
  }
  LessonAttempt.find = (query) => {
    queries.push(query)
    return {
      sort() { return this },
      limit(value) {
        assert.equal(value, 50)
        return { lean: async () => [] }
      },
    }
  }

  try {
    const response = createResponse()
    await getLessonProgress({ user: { id: userId, preferredLearningLevel: 'beginner' } }, response)
    assert.deepEqual(response.body.data, {
      level: 'beginner',
      completedLessons: ['greetings'],
      currentLessonId: 'greetings',
      masteredVocabulary: ['namaskara', 'dayavittu', 'dhanyavadagalu'],
      attempts: [],
    })
    assert.deepEqual(queries, [
      { user: userId },
      { user: userId, passed: true, $or: [{ curriculumLevel: 'beginner' }, { curriculumLevel: { $exists: false } }] },
      { user: userId },
    ])
  } finally {
    Progress.findOne = originalProgressFindOne
    LessonAttempt.distinct = originalAttemptDistinct
    LessonAttempt.find = originalAttemptFind
  }
})

test('switching learning levels scopes active progress while preserving level-tagged history', async () => {
  const originalProgressFindOne = Progress.findOne
  const originalAttemptDistinct = LessonAttempt.distinct
  const originalAttemptFind = LessonAttempt.find
  const queries = []
  Progress.findOne = (query) => {
    queries.push(query)
    return { lean: async () => ({
      currentLessonId: 'everyday-words',
      currentLessonLevel: 'beginner',
      masteredVocabulary: ['namaskara'],
    }) }
  }
  LessonAttempt.distinct = async (_field, query) => {
    queries.push(query)
    return ['intermediate-connectors']
  }
  LessonAttempt.find = (query) => {
    queries.push(query)
    return {
      sort() { return this },
      limit() {
        return {
          lean: async () => [
            { _id: { toString: () => 'advanced-attempt' }, lessonId: 'advanced-register', curriculumLevel: 'advanced', score: 2, total: 5, passed: false, attemptedAt: new Date('2025-01-02') },
            { _id: { toString: () => 'intermediate-attempt' }, lessonId: 'intermediate-connectors', curriculumLevel: 'intermediate', score: 5, total: 5, passed: true, attemptedAt: new Date('2025-01-01') },
          ],
        }
      },
    }
  }

  try {
    const response = createResponse()
    await getLessonProgress({ user: { id: userId, preferredLearningLevel: 'intermediate' } }, response)
    assert.deepEqual(response.body.data.completedLessons, ['intermediate-connectors'])
    assert.equal(response.body.data.currentLessonId, null)
    assert.deepEqual(
      response.body.data.masteredVocabulary,
      curriculaByLevel.get('intermediate').lessons[0].vocabulary.map(({ id }) => id),
    )
    assert.deepEqual(response.body.data.attempts.map(({ curriculumLevel }) => curriculumLevel), ['advanced', 'intermediate'])
    assert.deepEqual(queries, [
      { user: userId },
      { user: userId, passed: true, $or: [{ curriculumLevel: 'intermediate' }] },
      { user: userId },
    ])
  } finally {
    Progress.findOne = originalProgressFindOne
    LessonAttempt.distinct = originalAttemptDistinct
    LessonAttempt.find = originalAttemptFind
  }
})

test('current lesson updates reject locked lessons before writing progress', async () => {
  const originalAttemptDistinct = LessonAttempt.distinct
  const originalProgressFindOneAndUpdate = Progress.findOneAndUpdate
  let updateQuery
  LessonAttempt.distinct = async (_field, query) => {
    assert.deepEqual(query, { user: userId, passed: true, $or: [{ curriculumLevel: 'beginner' }, { curriculumLevel: { $exists: false } }] })
    return []
  }
  Progress.findOneAndUpdate = async (...args) => {
    updateQuery = args
    return { currentLessonId: 'greetings' }
  }

  try {
    await assert.rejects(
      setCurrentLesson({ user: { id: userId }, body: { lessonId: 'everyday-words' } }, createResponse()),
      { status: 409 },
    )
    assert.equal(updateQuery, undefined)

    const response = createResponse()
    await setCurrentLesson({ user: { id: userId }, body: { lessonId: 'greetings' } }, response)
    assert.deepEqual(response.body, { data: { currentLessonId: 'greetings' } })
    assert.deepEqual(updateQuery, [
      { user: userId },
      { $set: { currentLessonId: 'greetings', currentLessonLevel: 'beginner' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ])
  } finally {
    LessonAttempt.distinct = originalAttemptDistinct
    Progress.findOneAndUpdate = originalProgressFindOneAndUpdate
  }
})

test('lesson attempt submission rejects a lesson outside the authenticated profile level', async () => {
  const originalAttemptCreate = LessonAttempt.create
  let created = false
  LessonAttempt.create = async () => { created = true }
  try {
    await assert.rejects(
      submitLessonAttempt({
        user: { id: userId, preferredLearningLevel: 'intermediate' },
        params: { lessonId: 'greetings' },
        body: { answers: [] },
      }, createResponse()),
      { status: 409 },
    )
    assert.equal(created, false)
  } finally {
    LessonAttempt.create = originalAttemptCreate
  }
})

test('lesson attempt submission persists scored answers for the session owner and unlocks the next lesson', async () => {
  const originalAttemptDistinct = LessonAttempt.distinct
  const originalAttemptCreate = LessonAttempt.create
  const originalProgressFindOneAndUpdate = Progress.findOneAndUpdate
  let createDocument
  let progressUpdate
  const lesson = curriculaByLevel.get('beginner').lessons[0]

  LessonAttempt.distinct = async (_field, query) => {
    assert.deepEqual(query, { user: userId, passed: true, $or: [{ curriculumLevel: 'beginner' }, { curriculumLevel: { $exists: false } }] })
    return []
  }
  LessonAttempt.create = async (document) => {
    createDocument = document
    return { _id: 'attempt-id', ...document }
  }
  Progress.findOneAndUpdate = async (...args) => {
    progressUpdate = args
    return { currentLessonId: args[1].$set.currentLessonId, masteredVocabulary: ['namaskara', 'dayavittu', 'dhanyavadagalu'] }
  }

  try {
    const response = createResponse()
    await submitLessonAttempt({
      user: { id: userId },
      params: { lessonId: lesson.id },
      body: { answers: completeAnswers(lesson) },
    }, response)

    assert.equal(response.statusCode, 201)
    assert.equal(createDocument.user, userId)
    assert.equal(createDocument.curriculumLevel, 'beginner')
    assert.equal(createDocument.passed, true)
    assert.equal(createDocument.answers.length, lesson.exercises.length)
    assert.deepEqual(progressUpdate[1], {
      $set: { currentLessonId: 'everyday-words', currentLessonLevel: 'beginner' },
      $addToSet: { masteredVocabulary: { $each: lesson.vocabulary.map(({ id }) => id) } },
    })
    assert.equal(response.body.data.attempt.id, 'attempt-id')
    assert.equal(response.body.data.currentLessonId, 'everyday-words')
    assert.deepEqual(response.body.data.masteredVocabulary, ['namaskara', 'dayavittu', 'dhanyavadagalu'])
  } finally {
    LessonAttempt.distinct = originalAttemptDistinct
    LessonAttempt.create = originalAttemptCreate
    Progress.findOneAndUpdate = originalProgressFindOneAndUpdate
  }
})
