import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingLayout from './pages/LandingLayout'
import UserManagementPage from './pages/admin/UserManagementPage'

import LoginPage from './pages/auth/LoginPage'
import OAuth2Redirect from './pages/auth/OAuth2Redirect'

import ResourceListPage from './pages/resources/ResourceListPage'
import ResourceDetailPage from './pages/resources/ResourceDetailPage'
import BookingListPage from './pages/bookings/BookingListPage'
import BookingFormPage from './pages/bookings/BookingFormPage'
import QRCheckInPage from './pages/bookings/QRCheckInPage'
import QRDisplayPage from './pages/bookings/QRDisplayPage'
import IncidentListPage from './pages/incidents/IncidentListPage'
import IncidentDetailPage from './pages/incidents/IncidentDetailPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import NotificationPreferencesPage from './pages/notifications/NotificationPreferencesPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import SLADashboard from './pages/admin/SLADashboard'
import StaffDashboard from './pages/staff/StaffDashboard'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'
import ResourceAnalyticsPage from './pages/resources/ResourceAnalyticsPage'
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

          {/* QR check-in is PUBLIC — no login needed */}
          <Route path="/bookings/qr/:token" element={<QRCheckInPage />} />

          {/* Public landing — anyone can browse resources */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<ResourceListPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
          </Route>

          {/* Protected — requires login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/resources" element={<ResourceListPage />} />
            <Route path="/bookings" element={<BookingListPage />} />
            <Route path="/bookings/new" element={<BookingFormPage />} />
            {/* QR display is protected — only the logged-in student sees their own QR */}
            <Route path="/bookings/qr-display/:id" element={<QRDisplayPage />} />
            <Route path="/incidents" element={<IncidentListPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />
            <Route path="/resources/analytics" element={<ResourceAnalyticsPage />} />
            {/* Role dashboards */}
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/technician" element={<TechnicianDashboard />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sla" element={<SLADashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
