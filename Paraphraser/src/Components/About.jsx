import {
  BookOpen,
  RefreshCw,
  Cpu,
  ClipboardList,
  Type,
  PenTool,
  FileText,
} from "lucide-react"; // ✅ icons
import aviona from "../assets/Student/aviona.png";
import curl from "../assets/Student/Curl Joseph.png";
import ivan from "../assets/Student/Ivan Barnedo.png";
import jm from "../assets/Student/Jm.png";
import rey from "../assets/Student/Rey Adrian.png";
import rinoa from "../assets/Student/Rinoa.png";
import ruzzel from "../assets/Student/Ruzzel.png";
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ dark mode

const About = () => {
  const { darkMode } = useDarkMode(); // ✅ get dark mode state

  const teamMembers = [
    { name: "Princess Aviona Amad", image: aviona },
    { name: "Ivan Barnedo", image: ivan },
    { name: "Jm Bendanillo", image: jm },
    { name: "Ruzzel Polinar", image: ruzzel },
    { name: "Rey Adrian Porras", image: rey },
    { name: "Rinoa Amber Torrecampo", image: rinoa },
    { name: "Curl Joseph Villanueva", image: curl },
  ];

  const featureCards = [
    { icon: <BookOpen size={36} className="text-sky-500 mb-3" />, title: "Grammar Checking", desc: "Catch grammar, punctuation, and style mistakes." },
    { icon: <RefreshCw size={36} className="text-green-500 mb-3" />, title: "Paraphrase", desc: "Rewrite sentences while keeping the meaning." },
    { icon: <Cpu size={36} className="text-purple-500 mb-3" />, title: "Arregmatica AI", desc: "The intelligent core of our platform." },
    { icon: <ClipboardList size={36} className="text-orange-500 mb-3" />, title: "Quiz", desc: "Practice grammar knowledge with interactive quizzes." },
    { icon: <Type size={36} className="text-indigo-500 mb-3" />, title: "Text Enhancer", desc: "Polish and refine sentences for clarity." },
    { icon: <BookOpen size={36} className="text-yellow-500 mb-3" />, title: "Dictionary", desc: "Look up meanings, synonyms, and examples." },
    { icon: <PenTool size={36} className="text-pink-500 mb-3" />, title: "Humanize Word", desc: "Make AI-generated text sound more natural." },
    { icon: <FileText size={36} className="text-red-500 mb-3" />, title: "Essay Checker", desc: "Check essays for grammar and readability." },
  ];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} px-6 md:px-16 py-10 min-h-screen`}>
      {/* Title */}
      <h1 className="text-center text-4xl font-bold mb-12">About Us</h1>

      {/* About + Features Section */}
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left Text */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">About Arregmatica</h2>
          <p className="mb-4">
            <strong>Arregmatica</strong> is a website dedicated to help
            individuals, particularly students, to improve writing accuracy. Our
            grammar checking platform is designed with precision, ensuring that
            every function is clear, polished, and professional.
          </p>
          <p className="mb-4">
            From grammar and punctuations to style and tone, our intelligent
            system provides accurate suggestions to enhance your writing. This
            website ensures that your work reflects clarity and credibility.
          </p>
          <p className="mb-6">
            Our goal is to make high-quality writing support accessible,
            reliable, and effortless—empowering you to communicate with
            confidence in every context.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="mb-6">
            Many Grade 12 Students in Antipolo City Senior High School struggle
            in writing proper sentences, grammar structure, and more. We had an
            idea to create a grammar checking website to help students with this
            problem. The origin of the name <strong>"Arregmatica"</strong> comes
            from the words <em>arreglar</em> (Spanish for "to fix") and{" "}
            <em>grammatica</em> (Latin for "grammar"). When combined and
            translated into English, it means <strong>"Fix Grammar."</strong>
          </p>
        </div>

        {/* Right Side Feature Cards */}
        <div className="grid grid-cols-2 gap-6">
          {featureCards.map((card, idx) => (
            <div
              key={idx}
              className={`${darkMode ? "bg-gray-800 shadow-gray-700" : "bg-gray-100 shadow-md"} rounded-xl p-6 flex flex-col items-center text-center`}
            >
              {card.icon}
              <h3 className="font-semibold text-lg">{card.title}</h3>
              <p className="text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mt-16">
        <h2 className="text-center text-3xl font-bold mb-8">Our Team</h2>

        <div className="flex justify-center">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`${darkMode ? "bg-gray-800 shadow-gray-700" : "bg-white shadow-md"} rounded-xl p-6 text-center hover:scale-105 transition-transform`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full mb-3 object-cover"
                />
                <p className="font-medium">{member.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
