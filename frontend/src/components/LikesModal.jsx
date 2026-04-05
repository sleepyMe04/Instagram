import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function LikesModal({ postId, initialCount, onClose }) {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(initialCount || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLikes() {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${postId}/likes`);
        if (cancelled) return;
        setUsers(response.data.users || []);
        setCount(response.data.count || 0);
        setError(null);
      } catch (requestError) {
        if (cancelled) return;
        console.error('Failed to load likes:', requestError);
        setError('Could not load likes for this post.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLikes();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <div className="ig-modal-overlay" onClick={onClose}>
      <div className="ig-likes-sheet" onClick={event => event.stopPropagation()}>
        <button type="button" className="ig-likes-close" onClick={onClose} aria-label="Close likes list">
          ×
        </button>

        <div className="ig-likes-header">Likes</div>

        {loading && (
          <div className="ig-likes-state">Loading likes...</div>
        )}

        {!loading && error && (
          <div className="ig-likes-state ig-likes-error">{error}</div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="ig-likes-state">No users are attached to these likes yet.</div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="ig-likes-list">
            {users.map(user => (
              <div key={user._id} className="ig-likes-row">
                <img
                  src={user.avatarUrl || `https://i.pravatar.cc/48?u=${user.username}`}
                  alt={user.username}
                  className="ig-likes-avatar"
                />
                <div className="ig-likes-meta">
                  <div className="ig-likes-username">
                    {user.username}
                    {user.isVerified && <span className="ig-likes-verified">Verified</span>}
                  </div>
                  <div className="ig-likes-name">{user.fullName}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ig-likes-footer">{count.toLocaleString()} likes</div>
      </div>
    </div>
  );
}
