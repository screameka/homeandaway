import React, { useState, useEffect } from 'react';
import { ARTWORKS as INITIAL_ARTWORKS, GALLERY_HEADER } from '../constants/artworks';
import ArtworkModal from './ArtworkModal';
import './ArtworkGallery.css';

export function ArtworkGallery() {
  const [artworksList, setArtworksList] = useState(INITIAL_ARTWORKS);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand and scroll if URL contains #works hash or navigation is triggered
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#works') {
        setIsExpanded(true);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);

    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleBidSuccess = (artworkId, newBidAmount, newBidCount) => {
    setArtworksList((prevList) =>
      prevList.map((item) =>
        item.id === artworkId
          ? { ...item, currentBid: newBidAmount, bidCount: newBidCount }
          : item
      )
    );
  };

  const handleCardKeyDown = (e, artwork) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedArtwork(artwork);
    }
  };

  return (
    <section id="works" className="artwork-gallery-section site-container">
      {/* ------------------------------------------------------------------------
         COLLAPSED STATE: EDITORIAL TOGGLE BANNER
         ------------------------------------------------------------------------ */}
      {!isExpanded ? (
        <div className="gallery-collapsed-banner">
          <div className="collapsed-info">
            <div className="collapsed-meta-row">
              <span className="collapsed-badge">EXHIBITION CATALOGUE</span>
              <span className="collapsed-count">• CURATED PAINTINGS • UNVEILING NOV 2026</span>
            </div>
            <h2 className="collapsed-title">PAINTINGS &amp; LIVE AUCTION — COMING SOON</h2>
            <p className="collapsed-subtitle">
              CATALOGUE LOTS AND SILENT BIDDING UNVEIL LIVE IN NOVEMBER 2026 FOR THE LAGOS INAUGURAL EDITION.
            </p>
          </div>
          <button
            type="button"
            className="gallery-expand-btn"
            onClick={handleToggleExpand}
            aria-expanded="false"
            aria-label="Expand Works Catalogue Status"
          >
            <span>PREVIEW CATALOGUE STATUS</span>
            <span className="expand-arrow" aria-hidden="true">↓</span>
          </button>
        </div>
      ) : (
        /* ------------------------------------------------------------------------
           EXPANDED STATE: FULL CATALOGUE GRID & AUCTION LOTS
           ------------------------------------------------------------------------ */
        <div className="gallery-expanded-content">
          {/* Section Header */}
          <div className="gallery-header">
            <div className="gallery-header-top">
              <div className="gallery-meta">
                <span className="gallery-meta-label">{GALLERY_HEADER.sectionLabel}</span>
                <h2 className="gallery-meta-title">{GALLERY_HEADER.sectionTitle}</h2>
              </div>
              <button
                type="button"
                className="gallery-collapse-btn"
                onClick={handleToggleExpand}
                aria-expanded="true"
                aria-label="Collapse Works Catalogue"
              >
                <span>HIDE CATALOGUE</span>
                <span className="collapse-arrow" aria-hidden="true">↑</span>
              </button>
            </div>
            <p className="gallery-subtitle">{GALLERY_HEADER.subtitle}</p>
          </div>

          {/* Mobile-First Responsive Artwork Grid */}
          <div className="gallery-grid">
            {artworksList.map((artwork) => (
              <article
                key={artwork.id}
                className="artwork-card artwork-card-coming-soon"
                onClick={() => setSelectedArtwork(artwork)}
                onKeyDown={(e) => handleCardKeyDown(e, artwork)}
                tabIndex={0}
                role="button"
                aria-label={`Preview status for ${artwork.title} — Unveiling November 2026`}
              >
                {/* Blank / Coming Soon Placeholder Frame */}
                <div className="artwork-image-frame artwork-image-frame-placeholder">
                  <div className="card-lot-badge">{artwork.lotNumber}</div>
                  {artwork.image ? (
                    <img
                      src={artwork.image}
                      alt={`${artwork.title} by ${artwork.artist}`}
                      className="artwork-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="artwork-placeholder-canvas">
                      <div className="placeholder-content">
                        <div className="placeholder-watermark">HOME &amp; AWAY</div>
                        <div className="placeholder-badge">
                          <span className="placeholder-lock-icon">🔒</span>
                          <span className="placeholder-main-text">UNVEILING NOV 2026</span>
                          <span className="placeholder-sub-text">CATALOGUE LOT PREVIEW</span>
                        </div>
                        <div className="placeholder-footer-tag">{artwork.lotNumber} • INAUGURAL EDITION</div>
                      </div>
                    </div>
                  )}
                  <div className="artwork-hover-overlay">
                    <span className="overlay-text">VIEW LOT DETAILS →</span>
                  </div>
                </div>

                {/* Artwork Metadata & Coming Soon Status */}
                <div className="artwork-card-info">
                  <div className="card-artist-row">
                    <span className="card-artist">{artwork.artist}</span>
                    <span className="card-status-badge card-status-coming-soon">• {artwork.status}</span>
                  </div>
                  <h3 className="card-title">{artwork.title}</h3>
                  <p className="card-medium">{artwork.medium}</p>

                  <div className="card-pricing-row">
                    <div className="price-block">
                      <span className="price-label">AUCTION STATUS</span>
                      <span className="price-value price-value-coming-soon">OPENS NOV 2026</span>
                    </div>
                    <div className="bids-count-block">
                      <span className="bids-label">ESTIMATE</span>
                      <span className="bids-value">{artwork.estimate}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Lightbox & Bidding Modal */}
      <ArtworkModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onBidSuccess={handleBidSuccess}
      />
    </section>
  );
}

export default ArtworkGallery;
