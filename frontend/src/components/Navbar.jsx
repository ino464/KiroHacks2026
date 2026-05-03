import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import StatsPanel from "./StatsPanel";
import MessagesPanel from "./MessagesPanel";
import ChatPanel from "./ChatPanel";
import ObjectivesPanel from "./ObjectivesPanel";
import { getUnreadCount } from "../api";

export default function Navbar({ onMessage, messageTarget }) {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showStats, setShowStats] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = () => getUnreadCount().then(r => setUnread(r.data.unread)).catch(() => {});
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Allow parent to trigger opening messages
  useEffect(() => {
    if (messageTarget) {
      setMsgTarget(messageTarget);
      setShowMessages(true);
    }
  }, [messageTarget]);

  const openLogin = () => { setAuthMode("login"); setShowAuth(true); };
  const openRegister = () => { setAuthMode("register"); setShowAuth(true); };

  const handleOpenMessage = (username) => {
    setMsgTarget(username);
    setShowMessages(true);
  };

  return (
    <>
      <nav className="bg-slo-green text-white px-4 py-3 flex items-center justify-between shadow-md z-50 relative">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img src="/logo.png" alt="SLO Explorer" className="w-10 h-10 rounded-full object-cover" />
          <span>SLO Your Soul</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* AI Chat button — always visible */}
          <button
            onClick={() => setShowChat(c => !c)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              showChat ? "bg-white text-slo-green font-semibold" : "bg-white/20 hover:bg-white/30"
            }`}
            title="Trail Guide AI"
          >
            Trail Guide
          </button>
          {user ? (
            <>
              {/* Messages */}
              <button
                onClick={() => { setMsgTarget(null); setShowMessages(true); }}
                className="relative bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
                title="Messages"
              >
                Messages
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {/* Weekly Objectives */}
              <button
                onClick={() => setShowObjectives(true)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
                title="Weekly Objectives"
              >
                Objectives
              </button>

              {/* Stats */}
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

      {showMessages && (
        <MessagesPanel
          initialUsername={msgTarget}
          onClose={() => { setShowMessages(false); setMsgTarget(null); setUnread(0); }}
        />
      )}

      {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
      {showObjectives && <ObjectivesPanel onClose={() => setShowObjectives(false)} />}
    </>
  );
}
