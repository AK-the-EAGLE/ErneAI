export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`chat-row ${isUser ? 'chat-row-user' : ''}`}>
      {!isUser && <span className="chat-avatar" aria-hidden="true">ಎ</span>}
      <div className="chat-message-group">
        {!isUser && <span className="chat-speaker">Your local guide</span>}
        <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : ''}`}>
          <p className="chat-kannada" lang="kn">{message.kannada}</p>
          {!isUser && <><p className="chat-transliteration">{message.transliteration}</p><p className="chat-translation">{message.english}</p></>}
        </div>
      </div>
    </div>
  )
}
