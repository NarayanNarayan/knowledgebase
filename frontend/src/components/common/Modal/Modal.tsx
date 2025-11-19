import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { Button } from '../Button';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
}) => {
  return (
    <BaseDialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={styles.backdrop}
          onClick={closeOnBackdropClick ? onClose : undefined}
        />
        <BaseDialog.Popup className={`${styles.popup} ${styles[`popup--${size}`]}`}>
          {title && (
            <BaseDialog.Title className={styles.title}>
              {title}
            </BaseDialog.Title>
          )}
          <div className={styles.content}>
            {children}
          </div>
          {footer && <div className={styles.footer}>{footer}</div>}
          <BaseDialog.Close className={styles.closeButton} onClick={onClose}>
            ×
          </BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
};

