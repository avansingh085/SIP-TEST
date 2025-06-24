import React, { useState } from "react";

const AuthPanel = ({ onAuthenticated }) => {
  const [mode, setMode] = useState("register"); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      return alert("Username and password are required");
    }
    

    try {
      const endpoint = mode === "register"
        ? `${import.meta.env.VITE_BACKEND_URL}/users/register`
        : `${import.meta.env.VITE_BACKEND_URL}/users/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        onAuthenticated({ username, password }); 
      }
    } catch (err) {
      console.error(err);
      alert(`${mode === "register" ? "Registration" : "Login"} failed`);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded text-white max-w-md mx-auto mt-10">
      <h2 className="text-lg mb-4 font-semibold text-center">
        {mode === "register" ? "Register" : "Login"}
      </h2>

      <input
        className="p-2 mb-3 w-full rounded bg-gray-700 text-white placeholder-gray-400"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="p-2 mb-3 w-full rounded bg-gray-700 text-white placeholder-gray-400"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-medium"
      >
        {mode === "register" ? "Register & Login" : "Login"}
      </button>

      <p className="mt-3 text-sm text-gray-400 text-center">
        {mode === "register" ? (
          <>
            Already registered?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-blue-400 underline"
            >
              Login here
            </button>
          </>
        ) : (
          <>
            New user?{" "}
            <button
              onClick={() => setMode("register")}
              className="text-blue-400 underline"
            >
              Register here
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthPanel;
