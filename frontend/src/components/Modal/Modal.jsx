import React from 'react';
import './Modal.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className="cw-modal-overlay">
      <div className="cw-modal">
        {title && <h3 className="cw-modal-title">{title}</h3>}
        {message && <div className="cw-modal-body" dangerouslySetInnerHTML={{ __html: message }} />}
        <div className="cw-modal-actions">
          {type === 'confirm' ? (
            <>
              <button className="cw-btn cw-btn-ghost" onClick={onCancel}>
                {t('common.cancel')}
              </button>
              <button className="cw-btn cw-btn-primary" onClick={onConfirm}>
                {t('common.ok')}
              </button>
            </>
          ) : (
            <button className="cw-btn cw-btn-primary" onClick={onClose}>
              {t('common.ok')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
