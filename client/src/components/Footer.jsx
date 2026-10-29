import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner page-width">
        <div className="footer-branding">
          <Link className="brand footer-brand" to="/"><BrandLogo /></Link>
          <p>Learn Kannada. Belong anywhere.</p>
        </div>
        <div className="footer-links">
          <Link to="/about">About Erne</Link><Link to="/how-it-works">How it works</Link><Link to="/features">Features</Link>
          <a href="mailto:hello@erne.ai">Say hello <FaArrowRight aria-hidden="true" /></a>
        </div>
        <span className="footer-note">Made with care for Karnataka <span lang="kn">ನಮಸ್ಕಾರ</span></span>
      </div>
    </footer>
  )
}
