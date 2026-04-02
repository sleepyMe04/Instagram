import { useState } from 'react';
import PostCard from './PostCard';
import RepostModal from './RepostModal';



const POSTS = [
  {
    _id: 'post-1',
    author: 'natgeo',
    imageUrl: 'https://picsum.photos/seed/mountain123/600/600',
    caption: 'The mountains are calling and I must go 🏔️ #nature #adventure #explore',
    likes: 48291,
  },
  {
    _id: 'post-2',
    author: 'foodie.world',
    imageUrl: 'https://picsum.photos/seed/brunch456/600/600',
    caption: 'Sunday brunch hits different 🍳☕ #foodie #brunch #weekend',
    likes: 7843,
  },
  {
    _id: 'post-3',
    author: 'cityscapes',
    imageUrl: 'https://picsum.photos/seed/city789/600/600',
    caption: 'Golden hour in the city ✨ #urban #photography #goldenhour',
    likes: 12950,
  },
];
 


export default function Feed() {
  const [posts, setPosts] = useState(POSTS);
  const [repostTarget, setRepostTarget] = useState(null); // post being reposted
  const [toast, setToast] = useState(false);

  // Called when user clicks repost icon on any PostCard
  const handleOpenRepost = (post) => {
    setRepostTarget(post);
  };

  // Called when user confirms repost inside the modal
  const handleConfirmRepost = (caption) => {
    const repostedPost = {
      ...repostTarget,
      _id: `repost-${repostTarget._id}-${Date.now()}`,
      repostCaption: caption, // undefined means not a repost; empty string is a repost with no caption
    };
    setPosts(prev => [repostedPost, ...prev]);
    setRepostTarget(null);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleCancelRepost = () => {
    setRepostTarget(null);
  };

  return (
    <div className="ig-feed">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onRepost={handleOpenRepost}
        />
      ))}

      {/* Repost bottom-sheet modal */}
      {repostTarget && (
        <RepostModal
          post={repostTarget}
          onCancel={handleCancelRepost}
          onConfirm={handleConfirmRepost}
        />
      )}

      {/* Toast confirmation */}
      {toast && (
        <div className="ig-repost-toast">✓ Reposted to your feed</div>
      )}
    </div>
  );
}