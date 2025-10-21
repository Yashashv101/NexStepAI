import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import GoalSelection from './pages/GoalSelection';
import SkillLevel from './pages/SkillLevel';
import TimeSelection from './pages/TimeSelection';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import SuggestedGoals from './pages/SuggestedGoals';
import CuratedRoadmap from './pages/CuratedRoadmap';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<GoalSelection />} />
              <Route path="/skill-level" element={<SkillLevel />} />
              <Route path="/time-selection" element={<TimeSelection />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume-upload" element={<ResumeUpload />} />
              <Route path="/suggested-goals" element={<SuggestedGoals />} />
              <Route path="/roadmap" element={<CuratedRoadmap />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;