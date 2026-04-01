import { useState } from 'react';

export default function RepostModal({ post, onCancel, onConfirm }) {
  const [caption, setCaption] = useState('');

  return (
    <div className="ig-modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="ig-repost-sheet">

        {/* drag handle */}
        <div className="ig-sheet-handle" />

        <h2 className="ig-sheet-title">Repost</h2>

        {/* preview of the post being reposted */}
        <div className="ig-repost-preview">
          <img src={post.imageUrl} alt="preview" className="ig-repost-preview-img" />
          <div className="ig-repost-preview-meta">
            <span className="ig-repost-preview-author">@{post.author}</span>
            <span className="ig-repost-preview-caption">{post.caption}</span>
          </div>
        </div>

        {/* optional caption */}
        <p className="ig-repost-caption-label">Add your thoughts (optional)</p>
        <textarea
          className="ig-repost-textarea"
          placeholder="Write something about this post…"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          maxLength={200}
        />

        {/* actions */}
        <div className="ig-sheet-actions">
          <button className="ig-sheet-cancel" onClick={onCancel}>Cancel</button>
          <button className="ig-sheet-confirm" onClick={() => onConfirm(caption)}>
            Share Now
          </button>
        </div>

      </div>
    </div>
  );
}