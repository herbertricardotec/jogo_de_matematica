import React from 'react';
import { motion } from 'motion/react';
import {
  ACHIEVEMENT_MEDALS,
  AchievementMedalId,
  AvatarAccessoryId,
  AvatarBaseCharacterId,
  LearningModuleId,
} from '../types/game.ts';

interface AvatarIconProps {
  avatarId: string;
  className?: string;
}

export function parseAvatarDescriptor(avatarId: string): {
  character: AvatarBaseCharacterId;
  color: string;
  accessory: AvatarAccessoryId;
} {
  if (avatarId && avatarId.includes('|')) {
    const [charPart, colorPart, accPart] = avatarId.split('|');
    return {
      character: (charPart as AvatarBaseCharacterId) || 'cube_happy',
      color: colorPart || '#007AFF',
      accessory: (accPart as AvatarAccessoryId) || 'none',
    };
  }

  // Backward compatibility for simple avatar IDs
  switch (avatarId) {
    case 'boy_blue':
      return { character: 'boy_blue', color: '#007AFF', accessory: 'none' };
    case 'girl_pink':
      return { character: 'girl_pink', color: '#EC4899', accessory: 'crown' };
    case 'fox':
      return { character: 'fox_scientist', color: '#F97316', accessory: 'glasses' };
    case 'tiger':
      return { character: 'panda_genius', color: '#22C55E', accessory: 'cap' };
    default:
      return { character: 'cube_happy', color: '#007AFF', accessory: 'cap' };
  }
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({ avatarId, className = 'w-11 h-11' }) => {
  const { character, color, accessory } = parseAvatarDescriptor(avatarId);
  const uid = React.useId().replace(/:/g, '');

  const renderAccessory = () => {
    switch (accessory) {
      case 'cap':
        // 3D Student Graduation Cap (Capelo)
        return (
          <g>
            <polygon points="32,4 52,12 32,20 12,12" fill="#0F172A" stroke="#FFD600" strokeWidth="1.5" />
            <rect x="21" y="16" width="22" height="5" rx="2" fill="#1E293B" />
            <path d="M48 13V24" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="48" cy="25" r="2.5" fill="#FFD600" />
          </g>
        );
      case 'glasses':
        // 3D Smart Glasses
        return (
          <g>
            <rect x="13" y="25" width="16" height="12" rx="4" fill="rgba(56,189,248,0.28)" stroke="#0F172A" strokeWidth="3" />
            <rect x="35" y="25" width="16" height="12" rx="4" fill="rgba(56,189,248,0.28)" stroke="#0F172A" strokeWidth="3" />
            <line x1="29" y1="31" x2="35" y2="31" stroke="#0F172A" strokeWidth="3" />
            <line x1="16" y1="28" x2="20" y2="28" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="38" y1="28" x2="42" y2="28" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 'crown':
        // 3D Golden Star Crown
        return (
          <g>
            <path
              d="M17 18L21 7L32 14L43 7L47 18H17Z"
              fill="#FFD600"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="12" r="2.2" fill="#EF4444" />
            <circle cx="22" cy="14" r="1.8" fill="#007AFF" />
            <circle cx="42" cy="14" r="1.8" fill="#22C55E" />
          </g>
        );
      case 'headphones':
        // 3D Gamer Headphones
        return (
          <g>
            <path
              d="M11 32C11 17 53 17 53 32"
              stroke="#FFD600"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="7" y="26" width="7" height="15" rx="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="50" y="26" width="7" height="15" rx="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`bg3d_${uid}`} cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="35%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id={`gloss_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 3D Base Medallion / Cube */}
      {character === 'cube_happy' ? (
        <g>
          {/* 3D Rounded Happy Block */}
          <rect
            x="8"
            y="10"
            width="48"
            height="48"
            rx="15"
            fill={color}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <rect
            x="8"
            y="10"
            width="48"
            height="48"
            rx="15"
            fill={`url(#bg3d_${uid})`}
          />
          {/* Top 3D Specular Highlight */}
          <rect x="13" y="13" width="38" height="14" rx="7" fill={`url(#gloss_${uid})`} />
          {/* Cute Rosy Cheeks */}
          <circle cx="18" cy="38" r="4" fill="#F43F5E" fillOpacity="0.55" />
          <circle cx="46" cy="38" r="4" fill="#F43F5E" fillOpacity="0.55" />
          {/* Big 3D Eyes with Shine */}
          <circle cx="23" cy="31" r="4.5" fill="#0F172A" />
          <circle cx="41" cy="31" r="4.5" fill="#0F172A" />
          <circle cx="21.5" cy="29.5" r="1.6" fill="#FFFFFF" />
          <circle cx="39.5" cy="29.5" r="1.6" fill="#FFFFFF" />
          {/* Big Happy Mouth */}
          <path
            d="M24 40C26.5 45.5 37.5 45.5 40 40Z"
            fill="#0F172A"
          />
          <path d="M27 42.5C29 44.5 35 44.5 37 42.5" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* 3D Spherical Base Badge for Student Characters */}
          <circle cx="32" cy="33" r="26" fill={color} stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="32" cy="33" r="26" fill={`url(#bg3d_${uid})`} />
          <ellipse cx="32" cy="18" rx="16" ry="7" fill={`url(#gloss_${uid})`} />
        </g>
      )}

      {/* Character Specific 3D Features */}
      {character === 'owl_student' && (
        <g>
          {/* 3D Owl Ears & Face */}
          <path d="M16 17L24 23L17 29Z" fill="#7E22CE" />
          <path d="M48 17L40 23L47 29Z" fill="#7E22CE" />
          <circle cx="24" cy="31" r="7.5" fill="#FFFFFF" />
          <circle cx="40" cy="31" r="7.5" fill="#FFFFFF" />
          <circle cx="24" cy="31" r="4" fill="#0F172A" />
          <circle cx="40" cy="31" r="4" fill="#0F172A" />
          <circle cx="22.5" cy="29.5" r="1.5" fill="#FFFFFF" />
          <circle cx="38.5" cy="29.5" r="1.5" fill="#FFFFFF" />
          <polygon points="32,34 27,41 37,41" fill="#FFD600" stroke="#B45309" strokeWidth="1" />
        </g>
      )}

      {character === 'fox_scientist' && (
        <g>
          <polygon points="14,14 25,22 16,29" fill="#EA580C" />
          <polygon points="50,14 39,22 48,29" fill="#EA580C" />
          <path d="M15 35L32 49L49 35L42 26H22L15 35Z" fill="#FFFBEB" />
          <circle cx="23.5" cy="31" r="3.5" fill="#0F172A" />
          <circle cx="40.5" cy="31" r="3.5" fill="#0F172A" />
          <circle cx="22.5" cy="29.8" r="1.2" fill="#FFFFFF" />
          <circle cx="39.5" cy="29.8" r="1.2" fill="#FFFFFF" />
          <circle cx="32" cy="41" r="3.2" fill="#0F172A" />
        </g>
      )}

      {character === 'panda_genius' && (
        <g>
          <circle cx="17" cy="18" r="6" fill="#0F172A" />
          <circle cx="47" cy="18" r="6" fill="#0F172A" />
          <circle cx="32" cy="34" r="17" fill="#FFFFFF" />
          <ellipse cx="24" cy="32" rx="5" ry="6" fill="#0F172A" />
          <ellipse cx="40" cy="32" rx="5" ry="6" fill="#0F172A" />
          <circle cx="24" cy="31" r="2" fill="#FFFFFF" />
          <circle cx="40" cy="31" r="2" fill="#FFFFFF" />
          <ellipse cx="32" cy="38" rx="3.2" ry="2.2" fill="#0F172A" />
          <path d="M27 43C29 45.5 35 45.5 37 43" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}

      {character === 'cat_astro' && (
        <g>
          <polygon points="15,15 26,21 17,29" fill="#F472B6" />
          <polygon points="49,15 38,21 47,29" fill="#F472B6" />
          <circle cx="32" cy="34" r="16" fill="#FCE7F3" />
          <circle cx="24" cy="32" r="3.5" fill="#0F172A" />
          <circle cx="40" cy="32" r="3.5" fill="#0F172A" />
          <circle cx="23" cy="30.8" r="1.2" fill="#FFFFFF" />
          <circle cx="39" cy="30.8" r="1.2" fill="#FFFFFF" />
          <polygon points="32,36 29,39 35,39" fill="#EC4899" />
          <path d="M26 42C28 44.5 36 44.5 38 42" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}

      {character === 'robo_calc' && (
        <g>
          <line x1="32" y1="8" x2="32" y2="16" stroke="#FFD600" strokeWidth="3" />
          <circle cx="32" cy="8" r="3.5" fill="#EF4444" />
          <rect x="16" y="20" width="32" height="24" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="25" cy="30" r="4" fill="#22C55E" />
          <circle cx="39" cy="30" r="4" fill="#22C55E" />
          <rect x="23" y="38" width="18" height="3" rx="1.5" fill="#FFD600" />
        </g>
      )}

      {character === 'boy_blue' && (
        <g>
          <circle cx="32" cy="34" r="15" fill="#FDE68A" />
          <path d="M17 30C17 18 47 18 47 30C42 24 22 24 17 30Z" fill="#78350F" />
          <circle cx="26" cy="33" r="2.8" fill="#0F172A" />
          <circle cx="38" cy="33" r="2.8" fill="#0F172A" />
          <path d="M26 40C28.5 43 35.5 43 38 40" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {character === 'girl_pink' && (
        <g>
          <circle cx="32" cy="32" r="17" fill="#451A03" />
          <path d="M17 26C22 16 42 16 47 26" stroke="#F472B6" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="32" cy="35" r="14.5" fill="#FDE68A" />
          <circle cx="26" cy="34" r="2.8" fill="#0F172A" />
          <circle cx="38" cy="34" r="2.8" fill="#0F172A" />
          <path d="M26 41C28.5 44 35.5 44 38 41" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {/* Top 3D Accessory Overlay */}
      {renderAccessory()}
    </svg>
  );
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
      ? 'w-11 h-11 text-lg rounded-xl'
      : size === 'lg'
      ? 'w-16 h-16 text-3xl rounded-2xl'
      : 'w-13 h-13 text-2xl rounded-2xl';

  return (
    <div
      style={{
        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.38), transparent 55%), ${colorHex}`,
      }}
      className={`cube-3d border-2 border-white font-display font-black text-white flex items-center justify-center select-none shrink-0 ${sizeClasses} ${className}`}
    >
      <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)] tabular-nums">{number}</span>
    </div>
  );
};

/**
 * 3D Illustrated Emblem for Each of the 4 Learning Modules
 */
export const Module3DIllustration: React.FC<{ moduleId: LearningModuleId }> = ({ moduleId }) => {
  switch (moduleId) {
    case 'MODULE_1_NUMBERS':
      return (
        <div className="flex items-end gap-1 p-1.5 rounded-2xl bg-black/25 border border-white/30 shrink-0">
          <NumberCube3D number={1} colorHex="#007AFF" size="sm" />
          <NumberCube3D number={2} colorHex="#FFD600" size="sm" />
          <NumberCube3D number={3} colorHex="#EF4444" size="sm" />
        </div>
      );
    case 'MODULE_2_ADDITION':
      return (
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/25 border border-white/30 shrink-0">
          <NumberCube3D number={2} colorHex="#22C55E" size="sm" />
          <span className="font-display font-black text-xl text-[#FFD600] px-0.5">+</span>
          <NumberCube3D number={3} colorHex="#007AFF" size="sm" />
        </div>
      );
    case 'MODULE_3_SUBTRACTION':
      return (
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/25 border border-white/30 shrink-0">
          <NumberCube3D number={5} colorHex="#F97316" size="sm" />
          <span className="font-display font-black text-xl text-[#FFD600] px-0.5">−</span>
          <NumberCube3D number={2} colorHex="#EF4444" size="sm" />
        </div>
      );
    case 'MODULE_4_SYMBOLS':
    default:
      return (
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/25 border border-white/30 shrink-0">
          <NumberCube3D number="×" colorHex="#A855F7" size="sm" />
          <NumberCube3D number="÷" colorHex="#EC4899" size="sm" />
        </div>
      );
  }
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
    <div className="mt-4 w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#0F172A]/90 to-[#1E293B]/95 border-3 border-white/30 px-6 pt-5 pb-4 panel-3d flex items-end justify-around gap-4 relative overflow-hidden">
      {/* Left Character: Cheerful Boy in Blue Shirt (#007AFF) */}
      <div className="flex flex-col items-center z-10">
        <AvatarIcon avatarId="boy_blue|#007AFF|cap" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
        <span className="mt-1 text-xs font-extrabold text-sky-300">Léo</span>
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
        <AvatarIcon avatarId="girl_pink|#EC4899|crown" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
        <span className="mt-1 text-xs font-extrabold text-pink-300">Bia</span>
      </div>

      {/* Warm Wooden Table Base Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-gradient-to-r from-[#B45309] via-[#EAB308] to-[#B45309]" />
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

/**
 * Animated 3D Achievement Medal Badge with Ribbon, Metallic Bezel, Specular Highlight & Motion
 */
export const Medal3DBadge: React.FC<{
  medalId: AchievementMedalId;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  onClick?: () => void;
}> = ({ medalId, size = 'md', delay = 0, onClick }) => {
  const meta = ACHIEVEMENT_MEDALS[medalId] || ACHIEVEMENT_MEDALS.construtor_blocos;
  const uid = React.useId().replace(/:/g, '');

  const iconSizeClass =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';

  return (
    <motion.div
      initial={{ scale: 0, rotate: -18, y: 12 }}
      animate={{ scale: 1, rotate: [0, -4, 4, 0], y: [0, -3, 0] }}
      transition={{
        scale: { type: 'spring', stiffness: 260, damping: 16, delay },
        rotate: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay },
        y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      onClick={onClick}
      title={`${meta.title}: ${meta.description}`}
      className={`inline-flex items-center gap-2 rounded-2xl bg-slate-950/90 border-2 border-white/30 px-2.5 py-1.5 shadow-lg ${
        onClick ? 'cursor-pointer hover:border-[#FFD600] active:scale-95 transition-transform' : ''
      }`}
    >
      <svg viewBox="0 0 64 64" fill="none" className={`${iconSizeClass} shrink-0 drop-shadow-md`}>
        <defs>
          <radialGradient id={`medal_grad_${uid}`} cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="40%" stopColor={meta.primaryColor} stopOpacity="1" />
            <stop offset="100%" stopColor={meta.secondaryColor} stopOpacity="1" />
          </radialGradient>
        </defs>
        {/* Top Hanging 3D Ribbon */}
        <polygon points="18,4 29,4 33,24 22,24" fill={meta.ribbonColor} stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="46,4 35,4 31,24 42,24" fill={meta.ribbonColor} stroke="#FFFFFF" strokeWidth="1.5" />
        {/* 3D Medal Outer Scalloped Gold Rim */}
        <circle
          cx="32"
          cy="39"
          r="20"
          fill={meta.secondaryColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
        {/* 3D Medal Metallic Inner Disc */}
        <circle
          cx="32"
          cy="38"
          r="16.5"
          fill={`url(#medal_grad_${uid})`}
          stroke="#FEF08A"
          strokeWidth="1.8"
        />
        {/* Top Specular Gloss Highlight */}
        <ellipse cx="27" cy="29" rx="8" ry="3.5" fill="#FFFFFF" fillOpacity="0.45" />
        {/* Center 3D Symbol */}
        <text
          x="32"
          y="44"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="17"
          fontWeight="900"
          fontFamily="Fredoka, sans-serif"
        >
          {meta.symbol}
        </text>
      </svg>

      <div className="text-left min-w-0">
        <div className="font-display font-black text-xs text-[#FFD600] leading-tight truncate">
          {meta.title}
        </div>
        {size !== 'sm' && (
          <div className="text-[10px] font-bold text-sky-100 leading-tight line-clamp-2">
            {meta.description}
          </div>
        )}
      </div>
    </motion.div>
  );
};

