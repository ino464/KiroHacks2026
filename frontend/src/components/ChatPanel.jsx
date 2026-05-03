import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api";

const SUGGESTIONS = [
  "Best beginner hike near SLO?",
  "What should I bring on Bishop Peak?",
  "Is Montana de Oro good for sunset?",
  "Hardest trail in the area?",
];

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Hey! I'm your SLO Trail Guide 🏔️ Ask me anything about hiking trails, what to bring, best times to visit, or trail conditions around San Luis Obispo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      // Send all messages except the initial greeting
      const history = updated.slice(1);
      const res = await sendChatMessage(history);
      setMessages([...updated, { role: "model", content: res.data.reply }]);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || "Unknown error";
      setMessages([...updated, {
        role: "model",
        content: `Error: ${detail}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    send(input.trim());
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
      style={{ height: "520px" }}>

      {/* Header */}
      <div className="bg-slo-green text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <div className="font-bold text-sm">SLO Trail Guide</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "model" && (
              <div className="w-7 h-7 rounded-full bg-slo-green/10 flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5">
                🏔️
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-slo-green text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-slo-green/10 flex items-center justify-center text-sm shrink-0 mr-2">
              🏔️
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only show at start */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-slo-green/10 text-slo-green px-2.5 py-1 rounded-full hover:bg-slo-green/20 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about trails..."
          disabled={loading}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-slo-green text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition disabled:opacity-40"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
