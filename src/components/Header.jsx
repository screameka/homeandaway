import React from 'react';
import './Header.css';

export function Header() {
  return (
    <header className="site-header site-container">
      <div className="header-wordmark">
        <a href="#">HOME &amp; AWAY</a>
      </div>
      <nav className="header-nav" aria-label="Main Navigation">
        <a href="#about" className="nav-link">ABOUT</a>
        <a href="#thelist" className="nav-link">THE LIST</a>
      </nav>
    </header>
  );
}

export default Header;
