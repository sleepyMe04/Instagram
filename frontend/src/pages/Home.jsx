import { useState, useEffect } from 'react';
import api from '../api/axios';
import Feed from '../components/Feed';

const STORIES = [
  { user: 'your_story', you: true },
  { user: 'natgeo' },
  { user: 'ocean.vibes' },
  { user: 'neon.tokyo' },
  { user: 'wild.africa' },
  { user: 'forest.walks' },
  { user: 'street.lens' },
  { user: 'arch.daily' },
  { user: 'bloom.garden' },
  { user: 'desert.nomad' },
];

const CreateIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>);
const HeartNavIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>);
const MessageIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Home() {
  const [dark, setDark] = useState(() => localStorage.getItem('ig-dark') === '1');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('ig-dark', dark ? '1' : '0');
  }, [dark]);

  useEffect(() => {
    // Load viewer
    api.get('/users/me')
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error('Failed to fetch current user:', err));
  }, []);

  return (
    <>
      <nav className="ig-navbar">
        <div className="ig-navbar-logo">Instagram</div>
        <div className="ig-navbar-icons">
          <button className="ig-nav-btn" title="New Post"><CreateIcon/></button>
          <button className="ig-nav-btn" title="Notifications"><HeartNavIcon/></button>
          <button className="ig-nav-btn" title="Messages"><MessageIcon/></button>
          <button className="ig-nav-btn ig-dark-toggle" title="Toggle dark mode"
            onClick={() => setDark(d => !d)}>
            {dark ? <SunIcon/> : <MoonIcon/>}
          </button>
        </div>
      </nav>

      <div className="ig-layout">
        <div className="ig-feed-col">
          <div className="ig-stories-bar">
            {STORIES.map((s, i) => (
              <div key={s.user} className="ig-story-item">
                <div className={`ig-story-ring${i > 3 ? ' seen' : ''}`}>
                  <div className="ig-story-inner">
                    <img
                      // Story avatar
                      src={s.you
                        ? (currentUser?.avatarUrl || 'https://i.pravatar.cc/56?u=you.demo')
                        : `https://i.pravatar.cc/56?u=${s.user}`}
                      alt={s.user}
                    />
                  </div>
                </div>
                <span className="ig-story-name">{s.you ? 'Your story' : s.user}</span>
              </div>
            ))}
          </div>
          <Feed currentUser={currentUser}/>
        </div>
      </div>
    </>
  );
}
