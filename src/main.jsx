import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import App from './App.jsx'
import LandingPage from './pages/LandingPage'
import InputPage from './pages/InputPage'
import AnalysisPage from './pages/AnalysisPage'
import TailorPage from './pages/TailorPage'
import ExportPage from './pages/ExportPage'
import TrackerPage from './pages/TrackerPage'
import SettingsPage from './pages/SettingsPage'
import LegalPage from './pages/LegalPage'
import PublicResumePage from './pages/PublicResumePage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<App />}>
            {/* High-Converting SaaS Landing Page */}
            <Route index element={<LandingPage />} />

            {/* 4-Step ResumeForge Optimization Workspace */}
            <Route path="app" element={<InputPage />} />
            <Route path="create" element={<Navigate to="/app" replace />} />
            <Route path="analyze" element={<AnalysisPage />} />
            <Route path="tailor" element={<TailorPage />} />
            <Route path="export" element={<ExportPage />} />

            {/* Career Cockpit & Settings */}
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<Navigate to="/settings" replace />} />

            {/* Trust, Legal & Contact Pages */}
            <Route path="privacy" element={<LegalPage />} />
            <Route path="terms" element={<LegalPage />} />
            <Route path="security" element={<LegalPage />} />
            <Route path="contact" element={<LegalPage />} />

            {/* Public Shareable Web Portfolio */}
            <Route path="p/:id" element={<PublicResumePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
