import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Page-level lazy imports — each page becomes its own JS chunk
const Home = lazy(() => import('../pages/home/Home'));
const NotesPortal = lazy(() => import('../pages/notes/NotesPortal'));
const NoteDetail = lazy(() => import('../pages/notes/NoteDetail'));
const Upload = lazy(() => import('../pages/upload/Upload'));
const Pending = lazy(() => import('../pages/upload/Pending'));
const AdminReview = lazy(() => import('../pages/admin/AdminReview'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const PDFPreview = lazy(() => import('../pages/tools/PdfPreview'));
const Tools = lazy(() => import('../pages/tools/Tools'));
const Pricing = lazy(() => import('../pages/tools/Pricing'));
const Videos = lazy(() => import('../pages/Videos'));
const Internships = lazy(() => import('../pages/Internships'));
const NotFound = lazy(() => import('../pages/NotFound'));
const HowItWorks = lazy(() => import('../pages/static/HowItWorks'));
const FAQ = lazy(() => import('../pages/static/FAQ'));
const Blog = lazy(() => import('../pages/static/Blog'));
const About = lazy(() => import('../pages/static/About'));
const Contact = lazy(() => import('../pages/static/Contact'));
const Privacy = lazy(() => import('../pages/static/Privacy'));
const Terms = lazy(() => import('../pages/static/Terms'));
const Cookies = lazy(() => import('../pages/static/Cookies'));
const Guidelines = lazy(() => import('../pages/static/Guidelines'));
const Help = lazy(() => import('../pages/Help'));
const Report = lazy(() => import('../pages/Report'));
const Feedback = lazy(() => import('../pages/Feedback'));
const Debug = lazy(() => import('../pages/Debug'));
const DataConnectTest = lazy(() => import('../components/DataConnectTest'));
const PaymentAnalytics = lazy(() => import('../components/admin/PaymentAnalytics'));
const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));

const PageSpinner = (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
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
          <Suspense fallback={PageSpinner}>
            <Routes>
              {/* Auth Pages (No Layout) */}
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="preview/:id" element={<PDFPreview />} />

              {/* Main App Routes with Layout */}
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="notes" element={<NotesPortal />} />
                <Route path="notes/:noteId" element={<NoteDetail />} />
                <Route
                  path="/pending"
                  element={
                    <ProtectedRoute>
                      <Pending />
                    </ProtectedRoute>
                  }
                />
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

                {/* Data Connect Test Route - Development Only */}
                {import.meta.env.DEV && (
                  <Route path="test-dataconnect" element={<DataConnectTest />} />
                )}

                {/* Debug Route - Development Only */}
                {import.meta.env.DEV && <Route path="debug" element={<Debug />} />}

                {/* Protected Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes */}
                <Route
                  path="upload"
                  element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/review"
                  element={
                    <ProtectedRoute>
                      <AdminReview />
                    </ProtectedRoute>
                  }
                />

                {/* Public Routes */}
                <Route path="tools" element={<Tools />} />

                {/* Admin Routes */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="admin/payments"
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen bg-gray-50 py-8">
                        <div className="container-custom">
                          <h1 className="text-3xl font-bold mb-6">Payment Analytics</h1>
                          <PaymentAnalytics />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>

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
    </QueryClientProvider>
  );
}

export default App;
