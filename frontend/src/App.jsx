import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CandidatePortal from './pages/CandidatePortal';
import HRDashboard from './pages/HRDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
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
  );
}

export default App;
