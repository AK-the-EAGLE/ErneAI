const supportedProviders = ['mock', 'openai', 'huggingface', 'groq']
const providerCredentials = {
  openai: 'AI_API_KEY',
  huggingface: 'HF_TOKEN',
  groq: 'GROQ_API_KEY',
}

export function getAiProvider(configuredProvider = process.env.AI_PROVIDER) {
  const provider = configuredProvider || 'mock'
  if (!supportedProviders.includes(provider)) {
    throw new Error(`AI_PROVIDER must be ${supportedProviders.join(', ')}.`)
  }
  return provider
}

export function validateAiProviderConfiguration(provider = getAiProvider(), environment = process.env) {
  const credential = providerCredentials[provider]
  if (credential && (typeof environment[credential] !== 'string' || !environment[credential].trim())) {
    throw new Error(`${credential} is required when AI_PROVIDER is set to ${provider}.`)
  }
  return provider
}
