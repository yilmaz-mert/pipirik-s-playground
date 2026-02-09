import React from 'react';
import './Modal.css';

export default function Modal({ 
  open = false, 
  type = 'alert', 
  title = '', 
  message = '', 
  onConfirm = () => {}, 
  onCancel = () => {}, 
  onClose = () => {} 
}) {
  if (!open) return null;

  return (
    <div className="cw-modal-overlay">
      <div className="cw-modal">
        {title && <h3 className="cw-modal-title">{title}</h3>}
        {message && <div className="cw-modal-body" dangerouslySetInnerHTML={{ __html: message }} />}
        <div className="cw-modal-actions">
          {type === 'confirm' ? (
            <>
              <button className="cw-btn cw-btn-ghost" onClick={onCancel}>
                Cancel
              </button>
              <button className="cw-btn cw-btn-primary" onClick={onConfirm}>
                OK
              </button>
            </>
          ) : (
            <button className="cw-btn cw-btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
