import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";

export default function App() {
  const [messageTarget, setMessageTarget] = useState(null);

  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar
          messageTarget={messageTarget}
          onMessage={setMessageTarget}
        />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<MapView onMessage={setMessageTarget} />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
