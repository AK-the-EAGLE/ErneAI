import mongoose from 'mongoose'
import { scenarioIds } from '../config/scenarios.js'

const phraseSchema = new mongoose.Schema({
  kannada: { type: String, required: true, trim: true, maxlength: 300 },
  transliteration: { type: String, required: true, trim: true, maxlength: 300 },
  english: { type: String, required: true, trim: true, maxlength: 300 },
  scenario: { type: String, required: true, enum: [...scenarioIds, 'generated'], index: true },
  situation: { type: String, trim: true, maxlength: 160, default: '' },
  canonicalPhraseHash: { type: String, maxlength: 64 },
  context: { type: String, trim: true, maxlength: 120, default: '' },
  difficulty: { type: String, enum: ['essential', 'useful'], default: 'useful' },
}, { timestamps: true })

phraseSchema.index(
  { scenario: 1, kannada: 1, situation: 1 },
  { name: 'unique_scenario_kannada_situation', unique: true },
)
phraseSchema.index(
  { situation: 1, canonicalPhraseHash: 1 },
  {
    name: 'unique_situation_canonical_generated_phrase',
    unique: true,
    partialFilterExpression: { canonicalPhraseHash: { $type: 'string' } },
  },
)

export default mongoose.model('Phrase', phraseSchema)
