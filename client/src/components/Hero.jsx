import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import heroIllustration from '../assets/hero-kannada.png'

export default function Hero() {
  const { user } = useAuth()

  return (
    <section className="hero-section page-width">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> Kannada for everyday Karnataka</div>
        <h1>Kannada for the moments that <em>matter.</em></h1>
        <p className="hero-description">From catching a bus to making a new friend, learn the Kannada you actually need in everyday life.</p>
        <div className="hero-actions">
          <Link className="button button-light" to={user ? '/learn' : '/signup'}>Start your journey <FaArrowRight aria-hidden="true" /></Link>
          <Link className="text-link" to="/how-it-works">Explore how it works <FaArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="hero-proof"><span className="hero-kannada-mark" lang="kn">ನಮಸ್ಕಾರ</span><span>Small phrases. Real connections.</span></div>
      </div>
      <div className="hero-art">
        <div className="art-grid" aria-hidden="true" />
        <div className="art-orbit orbit-one" aria-hidden="true" />
        <div className="art-orbit orbit-two" aria-hidden="true" />
        <div className="hero-illustration-enter">
          <div className="hero-illustration-float">
            <img className="hero-illustration-image" src={heroIllustration} alt="A Kannada greeting surrounded by friendly conversation symbols" fetchPriority="high" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  )
}
