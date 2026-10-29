import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAiProvider, validateAiProviderConfiguration } from '../src/config/aiProvider.js'

test('AI provider configuration accepts mock, OpenAI, Hugging Face, and Groq', () => {
  for (const provider of ['mock', 'openai', 'huggingface', 'groq']) {
    assert.equal(getAiProvider(provider), provider)
  }
})

test('AI provider configuration defaults to mock when unset', () => {
  assert.equal(getAiProvider(''), 'mock')
  assert.equal(getAiProvider(undefined), 'mock')
})

test('AI provider configuration rejects unsupported values', () => {
  assert.throws(() => getAiProvider('unsupported'), {
    message: 'AI_PROVIDER must be mock, openai, huggingface, groq.',
  })
})

test('AI provider startup validation requires credentials only for configured live providers', () => {
  assert.equal(validateAiProviderConfiguration('mock', {}), 'mock')
  assert.equal(validateAiProviderConfiguration('openai', { AI_API_KEY: 'test-key' }), 'openai')
  assert.equal(validateAiProviderConfiguration('huggingface', { HF_TOKEN: 'test-token' }), 'huggingface')
  assert.equal(validateAiProviderConfiguration('groq', { GROQ_API_KEY: 'test-key' }), 'groq')

  for (const [provider, credential] of [
    ['openai', 'AI_API_KEY'],
    ['huggingface', 'HF_TOKEN'],
    ['groq', 'GROQ_API_KEY'],
  ]) {
    assert.throws(
      () => validateAiProviderConfiguration(provider, { [credential]: '  ' }),
      { message: `${credential} is required when AI_PROVIDER is set to ${provider}.` },
    )
  }
})
