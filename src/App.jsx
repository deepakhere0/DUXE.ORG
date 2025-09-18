import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages (we'll create these next)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import Upload from './pages/Upload';
import Tools from './pages/Tools';
import Videos from './pages/Videos';
import Internships from './pages/Internships';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Help from './pages/Help';
import Guidelines from './pages/Guidelines';
import Report from './pages/Report';
import Feedback from './pages/Feedback';
import ForgotPassword from './pages/ForgotPassword';
import DataConnectTest from './components/DataConnectTest';
import Debug from './pages/Debug';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ReviewQueue from './pages/admin/ReviewQueue';
import FileManagement from './pages/admin/FileManagement';
import Analytics from './pages/admin/Analytics';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="notes" element={<Notes />} />
              <Route path="notes/:noteId" element={<NoteDetail />} />
              <Route path="videos" element={<Videos />} />
              <Route path="internships" element={<Internships />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="blog" element={<Blog />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="cookies" element={<Cookies />} />
              <Route path="help" element={<Help />} />
              <Route path="guidelines" element={<Guidelines />} />
              <Route path="report" element={<Report />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              
              {/* Data Connect Test Route - Development Only */}
              {import.meta.env.DEV && (
                <Route path="test-dataconnect" element={<DataConnectTest />} />
              )}
              
              {/* Debug Route - Development Only */}
              {import.meta.env.DEV && (
                <Route path="debug" element={<Debug />} />
              )}
              
              {/* Protected Routes - Require Authentication */}
              <Route
                path="upload"
                element={
                  <ProtectedRoute requireVerified>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route path="tools" element={<Tools />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="review-queue" element={<ReviewQueue />} />
                        <Route path="files" element={<FileManagement />} />
                        <Route path="analytics" element={<Analytics />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all - 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#FF9900',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
