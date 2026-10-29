import { FaArrowRight, FaCheck, FaComments, FaStar } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import Hero from '../components/Hero.jsx'
import ScenarioCard from '../components/ScenarioCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import { scenarios } from '../data/scenarios.js'
import practiceIllustration from '../assets/practice-illustration.png'

const steps = [
  { number: '01', title: 'Choose your moment', text: 'Start with the situation you are in, from the market to your first day at work.', icon: FaStar },
  { number: '02', title: 'Pick up useful phrases', text: 'Learn what people actually say, with a clear meaning and easy transliteration.', icon: FaCheck },
  { number: '03', title: 'Try a conversation', text: 'Build confidence with a friendly practice conversation, one reply at a time.', icon: FaComments },
]

export default function Home() {
  const { user } = useAuth()
  return (
    <>
      <Hero />
      <ScrollReveal as="section" className="trust-strip page-width">
        <span>SMALL WORDS, BIG CONNECTIONS</span><div className="trust-rule" /><p>Built around the conversations that make a place feel like yours.</p>
      </ScrollReveal>
      <section className="language-strip" aria-label="A few useful Kannada words">
        <div className="language-marquee">
          {[0, 1].map((copy) => (
            <div className="language-marquee-group" key={copy} aria-hidden={copy === 1}>
              <span><b lang="kn">ನಮಸ್ಕಾರ</b> Hello</span>
              <span><b lang="kn">ಧನ್ಯವಾದಗಳು</b> Thank you</span>
              <span><b lang="kn">ಹೌದು</b> Yes</span>
              <span><b lang="kn">ಇಲ್ಲ</b> No</span>
              <span><b lang="kn">ಎಷ್ಟು?</b> How much?</span>
            </div>
          ))}
        </div>
      </section>
      <ScrollReveal as="section" className="scenario-section page-width">
        <div className="section-heading">
          <div><span className="eyebrow"><span className="eyebrow-line" /> Start with your everyday</span><h2>Where will Kannada<br /><em>take you?</em></h2></div>
          <Link className="text-link" to={user ? '/explore' : '/signup'}>Explore all phrases <FaArrowRight aria-hidden="true" /></Link>
        </div>
        <ScrollReveal as="div" className="scenario-grid scenario-card-group">{scenarios.map((scenario, index) => <ScenarioCard key={scenario.id} scenario={scenario} index={index} to={user ? `/explore/${scenario.id}` : '/signup'} publicPreview={!user} />)}</ScrollReveal>
      </ScrollReveal>
      <ScrollReveal as="section" className="how-section">
        <div className="page-width how-inner">
          <div className="how-copy"><span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> It starts with one hello</span><h2>A little practice.<br /><em>A lot more connection.</em></h2><p>No big lessons or perfect accents. Just kind, practical help for the next conversation.</p><Link className="button button-light" to="/how-it-works">See how it works <FaArrowRight aria-hidden="true" /></Link></div>
          <div className="steps-list">{steps.map(({ number, title, text, icon: Icon }) => <article className="step-item" key={number}><span className="step-number">{number}</span><div className="step-icon"><Icon aria-hidden="true" /></div><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </ScrollReveal>
      <ScrollReveal as="section" className="conversation-section page-width">
        <div className="conversation-copy"><span className="eyebrow"><span className="eyebrow-line" /> No pressure, just practice</span><h2>Try a conversation<br />before the <em>real one.</em></h2><p>Get a feel for the flow with friendly, contextual practice. Go at your pace—there is no wrong way to start.</p><Link className="button button-dark" to={user ? '/practice' : '/signup'}>Meet your practice partner <FaArrowRight aria-hidden="true" /></Link></div>
        <div className="practice-preview">
          <div className="section-illustration-frame practice-illustration-frame">
            <img className="section-illustration" src={practiceIllustration} alt="Two people practising Kannada together" loading="lazy" decoding="async" />
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal as="section" className="closing-cta page-width"><div><span className="eyebrow"><span className="eyebrow-line" /> Your next hello is closer</span><h2>Learn Kannada.<br /><em>Belong anywhere.</em></h2></div><Link className="button button-dark" to={user ? '/learn/lessons' : '/signup'}>Let’s get started <FaArrowRight aria-hidden="true" /></Link></ScrollReveal>
    </>
  )
}
