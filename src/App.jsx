import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Notes from './pages/Notes';
import NotesPortal from './pages/NotesPortal';
import NoteDetail from './pages/NoteDetail';
import Upload from './pages/Upload';
import UploadDev from './pages/UploadDev'; // Temporary development upload
import AdminReview from './pages/AdminReview';
import PDFPreview from './pages/Pdfpreview';
import Pending from './pages/Pending';
import Tools from './pages/Tools';
import Videos from './pages/Videos';
import Internships from './pages/Internships';
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
import DataConnectTest from './components/DataConnectTest';
import Debug from './pages/Debug';
import AdminDashboard from './pages/AdminDashboard';
import PaymentAnalytics from './components/admin/PaymentAnalytics';
import FixNotes from './pages/FixNotes';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';


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
              <Route path="notes-old" element={<Notes />} />
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

              {/* Fix Notes Route - Admin Tool */}
              <Route path="fix-notes" element={<FixNotes />} />


              {/* Protected Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Only Routes */}
              <Route path="upload" element={
                <ProtectedRoute>
                  <UploadDev />
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
