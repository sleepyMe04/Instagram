import { useState } from 'react';
import PostCard from './PostCard';
 
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
  const [posts] = useState(POSTS);
 
  return (
    <div className="ig-feed">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
        />
      ))}
    </div>
  );
}