// src/Home/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDarkMode } from "../Theme/DarkModeContext";

const DashboardPage = () => {
  const [reportData, setReportData] = useState([]);
  const [topUser, setTopUser] = useState(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const db = getDatabase();
    const accountsRef = ref(db, "accounts");

    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const users = Object.values(data);

      const monthlyActivity = {};
      const totalActivity = {};

      users.forEach((user) => {
        if (user.lastSignIn) {
          const date = new Date(user.lastSignIn);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // ex: 2025-9

          if (!monthlyActivity[monthKey]) {
            monthlyActivity[monthKey] = {};
          }

          if (!monthlyActivity[monthKey][user.username]) {
            monthlyActivity[monthKey][user.username] = 0;
          }

          monthlyActivity[monthKey][user.username] += 1;

          // Count for top active user
          if (!totalActivity[user.username]) {
            totalActivity[user.username] = 0;
          }
          totalActivity[user.username] += 1;
        }
      });

      // Transform into chart-friendly format
      const chartData = Object.entries(monthlyActivity).map(([month, userCounts]) => ({
        month,
        ...userCounts,
      }));

      setReportData(chartData);

      // Find most active user
      let maxUser = null;
      let maxCount = 0;
      Object.entries(totalActivity).forEach(([username, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxUser = username;
        }
      });

      setTopUser(maxUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className={`min-h-screen p-6 transition-colors ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-sky-50 to-sky-100 text-gray-900"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome to Admin Dashboard 🎉
      </h1>
      <p className="opacity-80 text-center mb-10">This is your control panel.</p>

      {/* ✅ Bar Chart for Monthly Online Activity */}
      <div
        className={`shadow-2xl rounded-2xl p-6 md:p-10 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 text-sky-500 text-center">
          Monthly Active Users Report 📊
        </h2>

        {topUser && (
          <p className="text-center mb-6 font-semibold">
            🏆 Most Active User:{" "}
            <span className="text-sky-500">{topUser}</span>
          </p>
        )}

        {reportData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

              {/* Dynamically generate bars for each user */}
              {Object.keys(reportData[0])
                .filter((key) => key !== "month")
                .map((username, index) => (
                  <Bar
                    key={index}
                    dataKey={username}
                    fill={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                    barSize={40}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">No activity data yet</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
