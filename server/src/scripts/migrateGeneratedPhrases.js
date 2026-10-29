import 'dotenv/config'
import mongoose from 'mongoose'
import { connectToDatabase } from '../config/db.js'
import fixWindowsDns from '../config/dns.js'
import Phrase from '../models/Phrase.js'

fixWindowsDns()

try {
  await connectToDatabase()

  const indexes = await Phrase.collection.indexes()
  for (const index of indexes) {
    const obsoleteScenarioIndex = index.key.scenario === 1
      && index.key.kannada === 1
      && Object.keys(index.key).length === 2
    const obsoleteHashIndex = index.key.canonicalPhraseHash === 1
      && Object.keys(index.key).length === 1

    if (obsoleteScenarioIndex || obsoleteHashIndex) {
      await Phrase.collection.dropIndex(index.name)
    }
  }

  await Phrase.updateMany({ situation: { $exists: false } }, { $set: { situation: '' } })
  await Phrase.createIndexes()
  console.log('Phrase indexes are ready for situation-specific generated phrases.')
} catch (error) {
  console.error(`Generated phrase migration failed (${error.name || 'Error'}). Check MONGO_URI and database availability.`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
