import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getLocalPracticePhrase, getPracticePhrase } from '../src/services/practicePhrase.js'

test('local fallback phrases come from the selected situation', () => {
  const shopping = getLocalPracticePhrase('shopping')
  const transport = getLocalPracticePhrase('transport')

  assert.equal(shopping.source, 'example')
  assert.equal(shopping.kannada, 'ಇದು ಎಷ್ಟು?')
  assert.equal(shopping.transliteration, 'Idu eṣṭu?')
  assert.equal(shopping.english, 'How much is this?')
  assert.match(shopping.usageTip, /asking a price/i)
  assert.notEqual(transport.kannada, shopping.kannada)
  assert.match(transport.english, /bus station/i)
})

test('local fallback selects a phrase using recent conversation context', () => {
  const phrase = getLocalPracticePhrase('transport', [
    { role: 'user', kannada: 'The bus station is nearby. Where is the bus station?' },
  ])

  assert.equal(phrase.english, 'Where is the bus station?')
})

test('an AI practice response is reused without making a second suggestion request', () => {
  const response = {
    mode: 'ai',
    kannada: 'ಇದು ಎಷ್ಟು?',
    transliteration: 'Idu eṣṭu?',
    english: 'How much is this?',
    suggestions: ['ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.'],
  }
  const phrase = getPracticePhrase('shopping', [], response)

  assert.deepEqual(phrase, {
    kannada: response.kannada,
    transliteration: response.transliteration,
    english: response.english,
    source: 'ai',
    usageTip: '',
  })
})

test('mock, malformed, and missing AI replies safely fall back to curated local phrases', () => {
  const responses = [
    { mode: 'mock', kannada: 'mock example' },
    { mode: 'ai', kannada: 'incomplete response' },
    null,
  ]

  for (const response of responses) {
    const phrase = getPracticePhrase('healthcare', [], response)
    assert.equal(phrase.source, 'example')
    assert.equal(phrase.kannada, 'ನನಗೆ ವೈದ್ಯರ ಸಹಾಯ ಬೇಕು.')
    assert.equal(phrase.english, 'I need a doctor’s help.')
    assert.ok(phrase.usageTip)
  }
})
