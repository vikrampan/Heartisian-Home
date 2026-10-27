import { StrictMode } from 'react'
import type { Root } from 'react-dom/client'
import './index.css'
import App from './App'

export function mount(root: Root) {
  // the reveal-on-scroll styles only hide content once this script is running
  document.documentElement.classList.add('js')

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
