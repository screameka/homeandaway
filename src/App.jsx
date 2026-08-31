import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ExhibitionInfo from './components/ExhibitionInfo';
import ArtworkGallery from './components/ArtworkGallery';
import WaitlistSignup from './components/WaitlistSignup';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app-shell page-shell">
      {/* 1. Quiet Header */}
      <Header />

      {/* 2. Main Editorial Canvas */}
      <main className="main-content">
        {/* Hero Section (Central transparent logo & ExhibitionMeta) */}
        <Hero />

        {/* Exhibition Curatorial Statement */}
        <ExhibitionInfo />

        {/* Selected Artworks Gallery Grid */}
        <ArtworkGallery />

        {/* Waitlist / Email Capture Section */}
        <WaitlistSignup />
      </main>

      {/* 3. Step 5: Editorial Footer & Page Closure */}
      <Footer />
    </div>
  );
}

export default App;

