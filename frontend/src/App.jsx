import React,{ useState } from "react";
import Register from "./components/RegisterUser"
import CallPanel from "./components/CallPanel";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-gray-800 flex justify-center items-start p-6">
      <div className="w-full max-w-md">
        {user ? <CallPanel sipCreds={user} /> : <Register onAuthenticated={setUser} />}
      </div>
    </div>
  );
}

export default App;
