import type { ChangeEvent, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  label,
  error,
  disabled = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}

      <input
        disabled={disabled}
        className={`w-full rounded-lg border bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-whiter dark:bg-form-input dark:text-white ${
          error
            ? 'border-danger focus:border-danger'
            : 'border-stroke dark:border-form-strokedark'
        }`}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default Input;
