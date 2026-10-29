import { createHash } from 'node:crypto'
import Phrase from '../models/Phrase.js'
import { scenarioIds, scenarioNames, scenarios } from '../config/scenarios.js'
import { HttpError } from '../middleware/errorHandler.js'
import { generateSituationPhrases } from '../services/aiService.js'

export function toPhrase(phrase) {
  const item = phrase.toJSON ? phrase.toJSON() : phrase
  return {
    id: item._id?.toString() ?? item.id,
    kannada: item.kannada,
    transliteration: item.transliteration,
    english: item.english,
    scenarioId: item.scenario,
    scenarioName: item.situation || scenarioNames.get(item.scenario),
    context: item.context ?? '',
    type: item.scenario === 'generated' ? 'Generated phrase' : item.context || 'Everyday phrase',
    level: item.difficulty === 'essential' ? 'Essential' : 'Useful',
  }
}

export async function listPhrases(request, response) {
  const { scenario, search = '' } = request.query
  if (scenario && !scenarioIds.includes(scenario)) throw new HttpError(400, 'Choose a supported scenario.')
  if (typeof search !== 'string' || search.length > 100) throw new HttpError(400, 'Search must be 100 characters or fewer.')

  const filter = { scenario: { $ne: 'generated' } }
  if (scenario) filter.scenario = scenario
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matcher = new RegExp(escaped, 'i')
    filter.$or = ['kannada', 'transliteration', 'english'].map((field) => ({ [field]: matcher }))
  }

  const phrases = await Phrase.find(filter).sort({ scenario: 1, createdAt: 1 }).limit(100).lean()
  response.json({ data: phrases.map(toPhrase) })
}

function normalizeSituation(value) {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function saveGeneratedPhrase(phrase, situation) {
  const phraseKey = phrase.kannada.normalize('NFKC').replace(/[\p{P}\p{Z}\s]/gu, '')
  const canonicalPhraseHash = createHash('sha256').update(phraseKey).digest('hex')
  const phraseLookup = {
    scenario: 'generated',
    situation,
    $or: [
      { canonicalPhraseHash },
      { kannada: phrase.kannada },
    ],
  }
  const existing = await Phrase.findOne(phraseLookup).lean()
  if (existing) return existing

  try {
    return await Phrase.create({
      ...phrase,
      scenario: 'generated',
      situation,
      canonicalPhraseHash,
      difficulty: 'useful',
    })
  } catch (error) {
    if (error?.code !== 11000) throw error
    const duplicate = await Phrase.findOne(phraseLookup).lean()
    if (!duplicate) throw error
    return duplicate
  }
}

export async function generatePhrases(request, response) {
  const body = request.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Choose one supported situation or enter a custom situation.')
  }
  if (Object.keys(body).some((key) => !['scenarioId', 'situation', 'query'].includes(key))) {
    throw new HttpError(400, 'Only scenarioId, situation, or query may be provided.')
  }

  const { scenarioId, situation: requestedSituation, query: requestedQuery } = body
  const hasScenario = scenarioId !== undefined
  const hasCustomSituation = requestedSituation !== undefined
  const hasQuery = requestedQuery !== undefined
  if (hasScenario === hasCustomSituation) {
    throw new HttpError(400, 'Choose one supported situation or enter a custom situation.')
  }
  if (hasQuery && (!hasScenario || hasCustomSituation)) {
    throw new HttpError(400, 'A phrase query must be used with a supported situation.')
  }

  let situation
  let description = ''
  let query
  if (hasScenario) {
    if (typeof scenarioId !== 'string' || !scenarioIds.includes(scenarioId)) {
      throw new HttpError(400, 'Choose a supported situation.')
    }
    const scenario = scenarios.find(({ id }) => id === scenarioId)
    situation = scenario.name
    description = scenario.description
    if (hasQuery) {
      query = normalizeSituation(requestedQuery)
      if (query.length < 1 || query.length > 100) {
        throw new HttpError(400, 'Enter a phrase request of 100 characters or fewer.')
      }
    }
  } else {
    situation = normalizeSituation(requestedSituation)
    if (situation.length < 3 || situation.length > 160) {
      throw new HttpError(400, 'Enter a situation between 3 and 160 characters.')
    }
  }

  const level = ['beginner', 'intermediate', 'advanced'].includes(request.user.preferredLearningLevel)
    ? request.user.preferredLearningLevel
    : 'beginner'
  const generatedPhrases = await generateSituationPhrases({ situation, description, query, level })
  const phrases = await Promise.all(generatedPhrases.map(async (phrase) => (
    toPhrase(await saveGeneratedPhrase(phrase, situation))
  )))

  response.json({
    data: {
      phrases,
      situation,
      scenarioId: hasScenario ? scenarioId : null,
      level,
    },
  })
}

export async function getPhrase(request, response) {
  const phrase = await Phrase.findById(request.params.id)
  if (!phrase) throw new HttpError(404, 'Phrase not found.')
  response.json({ data: toPhrase(phrase) })
}
