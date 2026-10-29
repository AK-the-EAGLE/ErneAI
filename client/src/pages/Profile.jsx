import { useState } from 'react'
import { FaCheck, FaUser } from 'react-icons/fa'
import useAuth from '../hooks/useAuth.js'
import { updateProfile } from '../services/authService.js'
import ThemedSelect from '../components/ThemedSelect.jsx'

const learningLevels = {
  beginner: 'Start with reading support, essential vocabulary, and short everyday sentences.',
  intermediate: 'Build longer conversations with grammar patterns, verb forms, and useful connectors.',
  advanced: 'Explore nuanced phrasing, register, idioms, complex explanations, and longer reading.',
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const [learningLevel, setLearningLevel] = useState(user.preferredLearningLevel ?? 'beginner')
  const [saveMessage, setSaveMessage] = useState('')
  const [saveFailed, setSaveFailed] = useState(false)
  const [saving, setSaving] = useState(false)

  async function updateLearningLevel(event) {
    const nextLevel = event.target.value
    setSaving(true)
    setSaveMessage('')
    setSaveFailed(false)
    try {
      const updatedUser = await updateProfile(nextLevel)
      setLearningLevel(updatedUser.preferredLearningLevel)
      setUser(updatedUser)
      setSaveMessage('Learning level saved to your account.')
    } catch (error) {
      setSaveMessage(error.message)
      setSaveFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="portal-page profile-page">
      <header className="portal-welcome"><div><span className="eyebrow"><span className="eyebrow-line" /> YOUR PROFILE</span><h1>A learning space that feels like yours.</h1><p>Your account and learning level are managed by the Erne backend.</p></div></header>
      <section className="profile-card">
        <div className="profile-person"><span className="profile-avatar"><FaUser aria-hidden="true" /></span><div><h2>{user.name || 'Erne learner'}</h2><p>{user.email}</p></div><span className="profile-demo-badge">HACKATHON ACCOUNT</span></div>
        <div className="profile-setting">
          <div>
            <h3>Learning level</h3>
            <p id="learning-level-help">{learningLevels[learningLevel]}</p>
            <p className="profile-level-history-note">Changing levels updates your learning path. Completed lessons and quiz history are preserved.</p>
          </div>
          <label className="sr-only" htmlFor="learning-level">Preferred learning level</label>
          <ThemedSelect id="learning-level" value={learningLevel} onChange={updateLearningLevel} disabled={saving} aria-describedby="learning-level-help">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </ThemedSelect>
        </div>
        <p className="profile-save-status" role={saveFailed ? 'alert' : 'status'} aria-live="polite">
          {saving ? 'Saving your learning level…' : saveMessage && <>{!saveFailed && <FaCheck aria-hidden="true" />} {saveMessage}</>}
        </p>
        <aside className="profile-security"><strong>Hackathon prototype, not a production service.</strong> The server hashes passwords and checks access to your account data. This project has not had a production security audit; use placeholder information.</aside>
      </section>
    </div>
  )
}
