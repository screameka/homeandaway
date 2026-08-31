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
              <span className="collapsed-count">• 4 CURATED LOTS AVAILABLE</span>
            </div>
            <h2 className="collapsed-title">WORKS &amp; LIVE AUCTION BIDDING</h2>
            <p className="collapsed-subtitle">
              PREVIEW SCULPTURES AND SUBMIT SILENT BIDS FOR THE NOVEMBER 2026 INAUGURAL EDITION.
            </p>
          </div>
          <button
            type="button"
            className="gallery-expand-btn"
            onClick={handleToggleExpand}
            aria-expanded="false"
            aria-label="Expand Works Catalogue and Auction Bidding"
          >
            <span>VIEW CATALOGUE &amp; PLACE BIDS</span>
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
                className="artwork-card"
                onClick={() => setSelectedArtwork(artwork)}
                onKeyDown={(e) => handleCardKeyDown(e, artwork)}
                tabIndex={0}
                role="button"
                aria-label={`View lot details and place bid for ${artwork.title} by ${artwork.artist}`}
              >
                {/* Image Frame with Lot Badge & Hover Overlay */}
                <div className="artwork-image-frame">
                  <div className="card-lot-badge">{artwork.lotNumber}</div>
                  <img
                    src={artwork.image}
                    alt={`${artwork.title} by ${artwork.artist}`}
                    className="artwork-card-img"
                    loading="lazy"
                  />
                  <div className="artwork-hover-overlay">
                    <span className="overlay-text">BID / PREVIEW LOT →</span>
                  </div>
                </div>

                {/* Artwork Metadata & Live Pricing */}
                <div className="artwork-card-info">
                  <div className="card-artist-row">
                    <span className="card-artist">{artwork.artist}</span>
                    <span className="card-status-badge">• {artwork.status}</span>
                  </div>
                  <h3 className="card-title">{artwork.title}</h3>
                  <p className="card-medium">{artwork.medium}</p>

                  <div className="card-pricing-row">
                    <div className="price-block">
                      <span className="price-label">CURRENT HIGH BID</span>
                      <span className="price-value">${artwork.currentBid.toLocaleString()} USD</span>
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
