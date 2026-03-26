import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Pages
import Home from '../pages/home/Home';
import NotesPortal from '../pages/notes/NotesPortal';
import NoteDetail from '../pages/notes/NoteDetail';
import Upload from '../pages/upload/Upload';
import AdminReview from '../pages/admin/AdminReview';
import PDFPreview from '../pages/tools/PdfPreview';
import Pending from '../pages/upload/Pending';
import Tools from '../pages/tools/Tools';
import Videos from '../pages/Videos';
import Internships from '../pages/Internships';
import NotFound from '../pages/NotFound';
import HowItWorks from '../pages/static/HowItWorks';
import Pricing from '../pages/tools/Pricing';
import FAQ from '../pages/static/FAQ';
import Blog from '../pages/static/Blog';
import About from '../pages/static/About';
import Contact from '../pages/static/Contact';
import Privacy from '../pages/static/Privacy';
import Terms from '../pages/static/Terms';
import Cookies from '../pages/static/Cookies';
import Help from '../pages/Help';
import Guidelines from '../pages/static/Guidelines';
import Report from '../pages/Report';
import Feedback from '../pages/Feedback';
import DataConnectTest from '../components/DataConnectTest';
import Debug from '../pages/Debug';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PaymentAnalytics from '../components/admin/PaymentAnalytics';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Dashboard from '../pages/dashboard/Dashboard';


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
              <Route path="/pending" element={
  <ProtectedRoute>
    <Pending />
  </ProtectedRoute>
} />
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
              {import.meta.env.DEV && (
                <Route path="debug" element={<Debug />} />
              )}
              
              
              {/* Protected Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Only Routes */}
              <Route path="upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="admin/review" element={
                <ProtectedRoute>
                  <AdminReview />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="tools" element={<Tools />} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/payments" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 py-8">
                    <div className="container-custom">
                      <h1 className="text-3xl font-bold mb-6">Payment Analytics</h1>
                      <PaymentAnalytics />
                    </div>
                  </div>
                </ProtectedRoute>
              } />

              {/* Catch all - 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
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
