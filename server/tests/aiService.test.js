import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateSupplementaryLessonContent, getPracticeReply } from '../src/services/aiService.js'

const environmentKeys = ['AI_PROVIDER', 'AI_API_KEY', 'HF_TOKEN', 'GROQ_API_KEY', 'AI_MODEL', 'AI_BASE_URL']

async function withProviderSettings(settings, run) {
  const previousEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]))
  const previousFetch = globalThis.fetch

  for (const key of environmentKeys) delete process.env[key]
  Object.assign(process.env, settings.environment)
  if (settings.fetch) globalThis.fetch = settings.fetch

  try {
    await run()
  } finally {
    for (const key of environmentKeys) {
      if (previousEnvironment[key] === undefined) delete process.env[key]
      else process.env[key] = previousEnvironment[key]
    }
    globalThis.fetch = previousFetch
  }
}

function providerResponse(reply, status = 200) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(reply) } }],
  }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const validReply = {
  kannada: 'ನಮಸ್ಕಾರ.',
  transliteration: 'Namaskāra.',
  english: 'Hello.',
  suggestions: ['ಧನ್ಯವಾದಗಳು'],
}

const validSupplementaryLesson = {
  title: 'Talking about the weather',
  objective: 'Describe a simple weather condition and ask about it.',
  introduction: 'Use these expressions in a short, polite conversation about the day.',
  vocabulary: [
    {
      kannada: 'ಹವಾಮಾನ',
      transliteration: 'Havāmāna',
      english: 'Weather',
      usage: 'Use this noun when asking about or describing the weather.',
      example: {
        kannada: 'ಇಂದಿನ ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ.',
        transliteration: 'Indina havāmāna chennāgide.',
        english: 'Today’s weather is nice.',
      },
    },
    {
      kannada: 'ಮಳೆ',
      transliteration: 'Maḷe',
      english: 'Rain',
      usage: 'Use this word to talk about rain.',
      example: {
        kannada: 'ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?',
        transliteration: 'Indu maḷe baruttadē?',
        english: 'Will it rain today?',
      },
    },
  ],
  context: 'Ask this when making plans for an outdoor activity.',
  summary: ['ಹವಾಮಾನ means weather.', 'ಮಳೆ means rain.'],
  exercises: [
    { prompt: 'What does ಹವಾಮಾನ mean?', options: ['Weather', 'Train', 'Shop'], answer: 'Weather', explanation: 'ಹವಾಮಾನ means weather.' },
    { prompt: 'Which word means rain?', options: ['ಮಳೆ', 'ಊರು', 'ದಾರಿ'], answer: 'ಮಳೆ', explanation: 'ಮಳೆ means rain.' },
    { prompt: 'Which phrase asks whether it will rain?', options: ['ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?', 'ನಮಸ್ಕಾರ', 'ಇದು ಎಷ್ಟು?'], answer: 'ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?', explanation: 'This asks if it will rain today.' },
  ],
}

test('mock mode returns the existing practice response contract without calling a provider', async () => {
  await withProviderSettings({
    environment: { AI_PROVIDER: 'mock' },
    fetch: async () => { throw new Error('Mock mode must not make a network request.') },
  }, async () => {
    const reply = await getPracticeReply({ scenario: 'shopping', history: [], message: 'ಇದು ಎಷ್ಟು?' })

    assert.equal(reply.mode, 'mock')
    assert.equal(typeof reply.kannada, 'string')
    assert.equal(typeof reply.transliteration, 'string')
    assert.equal(typeof reply.english, 'string')
    assert.ok(Array.isArray(reply.suggestions))
  })
})

