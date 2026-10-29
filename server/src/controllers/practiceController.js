import { scenarioIds } from '../config/scenarios.js'
import { HttpError } from '../middleware/errorHandler.js'
import { getPracticeReply } from '../services/aiService.js'

export async function respond(request, response) {
  const { scenario, history = [], message } = request.body
  if (!scenarioIds.includes(scenario)) throw new HttpError(400, 'Choose a supported practice situation.')
  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    throw new HttpError(400, 'Your message must be between 1 and 500 characters.')
  }
  if (!Array.isArray(history) || history.length > 20) throw new HttpError(400, 'Conversation history is too long.')
  for (const item of history) {
    if (
      !item || !['user', 'assistant'].includes(item.role)
      || typeof item.content !== 'string' || !item.content.trim() || item.content.length > 500
    ) throw new HttpError(400, 'Conversation history contains an invalid message.')
  }

  response.json({ data: await getPracticeReply({ scenario, history, message: message.trim() }) })
}
