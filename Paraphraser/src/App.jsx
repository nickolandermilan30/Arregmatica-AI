import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Home/Navbar";
import Homepage from "./Components/Homepage";
import Services from "./Components/Services";
import About from "./Components/About";
import Quiz from "./Components/Quiz";
import Multiple_choice from "./Answers/Multiple_choice";
import Four_question from "./Answers/Four_question";
import Timer_indicated from "./Answers/Undestanding";
import Login from "./Home/Login";
import Register from "./Home/Register";
import Profile from "./Components/Profile";
import History from "./Components/History";
import Stories from "./Feed/Feeds";
import ProtectedRoute from "./hooks/ProtectedRoute";
import Dictionary from "./Components/Dictionary";
import Humanize from "./Components/Humanize";
import EssaChecker from "./Components/EssaChecker";
import Landingpage from "./Components/LandingPage";
import Settings from "./Components/Settings";
import Score from "./Answers/Score";
import { DarkModeProvider } from "./Theme/DarkModeContext";
import AdminLogin from "./Home/AdminLogin";
import AdminRegister from "./Home/AdminRegister";
import Dashboard from "./Admin/Dashboard"; // ✅ import Dashboard

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />

          {/* Protected routes with Navbar */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <Routes>
                  <Route path="/home" element={<Homepage />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/feed" element={<Stories />} />
                  <Route path="/dictionary" element={<Dictionary />} />
                  <Route path="/essa-checker" element={<EssaChecker />} />
                  <Route path="/humanize" element={<Humanize />} />
                  <Route path="/landingpage" element={<Landingpage />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected routes WITHOUT Navbar */}
          <Route
            path="/score"
            element={
              <ProtectedRoute>
                <Score />
              </ProtectedRoute>
            }
          />
          <Route
            path="/multiple-choice"
            element={
              <ProtectedRoute>
                <Multiple_choice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/four-question"
            element={
              <ProtectedRoute>
                <Four_question />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timer-indicated"
            element={
              <ProtectedRoute>
                <Timer_indicated />
              </ProtectedRoute>
            }
          />

          {/* ✅ Admin Dashboard route WITHOUT Navbar */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          





        </Routes>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