test('Hugging Face sends a server-side token to the OpenAI-compatible endpoint and returns the expected shape', async () => {
  let request
  await withProviderSettings({
    environment: {
      AI_PROVIDER: 'huggingface',
      HF_TOKEN: 'hf_test_token_not_a_real_secret',
    },
    fetch: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) }
      return providerResponse({ ...validReply, suggestions: ['ಧನ್ಯವಾದಗಳು', 'ಇದು ಎಷ್ಟು?', 'ನನಗೆ ಇದು ಬೇಕು.', 'ಇನ್ನಷ್ಟು'] })
    },
  }, async () => {
    const reply = await getPracticeReply({
      scenario: 'healthcare',
      history: [{ role: 'assistant', content: 'ನಮಸ್ಕಾರ.' }],
      message: 'ನನಗೆ ವೈದ್ಯರ ಸಹಾಯ ಬೇಕು.',
    })

    assert.equal(request.url, 'https://router.huggingface.co/v1/chat/completions')
    assert.equal(request.options.headers.Authorization, 'Bearer hf_test_token_not_a_real_secret')
    assert.equal(request.body.model, 'Qwen/Qwen2.5-7B-Instruct')
    assert.equal(request.body.response_format.type, 'json_object')
    assert.match(request.body.messages[0].content, /natural, polite, beginner-friendly spoken Kannada/i)
    assert.match(request.body.messages[0].content, /healthcare/i)
    assert.deepEqual(reply, {
      ...validReply,
      suggestions: ['ಧನ್ಯವಾದಗಳು', 'ಇದು ಎಷ್ಟು?', 'ನನಗೆ ಇದು ಬೇಕು.'],
      mode: 'ai',
    })
  })
})

test('Hugging Face passes through a configured provider-pinned model identifier', async () => {
  let request
  await withProviderSettings({
    environment: {
      AI_PROVIDER: 'huggingface',
      HF_TOKEN: 'hf_test_token',
      AI_MODEL: 'Qwen/Qwen2.5-7B-Instruct:featherless-ai',
    },
    fetch: async (url, options) => {
      request = { url, body: JSON.parse(options.body) }
      return providerResponse(validReply)
    },
  }, async () => {
    await getPracticeReply({ scenario: 'shopping', history: [], message: 'ಇದು ಎಷ್ಟು?' })
    assert.equal(request.body.model, 'Qwen/Qwen2.5-7B-Instruct:featherless-ai')
  })
})

test('existing OpenAI-compatible provider keeps its default endpoint and model', async () => {
  let request
  await withProviderSettings({
    environment: { AI_PROVIDER: 'openai', AI_API_KEY: 'test-openai-key' },
    fetch: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) }
      return providerResponse(validReply)
    },
  }, async () => {
    const reply = await getPracticeReply({ scenario: 'transport', history: [], message: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?' })
    assert.equal(request.url, 'https://api.openai.com/v1/chat/completions')
    assert.equal(request.options.headers.Authorization, 'Bearer test-openai-key')
    assert.equal(request.body.model, 'gpt-4o-mini')
    assert.equal(reply.mode, 'ai')
  })
})

