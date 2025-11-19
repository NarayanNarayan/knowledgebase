import * as React from 'react';
import { Select as BaseSelect } from '@base-ui-components/react/select';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  id?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ label, options, value, onChange, error, helperText, placeholder, disabled, size = 'md', fullWidth = false, id }, ref) => {
    const selectId = id || `select-${React.useId()}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const selectedOption = options.find(opt => opt.value === value);

    const triggerClasses = [
      styles.trigger,
      styles[`trigger--${size}`],
      error && styles['trigger--error'],
      fullWidth && styles['trigger--full-width'],
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <BaseSelect.Root 
          value={value} 
          onChange={(newValue) => {
            if (onChange && newValue !== null && newValue !== undefined) {
              onChange(String(newValue));
            }
          }} 
          disabled={disabled}
        >
          <BaseSelect.Trigger ref={ref} id={selectId} className={triggerClasses} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errorId : helperId}>
            <BaseSelect.Value placeholder={placeholder}>
              {selectedOption?.label || placeholder}
            </BaseSelect.Value>
            <span className={styles.icon} aria-hidden="true">▼</span>
          </BaseSelect.Trigger>
          <BaseSelect.Portal>
            <BaseSelect.Positioner>
              <BaseSelect.Popup className={styles.popup}>
                <BaseSelect.List className={styles.listbox}>
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={styles.option}
                    >
                      {option.label}
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
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

Select.displayName = 'Select';

