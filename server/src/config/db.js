import mongoose from 'mongoose'

function getConnectionFailureMessage(error) {
  if (error?.name === 'MongoParseError') {
    return 'MongoDB connection failed: MONGO_URI format is invalid.'
  }

  if (error?.codeName === 'AuthenticationFailed' || [18, 8000].includes(error?.code)) {
    return 'MongoDB connection failed: authentication was rejected. Check the database credentials and account permissions.'
  }

  if (error?.code === 'ECONNREFUSED') {
    return 'MongoDB connection failed: the configured host refused the connection. Check that MongoDB is running and the host and port are correct.'
  }

  if (error?.name === 'MongooseServerSelectionError' || error?.name === 'MongoNetworkError') {
    return 'MongoDB connection failed: the server could not be reached. Check the hostname, network access, DNS, firewall, and database availability.'
  }

  return `MongoDB connection failed (${error?.name || 'Error'}). Check MONGO_URI and database availability.`
}

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is required. Add it to server/.env.')

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
    console.log('Connected to MongoDB.')
  } catch (error) {
    console.error(getConnectionFailureMessage(error))
    throw error
  }
}