test('Groq uses strict JSON Schema with the configured model and validates the expected response', async () => {
  let request
  await withProviderSettings({
    environment: {
      AI_PROVIDER: 'groq',
      GROQ_API_KEY: 'gsk_test_key_not_a_real_secret',
      AI_MODEL: 'openai/gpt-oss-20b',
    },
    fetch: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) }
      return providerResponse(validReply)
    },
  }, async () => {
    const reply = await getPracticeReply({ scenario: 'shopping', history: [], message: 'ಇದು ಎಷ್ಟು?' })

    assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions')
    assert.equal(request.options.headers.Authorization, 'Bearer gsk_test_key_not_a_real_secret')
    assert.equal(request.body.model, 'openai/gpt-oss-20b')
    assert.deepEqual(request.body.response_format, {
      type: 'json_schema',
      json_schema: {
        name: 'practice_reply',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            kannada: { type: 'string', description: 'A non-empty Kannada phrase.' },
            transliteration: { type: 'string', description: 'A non-empty Latin transliteration.' },
            english: { type: 'string', description: 'A non-empty English meaning.' },
            suggestions: {
              type: 'array',
              description: 'Zero to three non-empty Kannada follow-up phrases.',
              items: { type: 'string' },
            },
          },
          required: ['kannada', 'transliteration', 'english', 'suggestions'],
          additionalProperties: false,
        },
      },
    })

    test('supplementary lessons use Groq JSON-object mode and validate structured content', async () => {
      let request
      await withProviderSettings({
        environment: {
          AI_PROVIDER: 'groq',
          GROQ_API_KEY: 'gsk_test_key',
          AI_MODEL: 'openai/gpt-oss-20b',
        },
        fetch: async (url, options) => {
          request = { url, options, body: JSON.parse(options.body) }
          return providerResponse(validSupplementaryLesson)
        },
      }, async () => {
        const lesson = await generateSupplementaryLessonContent({
          level: 'intermediate',
          topic: 'Talking about the weather',
          coveredLessons: ['Connect ideas naturally'],
        })

        assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions')
        assert.ok(request.options.headers.Authorization.startsWith('Bearer '))
        assert.equal(request.body.model, 'openai/gpt-oss-20b')
        assert.deepEqual(request.body.response_format, { type: 'json_object' })
        assert.equal(request.body.max_completion_tokens, 3000)
        assert.match(request.body.messages[0].content, /exactly one JSON object/i)
        assert.deepEqual(JSON.parse(request.body.messages[1].content), {
          level: 'intermediate',
          topic: 'Talking about the weather',
          previouslyCoveredLessons: ['Connect ideas naturally'],
        })
        assert.equal(lesson.isSupplementary, true)
        assert.equal(lesson.requiresReview, true)
        assert.equal(lesson.assessment.totalQuestions, 3)
        assert.equal(lesson.vocabulary.length, 2)
        assert.equal(lesson.exercises.length, 3)
      })
    })

    test('supplementary lesson generation rejects malformed and incomplete AI output', async () => {
      const invalidOutputs = [
        'not JSON',
        { ...validSupplementaryLesson, extra: true },
        { ...validSupplementaryLesson, vocabulary: [{ ...validSupplementaryLesson.vocabulary[0], kannada: '' }] },
        { ...validSupplementaryLesson, exercises: [{ ...validSupplementaryLesson.exercises[0], answer: 'not an option' }, ...validSupplementaryLesson.exercises.slice(1)] },
        { ...validSupplementaryLesson, exercises: [{ ...validSupplementaryLesson.exercises[0], options: ['ಒಂದು', 'ಒಂದು', 'ಮೂರು'] }, ...validSupplementaryLesson.exercises.slice(1)] },
      ]

      for (const output of invalidOutputs) {
        await withProviderSettings({
          environment: { AI_PROVIDER: 'groq', GROQ_API_KEY: 'gsk_test_key' },
          fetch: async () => new Response(JSON.stringify({
            choices: [{ message: { content: typeof output === 'string' ? output : JSON.stringify(output) } }],
          })),
        }, async () => {
          await assert.rejects(
            generateSupplementaryLessonContent({ level: 'beginner', topic: 'weather', coveredLessons: [] }),
            (error) => error.status === 502 && /invalid lesson/i.test(error.message),
          )
        })
      }
    })

    test('supplementary lesson generation reports provider failures without leaking topic or credentials', async () => {
      const logs = []
      const originalConsoleError = console.error
      console.error = (...args) => logs.push(args)
      try {
        await withProviderSettings({
          environment: { AI_PROVIDER: 'groq', GROQ_API_KEY: 'gsk_test_secret' },
          fetch: async () => new Response(JSON.stringify({
            error: {
              code: 'json_validate_failed',
              failed_generation: 'private topic and gsk_test_secret',
            },
          }), { status: 400 }),
        }, async () => {
          await assert.rejects(
            generateSupplementaryLessonContent({ level: 'beginner', topic: 'private topic', coveredLessons: [] }),
            (error) => error.status === 502 && /baseline lessons are still available/i.test(error.message),
          )
        })
      } finally {
        console.error = originalConsoleError
      }
      assert.doesNotMatch(JSON.stringify(logs), /private topic|gsk_test_secret/)
    })
    assert.match(request.body.messages[0].content, /natural, polite, beginner-friendly spoken Kannada/i)
    assert.match(request.body.messages[0].content, /exactly these four fields and no others/i)
    assert.match(request.body.messages[0].content, /exactly one valid JSON object/i)
    assert.match(request.body.messages[0].content, /kannada, transliteration, and english must each be non-empty strings/i)
    assert.match(request.body.messages[0].content, /zero to three non-empty Kannada-script strings/i)
    assert.match(request.body.messages[0].content, /Do not wrap the JSON in markdown/i)
    assert.equal(request.body.max_completion_tokens, 1024)
    assert.equal(Object.hasOwn(request.body, 'max_tokens'), false)
    assert.equal(reply.mode, 'ai')
    assert.equal(reply.kannada, validReply.kannada)
  })
  })

  test('Groq accepts zero suggestions without changing the response shape', async () => {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'gsk_test_key',
        AI_MODEL: 'openai/gpt-oss-20b',
      },
      fetch: async () => providerResponse({ ...validReply, suggestions: [] }),
    }, async () => {
      const reply = await getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' })
      assert.deepEqual(reply, { ...validReply, suggestions: [], mode: 'ai' })
    })
})

