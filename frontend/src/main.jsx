import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react';
import './index.css'
import App from './App.jsx'
import './i18n'
import { ThemeProvider } from './context/ThemeContext';
import { EngineerModeProvider } from './context/EngineerModeContext';
import { SoundProvider } from './context/SoundContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <EngineerModeProvider>
        <SoundProvider>
        <HeroUIProvider>
          <Suspense fallback={
            <div
              className="h-screen w-screen flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
            >
              Loading...
            </div>
          }>
            <main className="dark text-foreground ">
              <App />
            </main>
          </Suspense>
        </HeroUIProvider>
        </SoundProvider>
      </EngineerModeProvider>
    </ThemeProvider>
  </StrictMode>,
)