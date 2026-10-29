import mongoose from 'mongoose'
import { scenarioIds } from '../config/scenarios.js'

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  visitedScenarios: [{ type: String, enum: scenarioIds }],
  currentLessonId: { type: String, maxlength: 100, default: null },
  currentLessonLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: null },
  masteredVocabulary: [{ type: String, maxlength: 120 }],
}, { timestamps: true })

export default mongoose.model('Progress', progressSchema)
