import React, { useState } from 'react';
import { WAITLIST_CONFIG } from '../constants/content';
import './WaitlistSignup.css';

export function WaitlistSignup({
  title = WAITLIST_CONFIG.title,
  description = WAITLIST_CONFIG.description,
  placeholder = WAITLIST_CONFIG.placeholder,
  buttonLabel = WAITLIST_CONFIG.buttonLabel,
  successMessage = WAITLIST_CONFIG.successMessage,
  errorMessage = WAITLIST_CONFIG.errorMessage,
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'invalid' | 'success'

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus('invalid');
      return;
    }
    // Frontend demo success state (backend connection handled in later step)
    setStatus('success');
  };

  return (
    <section id="thelist" className="waitlist-section site-container">
      <div className="waitlist-content">
        {title && <h2 className="waitlist-title">{title}</h2>}
        {description && <p className="waitlist-description">{description}</p>}

        {status === 'success' ? (
          <div className="waitlist-success" role="status">
            <span className="success-text">{successMessage}</span>
          </div>
        ) : (
          <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label htmlFor="waitlist-email" className="visually-hidden">
                {placeholder}
              </label>
              <input
                id="waitlist-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'invalid') setStatus('idle');
                }}
                placeholder={placeholder}
                className={`waitlist-input ${status === 'invalid' ? 'input-error' : ''}`}
                required
              />
              <button
                type="submit"
                className="waitlist-submit"
                aria-label={buttonLabel}
              >
                <span className="submit-arrow" aria-hidden="true">→</span>
              </button>
            </div>
            {status === 'invalid' && (
              <p className="waitlist-error" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default WaitlistSignup;
