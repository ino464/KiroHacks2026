import React, { useEffect, useState } from "react";
import { getComments, createComment, deleteComment, likeComment } from "../api";
import { useAuth } from "../context/AuthContext";

function LikeBar({ likes, dislikes, userVote, onLike, onDislike, disabled }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onLike}
        disabled={disabled}
        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs transition ${
          userVote === true
            ? "bg-green-100 text-green-700 font-semibold"
            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
        } disabled:opacity-40`}
      >
        👍 {likes}
      </button>
      <button
        onClick={onDislike}
        disabled={disabled}
        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs transition ${
          userVote === false
            ? "bg-red-100 text-red-700 font-semibold"
            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
        } disabled:opacity-40`}
      >
        👎 {dislikes}
      </button>
    </div>
  );
}

export default function CommentsSection({ landmarkId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => getComments(landmarkId).then(r => setComments(r.data));

  useEffect(() => { load(); }, [landmarkId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await createComment(landmarkId, body.trim());
      setBody("");
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete your comment?")) return;
    await deleteComment(commentId);
    load();
  };

  const handleCommentLike = async (commentId, isLike) => {
    await likeComment(commentId, isLike);
    load();
  };

  return (
    <div className="mt-2 border-t pt-2">
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
        💬 Comments {comments.length > 0 && `(${comments.length})`}
      </h4>

      {/* Comment list */}
      <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            No comments yet — be the first!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg px-2.5 py-2">
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-gray-700">{c.author.username}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-1.5">{c.body}</p>
              <div className="flex items-center justify-between">
                <LikeBar
                  likes={c.likes}
                  dislikes={c.dislikes}
                  userVote={c.user_vote}
                  onLike={() => handleCommentLike(c.id, true)}
                  onDislike={() => handleCommentLike(c.id, false)}
                  disabled={!user}
                />
                {user && user.id === c.author.id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New comment form */}
      {user ? (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slo-green"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="bg-slo-green text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-800 transition disabled:opacity-40"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="text-xs text-gray-400 text-center">Sign in to comment</p>
      )}
    </div>
  );
}
