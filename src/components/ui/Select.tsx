import type { ChangeEvent, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({
  label,
  options,
  error,
  disabled = false,
  className = '',
  placeholder,
  ...props
}: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}

      <select
        disabled={disabled}
        className={`w-full rounded-lg border bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-whiter dark:bg-form-input dark:text-white ${
          error
            ? 'border-danger focus:border-danger'
            : 'border-stroke dark:border-form-strokedark'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-black"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default Select;
