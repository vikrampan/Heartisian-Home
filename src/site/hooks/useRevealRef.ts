import { useEffect, useRef } from 'react'

// Marks the element with data-visible="true" the first time it scrolls into view.
export function useRevealRef<T extends Element>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        node.setAttribute('data-visible', 'true')
        observer.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}
