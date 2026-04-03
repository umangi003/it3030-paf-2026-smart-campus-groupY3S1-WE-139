import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import ResourceListPage from './pages/resources/ResourceListPage'
import ResourceDetailPage from './pages/resources/ResourceDetailPage'
import BookingListPage from './pages/bookings/BookingListPage'
import BookingFormPage from './pages/bookings/BookingFormPage'
import QRCheckInPage from './pages/bookings/QRCheckInPage'
import IncidentListPage from './pages/incidents/IncidentListPage'
import IncidentDetailPage from './pages/incidents/IncidentDetailPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import NotificationPreferencesPage from './pages/notifications/NotificationPreferencesPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import SLADashboard from './pages/admin/SLADashboard'
import OAuth2Redirect from './pages/auth/OAuth2Redirect'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              background: '#001E2B',
              color: '#fff',
              border: '1px solid #023430',
            },
            success: { iconTheme: { primary: '#00ED64', secondary: '#001E2B' } },
          }}
        />
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/resources" replace />} />
            <Route path="/resources" element={<ResourceListPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/bookings" element={<BookingListPage />} />
            <Route path="/bookings/new" element={<BookingFormPage />} />
            <Route path="/bookings/qr/:token" element={<QRCheckInPage />} />
            <Route path="/incidents" element={<IncidentListPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sla" element={<SLADashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
