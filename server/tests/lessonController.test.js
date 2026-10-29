import { test } from 'node:test'
import assert from 'node:assert/strict'
import SupplementaryLesson from '../src/models/SupplementaryLesson.js'
import { generateSupplementaryLesson, getSupplementaryLesson } from '../src/controllers/lessonController.js'

const userId = '507f1f77bcf86cd799439011'

function createResponse() {
  return {
    statusCode: 200,
    body: null,
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

test('supplementary lesson input is validated before looking up user data', async () => {
  const originalFindOne = SupplementaryLesson.findOne
  let queried = false
  SupplementaryLesson.findOne = () => { queried = true }
  try {
    await assert.rejects(
      generateSupplementaryLesson({ user: { id: userId }, body: { topic: ' ' } }, createResponse()),
      { status: 400 },
    )
    assert.equal(queried, false)
  } finally {
    SupplementaryLesson.findOne = originalFindOne
  }
})

test('supplementary lesson cache is scoped to the authenticated user and saved learning level', async () => {
  const originalFindOne = SupplementaryLesson.findOne
  let query
  const cachedLesson = {
    _id: userId,
    level: 'advanced',
    topic: 'Weather',
    lesson: { title: 'Talking about weather', isSupplementary: true },
  }
  SupplementaryLesson.findOne = (filter) => {
    query = filter
    return { lean: async () => cachedLesson }
  }
  try {
    const response = createResponse()
    await generateSupplementaryLesson({
      user: { id: userId, preferredLearningLevel: 'advanced' },
      body: { topic: '  Weather  ' },
    }, response)
    assert.deepEqual(query, {
      user: userId,
      level: 'advanced',
      topicKey: 'weather',
    })
    assert.deepEqual(response.body, {
      data: {
        id: userId,
        lesson: cachedLesson.lesson,
        level: 'advanced',
        topic: cachedLesson.topic,
        cached: true,
      },
    })
  } finally {
    SupplementaryLesson.findOne = originalFindOne
  }
})

test('supplementary lesson lookup is scoped to the authenticated user', async () => {
  const originalFindOne = SupplementaryLesson.findOne
  let query
  const savedLesson = {
    _id: userId,
    level: 'beginner',
    topic: 'Weather',
    lesson: { title: 'Talking about weather' },
  }
  SupplementaryLesson.findOne = (filter) => {
    query = filter
    return { lean: async () => savedLesson }
  }
  try {
    const response = createResponse()
    await getSupplementaryLesson({
      user: { id: userId },
      params: { lessonId: userId },
    }, response)
    assert.deepEqual(query, { _id: userId, user: userId })
    assert.deepEqual(response.body.data, {
      id: userId,
      lesson: savedLesson.lesson,
      level: 'beginner',
      topic: 'Weather',
    })
  } finally {
    SupplementaryLesson.findOne = originalFindOne
  }
})
