import type { ChangeEvent, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'children' | 'value' | 'onChange'
  > {
  label?: string;
  options: SelectOption[];
  value?: string | number | readonly string[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  multiple = false,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        multiple={multiple}
        className={`w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-2 dark:text-white ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'
        } ${
          disabled
            ? 'cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            : 'bg-white dark:bg-slate-950'
        }`}
        {...props}
      >
        {placeholder && (
          <option
            value=""
            disabled
            className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white"
          >
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Select;
