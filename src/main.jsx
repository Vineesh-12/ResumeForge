import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import App from './App.jsx'
import InputPage from './pages/InputPage'
import AnalysisPage from './pages/AnalysisPage'
import TailorPage from './pages/TailorPage'
import ExportPage from './pages/ExportPage'
import TrackerPage from './pages/TrackerPage'
import PublicResumePage from './pages/PublicResumePage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<InputPage />} />
            <Route path="analyze" element={<AnalysisPage />} />
            <Route path="tailor" element={<TailorPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="p/:id" element={<PublicResumePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
