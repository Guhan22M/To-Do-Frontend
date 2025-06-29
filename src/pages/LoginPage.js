import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard'); // change this if your main page is different
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:5000/auth/${provider}`;
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="text-center mb-4">Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            onChange={handleChange}
            value={formData.password}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>

      <div className="text-center mt-3">
        <p>or sign in with:</p>
        <button onClick={() => handleOAuth('google')} className="btn btn-outline-danger w-100 mb-2">Google</button>
        <button onClick={() => handleOAuth('github')} className="btn btn-outline-dark w-100 mb-2">GitHub</button>
        {/* <button onClick={() => handleOAuth('facebook')} className="btn btn-outline-primary w-100">Facebook</button> */}
      </div>
    </div>
  );
}

export default LoginPage;
