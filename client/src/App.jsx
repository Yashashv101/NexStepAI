import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoalSelection from './pages/GoalSelection';
import SkillLevel from './pages/SkillLevel';
import TimeSelection from './pages/TimeSelection';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<GoalSelection />} />
          <Route path="/skill-level" element={<SkillLevel />} />
          <Route path="/time-selection" element={<TimeSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;