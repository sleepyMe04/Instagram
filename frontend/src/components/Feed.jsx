import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import RepostModal from './RepostModal';
import api from '../api/axios';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repostTarget, setRepostTarget] = useState(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    api.get('/posts/feed')
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err);
        setError('Could not load posts. Is the backend running?');
        setLoading(false);
      });
  }, []);

  const handleLike = async (postId, liked) => {
    try {
      const res = await api.put(`/posts/${postId}/like`, { liked });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleOpenRepost = (post) => setRepostTarget(post);

  const handleConfirmRepost = async (caption) => {
    try {
      await api.put(`/posts/${repostTarget._id}/repost`, { reposted: true });
    } catch (err) {
      console.error('Repost failed:', err);
    }
    // Replace the original post in-place with the reposted version (adds repost badge)
    // so no duplicate appears in the feed.
    setPosts(prev => prev.map(p =>
      p._id === repostTarget._id
        ? { ...p, repostCaption: caption }
        : p
    ));
    setRepostTarget(null);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleCancelRepost = () => setRepostTarget(null);

  if (loading) return (
    <div className="ig-feed-loading">
      {[1, 2, 3].map(i => (
        <div key={i} className="ig-post ig-skeleton">
          <div className="ig-skeleton-header">
            <div className="ig-skeleton-avatar" />
            <div className="ig-skeleton-lines">
              <div className="ig-skeleton-line short" />
              <div className="ig-skeleton-line xshort" />
            </div>
          </div>
          <div className="ig-skeleton-image" />
          <div className="ig-skeleton-footer">
            <div className="ig-skeleton-line medium" />
            <div className="ig-skeleton-line long" />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="ig-feed-error">
      <span>⚠️</span>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="ig-feed">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onRepost={handleOpenRepost}
          onLike={handleLike}
        />
      ))}

      {repostTarget && (
        <RepostModal
          post={repostTarget}
          onCancel={handleCancelRepost}
          onConfirm={handleConfirmRepost}
        />
      )}

      {toast && (
        <div className="ig-repost-toast">✓ Reposted to your feed</div>
      )}
    </div>
  );
}
