import mongoose from 'mongoose'

const supplementaryLessonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  topicKey: { type: String, required: true, maxlength: 100 },
  topic: { type: String, required: true, maxlength: 100 },
  lesson: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true })

supplementaryLessonSchema.index({ user: 1, level: 1, topicKey: 1 }, { unique: true })

export default mongoose.model('SupplementaryLesson', supplementaryLessonSchema)
