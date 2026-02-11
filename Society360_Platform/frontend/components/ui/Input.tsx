import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">

        {label && (
          <label className="block text-sm font-medium text-slate-300 tracking-tight">
            {label}
          </label>
        )}

        <div className="relative">

          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full rounded-xl
              bg-[#0b1220]/40 backdrop-blur-md
              border border-white/10

              ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3

              text-white placeholder:text-slate-400

              shadow-[0_8px_28px_rgba(0,0,0,0.35)]
              transition-all duration-200 ease-out

              focus:outline-none
              focus:ring-2 focus:ring-indigo-500/50
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
              error ? `${props.id || props.name}-error` : undefined
            }
            {...props}
          />
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

Input.displayName = 'Input';
