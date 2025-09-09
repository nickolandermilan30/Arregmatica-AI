import React, { useState } from "react";
import { Eye, EyeOff, UserCheck, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import bgImage from "../assets/bg_picture.png";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (password !== confirm) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      // ✅ Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Update profile (only displayName)
      await updateProfile(user, {
        displayName: username,
      });

      // ✅ Show success modal
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative bg-white shadow-lg rounded-2xl p-10 w-full max-w-5xl grid md:grid-cols-2 gap-8">
        
        {/* Left side: Why register */}
        <div className="flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-2xl font-bold mb-4">Why Register / Login?</h2>
          <p className="text-gray-600 mb-8">
            Creating an account gives you secure access, personalized features, 
            and exclusive content. Start your journey today!
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <UserCheck size={32} className="text-blue-600 mb-2" />
              <span className="text-sm text-gray-700">Easy Access</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield size={32} className="text-green-600 mb-2" />
              <span className="text-sm text-gray-700">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <Star size={32} className="text-yellow-500 mb-2" />
              <span className="text-sm text-gray-700">Exclusive</span>
            </div>
          </div>
        </div>

        {/* Right side: Form */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                name="username"
                type="text"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-2 pr-10 border rounded-lg focus:ring focus:ring-blue-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full p-2 pr-10 border rounded-lg focus:ring focus:ring-blue-300"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-1/2 bg-white text-gray-800 p-2 rounded-lg shadow hover:bg-gray-100 transition border"
              >
                Go Back Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
            <h3 className="text-xl font-semibold mb-4">🎉 You are registered!</h3>
            <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/"); // go to login page
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
