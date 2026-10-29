import { useEffect, useRef, useState } from 'react'
import { FaArrowUp, FaQuestionCircle, FaRedoAlt, FaStar } from 'react-icons/fa'
import ChatMessage from '../components/ChatMessage.jsx'
import { getOpeningMessage } from '../services/conversation.js'
import { api } from '../services/api.js'
import ThemedSelect from '../components/ThemedSelect.jsx'
import { getLocalPracticePhrase, getPracticePhrase } from '../services/practicePhrase.js'
import { scenarios } from '../data/scenarios.js'

export default function Practice() {
  const [scenarioId, setScenarioId] = useState('shopping')
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]
  const [messages, setMessages] = useState(() => [{ id: 1, role: 'guide', ...getOpeningMessage('shopping') }])
  const [suggestions, setSuggestions] = useState(() => scenarios.find((item) => item.id === 'shopping').suggestions)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [practiceMode, setPracticeMode] = useState('')
  const [phrasePanel, setPhrasePanel] = useState(() => getLocalPracticePhrase('shopping'))
  const bottomRef = useRef(null)
  const requestIdRef = useRef(0)
  const messageIdRef = useRef(1)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  function changeScenario(event) {
    // Ignore a reply that finishes after the learner switches situations.
    requestIdRef.current += 1
    const nextId = event.target.value
    const opening = getOpeningMessage(nextId)
    setScenarioId(nextId)
    setMessages([{ id: ++messageIdRef.current, role: 'guide', ...opening }])
    setSuggestions(scenarios.find((item) => item.id === nextId).suggestions)
    setPhrasePanel(getLocalPracticePhrase(nextId))
    setError('')
    setInput('')
    setIsTyping(false)
  }

  async function sendMessage(messageText = input) {
    const text = messageText.trim()
    if (!text || isTyping) return
    const message = { id: ++messageIdRef.current, role: 'user', kannada: text }
    setMessages((current) => [...current, message])
    setInput('')
    setError('')
    setIsTyping(true)
    const requestId = ++requestIdRef.current
    try {
      const history = messages.map((item) => ({
        role: item.role === 'guide' ? 'assistant' : 'user',
        content: item.kannada,
      }))
      const reply = await api.respond(scenarioId, text, history)
      if (requestId !== requestIdRef.current) return
      setPracticeMode(reply.mode)
      const guideMessage = { id: ++messageIdRef.current, role: 'guide', ...reply }
      setMessages((current) => [...current, guideMessage])
      setPhrasePanel(getPracticePhrase(scenarioId, [...messages, message], reply))
      setSuggestions(reply.suggestions ?? scenario.suggestions)
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setError(error.message)
        setPhrasePanel(getLocalPracticePhrase(scenarioId, [...messages, message]))
      }
    } finally {
      if (requestId === requestIdRef.current) setIsTyping(false)
    }
  }

  function resetPractice() {
    requestIdRef.current += 1
    const opening = getOpeningMessage(scenarioId)
    setMessages([{ id: ++messageIdRef.current, role: 'guide', ...opening }])
    setSuggestions(scenario.suggestions)
    setPhrasePanel(getLocalPracticePhrase(scenarioId))
    setError('')
    setInput('')
    setIsTyping(false)
  }

  return (
    <div className="portal-page practice-page page-width">
      <header className="page-intro practice-intro">
        <span className="eyebrow"><span className="eyebrow-line" /> A safe space to try</span>
        <h1>
          Practice for the<br />
          <em>real world.</em>
        </h1>
        <p>Try a little Kannada in a low-pressure conversation. The backend uses local mock replies unless an AI provider is configured.</p>
      </header>
      <div className="practice-layout">
        <section className="practice-panel" aria-label="Conversation practice">
          <div className="practice-panel-header">
            <div className="conversation-person">
              <span className="conversation-avatar">ಎ</span>
              <div>
                <strong>Your local guide</strong>
                <small><span className="online-dot" /> {practiceMode === 'ai' ? 'AI-assisted practice' : practiceMode === 'mock' ? 'Practice mode · local mock replies' : 'Practice mode · reply type shown below'}</small>
              </div>
            </div>
            <button type="button" className="reset-button" onClick={resetPractice}>
              <FaRedoAlt aria-hidden="true" /> Start over
            </button>
          </div>
          <div className="practice-context">
            <div>
              <span className="context-label">YOUR SITUATION</span>
              <p>{scenario.prompt}</p>
            </div>
            <label className="sr-only" htmlFor="practice-scenario">Choose a practice situation</label>
            <ThemedSelect id="practice-scenario" value={scenarioId} onChange={changeScenario} wrapperClassName="practice-scenario-select">
              {scenarios.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </ThemedSelect>
          </div>
          <div className="chat-history" aria-live="polite">
            {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
            {isTyping && (
              <div className="chat-row">
                <span className="chat-avatar" aria-hidden="true">ಎ</span>
                <div className="typing-bubble" role="status">
                  <span /><span /><span />
                  <span className="sr-only">Your local guide is typing</span>
                </div>
              </div>
            )}
            {error && <p className="practice-error" role="alert">{error}</p>}
            <div ref={bottomRef} />
          </div>
          <div className="suggested-replies">
            <span>TRY A REPLY</span>
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} disabled={isTyping}>
                {suggestion}
              </button>
            ))}
          </div>
          <form
            className="message-form"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <label className="sr-only" htmlFor="practice-message">Write a message</label>
            <input id="practice-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a Kannada phrase or a reply…" />
            <button type="submit" className="send-button" aria-label="Send message" disabled={!input.trim() || isTyping}>{isTyping ? <span className="loading-spinner" aria-hidden="true" /> : <FaArrowUp aria-hidden="true" />}</button>
          </form>
          <p className="message-hint">{practiceMode === 'ai' ? 'AI-generated practice response. Review translations with a fluent speaker when accuracy matters.' : practiceMode === 'mock' ? 'Local mock replies are served by the backend. No live AI provider is connected.' : 'The backend uses local mock replies unless an AI provider is configured.'}</p>
        </section>
        <aside className="practice-aside">
          <div className="aside-heading">
            <span className="aside-icon"><FaStar aria-hidden="true" /></span>
            <div>
              <span className="context-label">A LITTLE HELP</span>
              <h2>Take it one phrase at a time.</h2>
            </div>
          </div>
          <p className="aside-description">Review a phrase from your conversation, with its transliteration and meaning.</p>
          <div className="phrase-explainer">
            <span className="context-label">PHRASE TO TRY</span>
            <p className="explainer-kannada" lang="kn">{phrasePanel.kannada}</p>
            <p className="explainer-translit">{phrasePanel.transliteration}</p>
            <p className="explainer-meaning">{phrasePanel.english}</p>
            {phrasePanel.usageTip && <p className="phrase-usage-tip">{phrasePanel.usageTip}</p>}
          </div>
          <div className="practice-tip">
            <FaQuestionCircle aria-hidden="true" />
            <p>
              <strong>It is okay to go slowly.</strong><br />
              A smile and a try can go a long way. Your guide is here to help you practise.
            </p>
          </div>
          <div className="demo-badge" role="status">
            {isTyping
              ? 'Updating after your message…'
              : phrasePanel.source === 'ai' ? 'AI-suggested phrase' : 'Example phrase · local fallback'}
          </div>
        </aside>
      </div>
    </div>
  )
}
