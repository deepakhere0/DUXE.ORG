import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleRedirectResult } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkRedirectResult = async () => {
      if (isProcessing || !handleRedirectResult) return;
      
      try {
        setIsProcessing(true);
        console.log('🔍 Checking for Google Sign-In redirect result...');
        
        const result = await handleRedirectResult();
        
        if (result?.success) {
          console.log('✅ Redirect authentication successful:', result.user?.email);
          
          // Get intended destination or default to dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          
          toast.success(`Welcome, ${result.user?.displayName || result.user?.email}!`);
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('❌ Error processing redirect result:', error);
        
        // Only show error if it's not a normal "no auth event" error
        if (error.code !== 'auth/no-auth-event') {
          console.error('Authentication redirect failed:', error.message);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure Firebase is initialized
    const timeout = setTimeout(checkRedirectResult, 200);
    return () => clearTimeout(timeout);
  }, [navigate, location.state, handleRedirectResult, isProcessing]);

  return null; // This component doesn't render anything
};

export default AuthRedirectHandler;