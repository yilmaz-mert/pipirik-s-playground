import React, { useCallback, useState } from 'react';
import Modal from './Modal/Modal';
import { ModalContext } from './ModalContext';

export function ModalProvider({ children }) {
  const [modal, setModal] = useState({ open: false });

  const showConfirm = useCallback(({ title = '', message = '' } = {}) => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        resolve(true);
        setModal({ open: false });
      };
      const handleCancel = () => {
        resolve(false);
        setModal({ open: false });
      };

      setModal({
        open: true,
        type: 'confirm',
        title,
        message,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      });
    });
  }, []);

  const showAlert = useCallback(({ title = '', message = '' } = {}) => {
    return new Promise((resolve) => {
      const handleClose = () => {
        resolve();
        setModal({ open: false });
      };

      setModal({
        open: true,
        type: 'alert',
        title,
        message,
        onClose: handleClose,
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ showConfirm, showAlert }}>
      {children}
      <Modal {...modal} />
    </ModalContext.Provider>
  );
}
