'use client';

import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">🌿</div>
        <span>EcoHarmony Park</span>
      </div>
      
      <div className="nav-section">
        <div className="user-info">
          <div className="user-avatar">JD</div>
          <span className="user-name">Juan Pérez</span>
        </div>
        
        <button 
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}