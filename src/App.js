import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Registerpage from './pages/Registerpage';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Registerpage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage/>} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} /> 
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
