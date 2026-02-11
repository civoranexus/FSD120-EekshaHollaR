import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {

  const baseStyles = `
    inline-flex items-center justify-center
    font-medium tracking-tight
    rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:-translate-y-[1px]
    active:translate-y-0
  `;

  const variants = {
    primary: `
      bg-gradient-to-br from-indigo-500 to-indigo-700
      text-white
      shadow-[0_10px_30px_rgba(79,70,229,0.45)]
      hover:shadow-[0_18px_45px_rgba(79,70,229,0.65)]
      focus:ring-indigo-500/50
    `,
    secondary: `
      bg-gradient-to-br from-emerald-500 to-emerald-700
      text-white
      shadow-[0_10px_30px_rgba(16,185,129,0.45)]
      hover:shadow-[0_18px_45px_rgba(16,185,129,0.65)]
      focus:ring-emerald-500/50
    `,
    outline: `
      bg-white/5 backdrop-blur-md
      border border-white/15
      text-white
      hover:bg-white/10
      focus:ring-indigo-500/40
    `,
    ghost: `
      text-slate-300
      hover:bg-white/10
      focus:ring-white/20
    `,
    danger: `
      bg-gradient-to-br from-red-500 to-red-700
      text-white
      shadow-[0_10px_30px_rgba(239,68,68,0.45)]
      hover:shadow-[0_18px_45px_rgba(239,68,68,0.65)]
      focus:ring-red-500/50
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-live={isLoading ? 'polite' : undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Loading</span>
          <div className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">Please wait...</span>
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
};
