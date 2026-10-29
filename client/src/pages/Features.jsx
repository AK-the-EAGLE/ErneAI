import { FaArrowRight, FaBookmark, FaBookOpen, FaChartLine, FaComments, FaLanguage, FaLightbulb, FaMapMarkedAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import featuresIllustration from '../assets/features-hero.png'
import situationLearningIllustration from '../assets/features/situation-learning.png'
import kannadaTranslationIllustration from '../assets/features/kannada-translation.png'
import conversationPracticeIllustration from '../assets/features/conversation-practice.png'
import contextualRepliesIllustration from '../assets/features/contextual-replies.png'
import savedPhrasesIllustration from '../assets/features/saved-phrases.png'
import learningProgressIllustration from '../assets/features/learning-process.png'
import learningPlansIllustration from '../assets/features/personal-learning-plan.png'

const features = [
  { icon: FaMapMarkedAlt, title: 'Situation-based learning', description: 'Explore starter phrases for transport, shopping, healthcare, education, and workplace moments.', illustration: situationLearningIllustration, illustrationAlt: 'Illustration representing everyday situations for Kannada learning' },
  { icon: FaLanguage, title: 'Kannada, transliteration, meaning', description: 'Read Kannada script alongside Latin transliteration and an English translation.', illustration: kannadaTranslationIllustration, illustrationAlt: 'Illustration representing Kannada script with transliteration and meaning' },
  { icon: FaComments, title: 'Conversation practice', description: 'Try a short conversation with server-provided mock replies. An AI provider can be configured on the server.', illustration: conversationPracticeIllustration, illustrationAlt: 'Illustration representing Kannada conversation practice' },
  { icon: FaLightbulb, title: 'Suggested contextual replies', description: 'Pick a suggested phrase as a starting point for your next turn in the practice demo.', illustration: contextualRepliesIllustration, illustrationAlt: 'Illustration representing contextual suggested replies' },
  { icon: FaBookmark, title: 'Saved phrases', description: 'Save useful phrases to your account and find them again after signing in.', illustration: savedPhrasesIllustration, illustrationAlt: 'Illustration representing saved Kannada phrases' },
  { icon: FaChartLine, title: 'Basic learning progress', description: 'Track which situations you have opened. Progress is saved to your account.', illustration: learningProgressIllustration, illustrationAlt: 'Illustration representing learning progress tracking' },
  { icon: FaBookOpen, title: 'Personal learning plans', description: 'Adaptive lesson plans and recommendation journeys are not part of this demo yet.', illustration: learningPlansIllustration, illustrationAlt: 'Illustration representing a personal learning plan', status: 'Planned' },
]

export default function Features() {
  return (
    <div className="editorial-page features-page">
      <section className="editorial-hero page-width">
        <div className="editorial-hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> Thoughtful tools for real moments</span>
          <h1>Everything starts<br />with <em>being understood.</em></h1>
          <p>Explore what the current learning prototype can do today—and what is still on the roadmap.</p>
        </div>
        <div className="editorial-hero-enter">
          <div className="editorial-hero-float">
            <img className="editorial-hero-illustration" src={featuresIllustration} alt="Kannada learning features shown on a mobile app with conversation and study tools" fetchPriority="high" decoding="async" />
          </div>
        </div>
      </section>
      <ScrollReveal as="section" className="feature-grid page-width feature-card-group">{features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</ScrollReveal>
      <ScrollReveal as="section" className="feature-disclaimer page-width"><p>Accounts and saved learning data use the Erne backend. This hackathon prototype has not had a production security audit, and practice uses mock replies unless an AI provider is configured.</p><Link className="button button-dark" to="/signup">Create an account <FaArrowRight aria-hidden="true" /></Link></ScrollReveal>
    </div>
  )
}
