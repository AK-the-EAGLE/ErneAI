import { FaArrowRight, FaBookOpen, FaComments, FaLanguage, FaRegCompass } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal.jsx'
import howItWorksIllustration from '../assets/how-it-works-hero.png'
import phraseInContextIllustration from '../assets/phrase-in-context.png'

const journey = [
  { n: '01', title: 'Choose your everyday situation', text: 'Start with the moments that matter to you: getting around, shopping, healthcare, education, or work.', icon: FaRegCompass },
  { n: '02', title: 'Discover practical Kannada phrases', text: 'Each phrase comes with Kannada script, transliteration, and a plain English meaning.', icon: FaBookOpen },
  { n: '03', title: 'Explore each phrase', text: 'Read Kannada script alongside its transliteration and English meaning.', icon: FaLanguage },
  { n: '04', title: 'Continue the conversation', text: 'Try a guided practice conversation with server-provided replies. An AI provider can be configured on the server.', icon: FaComments },
]

export default function HowItWorks() {
  return (
    <div className="editorial-page">
      <section className="editorial-hero page-width">
        <div className="editorial-hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> Small steps, everyday confidence</span>
          <h1>Learn it for life<br />as it <em>happens.</em></h1>
          <p>Erne takes you from a real-life situation to a phrase you can understand and use in practice.</p>
        </div>
        <div className="editorial-hero-enter">
          <div className="editorial-hero-float">
            <img className="editorial-hero-illustration" src={howItWorksIllustration} alt="A language-learning app guiding a learner through Kannada practice" fetchPriority="high" decoding="async" />
          </div>
        </div>
      </section>
      <ScrollReveal as="section" className="journey page-width journey-step-group">
        {journey.map(({ n, title, text, icon: Icon }) => <article className="journey-step" key={n}><span className="journey-number">{n}</span><span className="journey-icon"><Icon aria-hidden="true" /></span><div><h2>{title}</h2><p>{text}</p></div></article>)}
      </ScrollReveal>
      <ScrollReveal as="section" className="journey-preview page-width">
        <div><span className="eyebrow"><span className="eyebrow-line" /> A phrase in context</span><h2>Useful words feel<br /><em>different in a moment.</em></h2><p>In the learning portal, you can save phrases and progress to your account, then practise a short conversation with server-provided replies.</p><Link className="button button-dark" to="/signup">Create an account <FaArrowRight aria-hidden="true" /></Link></div>
        <div className="phrase-context-visual">
          <div className="section-illustration-frame phrase-context-illustration-frame">
            <img className="section-illustration" src={phraseInContextIllustration} alt="A learner and local neighbour sharing Kannada phrases in conversation" loading="lazy" decoding="async" />
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal as="section" className="about-cta page-width"><FaComments aria-hidden="true" /><div><h2>Your first phrase is waiting.</h2><p>Try the interactive learning experience in your account.</p></div><Link className="button button-dark" to="/signup">Start learning <FaArrowRight aria-hidden="true" /></Link></ScrollReveal>
    </div>
  )
}
