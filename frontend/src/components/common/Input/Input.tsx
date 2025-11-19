import * as React from 'react';
import { Input as BaseInput } from '@base-ui-components/react/input';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, size = 'md', fullWidth = false, className, id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const inputClasses = [
      styles.input,
      styles[`input--${size}`],
      error && styles['input--error'],
      fullWidth && styles['input--full-width'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <BaseInput
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperId}
          {...props}
        />
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={helperId} className={styles.helper}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

