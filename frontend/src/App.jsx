
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizDashboard from './pages/QuizDashboard';
import QuizPage from "./pages/QuizPage";
import QuizHistory from './pages/QuizHistory';
import AdminDashboard from './pages/AdminDashboard';
import UserPerformance from './pages/UserPerformance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quizzes" element={<QuizDashboard />} />
      <Route path="/quiz/:id" element={<QuizPage />} />
      <Route path="/quiz-history" element={<QuizHistory />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/user/:id/performance" element={<UserPerformance />} />
    </Routes>
  );
}

export default App;
