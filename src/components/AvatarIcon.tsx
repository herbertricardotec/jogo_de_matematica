import React from 'react';

interface AvatarIconProps {
  avatarId: string;
  className?: string;
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({ avatarId, className = 'w-8 h-8' }) => {
  switch (avatarId) {
    case 'fox':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path d="M8 10L18 20L30 20L40 10L37 32L24 41L11 32L8 10Z" fill="#F59E0B" />
          <path d="M11 32L24 41L37 32L31 27H17L11 32Z" fill="#FEF3C7" />
          <circle cx="18" cy="25" r="2.5" fill="#0F172A" />
          <circle cx="30" cy="25" r="2.5" fill="#0F172A" />
          <path d="M21 34L24 37L27 34H21Z" fill="#0F172A" />
        </svg>
      );
    case 'falcon':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="16" fill="#2563EB" />
          <path d="M12 22C16 14 32 14 36 22L24 36L12 22Z" fill="#60A5FA" />
          <path d="M21 26L24 33L27 26H21Z" fill="#FBBF24" />
          <circle cx="18" cy="22" r="2.5" fill="#0F172A" />
          <circle cx="30" cy="22" r="2.5" fill="#0F172A" />
        </svg>
      );
    case 'panther':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <rect x="10" y="12" width="28" height="26" rx="12" fill="#7C3AED" />
          <circle cx="14" cy="13" r="5" fill="#6D28D9" />
          <circle cx="34" cy="13" r="5" fill="#6D28D9" />
          <circle cx="18" cy="24" r="2.8" fill="#FDE047" />
          <circle cx="30" cy="24" r="2.8" fill="#FDE047" />
          <path d="M20 31H28L24 35L20 31Z" fill="#DDD6FE" />
        </svg>
      );
    case 'tiger':
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="25" r="15" fill="#10B981" />
          <path d="M12 14L19 18L14 23Z" fill="#059669" />
          <path d="M36 14L29 18L34 23Z" fill="#059669" />
          <circle cx="18" cy="24" r="2.5" fill="#0F172A" />
          <circle cx="30" cy="24" r="2.5" fill="#0F172A" />
          <path d="M19 31C21 34 27 34 29 31" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
};

export const MathShowTitleEmblem: React.FC<{ className?: string }> = ({ className = 'w-full max-w-lg' }) => (
  <svg viewBox="0 0 560 130" fill="none" className={className} role="img" aria-label="MathShow TV">
    <defs>
      <linearGradient id="goldStageGrad" x1="0" y1="0" x2="560" y2="130" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="panelStrokeGrad" x1="0" y1="0" x2="0" y2="130" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
    </defs>
    {/* Broadcast Stage Frame */}
    <rect
      x="8"
      y="10"
      width="544"
      height="110"
      rx="24"
      fill="#0F172A"
      stroke="url(#panelStrokeGrad)"
      strokeWidth="3"
    />
    {/* Left & Right Mathematical Badges */}
    <circle cx="64" cy="65" r="34" fill="#1E293B" stroke="#F59E0B" strokeWidth="2.5" />
    <path d="M52 65H76M64 53V77" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" />

    <circle cx="496" cy="65" r="34" fill="#1E293B" stroke="#38BDF8" strokeWidth="2.5" />
    <path d="M484 65H508" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />

    {/* Center Typography */}
    <text
      x="280"
      y="68"
      textAnchor="middle"
      fill="url(#goldStageGrad)"
      fontFamily="Outfit, sans-serif"
      fontWeight="900"
      fontSize="48"
      letterSpacing="2"
    >
      MATHSHOW TV
    </text>
    <text
      x="280"
      y="100"
      textAnchor="middle"
      fill="#94A3B8"
      fontFamily="Plus Jakarta Sans, sans-serif"
      fontWeight="600"
      fontSize="15"
      letterSpacing="4"
    >
      DESAFIO DE ADIÇÃO &amp; SUBTRAÇÃO AO VIVO
    </text>
  </svg>
);
