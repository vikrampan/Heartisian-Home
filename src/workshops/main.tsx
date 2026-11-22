import { StrictMode } from 'react'
import type { Root } from 'react-dom/client'
import './workshops.css'
import WorkshopsApp from './WorkshopsApp'
import { activateRouter } from './lib'

export function mount(root: Root) {
  document.documentElement.classList.add('js')
  activateRouter()
  root.render(
    <StrictMode>
      <WorkshopsApp />
    </StrictMode>,
  )
}
