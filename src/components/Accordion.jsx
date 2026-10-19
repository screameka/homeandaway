import React, { useState } from 'react';
import './Accordion.css';

/**
 * Shared editorial Accordion component matching the Home & Away aesthetic.
 *
 * @param {Object} props
 * @param {string} props.id - Unique ID for accessibility linkages
 * @param {React.ReactNode} props.title - Accordion header title
 * @param {boolean} [props.isOpen] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Initial open state when uncontrolled
 * @param {Function} [props.onToggle] - Callback invoked with new boolean state on toggle
 * @param {React.ReactNode} props.children - Collapsible content
 * @param {string} [props.className=''] - Additional outer container class
 * @param {string} [props.headerClassName=''] - Additional trigger button class
 * @param {string} [props.contentClassName=''] - Additional panel class
 * @param {string} [props.ariaLabel] - Custom aria-label for the trigger button
 */
export function Accordion({
  id,
  title,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onToggle,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  ariaLabel,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    const nextState = !open;
    if (onToggle) {
      onToggle(nextState);
    }
    if (!isControlled) {
      setInternalOpen(nextState);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`accordion-container ${className} ${open ? 'is-open' : 'is-collapsed'}`}>
      <h2 className="accordion-heading">
        <button
          type="button"
          id={`${id}-trigger`}
          className={`accordion-trigger ${headerClassName}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          aria-label={ariaLabel || `${open ? 'Collapse' : 'Expand'} ${typeof title === 'string' ? title : ''}`}
        >
          <span className="accordion-title">{title}</span>
          <span className="accordion-indicator" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
      </h2>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={`accordion-panel ${open ? 'is-expanded' : 'is-collapsed'} ${contentClassName}`}
      >
        <div className="accordion-panel-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Accordion;
