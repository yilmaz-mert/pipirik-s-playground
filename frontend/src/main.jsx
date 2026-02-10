import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ModalProvider } from './components/ModalProvider'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <ModalProvider>
        <App />
      </ModalProvider>
    </Suspense>
  </StrictMode>,
)