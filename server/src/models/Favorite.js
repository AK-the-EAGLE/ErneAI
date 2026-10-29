import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['phrase', 'lesson'], default: 'phrase', required: true },
  phrase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phrase',
    required() { return this.kind === 'phrase' },
  },
  lessonId: {
    type: String,
    required() { return this.kind === 'lesson' },
  },
  curriculumLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required() { return this.kind === 'lesson' },
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  autoIndex: false,
})

favoriteSchema.index(
  { user: 1, kind: 1, phrase: 1 },
  {
    name: 'unique_user_phrase_favorite',
    unique: true,
    partialFilterExpression: { phrase: { $type: 'objectId' } },
  },
)
favoriteSchema.index(
  { user: 1, kind: 1, lessonId: 1 },
  {
    name: 'unique_user_lesson_favorite',
    unique: true,
    partialFilterExpression: { lessonId: { $type: 'string' } },
  },
)

export default mongoose.model('Favorite', favoriteSchema)
