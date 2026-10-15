import { useCallback, useState } from 'react'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import Hero from './components/Hero'
import InitiativeSection from './components/InitiativeSection'
import CraftSection from './components/CraftSection'
import StorySection from './components/StorySection'
import DifferenceSection from './components/DifferenceSection'
import KSVSection from './components/KSVSection'
import JourneySection from './components/JourneySection'
import PeopleSection from './components/PeopleSection'
import BuildSection from './components/BuildSection'
import Footer from './components/Footer'
import VideoModal from './components/VideoModal'
import { useActiveSection } from './hooks/useActiveSection'
import { SECTIONS, SECTION_IDS } from './data/content'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const activeId = useActiveSection(SECTION_IDS)
  const activeNav = SECTIONS.find((section) => section.id === activeId)?.nav ?? 0

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const openVideo = useCallback(() => setVideoOpen(true), [])
  const closeVideo = useCallback(() => setVideoOpen(false), [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-paper focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <Header activeNav={activeNav} menuOpen={menuOpen} onMenuOpen={openMenu} />
      <MobileMenu open={menuOpen} activeNav={activeNav} onClose={closeMenu} />

      <main id="main">
        <Hero onPlayVideo={openVideo} />
        <InitiativeSection />
        <CraftSection />
        <StorySection onPlayVideo={openVideo} />
        <DifferenceSection />
        <KSVSection />
        <JourneySection />
        <PeopleSection />
        <BuildSection />
      </main>

      <Footer />

      <VideoModal open={videoOpen} onClose={closeVideo} />
    </>
  )
}
