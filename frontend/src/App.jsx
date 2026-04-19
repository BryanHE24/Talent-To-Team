import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CandidatePortal from './pages/CandidatePortal';
import HRDashboard from './pages/HRDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CandidatePortal />} />
          <Route 
            path="/hr" 
            element={
              <ProtectedRoute>
                <HRDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
