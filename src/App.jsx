import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page 1: User Sign Up Page (/signup and /) */}
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Page 2: User Login Page (/login) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
