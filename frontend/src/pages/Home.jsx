import { useState } from 'react';
import Feed from '../components/Feed';

const HomeIcon = () => (<svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z" /></svg>);
const SearchIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="7.5" /><line x1="16.5" x2="22" y1="16.5" y2="22" /></svg>);
const HeartNavIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
const CreateIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const MessageIcon = () => (<svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);

export default function Home() {
  return (
    <>
      <nav className="ig-navbar">
        <div className="ig-navbar-logo">Instagram</div>
        <div className="ig-navbar-icons">
          <button className="ig-nav-btn" title="New Post"><CreateIcon /></button>
          <button className="ig-nav-btn" title="Notifications"><HeartNavIcon /></button>
          <button className="ig-nav-btn" title="Messages"><MessageIcon /></button>
        </div>
      </nav>

      <Feed />
    </>
  );
}