test('Groq reports a missing server-side key without making a request', async () => {
  let called = false
  await withProviderSettings({
    environment: { AI_PROVIDER: 'groq' },
    fetch: async () => { called = true },
  }, async () => {
    await assert.rejects(
      getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
      (error) => error.status === 503 && /GROQ_API_KEY/.test(error.message),
    )
    assert.equal(called, false)
  })
})

test('Groq maps invalid-key, unsupported-model, rate-limit, and upstream errors to safe messages', async () => {
  const cases = [
    [401, { error: { code: 'invalid_api_key', message: 'invalid key details' } }, /Groq rejected its API key/i],
    [400, { error: { code: 'model_not_found', message: 'model is not available' } }, /Groq rejected AI_MODEL/i],
    [429, { error: { code: 'rate_limit_exceeded', message: 'limit details' } }, /temporarily rate-limited/i],
    [503, { error: { code: 'service_unavailable', message: 'outage details' } }, /could not complete the practice reply/i],
  ]

  for (const [status, errorBody, expectedMessage] of cases) {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'gsk_test_key_not_a_real_secret',
        AI_MODEL: 'openai/gpt-oss-20b',
      },
      fetch: async () => new Response(JSON.stringify(errorBody), { status }),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
        (error) => error.status >= 500 && expectedMessage.test(error.message)
          && !/invalid key details|limit details|outage details/.test(error.message),
      )
    })
  }
})

test('Groq JSON validation failures record only failed-generation presence', async () => {
  const messages = []
  const originalConsoleError = console.error
  let requestCount = 0
  console.error = (...args) => messages.push(args)

  try {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'gsk_test_key',
        AI_MODEL: 'openai/gpt-oss-20b',
      },
      fetch: async () => {
        requestCount += 1
        return new Response(JSON.stringify({
          error: {
            code: 'json_validate_failed',
            message: 'Failed to validate JSON. Please adjust your prompt.',
            failed_generation: 'private conversation text and gsk_test_key',
          },
        }), { status: 400 })
      },
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'private conversation text' }),
        (error) => error.status === 502 && /could not complete the practice reply/i.test(error.message),
      )
    })
  } finally {
    console.error = originalConsoleError
  }

  assert.deepEqual(messages[0][1], {
    provider: 'groq',
    stage: 'http_response',
    status: 400,
    code: 'json_validate_failed',
    model: 'openai/gpt-oss-20b',
    failedGenerationPresent: true,
  })
  assert.equal(requestCount, 1)
  assert.doesNotMatch(JSON.stringify(messages), /private conversation text|gsk_test_key/)
})

