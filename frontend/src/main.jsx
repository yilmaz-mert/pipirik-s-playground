import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { NextUIProvider } from "@nextui-org/react"; 
import { HeroUIProvider } from '@heroui/react';
import './index.css'
import App from './App.jsx'
import { ModalProvider } from './components/ModalProvider'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NextUIProvider> {/* 2. Tüm uygulamayı sarmala */}
      <HeroUIProvider>
      <Suspense fallback={<div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>}>
        <ModalProvider>
          {/* 3. 'dark' class'ını ve HeroUI tema sınıflarını buraya ekliyoruz */}
          {/* Global theme tokens via CSS variables for pages/components */}
          <main
            className="dark text-foreground bg-background min-h-screen"
            style={{
              '--accent': '#38BDF8',
              '--accent-2': '#818CF8',
              '--card-bg': 'rgba(30,41,59,0.4)',
              '--card-border': 'rgba(51,65,85,0.5)',
              '--muted': '#94A3B8',
              '--page-bg': '#0f172a'
            }}
          >
            <App />
          </main>
        </ModalProvider>
      </Suspense>
      </HeroUIProvider>
    </NextUIProvider>
  </StrictMode>,
)