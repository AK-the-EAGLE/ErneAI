export default function FeatureCard({ icon: Icon, title, description, illustration, illustrationAlt, status = 'Available' }) {
  return (
    <article className="feature-card">
      <div className="feature-illustration-frame">
        <img className="feature-illustration" src={illustration} alt={illustrationAlt} loading="lazy" decoding="async" />
      </div>
      <div className="feature-card-meta">
        <span className="feature-icon"><Icon aria-hidden="true" /></span>
        <span className={`feature-status${status === 'Planned' ? ' planned' : ''}`}>{status}</span>
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  )
}
