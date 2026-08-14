import React from 'react';
import logoAsset from '../assets/home-and-away-logo.png';
import ExhibitionMeta from './ExhibitionMeta';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-logo-wrapper">
        <img 
          src={logoAsset} 
          alt="HOME & AWAY Sculptural Art Show Logo" 
          className="hero-logo-img" 
        />
      </div>
      <ExhibitionMeta />
    </section>
  );
}

export default Hero;
