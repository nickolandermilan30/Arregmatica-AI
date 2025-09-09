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
import ProtectedRoute from "./hooks/ProtectedRoute"; // ✅ import
import Dictionary from "./Components/Dictionary";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
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
                <Route path="/dictionary" element={<Dictionary />} />
                <Route path="/multiple-choice" element={<Multiple_choice />} />
                <Route path="/four-question" element={<Four_question />} />
                <Route path="/timer-indicated" element={<Timer_indicated />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
