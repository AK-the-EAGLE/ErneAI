import authIllustration from '../assets/auth-illustration.png'

export default function AuthPhrasePanel({ heading, description, supportingLine }) {
  return (
    <aside className="auth-phrase-panel">
      <img className="auth-panel-illustration" src={authIllustration} alt="Two women sharing a warm Kannada-learning conversation" fetchPriority="high" decoding="async" />
      <div className="auth-panel-copy">
        <h2>{heading}</h2>
        <p>{description}</p>
        <p className="auth-panel-supporting">{supportingLine}</p>
      </div>
    </aside>
  )
}
