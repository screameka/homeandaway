import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { WAITLIST_CONFIG } from '../constants/content';
import './WaitlistSignup.css';

export function WaitlistSignup({
  title = WAITLIST_CONFIG.title || 'JOIN THE WAITLIST',
  description = WAITLIST_CONFIG.description || 'SIGN UP FOR PRIVATE PREVIEWS & EXHIBITION ANNOUNCEMENTS',
  successMessage = WAITLIST_CONFIG.successMessage || 'THANK YOU. YOU HAVE BEEN ADDED TO THE WAITLIST.',
  errorMessage = WAITLIST_CONFIG.errorMessage || 'PLEASE ENTER A VALID EMAIL ADDRESS.',
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('idle'); // 'idle' | 'invalid' | 'submitting' | 'success' | 'error'
  const [serverError, setServerError] = useState('');

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateEmail(email)) {
      setStatus('invalid');
      return;
    }

    setStatus('submitting');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            name: name.trim() || null,
            email: email.trim(),
            source: source.trim() || 'Website',
          },
        ]);

      if (error) {
        console.error('Supabase waitlist insert error:', error);
        
        let friendlyMessage = 'FAILED TO SUBMIT. PLEASE TRY AGAIN LATER.';
        
        const isDuplicate =
          error.code === '23505' ||
          (error.message && (
            error.message.toLowerCase().includes('duplicate') ||
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('unique constraint') ||
            error.message.toLowerCase().includes('already exists')
          ));

        const isPermissionError =
          error.code === '42501' ||
          (error.message && error.message.toLowerCase().includes('permission denied'));

        if (isDuplicate) {
          friendlyMessage = 'THIS EMAIL IS ALREADY REGISTERED ON THE WAITLIST.';
        } else if (isPermissionError) {
          friendlyMessage = 'UNABLE TO COMPLETE REGISTRATION AT THIS TIME. PLEASE TRY AGAIN LATER.';
        }

        setServerError(friendlyMessage);
        setStatus('error');
      } else {
        setStatus('success');
        setName('');
        setEmail('');
        setSource('Website');
      }
    } catch (err) {
      console.error('Unexpected waitlist submission error:', err);
      setServerError('AN UNEXPECTED ERROR OCCURRED. PLEASE TRY AGAIN.');
      setStatus('error');
    }
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
            <div className="form-fields-grid">
              {/* Full Name */}
              <div className="input-group">
                <label htmlFor="waitlist-name" className="field-label">
                  NAME
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="YOUR NAME"
                  className="waitlist-input"
                />
              </div>

              {/* Email Address */}
              <div className="input-group">
                <label htmlFor="waitlist-email" className="field-label">
                  EMAIL *
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'invalid' || status === 'error') setStatus('idle');
                  }}
                  placeholder="EMAIL ADDRESS"
                  className={`waitlist-input ${status === 'invalid' ? 'input-error' : ''}`}
                  required
                />
              </div>

              {/* Source Selection */}
              <div className="input-group">
                <label htmlFor="waitlist-source" className="field-label">
                  HOW DID YOU HEAR ABOUT US?
                </label>
                <select
                  id="waitlist-source"
                  name="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="waitlist-select"
                >
                  <option value="Website">Website / Search</option>
                  <option value="Instagram">Instagram / Social</option>
                  <option value="Gallery Visitor">Gallery Visitor</option>
                  <option value="Press / Publication">Press / Publication</option>
                  <option value="Word of Mouth">Word of Mouth</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <div className="submit-row">
              <button
                type="submit"
                className="waitlist-submit"
                disabled={status === 'submitting'}
                aria-label="Submit Waitlist Form"
              >
                <span className="submit-label">
                  {status === 'submitting' ? 'JOINING...' : 'JOIN WAITLIST'}
                </span>
                <span className="submit-arrow" aria-hidden="true">→</span>
              </button>
            </div>

            {status === 'invalid' && (
              <p className="waitlist-error" role="alert">
                {errorMessage}
              </p>
            )}

            {status === 'error' && (
              <p className="waitlist-error" role="alert">
                {serverError}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default WaitlistSignup;
