import React from 'react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="site-footer site-container">
      <div className="footer-divider" aria-hidden="true"></div>
      <div className="footer-content">
        {/* Left: Wordmark */}
        <div className="footer-left">
          <span className="footer-brand">HOME &amp; AWAY</span>
        </div>

        {/* Center/Nav: Optional Quiet Quick Links */}
        <nav className="footer-nav" aria-label="Footer Links">
          <a href="#about" className="footer-link">ABOUT</a>
          <a href="#thelist" className="footer-link">WAITLIST</a>
        </nav>

        {/* Right: Location & Copyright */}
        <div className="footer-right">
          <span className="footer-location">LAGOS</span>
          <span className="footer-copyright">&copy; 2026</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
