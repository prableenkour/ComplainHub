import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register-admin",
        { name, email, password, adminSecret }
      );

      alert("Admin registered successfully");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error registering admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">

        <h2 className="text-3xl font-bold text-center mb-6">
          Admin Registration 👑
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="password"
            placeholder="Admin Secret"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold transition hover:scale-105"
          >
            Register Admin
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegister;