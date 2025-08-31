import { BookOpen, RefreshCw, Cpu, ClipboardList, Moon } from "lucide-react"; // ✅ icons

const About = () => {
  return (
    <div className="px-6 md:px-16 py-10  dark:text-gray-900 bg-white  min-h-screen">
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
          {/* Grammar Checking */}
          <div className="bg-gray-100 dark:bg-gray-200 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
            <BookOpen size={36} className="text-sky-500 mb-3" />
            <h3 className="font-semibold text-lg">Grammar Checking</h3>
            <p className="text-sm">
              Tool to catch grammar, punctuation, and style mistakes.
            </p>
          </div>

          {/* Paraphrase */}
          <div className="bg-gray-100 dark:bg-gray-200 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
            <RefreshCw size={36} className="text-green-500 mb-3" />
            <h3 className="font-semibold text-lg">Paraphrase</h3>
            <p className="text-sm">
              Rewrite sentences while keeping the original meaning.
            </p>
          </div>

          {/* Arregmatica AI */}
          <div className="bg-gray-100 dark:bg-gray-200 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
            <Cpu size={36} className="text-purple-500 mb-3" />
            <h3 className="font-semibold text-lg">Arregmatica AI</h3>
            <p className="text-sm">The intelligent core of our platform.</p>
          </div>

          {/* Quiz */}
          <div className="bg-gray-100 dark:bg-gray-200 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
            <ClipboardList size={36} className="text-orange-500 mb-3" />
            <h3 className="font-semibold text-lg">Quiz</h3>
            <p className="text-sm">
              Practice grammar knowledge with interactive quizzes.
            </p>
          </div>

         
        </div>
      </div>

     {/* Team Section */}
<div className="mt-16">
  <h2 className="text-center text-3xl font-bold mb-8">Our Team</h2>
  
  <div className="flex justify-center">
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[
        "Princess Aviona Amad",
        "Ivan Barnedo",
        "Jm Bendanillo",
        "Ruzzel Polinar",
        "Rey Adrian Porras",
        "Rinoa Amber Torrecampo",
        "Curl Joseph Villanueva",
      ].map((name, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-200 rounded-xl shadow-md p-6 text-center hover:scale-105 transition-transform"
        >
          <div className="w-16 h-16 mx-auto bg-sky-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3">
            {name.charAt(0)}
          </div>
          <p className="font-medium">{name}</p>
        </div>
      ))}
    </div>
  </div>
</div>
</div>

  );
};

export default About;
