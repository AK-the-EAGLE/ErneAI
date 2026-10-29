import 'dotenv/config'
import mongoose from 'mongoose'
import fixWindowsDns from '../config/dns.js'
import { connectToDatabase } from '../config/db.js'
import { migrateFavoriteIndexes } from '../services/favoriteIndexMigration.js'

try {
  fixWindowsDns()
  await connectToDatabase()
  await migrateFavoriteIndexes()
  console.log('Favorite indexes are ready for distinct phrase and lesson saves.')
} catch (error) {
  console.error(`Favorite index migration failed (${error.name || 'Error'}). Check MONGO_URI and database availability.`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
