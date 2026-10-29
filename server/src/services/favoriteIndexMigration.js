import Favorite from '../models/Favorite.js'

function isExpectedUniqueIndex(index, expectedIndexes) {
  return expectedIndexes.some(([keys, options]) => (
    JSON.stringify(index.key) === JSON.stringify(keys)
    && JSON.stringify(index.partialFilterExpression) === JSON.stringify(options.partialFilterExpression)
  ))
}

export async function migrateFavoriteIndexes() {
  await Favorite.updateMany(
    { phrase: { $type: 'objectId' }, kind: { $exists: false } },
    { $set: { kind: 'phrase' } },
  )

  const expectedIndexes = Favorite.schema.indexes().filter(([, options]) => options.unique)
  const indexes = await Favorite.collection.indexes()
  const obsoleteIndexes = indexes.filter((index) => (
    index.unique
    && index.name !== '_id_'
    && !isExpectedUniqueIndex(index, expectedIndexes)
  ))

  for (const index of obsoleteIndexes) {
    await Favorite.collection.dropIndex(index.name)
  }

  await Favorite.createIndexes()
}
