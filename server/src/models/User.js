import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  preferredLearningLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: true })

userSchema.set('toJSON', {
  transform(_document, returned) {
    returned.id = returned._id.toString()
    delete returned._id
    delete returned.__v
    delete returned.passwordHash
    delete returned.tokenVersion
  },
})

export default mongoose.model('User', userSchema)
