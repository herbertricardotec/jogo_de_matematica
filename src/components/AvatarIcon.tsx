import React from 'react';

interface AvatarIconProps {
  avatarId: string;
  className?: string;
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({ avatarId, className = 'w-9 h-9' }) => {
  switch (avatarId) {
    case 'boy_blue':
      return (
        <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
          <circle cx="28" cy="28" r="24" fill="#007AFF" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Shirt */}
          <path d="M14 48C16 39 40 39 42 48" fill="#0284C7" />
          {/* Face */}
          <circle cx="28" cy="27" r="12" fill="#FDE68A" />
          {/* Cheerful Hair */}
          <path d="M16 24C16 15 40 15 40 24C36 19 20 19 16 24Z" fill="#78350F" />
          {/* Expressive Eyes & Smile */}
          <circle cx="23.5" cy="26.5" r="2.2" fill="#0F172A" />
          <circle cx="32.5" cy="26.5" r="2.2" fill="#0F172A" />
          <path
            d="M23.5 32C25.5 34.5 30.5 34.5 32.5 32"
            stroke="#0F172A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'girl_pink':
      return (
        <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
          <circle cx="28" cy="28" r="24" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Pink Dress */}
          <path d="M14 48C16 39 40 39 42 48" fill="#F43F5E" />
          {/* Hair & Pink Headband (Tiara) */}
          <circle cx="28" cy="26" r="14" fill="#451A03" />
          <path
            d="M16 22C20 14 36 14 40 22"
            stroke="#F472B6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Face */}
          <circle cx="28" cy="28" r="11.5" fill="#FDE68A" />
          {/* Expressive Eyes & Smile */}
          <circle cx="23.5" cy="27.5" r="2.2" fill="#0F172A" />
          <circle cx="32.5" cy="27.5" r="2.2" fill="#0F172A" />
          <path
            d="M23.5 32.5C25.5 35 30.5 35 32.5 32.5"
            stroke="#0F172A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'fox':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M10 12L18 20L30 20L38 12L35 32L24 39L13 32L10 12Z" fill="#EA580C" />
          <path d="M13 32L24 39L35 32L30 27H18L13 32Z" fill="#FEF3C7" />
          <circle cx="19" cy="25" r="2.3" fill="#0F172A" />
          <circle cx="29" cy="25" r="2.3" fill="#0F172A" />
        </svg>
      );
    case 'tiger':
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="24" cy="25" r="13" fill="#16A34A" />
          <circle cx="19" cy="24" r="2.3" fill="#FFFFFF" />
          <circle cx="29" cy="24" r="2.3" fill="#FFFFFF" />
          <path
            d="M19 30C21 33 27 33 29 30"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};

/**
 * 3D Stackable Rounded Number Block Component (1, 2, 3, 4, 5...)
 */
export const NumberCube3D: React.FC<{
  number: number | string;
  colorHex: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ number, colorHex, size = 'md', className = '' }) => {
  const sizeClasses =
    size === 'sm'
      ? 'w-10 h-10 text-lg rounded-xl'
      : size === 'lg'
      ? 'w-16 h-16 text-3xl rounded-2xl'
      : 'w-12 h-12 text-xl rounded-2xl';

  return (
    <div
      style={{ backgroundColor: colorHex }}
      className={`cube-3d border-2 border-white/90 font-display font-black text-white flex items-center justify-center select-none shrink-0 ${sizeClasses} ${className}`}
    >
      <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] tabular-nums">{number}</span>
    </div>
  );
};

/**
 * Splash / Title Screen Centerpiece Illustration:
 * Balloon Header "Jogo de Matemática" + Boy (#007AFF) & Girl (#EC4899) stacking 3D blocks 1, 2, 3, 4, 5
 * with floating +, −, ×, ÷ symbols
 */
