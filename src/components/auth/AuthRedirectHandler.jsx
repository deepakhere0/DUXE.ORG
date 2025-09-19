import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const { handleRedirectResult } = useAuth();

  useEffect(() => {
    const checkRedirectResult = async () => {
      const result = await handleRedirectResult();
      if (result?.success) {
        // Navigate to dashboard on successful redirect authentication
        navigate('/dashboard', { replace: true });
      }
    };

    checkRedirectResult();
  }, [navigate, handleRedirectResult]);

  return null; // This component doesn't render anything
};

export default AuthRedirectHandler;