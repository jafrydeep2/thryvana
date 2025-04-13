import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register the service worker for PWA
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // You can show a prompt to refresh here
    console.log('New content available. Refresh the page.')
  },
  onOfflineReady() {
    console.log('App ready to work offline.')
  },
})


createRoot(document.getElementById("root")!).render(<App />);
