import { FaArrowRight, FaBookOpen, FaBriefcase, FaHeartbeat, FaShoppingBag, FaTrain } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import transportationImage from '../assets/scenarios/transportation.png'
import shoppingImage from '../assets/scenarios/shopping.png'
import healthcareImage from '../assets/scenarios/healthcare.png'
import educationImage from '../assets/scenarios/education.png'
import workplaceImage from '../assets/scenarios/workplace.png'

const icons = {
  'train-front': FaTrain,
  'shopping-bag': FaShoppingBag,
  'heart-pulse': FaHeartbeat,
  'book-open': FaBookOpen,
  'briefcase-business': FaBriefcase,
}

const illustrations = {
  transport: transportationImage,
  shopping: shoppingImage,
  healthcare: healthcareImage,
  education: educationImage,
  workplace: workplaceImage,
}

export default function ScenarioCard({ scenario, index, to = '/signup', publicPreview = false }) {
  const Icon = icons[scenario.icon] ?? FaBookOpen
  const illustration = illustrations[scenario.id]
  const examplePhrase = scenario.phrases[0]

  return (
    <Link className={`scenario-card scenario-${scenario.color}`} to={to} aria-label={`${scenario.name}: ${scenario.description}${publicPreview ? ' Create an account to learn more.' : ''}`}>
      <span className="scenario-number">0{index + 1}</span>
      <span className="scenario-icon"><Icon aria-hidden="true" /></span>
      <img className="scenario-illustration" src={illustration} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <h3>{scenario.name}</h3>
      <p>{scenario.description}</p>
      <span className="scenario-example" lang="kn">{examplePhrase.kannada}</span>
      <span className="scenario-action">{publicPreview ? 'Create an account' : 'Explore phrases'} <FaArrowRight aria-hidden="true" /></span>
    </Link>
  )
}
