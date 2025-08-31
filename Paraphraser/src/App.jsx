import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Home/Navbar";
import Homepage from "./Components/Homepage";
import Services from "./Components/Services";
import About from "./Components/About";
import Quiz from "./Components/Quiz";
import Multiple_choice from "./Answers/Multiple_choice"; // ✅ import component
import Four_question from "./Answers/Four_question"; // ✅ import
import Timer_indicated from "./Answers/Undestanding"; // ✅ import

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/multiple-choice" element={<Multiple_choice />} />
         <Route path="/four-question" element={<Four_question />} />
         <Route path="/timer-indicated" element={<Timer_indicated />} />
      </Routes>
    </Router>
  );
};

export default App;