test('Groq malformed JSON is rejected without fabricating a practice response', async () => {
  for (const result of [
    { choices: [{ message: { content: 'not valid json' } }] },
    { choices: [{ message: { content: '' } }] },
    { choices: [{ message: {} }] },
  ]) {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'gsk_test_key',
        AI_MODEL: 'openai/gpt-oss-20b',
      },
      fetch: async () => new Response(JSON.stringify(result), { status: 200 }),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
        (error) => error.status === 502 && /invalid practice reply/i.test(error.message),
      )
    })
  }
})

test('Groq rejects missing fields, invalid types, non-Kannada suggestions, and excess suggestions', async () => {
  const invalidReplies = [
    { kannada: 'ನಮಸ್ಕಾರ', suggestions: [] },
    { ...validReply, kannada: '   ' },
    { ...validReply, english: 42 },
    { ...validReply, suggestions: null },
    { ...validReply, suggestions: [42] },
    { ...validReply, suggestions: ['Thanks'] },
    { ...validReply, suggestions: ['ಧನ್ಯವಾದಗಳು Thanks'] },
    { ...validReply, suggestions: ['ಧನ್ಯವಾದಗಳು', 'ನಮಸ್ಕಾರ', 'ಹೌದು', 'ಇಲ್ಲ'] },
    { ...validReply, extra: 'unexpected' },
  ]

  for (const invalidReply of invalidReplies) {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'gsk_test_key',
        AI_MODEL: 'openai/gpt-oss-20b',
      },
      fetch: async () => providerResponse(invalidReply),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
        (error) => error.status === 502 && /invalid practice reply/i.test(error.message),
      )
    })
  }
})

test('Groq provider diagnostics redact API keys even if echoed in an error message', async () => {
  const messages = []
  const originalConsoleError = console.error
  console.error = (...args) => messages.push(args)

  try {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'gsk_test_key_that_must_never_be_logged',
        AI_MODEL: 'openai/gpt-oss-20b',
      },
      fetch: async () => new Response(JSON.stringify({
        error: {
          code: 'invalid_api_key',
          message: 'Rejected key gsk_test_key_that_must_never_be_logged.',
        },
      }), { status: 401 }),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
        (error) => error.status === 502 && /Groq rejected its API key/i.test(error.message),
      )
    })
  } finally {
    console.error = originalConsoleError
  }

  assert.doesNotMatch(JSON.stringify(messages), /gsk_test_key_that_must_never_be_logged/)
  assert.deepEqual(messages[0][1], {
    provider: 'groq',
    stage: 'http_response',
    status: 401,
    code: 'invalid_api_key',
    model: 'openai/gpt-oss-20b',
  })
})

test('Hugging Face mode reports missing credentials without making a request', async () => {
  let called = false
  await withProviderSettings({
    environment: { AI_PROVIDER: 'huggingface' },
    fetch: async () => { called = true },
  }, async () => {
    await assert.rejects(
      getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
      (error) => error.status === 503 && /HF_TOKEN/.test(error.message),
    )
    assert.equal(called, false)
  })
})

test('malformed provider content is rejected with a safe message', async () => {
  await withProviderSettings({
    environment: { AI_PROVIDER: 'huggingface', HF_TOKEN: 'hf_test_token' },
    fetch: async () => new Response(JSON.stringify({
      choices: [{ message: { content: 'not valid json' } }],
    }), { status: 200 }),
  }, async () => {
    await assert.rejects(
      getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
      (error) => error.status === 502 && /invalid practice reply/i.test(error.message),
    )
  })
})

