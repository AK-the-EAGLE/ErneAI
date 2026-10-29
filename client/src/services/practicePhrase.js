import { scenarios } from '../data/scenarios.js'

function getContextTerms(conversation) {
  const context = conversation
    .slice(-6)
    .map((item) => item?.kannada || item?.content || '')
    .join(' ')
    .toLowerCase()

  return new Set(context.match(/[a-z]{3,}/g) || [])
}

function scorePhrase(phrase, terms) {
  const phraseTerms = `${phrase.english} ${phrase.type} ${phrase.transliteration}`
    .toLowerCase()
    .match(/[a-z]{3,}/g) || []

  return phraseTerms.reduce((score, term) => score + (terms.has(term) ? 1 : 0), 0)
}

export function getLocalPracticePhrase(scenarioId, conversation = []) {
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]
  const terms = getContextTerms(conversation)
  const phrase = scenario.phrases.reduce((best, candidate) =>
    scorePhrase(candidate, terms) > scorePhrase(best, terms) ? candidate : best)

  return {
    kannada: phrase.kannada,
    transliteration: phrase.transliteration,
    english: phrase.english,
    source: 'example',
    usageTip: phrase.type ? `Useful for ${phrase.type.toLowerCase()}.` : '',
  }
}

export function getPracticePhrase(scenarioId, conversation = [], aiReply) {
  if (
    aiReply?.mode === 'ai'
    && typeof aiReply.kannada === 'string' && aiReply.kannada.trim()
    && typeof aiReply.transliteration === 'string' && aiReply.transliteration.trim()
    && typeof aiReply.english === 'string' && aiReply.english.trim()
  ) {
    return {
      kannada: aiReply.kannada.trim(),
      transliteration: aiReply.transliteration.trim(),
      english: aiReply.english.trim(),
      source: 'ai',
      usageTip: '',
    }
  }

  return getLocalPracticePhrase(scenarioId, conversation)
}
