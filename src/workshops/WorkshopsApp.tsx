import { Suspense, lazy } from 'react'
import BookingPage from './BookingPage'
import WorkshopPage from './WorkshopPage'
import WorkshopsPage from './WorkshopsPage'
import { useLocation } from './lib'
import { Loading } from './ui'

// Separate download: only the team ever opens the admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function WorkshopsApp() {
  const location = useLocation()
  const url = new URL(location, window.location.origin)
  const parts = url.pathname.split('/').filter(Boolean)

  if (parts[0] === 'admin') {
    return (
      <Suspense fallback={<Loading label="Opening the admin" />}>
        <AdminApp path={parts.slice(1)} />
      </Suspense>
    )
  }
  if (parts[0] === 'booking' && parts[1]) return <BookingPage key={parts[1]} token={parts[1]} fresh={url.searchParams.has('new')} />
  if (parts[0] === 'workshops' && parts[1]) return <WorkshopPage key={parts[1]} slug={decodeURIComponent(parts[1])} />
  return <WorkshopsPage />
}

