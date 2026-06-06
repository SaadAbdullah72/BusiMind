import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Application Entry Point
 * 
 * Bootstraps the React application by rendering the root `<App />` component 
 * into the DOM within a StrictMode boundary.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
