import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openLogin = () => { setAuthMode("login"); setShowAuth(true); };
  const openRegister = () => { setAuthMode("register"); setShowAuth(true); };

  return (
    <>
      <nav className="bg-slo-green text-white px-4 py-3 flex items-center justify-between shadow-md z-50 relative">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-2xl">🏔️</span>
          <span>SLO Explorer</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm opacity-80">Hi, {user.username}</span>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={openLogin}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
              >
                Sign in
              </button>
              <button
                onClick={openRegister}
                className="bg-white text-slo-green font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-slo-sand transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
      )}
    </>
  );
}
