import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { NextUIProvider } from "@nextui-org/react"; 
import './index.css'
import App from './App.jsx'
import { ModalProvider } from './components/ModalProvider'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NextUIProvider> {/* 2. Tüm uygulamayı sarmala */}
      <Suspense fallback={<div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>}>
        <ModalProvider>
          {/* 3. 'dark' class'ını ve HeroUI tema sınıflarını buraya ekliyoruz */}
          <main className="dark text-foreground bg-background min-h-screen">
            <App />
          </main>
        </ModalProvider>
      </Suspense>
    </NextUIProvider>
  </StrictMode>,
)