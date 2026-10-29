import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import { connectToDatabase } from './config/db.js'
import { getSessionSettings } from './config/session.js'
import { getAiProvider, validateAiProviderConfiguration } from './config/aiProvider.js'
import { migrateFavoriteIndexes } from './services/favoriteIndexMigration.js'
import  fixWindowsDns from './config/dns.js'

fixWindowsDns()

const port = process.env.PORT ? Number(process.env.PORT) : 5000
const validSameSite = ['strict', 'lax', 'none'].includes(process.env.COOKIE_SAME_SITE || 'lax')
const secret = process.env.JWT_SECRET

function validateConfiguration() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Add it to server/.env.')
  if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL is required. Add it to server/.env.')
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters. Generate a private secret and add it to server/.env.')
  getSessionSettings()
  if (!validSameSite) throw new Error('COOKIE_SAME_SITE must be strict, lax, or none.')
  validateAiProviderConfiguration(getAiProvider())
  if (process.env.COOKIE_SAME_SITE === 'none' && process.env.COOKIE_SECURE !== 'true' && process.env.NODE_ENV !== 'production') {
    throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true.')
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535.')
  }
}

async function startServer() {
  try {
    validateConfiguration()
  } catch (error) {
    console.error(`Server configuration error: ${error.message}`)
    process.exitCode = 1
    return
  }

  try {
    await connectToDatabase()
    await migrateFavoriteIndexes()
  } catch {
    console.error('Server startup stopped; database setup failed and the API did not start.')
    await mongoose.disconnect()
    process.exitCode = 1
    return
  }

  app.listen(port, () => console.log(`Erne AI API listening on port ${port}.`))
}

await startServer()
