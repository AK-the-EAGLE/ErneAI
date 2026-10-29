import { FaArrowRight, FaHeart, FaMapMarkerAlt, FaRegCommentDots } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal.jsx'
import aboutIllustration from '../assets/about-hero.png'

export default function About() {
  return (
    <div className="editorial-page">
      <section className="editorial-hero page-width">
        <div className="editorial-hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> A little more belonging</span>
          <h1>Language is how<br />a place says <em>come in.</em></h1>
          <p>Erne AI helps make the everyday moments of life in Karnataka feel a little less unfamiliar—and a lot more connected.</p>
        </div>
        <div className="editorial-hero-enter">
          <div className="editorial-hero-float">
            <img className="editorial-hero-illustration" src={aboutIllustration} alt="Two people learning Kannada together with a book" fetchPriority="high" decoding="async" />
          </div>
        </div>
      </section>
      <ScrollReveal as="section" className="about-story page-width">
        <div className="story-lead"><span className="story-icon"><FaMapMarkerAlt aria-hidden="true" /></span><span className="context-label">THE MOMENT WE STARTED WITH</span><h2>A small language gap can make a big place feel far away.</h2></div>
        <div className="story-body"><p>Moving somewhere new means learning a thousand little things. How to ask for a stop. What to say at the pharmacy. How to greet a neighbour. When you do not know the local language, these ordinary moments can take extra courage.</p><p>Learning a language should start with the conversations you actually want to have—not a list of words without a place to use them.</p></div>
      </ScrollReveal>
      <ScrollReveal as="section" className="about-values">
        <div className="page-width values-grid">
          <div><span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> Why Erne exists</span><h2>Practical words.<br /><em>Real human connection.</em></h2></div>
          <p>Erne AI is a Kannada communication companion built around everyday situations. It brings practical phrases, readable transliteration, clear meanings, and low-pressure conversation practice together in one place.</p>
          <div className="value-quote"><FaHeart aria-hidden="true" /><p>We believe a first hello can be the beginning of feeling at home.</p></div>
        </div>
      </ScrollReveal>
      <ScrollReveal as="section" className="about-vision page-width">
        <div><span className="eyebrow"><span className="eyebrow-line" /> The vision</span><h2>Not perfect Kannada.<br /><em>More confident moments.</em></h2></div>
        <div><p>Our vision is a Karnataka where more people can join everyday conversations with warmth and confidence. Erne is an early learning experience, designed to grow with its learners and with the communities whose language it celebrates.</p><Link className="text-link" to="/how-it-works">See how it works <FaArrowRight aria-hidden="true" /></Link></div>
      </ScrollReveal>
      <ScrollReveal as="section" className="about-cta page-width"><FaRegCommentDots aria-hidden="true" /><div><h2>Start with one phrase.</h2><p>Explore the learning experience and see where a little Kannada can take you.</p></div><Link className="button button-dark" to="/signup">Get started <FaArrowRight aria-hidden="true" /></Link></ScrollReveal>
    </div>
  )
}
