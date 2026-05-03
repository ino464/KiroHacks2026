import React, { useEffect, useState, useRef } from "react";
import { getConversations, getConversation, sendMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function MessagesPanel({ initialUsername, onClose }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUsername, setActiveUsername] = useState(initialUsername || null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getConversations().then(r => setConversations(r.data));
  }, []);

  useEffect(() => {
    if (activeUsername) {
      getConversation(activeUsername).then(r => {
        setMessages(r.data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });
    }
  }, [activeUsername]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() || !activeUsername) return;
    setSending(true);
    try {
      await sendMessage(activeUsername, body.trim());
      setBody("");
      const r = await getConversation(activeUsername);
      setMessages(r.data);
      const cr = await getConversations();
      setConversations(cr.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } finally {
      setSending(false);
    }
  };

  const startConvo = (username) => {
    setActiveUsername(username);
    if (!conversations.find(c => c.other_username === username)) {
      setConversations(prev => [{
        other_user_id: 0,
        other_username: username,
        last_message: "",
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      }, ...prev]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-end z-[1000] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[70vh] flex overflow-hidden">

        {/* Sidebar — conversations */}
        <div className="w-56 border-r flex flex-col shrink-0">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Messages</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center p-4">No conversations yet</p>
            ) : (
              conversations.map(c => (
                <button
                  key={c.other_username}
                  onClick={() => setActiveUsername(c.other_username)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                    activeUsername === c.other_username ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-800 truncate">{c.other_username}</span>
                    {c.unread_count > 0 && (
                      <span className="bg-slo-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {activeUsername ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slo-green/20 flex items-center justify-center text-sm font-bold text-slo-green">
                  {activeUsername[0].toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800">{activeUsername}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-8">
                    Start a conversation with {activeUsername}
                  </p>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        isMine
                          ? "bg-slo-green text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        <p>{msg.body}</p>
                        <p className={`text-xs mt-0.5 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <input
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={`Message ${activeUsername}...`}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green"
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="bg-slo-green text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation or click a username to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
