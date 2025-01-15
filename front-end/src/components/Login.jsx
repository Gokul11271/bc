import React, { useState } from "react";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between admin and user login
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`${result.role} login successful`);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Failed to login. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isRegistering ? "Admin Login" : "User Login"}
        </h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 underline"
          >
            Switch to {isRegistering ? "User Login" : "Admin Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
