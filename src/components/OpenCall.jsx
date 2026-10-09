import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './OpenCall.css';

// Submissions close 31 October 2026, 23:59:59 Lagos time (UTC+1)
export const OPEN_CALL_DEADLINE = '2026-10-31T23:59:59+01:00';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function OpenCall() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [submissionType, setSubmissionType] = useState('Existing work from my collection');
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [year, setYear] = useState('');
  const [statement, setStatement] = useState('');
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [honeypot, setHoneypot] = useState('');

  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [validationError, setValidationError] = useState('');
  const [serverError, setServerError] = useState('');

  const fileInputRef = useRef(null);

  // Check deadline (driven by single constant at top of file)
  const isClosed = new Date() > new Date(OPEN_CALL_DEADLINE);

  // Manage file preview URLs & cleanup memory leaks
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleFileChange = (e) => {
    setValidationError('');
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const combinedFiles = [...files, ...selectedFiles];

    if (combinedFiles.length > 3) {
      setValidationError('YOU MAY ONLY UPLOAD A MAXIMUM OF 3 IMAGES.');
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setValidationError(`FILE "${file.name}" IS NOT A SUPPORTED FORMAT (JPG, PNG, WEBP ONLY).`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setValidationError(`FILE "${file.name}" EXCEEDS THE 5 MB SIZE LIMIT.`);
        return;
      }
    }

    setFiles(combinedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setValidationError('');
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setServerError('');

    // Honeypot spam protection
    if (honeypot) {
      setStatus('success');
      return;
    }

    // Required fields validation
    if (!fullName.trim()) {
      setValidationError('PLEASE ENTER YOUR FULL NAME.');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setValidationError('PLEASE ENTER A VALID EMAIL ADDRESS.');
      return;
    }

    if (!whatsapp.trim()) {
      setValidationError('PLEASE ENTER YOUR WHATSAPP NUMBER.');
      return;
    }

    if (!instagram.trim()) {
      setValidationError('PLEASE ENTER YOUR INSTAGRAM HANDLE OR PORTFOLIO LINK.');
      return;
    }

    if (!submissionType) {
      setValidationError('PLEASE SELECT A SUBMISSION TYPE.');
      return;
    }

    if (!title.trim()) {
      setValidationError('PLEASE ENTER THE PAINTING TITLE.');
      return;
    }

    if (!medium.trim()) {
      setValidationError('PLEASE ENTER THE MEDIUM.');
      return;
    }

    const isThemed = submissionType === 'New piece for Home & Away';
    if (isThemed && !statement.trim()) {
      setValidationError('A SHORT STATEMENT IS REQUIRED WHEN SUBMITTING A NEW PIECE FOR HOME & AWAY.');
      return;
    }

    if (statement.length > 600) {
      setValidationError('SHORT STATEMENT MUST NOT EXCEED 600 CHARACTERS.');
      return;
    }

    if (files.length < 1 || files.length > 3) {
      setValidationError('PLEASE UPLOAD BETWEEN 1 AND 3 IMAGES OF YOUR WORK.');
      return;
    }

    setStatus('submitting');

    try {
      // 1. Upload images to Supabase Storage bucket "open-call-submissions"
      const uploadedUrls = [];

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('open-call-submissions')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase image upload error:', uploadError);
          let errMsg = 'IMAGE UPLOAD FAILED. PLEASE TRY AGAIN OR CHECK FILE FORMAT/SIZE.';
          if (uploadError.message && uploadError.message.toLowerCase().includes('bucket not found')) {
            errMsg = 'STORAGE BUCKET NOT FOUND. PLEASE CONTACT EXHIBITION ADMINISTRATORS.';
          }
          setServerError(errMsg);
          setStatus('error');
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('open-call-submissions')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 2. Insert record into open_call_submissions table
      const { error: insertError } = await supabase
        .from('open_call_submissions')
        .insert([
          {
            full_name: fullName.trim(),
            email: email.trim(),
            whatsapp: whatsapp.trim(),
            instagram: instagram.trim(),
            submission_type: submissionType,
            title: title.trim(),
            medium: medium.trim(),
            dimensions: dimensions.trim() || null,
            year: year.trim() || null,
            statement: statement.trim() || null,
            image_urls: uploadedUrls,
            status: 'new',
          },
        ]);

      if (insertError) {
        console.error('Supabase open call insert error:', insertError);
        let friendlyMessage = 'FAILED TO SUBMIT YOUR APPLICATION. PLEASE TRY AGAIN LATER.';
        
        if (
          insertError.code === '42501' ||
          (insertError.message && insertError.message.toLowerCase().includes('permission denied'))
        ) {
          friendlyMessage = 'UNABLE TO COMPLETE SUBMISSION AT THIS TIME. PLEASE TRY AGAIN LATER.';
        }
        
        setServerError(friendlyMessage);
        setStatus('error');
      } else {
        setStatus('success');
        setFullName('');
        setEmail('');
        setWhatsapp('');
        setInstagram('');
        setSubmissionType('Existing work from my collection');
        setTitle('');
        setMedium('');
        setDimensions('');
        setYear('');
        setStatement('');
        setFiles([]);
      }
    } catch (err) {
      console.error('Unexpected open call submission error:', err);
      setServerError('AN UNEXPECTED ERROR OCCURRED. PLEASE TRY AGAIN.');
      setStatus('error');
    }
  };

  return (
    <section id="open-call" className="open-call-section site-container">
      <div className="open-call-content">
        <h2 className="open-call-title">OPEN CALL</h2>
        <p className="open-call-intro">
          Artists are invited to be part of the exhibition in one of two ways:
          (1) submit existing work from their collection, or (2) create a painting for the theme &ldquo;Home &amp; Away&rdquo;.
        </p>
        <p className="open-call-deadline-note">
          SUBMISSIONS CLOSE 31 OCTOBER 2026. ALL SIZES AND DIMENSIONS ARE ACCEPTED.
        </p>

        {isClosed ? (
          <div className="open-call-closed" role="status">
            <span className="closed-title">SUBMISSIONS ARE NOW CLOSED</span>
            <p className="closed-description">
              Thank you to all artists who submitted work for Home &amp; Away.
              Selected artists will be contacted by email.
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="open-call-success" role="status">
            <span className="success-text">
              THANK YOU. YOUR SUBMISSION HAS BEEN RECEIVED. SELECTED ARTISTS WILL BE CONTACTED BY EMAIL.
            </span>
          </div>
        ) : (
          <form className="open-call-form" onSubmit={handleSubmit} noValidate>
            {/* Honeypot field for spam protection */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="open-call-hp">Leave this empty</label>
              <input
                id="open-call-hp"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="form-fields-grid">
              {/* Submission Type */}
              <div className="input-group radio-group-container">
                <span className="field-label">SUBMISSION TYPE *</span>
                <div className="radio-options">
                  <label className={`radio-option ${submissionType === 'Existing work from my collection' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="submissionType"
                      value="Existing work from my collection"
                      checked={submissionType === 'Existing work from my collection'}
                      onChange={(e) => setSubmissionType(e.target.value)}
                      className="radio-input"
                    />
                    <span className="radio-custom" aria-hidden="true" />
                    <span className="radio-label-text">EXISTING WORK FROM MY COLLECTION</span>
                  </label>
                  <label className={`radio-option ${submissionType === 'New piece for Home & Away' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="submissionType"
                      value="New piece for Home & Away"
                      checked={submissionType === 'New piece for Home & Away'}
                      onChange={(e) => setSubmissionType(e.target.value)}
                      className="radio-input"
                    />
                    <span className="radio-custom" aria-hidden="true" />
                    <span className="radio-label-text">NEW PIECE FOR HOME &amp; AWAY</span>
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div className="input-group">
                <label htmlFor="open-call-fullname" className="field-label">
                  FULL NAME *
                </label>
                <input
                  id="open-call-fullname"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="YOUR FULL NAME"
                  className="open-call-input"
                  required
                />
              </div>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="open-call-email" className="field-label">
                  EMAIL *
                </label>
                <input
                  id="open-call-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="EMAIL ADDRESS"
                  className="open-call-input"
                  required
                />
              </div>

              {/* WhatsApp Number */}
              <div className="input-group">
                <label htmlFor="open-call-whatsapp" className="field-label">
                  WHATSAPP NUMBER *
                </label>
                <input
                  id="open-call-whatsapp"
                  type="tel"
                  name="whatsapp"
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="+234 800 000 0000 (WITH COUNTRY CODE)"
                  className="open-call-input"
                  required
                />
              </div>

              {/* Instagram Handle or Portfolio Link */}
              <div className="input-group">
                <label htmlFor="open-call-instagram" className="field-label">
                  INSTAGRAM HANDLE OR PORTFOLIO LINK *
                </label>
                <input
                  id="open-call-instagram"
                  type="text"
                  name="instagram"
                  value={instagram}
                  onChange={(e) => {
                    setInstagram(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="@HANDLE OR HTTPS://YOURPORTFOLIO.COM"
                  className="open-call-input"
                  required
                />
              </div>

              {/* Painting Title */}
              <div className="input-group">
                <label htmlFor="open-call-title-field" className="field-label">
                  PAINTING TITLE *
                </label>
                <input
                  id="open-call-title-field"
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="TITLE OF THE WORK"
                  className="open-call-input"
                  required
                />
              </div>

              {/* Medium */}
              <div className="input-group">
                <label htmlFor="open-call-medium" className="field-label">
                  MEDIUM *
                </label>
                <input
                  id="open-call-medium"
                  type="text"
                  name="medium"
                  value={medium}
                  onChange={(e) => {
                    setMedium(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="E.G. OIL ON CANVAS, ACRYLIC AND INK"
                  className="open-call-input"
                  required
                />
              </div>

              {/* Dimensions (optional) & Year (optional) */}
              <div className="two-col-grid">
                <div className="input-group">
                  <label htmlFor="open-call-dimensions" className="field-label">
                    DIMENSIONS (OPTIONAL)
                  </label>
                  <input
                    id="open-call-dimensions"
                    type="text"
                    name="dimensions"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="E.G. 120 X 150 CM"
                    className="open-call-input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="open-call-year" className="field-label">
                    YEAR (OPTIONAL)
                  </label>
                  <input
                    id="open-call-year"
                    type="text"
                    name="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="E.G. 2026"
                    className="open-call-input"
                  />
                </div>
              </div>

              {/* Short Statement */}
              <div className="input-group textarea-group">
                <div className="label-counter-row">
                  <label htmlFor="open-call-statement" className="field-label">
                    SHORT STATEMENT {submissionType === 'New piece for Home & Away' ? '*' : '(OPTIONAL)'}
                  </label>
                  <span className="char-counter">
                    {statement.length}/600
                  </span>
                </div>
                <p className="field-subtext">How the work relates to home, diaspora, or elsewhere.</p>
                <textarea
                  id="open-call-statement"
                  name="statement"
                  maxLength={600}
                  value={statement}
                  onChange={(e) => {
                    setStatement(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="BRIEFLY DESCRIBE HOW YOUR WORK REFLECTS THE THEMES OF HOME, DIASPORA, OR ELSEWHERE..."
                  className="open-call-textarea"
                  rows={4}
                />
              </div>

              {/* Image Upload Area */}
              <div className="input-group upload-group">
                <span className="field-label">
                  WORK IMAGES (1 TO 3 IMAGES, JPG/PNG/WEBP, MAX 5MB EACH) *
                </span>
                
                {files.length < 3 && (
                  <div className="file-dropzone">
                    <input
                      ref={fileInputRef}
                      id="open-call-file-input"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="open-call-file-input" className="file-dropzone-button">
                      <span>+ CHOOSE IMAGES ({files.length}/3)</span>
                    </label>
                  </div>
                )}

                {/* Thumbnail Previews */}
                {files.length > 0 && (
                  <div className="file-preview-grid">
                    {files.map((file, idx) => (
                      <div key={idx} className="file-preview-card">
                        <div className="preview-img-wrapper">
                          <img
                            src={filePreviews[idx]}
                            alt={`Preview ${idx + 1}`}
                            className="preview-img"
                          />
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => handleRemoveFile(idx)}
                            aria-label={`Remove image ${file.name}`}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="preview-file-info">
                          <span className="preview-file-name">{file.name}</span>
                          <span className="preview-file-size">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="submit-row">
              <button
                type="submit"
                className="open-call-submit"
                disabled={status === 'submitting'}
                aria-label="Submit Open Call Application"
              >
                <span className="submit-label">
                  {status === 'submitting' ? 'UPLOADING & SUBMITTING...' : 'SUBMIT APPLICATION'}
                </span>
                <span className="submit-arrow" aria-hidden="true">→</span>
              </button>
            </div>

            {validationError && (
              <p className="open-call-error" role="alert">
                {validationError}
              </p>
            )}

            {status === 'error' && (
              <p className="open-call-error" role="alert">
                {serverError}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default OpenCall;
