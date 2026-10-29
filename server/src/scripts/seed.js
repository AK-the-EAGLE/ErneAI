import 'dotenv/config'
import mongoose from 'mongoose'
import { connectToDatabase } from '../config/db.js'
import Phrase from '../models/Phrase.js'
import { seedPhrases } from '../data/seedPhrases.js'

try {
  await connectToDatabase()
  for (const phrase of seedPhrases) {
    await Phrase.updateOne(
      { scenario: phrase.scenario, kannada: phrase.kannada },
      { $set: phrase },
      { upsert: true, runValidators: true },
    )
  }
  console.log(`Seeded ${seedPhrases.length} Kannada phrases.`)
} catch (error) {
  console.error(`Phrase seeding failed (${error.name || 'Error'}). Check MONGO_URI and database availability.`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
