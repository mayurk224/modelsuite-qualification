import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'sonner'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Toaster position="top-right" toastOptions={{
    style: {
      background: '#161615',
      color: '#fff',
      border: '1px solid rgb(43, 43, 43)',
    },
  }}/>
    <App />
  </StrictMode>,
)
