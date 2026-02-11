import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">

        {label && (
          <label className="block text-sm font-medium text-slate-300 tracking-tight">
            {label}
          </label>
        )}

        <div className="relative">

          <select
            ref={ref}
            className={`
              w-full appearance-none
              rounded-xl
              bg-[#0b1220]/40 backdrop-blur-md
              border border-white/10
              pl-4 pr-10 py-3

              text-white
              placeholder:text-slate-400

              shadow-[0_8px_28px_rgba(0,0,0,0.35)]
              transition-all duration-200 ease-out

              focus:outline-none focus:ring-2 focus:ring-indigo-500/50
              focus:border-indigo-500/60

              disabled:bg-white/5 disabled:cursor-not-allowed

              ${
                error
                  ? 'border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60'
                  : ''
              }

              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props?.name || props?.id}-error` : undefined
            }
            {...props}
          >
            <option value="" className="bg-[#0b1220] text-slate-400">
              Select an option
            </option>

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#0b1220] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

        </div>

        {error && (
          <p
            id={`${props?.name || props?.id}-error`}
            className="text-sm text-red-400 mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
