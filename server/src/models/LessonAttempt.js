import mongoose from 'mongoose'

const answerAttemptSchema = new mongoose.Schema({
  answer: mongoose.Schema.Types.Mixed,
  correct: { type: Boolean, required: true },
}, { _id: false })

const questionResultSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  attempts: { type: [answerAttemptSchema], required: true },
  finalCorrect: { type: Boolean, required: true },
}, { _id: false })

const lessonAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId: { type: String, required: true, maxlength: 100 },
  curriculumLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', required: true },
  score: { type: Number, min: 0, required: true },
  total: { type: Number, min: 1, required: true },
  passed: { type: Boolean, required: true },
  answers: { type: [questionResultSchema], required: true },
  attemptedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true })

lessonAttemptSchema.index({ user: 1, attemptedAt: -1 })

export default mongoose.model('LessonAttempt', lessonAttemptSchema)
