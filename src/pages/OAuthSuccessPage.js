import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OAuthSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const user = query.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user); // already a JSON string
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return <div className="text-center mt-5">🔄 Redirecting...</div>;
}

export default OAuthSuccessPage;
