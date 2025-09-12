import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue, remove } from "firebase/database";
import { ArrowRight, Trash2 } from "lucide-react";

const History = () => {
  const [grammarHistory, setGrammarHistory] = useState([]);
  const [improveHistory, setImproveHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // "grammar" | "improve"

  useEffect(() => {
    const grammarRef = ref(database, "grammar");
    const improveRef = ref(database, "improve");

    // ✅ Grammar listener
    onValue(grammarRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setGrammarHistory(list);
      } else {
        setGrammarHistory([]);
      }
    });

    // ✅ Improve listener
    onValue(improveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setImproveHistory(list);
      } else {
        setImproveHistory([]);
      }
    });
  }, []);

  // ✅ Confirm delete function
  const confirmDelete = (type) => {
    setDeleteType(type);
    setModalOpen(true);
  };

  // ✅ Actual delete function
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-sky-50 to-sky-200 px-4 py-8 md:px-8">
       <h1 className="text-4xl md:text-5xl font-extrabold text-sky-700 mb-10 text-center tracking-tight">
        History
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left Box - Grammar */}
        <div className="flex flex-col min-h-[300px] bg-green-50 border-2 border-green-400 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-800">✅ Grammar</h2>
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
                  className="flex items-center gap-4 bg-white shadow rounded-xl p-4"
                >
                  {/* Percent Circle */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm text-red-600 relative"
                      style={{
                        background: `conic-gradient(#ef4444 ${
                          item.percent * 3.6
                        }deg, #fde8e8 ${item.percent * 3.6}deg)`,
                      }}
                    >
                      <div className="absolute w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input text */}
                  <div className="flex-1 border border-gray-200 bg-gray-50 rounded-lg p-3 text-gray-700 text-sm leading-relaxed shadow-inner">
                    {item.input}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="text-gray-500 w-6 h-6 flex-shrink-0" />

                  {/* Result text */}
                  <div className="flex-1 border border-green-300 bg-green-50 rounded-lg p-3 text-green-800 text-sm leading-relaxed shadow-inner">
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-700 text-sm">
              No grammar history found yet.
            </p>
          )}
        </div>

        {/* Right Box - Improve */}
        <div className="flex flex-col min-h-[300px] bg-violet-50 border-2 border-violet-400 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-violet-800">✨ Improve</h2>
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
                  className="flex items-center gap-4 bg-white shadow rounded-xl p-4"
                >
                  {/* Input text */}
                  <div className="flex-1 border border-gray-200 bg-gray-50 rounded-lg p-3 text-gray-700 text-sm leading-relaxed shadow-inner">
                    {item.input}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="text-gray-500 w-6 h-6 flex-shrink-0" />

                  {/* Result text */}
                  <div className="flex-1 border border-violet-300 bg-violet-50 rounded-lg p-3 text-violet-800 text-sm leading-relaxed shadow-inner">
                    {item.result}
                    <div className="mt-2 text-xs text-gray-500 italic">
                      Style: {item.style}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-violet-700 text-sm">
              No improve history found yet.
            </p>
          )}
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
  {/* ✅ Confirmation Modal */}
{modalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Are you sure?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        This action cannot be undone. The{" "}
        <span className="font-semibold text-red-600">
          {deleteType === "grammar" ? "Grammar" : "Improve"}
        </span>{" "}
        history will be permanently deleted.
      </p>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setModalOpen(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
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
