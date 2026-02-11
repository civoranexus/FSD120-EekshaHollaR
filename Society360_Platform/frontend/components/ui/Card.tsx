import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative
        rounded-2xl
        bg-[#0b1220]/40
        backdrop-blur-md
        border border-white/10
        p-6 md:p-8
        shadow-[0_12px_48px_rgba(0,0,0,0.35)]
        transition-all duration-300 ease-out
        ${hover
          ? 'hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(0,0,0,0.55)] cursor-pointer'
          : ''
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => (
  <div className={`mb-5 flex flex-col gap-1 ${className}`}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
}) => (
  <h3
    className={`
      text-xl font-semibold tracking-tight
      text-white
      ${className}
    `}
  >
    {children}
  </h3>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => (
  <div
    className={`
      text-slate-300 leading-relaxed
      ${className}
    `}
  >
    {children}
  </div>
);
