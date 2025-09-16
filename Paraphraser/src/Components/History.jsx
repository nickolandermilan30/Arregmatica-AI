import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue, remove } from "firebase/database";
import { ArrowRight, Trash2 } from "lucide-react";
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ Import dark mode

const History = () => {
  const [grammarHistory, setGrammarHistory] = useState([]);
  const [improveHistory, setImproveHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);

  const { darkMode } = useDarkMode(); // ✅ Use dark mode

  useEffect(() => {
    const grammarRef = ref(database, "grammar");
    const improveRef = ref(database, "improve");

    onValue(grammarRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setGrammarHistory(list);
      } else setGrammarHistory([]);
    });

    onValue(improveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setImproveHistory(list);
      } else setImproveHistory([]);
    });
  }, []);

  const confirmDelete = (type) => {
    setDeleteType(type);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === "grammar") {
        await remove(ref(database, "grammar"));
        setGrammarHistory([]);
      } else if (deleteType === "improve") {
        await remove(ref(database, "improve"));
        setImproveHistory([]);
      }
      setModalOpen(false);
      setDeleteType(null);
    } catch (error) {
      console.error("❌ Error deleting history:", error);
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-b from-sky-50 to-sky-200 text-gray-900"} min-h-screen flex flex-col items-center justify-start px-4 py-8 md:px-8`}>
      <h1 className={`text-4xl md:text-5xl font-extrabold mb-10 text-center tracking-tight ${darkMode ? "text-white" : "text-sky-700"}`}>
        History
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Grammar */}
        <div className={`flex flex-col min-h-[300px] rounded-xl shadow p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-green-50 border-green-400"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? "text-green-400" : "text-green-800"}`}>✅ Grammar</h2>
            {grammarHistory.length > 0 && (
              <button
                onClick={() => confirmDelete("grammar")}
                className="w-9 h-9 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-transform hover:scale-110"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {grammarHistory.length > 0 ? (
            <div className="space-y-6">
              {grammarHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-xl p-4 shadow ${darkMode ? "bg-gray-700" : "bg-white"}`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm text-red-600 relative"
                      style={{
                        background: `conic-gradient(#ef4444 ${item.percent * 3.6}deg, ${darkMode ? "#4b5563" : "#fde8e8"} ${item.percent * 3.6}deg)`,
                      }}
                    >
                      <div className={`absolute w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                        <span className="text-xs font-semibold">{item.percent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex-1 rounded-lg p-3 leading-relaxed shadow-inner ${darkMode ? "bg-gray-700 border border-gray-600 text-gray-100" : "bg-gray-50 border border-gray-200 text-gray-700"}`}>
                    {item.input}
                  </div>

                  <ArrowRight className="text-gray-500 w-6 h-6 flex-shrink-0" />

                  <div className={`flex-1 rounded-lg p-3 leading-relaxed shadow-inner ${darkMode ? "bg-gray-800 border border-green-600 text-green-400" : "bg-green-50 border border-green-300 text-green-800"}`}>
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${darkMode ? "text-gray-400" : "text-green-700"} text-sm`}>
              No grammar history found yet.
            </p>
          )}
        </div>

        {/* Improve */}
        <div className={`flex flex-col min-h-[300px] rounded-xl shadow p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-violet-50 border-violet-400"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? "text-violet-400" : "text-violet-800"}`}>✨ Improve</h2>
            {improveHistory.length > 0 && (
              <button
                onClick={() => confirmDelete("improve")}
                className="w-9 h-9 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-transform hover:scale-110"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {improveHistory.length > 0 ? (
            <div className="space-y-6">
              {improveHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-xl p-4 shadow ${darkMode ? "bg-gray-700" : "bg-white"}`}
                >
                  <div className={`flex-1 rounded-lg p-3 leading-relaxed shadow-inner ${darkMode ? "bg-gray-700 border border-gray-600 text-gray-100" : "bg-gray-50 border border-gray-200 text-gray-700"}`}>
                    {item.input}
                  </div>

                  <ArrowRight className="text-gray-500 w-6 h-6 flex-shrink-0" />

                  <div className={`flex-1 rounded-lg p-3 leading-relaxed shadow-inner ${darkMode ? "bg-gray-800 border border-violet-600 text-violet-400" : "bg-violet-50 border border-violet-300 text-violet-800"}`}>
                    {item.result}
                    <div className={`mt-2 text-xs italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Style: {item.style}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${darkMode ? "text-gray-400" : "text-violet-700"} text-sm`}>
              No improve history found yet.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className={`p-6 rounded-xl shadow-lg w-80 text-center ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
            <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              This action cannot be undone. The{" "}
              <span className="font-semibold text-red-600">
                {deleteType === "grammar" ? "Grammar" : "Improve"}
              </span>{" "}
              history will be permanently deleted.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className={`px-4 py-2 rounded-lg border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
