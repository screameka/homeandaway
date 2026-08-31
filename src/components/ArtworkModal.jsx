import React, { useState, useEffect } from 'react';
import './ArtworkModal.css';

export function ArtworkModal({ artwork, onClose, onBidSuccess }) {
  const [currentBid, setCurrentBid] = useState(0);
  const [bidCount, setBidCount] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidderEmail, setBidderEmail] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!artwork) return;

    setCurrentBid(artwork.currentBid);
    setBidCount(artwork.bidCount);
    const minNextBid = artwork.currentBid + artwork.minIncrement;
    setBidAmount(minNextBid.toString());
    setBidderEmail('');
    setBidderName('');
    setStatus('idle');
    setStatusMsg('');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [artwork, onClose]);

  if (!artwork) return null;

  const minNextBid = currentBid + artwork.minIncrement;

  const handleQuickIncrement = (increment) => {
    const nextVal = Math.max(minNextBid, (parseInt(bidAmount, 10) || currentBid) + increment);
    setBidAmount(nextVal.toString());
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    setStatusMsg('');

    const parsedBid = parseInt(bidAmount, 10);
    if (isNaN(parsedBid) || parsedBid < minNextBid) {
      setStatus('error');
      setStatusMsg(`MINIMUM VALID BID IS $${minNextBid.toLocaleString()} USD.`);
      return;
    }

    if (!bidderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bidderEmail.trim())) {
      setStatus('error');
      setStatusMsg('PLEASE ENTER A VALID CONTACT EMAIL FOR BID CONFIRMATION.');
      return;
    }

    setStatus('submitting');

    setTimeout(() => {
      const newBid = parsedBid;
      const newCount = bidCount + 1;
      setCurrentBid(newBid);
      setBidCount(newCount);
      setStatus('success');
      setStatusMsg(
        `SUCCESS: YOUR BID OF $${newBid.toLocaleString()} USD FOR ${artwork.lotNumber} HAS BEEN REGISTERED.`
      );

      if (onBidSuccess) {
        onBidSuccess(artwork.id, newBid, newCount);
      }

      setBidAmount((newBid + artwork.minIncrement).toString());
    }, 600);
  };

  return (
    <div
      className="artwork-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-artwork-title"
    >
      <div
        className="artwork-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Close Bar */}
        <div className="modal-header-bar">
          <div className="modal-lot-badge">
            <span className="badge-lot">{artwork.lotNumber}</span>
            <span className="badge-status">• {artwork.status}</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close artwork preview"
          >
            <span>CLOSE</span>
            <span className="close-icon" aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="modal-body-grid">
          {/* Artwork Image Viewport */}
          <div className="modal-image-wrapper">
            <img
              src={artwork.image}
              alt={`${artwork.title} by ${artwork.artist}`}
              className="modal-artwork-img"
            />
          </div>

          {/* Details & Bidding Panel */}
          <div className="modal-details-panel">
            <div className="modal-artist-header">
              <span className="artist-label">ARTIST</span>
              <h4 className="artist-name">{artwork.artist}</h4>
            </div>

            <h3 id="modal-artwork-title" className="modal-artwork-title">
              {artwork.title}
            </h3>

            <dl className="modal-spec-list">
              <div className="spec-row">
                <dt className="spec-label">ESTIMATE</dt>
                <dd className="spec-value">{artwork.estimate}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-label">YEAR / MEDIUM</dt>
                <dd className="spec-value">{artwork.year} — {artwork.medium}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-label">DIMENSIONS</dt>
                <dd className="spec-value">{artwork.dimensions}</dd>
              </div>
            </dl>

            {/* Auction Bidding Section */}
            <div className="modal-auction-block">
              <div className="auction-live-summary">
                <div className="auction-stat">
                  <span className="stat-label">CURRENT HIGH BID</span>
                  <span className="stat-value">${currentBid.toLocaleString()} USD</span>
                </div>
                <div className="auction-stat">
                  <span className="stat-label">TOTAL BIDS</span>
                  <span className="stat-value">{bidCount} BIDS</span>
                </div>
              </div>

              {/* Bidding Form */}
              <form className="modal-bid-form" onSubmit={handleBidSubmit} noValidate>
                <div className="bid-input-wrapper">
                  <label htmlFor="modal-bid-amount" className="bid-field-label">
                    YOUR BID (MIN: ${minNextBid.toLocaleString()} USD)
                  </label>
                  <div className="bid-amount-input-group">
                    <span className="currency-prefix">$</span>
                    <input
                      id="modal-bid-amount"
                      type="number"
                      step={artwork.minIncrement}
                      min={minNextBid}
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      className="bid-input"
                      placeholder={minNextBid.toString()}
                      required
                    />
                    <span className="currency-suffix">USD</span>
                  </div>
                </div>

                {/* Quick Increment Buttons */}
                <div className="quick-increments">
                  <span className="increments-label">QUICK INCREMENT:</span>
                  <button
                    type="button"
                    className="inc-btn"
                    onClick={() => handleQuickIncrement(500)}
                  >
                    +$500
                  </button>
                  <button
                    type="button"
                    className="inc-btn"
                    onClick={() => handleQuickIncrement(1000)}
                  >
                    +$1,000
                  </button>
                  <button
                    type="button"
                    className="inc-btn"
                    onClick={() => handleQuickIncrement(2500)}
                  >
                    +$2,500
                  </button>
                </div>

                {/* Bidder Contact Info */}
                <div className="bidder-info-grid">
                  <div className="bid-input-wrapper">
                    <label htmlFor="modal-bidder-name" className="bid-field-label">
                      NAME / INITIALS
                    </label>
                    <input
                      id="modal-bidder-name"
                      type="text"
                      value={bidderName}
                      onChange={(e) => setBidderName(e.target.value)}
                      placeholder="NAME OR ANONYMOUS"
                      className="bid-text-input"
                    />
                  </div>

                  <div className="bid-input-wrapper">
                    <label htmlFor="modal-bidder-email" className="bid-field-label">
                      CONFIRMATION EMAIL *
                    </label>
                    <input
                      id="modal-bidder-email"
                      type="email"
                      value={bidderEmail}
                      onChange={(e) => {
                        setBidderEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="CONTACT EMAIL"
                      className="bid-text-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="modal-bid-submit-btn"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'REGISTERING BID...' : `PLACE BID FOR ${artwork.lotNumber}`}
                </button>

                {statusMsg && (
                  <p
                    className={`bid-status-alert ${
                      status === 'success' ? 'status-success' : 'status-error'
                    }`}
                    role="alert"
                  >
                    {statusMsg}
                  </p>
                )}
              </form>
            </div>

            <div className="modal-curatorial">
              <span className="curatorial-label">CURATORIAL STATEMENT</span>
              <p className="curatorial-text">{artwork.curatorialNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtworkModal;
