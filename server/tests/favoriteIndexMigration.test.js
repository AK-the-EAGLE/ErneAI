import { test } from 'node:test'
import assert from 'node:assert/strict'
import Favorite from '../src/models/Favorite.js'
import { migrateFavoriteIndexes } from '../src/services/favoriteIndexMigration.js'

test('favorite index migration removes legacy uniqueness constraints and preserves current indexes', async () => {
  const originalUpdateMany = Favorite.updateMany
  const originalIndexes = Favorite.collection.indexes
  const originalDropIndex = Favorite.collection.dropIndex
  const originalCreateIndexes = Favorite.createIndexes
  const legacyIndexes = [
    { name: '_id_', key: { _id: 1 } },
    { name: 'user_1_phrase_1', key: { user: 1, phrase: 1 }, unique: true },
    {
      name: 'user_1_lessonId_1',
      key: { user: 1, lessonId: 1 },
      unique: true,
      partialFilterExpression: { lessonId: { $type: 'string' } },
    },
    ...Favorite.schema.indexes().map(([key, options]) => ({
      name: options.name,
      key,
      unique: options.unique,
      partialFilterExpression: options.partialFilterExpression,
    })),
  ]
  const droppedIndexes = []
  let updateCall
  let indexesCreated = false

  Favorite.updateMany = async (...args) => { updateCall = args }
  Favorite.collection.indexes = async () => legacyIndexes
  Favorite.collection.dropIndex = async (name) => { droppedIndexes.push(name) }
  Favorite.createIndexes = async () => { indexesCreated = true }

  try {
    await migrateFavoriteIndexes()

    assert.deepEqual(updateCall, [
      { phrase: { $type: 'objectId' }, kind: { $exists: false } },
      { $set: { kind: 'phrase' } },
    ])
    assert.deepEqual(droppedIndexes, ['user_1_phrase_1', 'user_1_lessonId_1'])
    assert.equal(indexesCreated, true)
  } finally {
    Favorite.updateMany = originalUpdateMany
    Favorite.collection.indexes = originalIndexes
    Favorite.collection.dropIndex = originalDropIndex
    Favorite.createIndexes = originalCreateIndexes
  }
})
