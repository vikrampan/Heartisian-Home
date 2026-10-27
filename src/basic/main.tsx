import { StrictMode } from 'react'
import type { Root } from 'react-dom/client'
import './basic.css'
import BasicApp from './BasicApp'

export function mount(root: Root) {
  // index.html carries the full site's title and colours; swap in this page's own
  document.title = 'Heartisan Home — Natural Construction at Kanha Shanti Vanam'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff')

  root.render(
    <StrictMode>
      <BasicApp />
    </StrictMode>,
  )
}
