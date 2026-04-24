import React from 'react';
import GwizaLogo from './GwizaLogo';

type GwizaBrandMarkProps = {
  size?: number;
  textClassName?: string;
  className?: string;
};

const GwizaBrandMark = ({
  size = 40,
  textClassName = '',
  className = '',
}: GwizaBrandMarkProps) => {
  return (
    <div className={`inline-flex items-end gap-2 ${className}`.trim()}>
      <GwizaLogo size={size} />
      <span
        className={`font-bold tracking-tighter leading-none translate-y-[3px] ${textClassName}`.trim()}
      >
        Gwiza
      </span>
    </div>
  );
};

export default GwizaBrandMark;
