import React from 'react';
import './ExhibitionInfo.css';

export function ExhibitionInfo() {
  return (
    <section id="about" className="exhibition-info-section site-container">
      {/* Left Column: Quiet Metadata */}
      <div className="info-meta">
        <span className="info-meta-label">ABOUT</span>
        <span className="info-meta-title">HOME &amp; AWAY</span>
      </div>

      {/* Right Column: Editorial Exhibition Curatorial Statement */}
      <div className="info-statement">
        <p className="statement-lead">
          HOME &amp; AWAY is a contemporary art exhibition exploring the relationship between Nigeria, Nigerians in the diaspora, and the wider world.
        </p>
        <p className="statement-body">
          It creates a space for artists, ideas and perspectives to move between home and elsewhere. The first edition takes place in Lagos in November 2026.
        </p>
      </div>
    </section>
  );
}

export default ExhibitionInfo;
