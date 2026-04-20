import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CandidatePortal from './pages/CandidatePortal';
import HRDashboard from './pages/HRDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// HRDashboard now handles its own auth guard with the premium login screen.
// CandidatePortal is public — no auth required.

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/"   element={<CandidatePortal />} />
          <Route path="/hr" element={<HRDashboard />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

