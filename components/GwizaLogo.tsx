import React, { useId } from 'react';

type GwizaLogoProps = {
  size?: number;
  className?: string;
};

const GwizaLogo = ({ size = 80, className = '' }: GwizaLogoProps) => {
  const uid = useId().replace(/:/g, '');
  const id = `gwiza-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D1F2D" />
          <stop offset="100%" stopColor="#0A1628" />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="20" y1="20" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4FC3E8" />
          <stop offset="100%" stopColor="#2A7AB5" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="22" fill={`url(#${id}-bg)`} />

      <path
        d="M28 58
           L28 42
           Q28 22 46 22
           L64 22
           L64 36
           L48 36
           Q38 36 38 44
           L38 56
           Q38 66 48 66
           L62 66
           L62 52
           L50 52
           L50 42
           L72 42
           L72 66
           Q72 78 62 78
           L46 78
           Q28 78 28 58 Z"
        fill={`url(#${id}-g)`}
      />

      <circle cx="72" cy="24" r="5.5" fill="white" />
    </svg>
  );
};

export default GwizaLogo;
