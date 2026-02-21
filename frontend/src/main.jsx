import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'; // Sadece HeroUI kaldı
import './index.css'
import App from './App.jsx'
import { ModalProvider } from './components/ModalProvider'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
      <Suspense fallback={
        <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center text-white">
          Loading...
        </div>
      }>
        <ModalProvider>
          {/* Style bloğu tamamen kaldırıldı, class'lar korundu */}
         <main className="dark text-foreground min-h-screen">
            <App />
          </main>
        </ModalProvider>
      </Suspense>
    </HeroUIProvider>
  </StrictMode>,
)