export const KidsMathSplashHero: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-2xl',
}) => (
  <div className={`relative flex flex-col items-center select-none ${className}`}>
    {/* Top Balloon Title Banner ("Jogo de Matemática") */}
    <div className="relative z-10 px-8 py-4 rounded-[32px] bg-gradient-to-b from-[#007AFF] to-[#0284C7] border-4 border-white shadow-[0_8px_0_#0369A1,0_14px_28px_rgba(0,0,0,0.45)] flex flex-col items-center">
      {/* Floating 3D Math Operators around Title */}
      <div
        className="absolute -left-6 -top-4 w-12 h-12 rounded-2xl bg-[#22C55E] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-2xl text-white -rotate-12"
        aria-hidden="true"
      >
        +
      </div>
      <div
        className="absolute -right-6 -top-4 w-12 h-12 rounded-2xl bg-[#F97316] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-2xl text-white rotate-12"
        aria-hidden="true"
      >
        −
      </div>
      <div
        className="absolute -left-5 -bottom-4 w-11 h-11 rounded-2xl bg-[#007AFF] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white rotate-6"
        aria-hidden="true"
      >
        ×
      </div>
      <div
        className="absolute -right-5 -bottom-4 w-11 h-11 rounded-2xl bg-[#A855F7] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white -rotate-6"
        aria-hidden="true"
      >
        ÷
      </div>

      <span className="title-3d-white font-display font-black text-2xl sm:text-3xl tracking-wide uppercase leading-none">
        Jogo de
      </span>
      <span className="title-3d-yellow font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
        Matemática
      </span>
    </div>

    {/* 3D Scene: Boy & Girl Building the Tower of Number Blocks (1, 2, 3, 4, 5) */}
    <div className="mt-4 w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#0F172A]/85 to-[#1E293B]/95 border-2 border-white/20 px-6 pt-5 pb-4 shadow-2xl flex items-end justify-around gap-4 relative overflow-hidden">
      {/* Left Character: Cheerful Boy in Blue Shirt (#007AFF) */}
      <div className="flex flex-col items-center z-10">
        <AvatarIcon avatarId="boy_blue" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
        <span className="mt-1 text-xs font-bold text-sky-300">Léo</span>
      </div>

      {/* Center Interactive 3D Block Tower (1, 2, 3, 4, 5) */}
      <div className="flex flex-col items-center gap-1.5 z-10">
        <div className="flex items-center gap-1.5">
          <NumberCube3D number={5} colorHex="#A855F7" size="sm" className="-rotate-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <NumberCube3D number={3} colorHex="#EF4444" size="sm" />
          <NumberCube3D number={4} colorHex="#22C55E" size="sm" className="rotate-2" />
        </div>
        <div className="flex items-center gap-1.5">
          <NumberCube3D number={1} colorHex="#007AFF" size="md" />
          <NumberCube3D number={2} colorHex="#FFD600" size="md" />
        </div>
      </div>

      {/* Right Character: Smiling Girl in Pink Dress & Tiara (#EC4899) */}
      <div className="flex flex-col items-center z-10">
        <AvatarIcon avatarId="girl_pink" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
        <span className="mt-1 text-xs font-bold text-pink-300">Bia</span>
      </div>

      {/* Warm Wooden Table Base Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#B45309] via-[#EAB308] to-[#B45309]" />
    </div>
  </div>
);

/**
 * MgnetSoftware Footer Badge
 */
export const MgnetSoftwareBadge: React.FC<{ onOpenParentalGate?: () => void }> = ({
  onOpenParentalGate,
}) => (
  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-[#0A192F] border-2 border-[#FFD600]/80 shadow-md">
    <span className="font-display font-bold text-xs tracking-wider text-white">
      Mgnet<span className="text-[#FFD600]">Software</span>
    </span>
    <span className="text-slate-500" aria-hidden="true">
      ·
    </span>
    <span className="text-[11px] text-emerald-300 font-semibold">100% Kid-Safe (Sem Anúncios)</span>
    {onOpenParentalGate && (
      <>
        <span className="text-slate-500" aria-hidden="true">
          ·
        </span>
        <button
          type="button"
          data-tv-focusable="true"
          onClick={onOpenParentalGate}
          className="tv-focusable text-[11px] font-bold text-[#FFD600] hover:underline whitespace-nowrap"
        >
          Área dos Pais
        </button>
      </>
    )}
  </div>
);
