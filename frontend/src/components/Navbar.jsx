import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import StatsPanel from "./StatsPanel";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showStats, setShowStats] = useState(false);

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
              <button
                onClick={() => setShowStats(true)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5"
                title="My Stats"
              >
                <span>📊</span>
                <span className="hidden sm:inline">{user.username}</span>
              </button>
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

      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
    </>
  );
}
