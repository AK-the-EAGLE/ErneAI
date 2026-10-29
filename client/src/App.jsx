import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import PortalLayout from './layouts/PortalLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import Features from './pages/Features.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import ScenarioPage from './pages/ScenarioPage.jsx'
import Practice from './pages/Practice.jsx'
import Favorites from './pages/Favorites.jsx'
import Profile from './pages/Profile.jsx'
import LessonsPage from './pages/LessonsPage.jsx'
import LessonPage from './pages/LessonPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<Features />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<PortalLayout />}>
                <Route path="/learn" element={<Dashboard />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/:scenarioId" element={<ExplorePage />} />
                <Route path="/learn/lessons" element={<LessonsPage />} />
                <Route path="/learn/lessons/:lessonId" element={<LessonPage />} />
                <Route path="/learn/:scenarioId" element={<ScenarioPage />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
