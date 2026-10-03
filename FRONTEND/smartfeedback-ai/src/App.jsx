import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/common/Toast'

import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Public pages
import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Register from './pages/Register'

// App pages
import Dashboard       from './pages/Dashboard'
import GenerateFeedback from './pages/GenerateFeedback'
import FeedbackList    from './pages/FeedbackList'
import Contacts        from './pages/Contacts'
import AddContact      from './pages/AddContact'
import SendFeedback    from './pages/SendFeedback'
import History         from './pages/History'
import Analytics       from './pages/Analytics'
import Profile         from './pages/Profile'
import Settings        from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Landing />}  />
            <Route path="/login"    element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* Protected — all nested under AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />}        />
              <Route path="/generate"  element={<GenerateFeedback />} />
              <Route path="/feedback"  element={<FeedbackList />}     />
              <Route path="/contacts"       element={<Contacts />}   />
              <Route path="/contacts/add"   element={<AddContact />} />
              <Route path="/send"      element={<SendFeedback />}     />
              <Route path="/history"   element={<History />}          />
              <Route path="/analytics" element={<Analytics />}        />
              <Route path="/profile"   element={<Profile />}          />
              <Route path="/settings"  element={<Settings />}         />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global toast container (also used by public pages) */}
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
