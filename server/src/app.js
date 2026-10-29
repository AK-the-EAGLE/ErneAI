import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { checkOrigin } from './middleware/checkOrigin.js'
import { errorHandler, HttpError } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import scenarioRoutes from './routes/scenarioRoutes.js'
import phraseRoutes from './routes/phraseRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import practiceRoutes from './routes/practiceRoutes.js'
import lessonRoutes from './routes/lessonRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === process.env.CLIENT_URL) {
      callback(null, origin || false)
      return
    }
    callback(new HttpError(403, 'This request origin is not allowed.'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '32kb' }))
app.use((request, _response, next) => {
  if (request.body === undefined) request.body = {}
  if (request.body === null || Array.isArray(request.body) || typeof request.body !== 'object') {
    next(new HttpError(400, 'The request body must be a JSON object.'))
    return
  }
  next()
})
app.use(cookieParser())
app.use(checkOrigin)

app.get('/api/health', (_request, response) => response.json({ data: { status: 'ok' } }))
app.use('/api/auth', authRoutes)
app.use('/api/scenarios', scenarioRoutes)
app.use('/api/phrases', phraseRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/practice', practiceRoutes)
app.use('/api/lessons', lessonRoutes)
app.use((_request, _response, next) => next(new HttpError(404, 'Route not found.')))
app.use(errorHandler)

export default app