test('incomplete model output is rejected rather than returned as a partial practice response', async () => {
  await withProviderSettings({
    environment: { AI_PROVIDER: 'huggingface', HF_TOKEN: 'hf_test_token' },
    fetch: async () => providerResponse({ kannada: 'ನಮಸ್ಕಾರ', suggestions: [] }),
  }, async () => {
    await assert.rejects(
      getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
      (error) => error.status === 502 && /invalid practice reply/i.test(error.message),
    )
  })
})

test('provider rate limits and authorization failures do not expose provider response bodies', async () => {
  for (const [status, expectedStatus, expectedMessage] of [
    [429, 503, /temporarily rate-limited/i],
    [401, 502, /rejected its credentials or access permissions/i],
  ]) {
    await withProviderSettings({
      environment: { AI_PROVIDER: 'huggingface', HF_TOKEN: 'hf_test_token' },
      fetch: async () => new Response('private provider details and credentials', { status }),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
        (error) => error.status === expectedStatus
          && expectedMessage.test(error.message)
          && !/private provider details/.test(error.message),
      )
    })
  }
})

test('model_not_supported gives routing guidance and logs sanitized provider diagnostics', async () => {
  const messages = []
  const originalConsoleError = console.error
  console.error = (...args) => messages.push(args)

  try {
    await withProviderSettings({
      environment: {
        AI_PROVIDER: 'huggingface',
        HF_TOKEN: 'hf_test_token_must_not_be_logged',
        AI_MODEL: 'Qwen/Qwen2.5-7B-Instruct',
      },
      fetch: async () => new Response(JSON.stringify({
        error: {
          code: 'model_not_supported',
          message: 'Model is not supported by this route. Token hf_test_token_must_not_be_logged; user text: PRIVATE_CONVERSATION.',
        },
      }), { status: 400 }),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'PRIVATE_CONVERSATION' }),
        (error) => error.status === 502 && /could not route this model/i.test(error.message)
          && /featherless-ai/.test(error.message),
      )
    })
  } finally {
    console.error = originalConsoleError
  }

  assert.equal(messages.length, 1)
  assert.equal(messages[0][0], 'AI provider request failed.')
  assert.deepEqual(messages[0][1], {
    provider: 'huggingface',
    stage: 'http_response',
    status: 400,
    code: 'model_not_supported',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    message: 'Model is not supported by this route. Token [REDACTED]; user text: [REDACTED].',
  })
  assert.doesNotMatch(JSON.stringify(messages), /hf_test_token|PRIVATE_CONVERSATION/)
})

test('other provider HTTP failures log sanitized provider message and return a safe frontend error', async () => {
  const messages = []
  const originalConsoleError = console.error
  console.error = (...args) => messages.push(args)

  try {
    await withProviderSettings({
      environment: { AI_PROVIDER: 'huggingface', HF_TOKEN: 'hf_test_token' },
      fetch: async () => new Response(JSON.stringify({
        error: {
          code: 'provider_unavailable',
          message: 'Provider temporarily unavailable.',
        },
      }), { status: 502 }),
    }, async () => {
      await assert.rejects(
        getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
        (error) => error.status === 502 && /could not complete the practice reply/i.test(error.message),
      )
    })
  } finally {
    console.error = originalConsoleError
  }

  assert.equal(messages[0][1].message, 'Provider temporarily unavailable.')
})

test('provider timeouts return a safe timeout response', async () => {
  await withProviderSettings({
    environment: { AI_PROVIDER: 'huggingface', HF_TOKEN: 'hf_test_token' },
    fetch: async () => { throw new DOMException('private timeout details', 'TimeoutError') },
  }, async () => {
    await assert.rejects(
      getPracticeReply({ scenario: 'shopping', history: [], message: 'ನಮಸ್ಕಾರ' }),
      (error) => error.status === 504 && /too long to respond/i.test(error.message),
    )
  })
})
