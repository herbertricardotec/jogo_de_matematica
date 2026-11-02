import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ACHIEVEMENT_MEDALS,
  AchievementMedalId,
  AvatarAccessoryId,
  AvatarBaseCharacterId,
  LearningModuleId,
  MathQuestion,
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
    const mappedChar = normalizeLegacyCharacter(charPart as AvatarBaseCharacterId);
    return {
      character: mappedChar,
      color: colorPart || '#007AFF',
      accessory: (accPart as AvatarAccessoryId) || 'none',
    };
  }

  return {
    character: normalizeLegacyCharacter(avatarId as AvatarBaseCharacterId),
    color: '#007AFF',
    accessory: 'none',
  };
}

function normalizeLegacyCharacter(charId: string): AvatarBaseCharacterId {
  switch (charId) {
    case 'cube_happy':
    case 'cube_star':
    case 'cube_genius':
    case 'robo_calc':
    case 'fox_scientist':
    case 'owl_student':
    case 'panda_genius':
    case 'cat_astro':
    case 'leo_infantil_m':
    case 'ricardo_infantil_m':
    case 'bia_infantil_f':
    case 'vania_infantil_f':
    case 'kaua_infantil_m':
    case 'sofia_infantil_f':
    case 'lucas_teen_m':
    case 'maya_teen_f':
    case 'gui_teen_m':
    case 'lara_teen_f':
      return charId;
    case 'boy_blue':
      return 'leo_infantil_m';
    case 'girl_pink':
      return 'bia_infantil_f';
    case 'fox':
      return 'fox_scientist';
    case 'tiger':
      return 'panda_genius';
    default:
      return 'cube_happy';
  }
}

interface CharacterStyleProfile {
  skinBase: string;
  skinShadow: string;
  skinHighlight: string;
  hairColor: string;
  hairHighlight: string;
  shirtDefault: string;
  hairStyle:
    | 'boy_side_part'
    | 'girl_top_bun'
    | 'boy_curly_fade'
    | 'girl_curly_puff'
    | 'teen_wavy_curls'
    | 'teen_long_side'
    | 'teen_curly_top'
    | 'teen_bob_cut';
  outfitStyle: 'tshirt' | 'striped' | 'hoodie' | 'denim_jacket' | 'collar_stripe';
  hasBuiltInGlasses?: boolean;
}

const CHARACTER_PROFILES: Record<string, CharacterStyleProfile> = {
  // 1. Ricardo (Infantil Masculino - Menino sorridente de cabelo castanho penteado, inspirado na Imagem 2)
  leo_infantil_m: {
    skinBase: '#F6C09E',
    skinShadow: '#DF9B74',
    skinHighlight: '#FFE0C8',
    hairColor: '#5C2C16',
    hairHighlight: '#8B4513',
    shirtDefault: '#F97316',
    hairStyle: 'boy_side_part',
    outfitStyle: 'tshirt',
  },
  ricardo_infantil_m: {
    skinBase: '#F6C09E',
    skinShadow: '#DF9B74',
    skinHighlight: '#FFE0C8',
    hairColor: '#5C2C16',
    hairHighlight: '#8B4513',
    shirtDefault: '#F97316',
    hairStyle: 'boy_side_part',
    outfitStyle: 'tshirt',
  },
  // 2. Vania (Infantil Feminino - Menina alegre de cabelo ruivo com coque alto, inspirada na Imagem 2)
  bia_infantil_f: {
    skinBase: '#F7C6A6',
    skinShadow: '#E2A27E',
    skinHighlight: '#FFE4D0',
    hairColor: '#C85A28',
    hairHighlight: '#EA7B44',
    shirtDefault: '#EC4899',
    hairStyle: 'girl_top_bun',
    outfitStyle: 'tshirt',
  },
  vania_infantil_f: {
    skinBase: '#F7C6A6',
    skinShadow: '#E2A27E',
    skinHighlight: '#FFE4D0',
    hairColor: '#C85A28',
    hairHighlight: '#EA7B44',
    shirtDefault: '#EC4899',
    hairStyle: 'girl_top_bun',
    outfitStyle: 'tshirt',
  },
  // 3. Kauã (Infantil Masculino - Menino negro sorridente de cabelo black curto, inspirado na Imagem 2)
  kaua_infantil_m: {
    skinBase: '#8D5538',
    skinShadow: '#693B22',
    skinHighlight: '#AB6E4E',
    hairColor: '#1C1411',
    hairHighlight: '#3B2F2A',
    shirtDefault: '#F97316',
    hairStyle: 'boy_curly_fade',
    outfitStyle: 'tshirt',
  },
  // 4. Sofia (Infantil Feminino - Menina negra de cabelo cacheado volumoso, inspirada na Imagem 2)
  sofia_infantil_f: {
    skinBase: '#844D32',
    skinShadow: '#5E331D',
    skinHighlight: '#A36647',
    hairColor: '#231712',
    hairHighlight: '#463229',
    shirtDefault: '#E15B64',
    hairStyle: 'girl_curly_puff',
    outfitStyle: 'tshirt',
  },
  // 5. Lucas (Adolescente Masculino - Cabelo cacheado ruivo, camiseta listrada e óculos redondos, inspirado na Imagem 2)
  lucas_teen_m: {
    skinBase: '#F4BE9B',
    skinShadow: '#DC9A73',
    skinHighlight: '#FFE0C9',
    hairColor: '#9E431E',
    hairHighlight: '#C96135',
    shirtDefault: '#0284C7',
    hairStyle: 'teen_wavy_curls',
    outfitStyle: 'striped',
    hasBuiltInGlasses: true,
  },
  // 6. Maya (Adolescente Feminino - Cabelo castanho longo, óculos e jaqueta jeans, inspirada na Imagem 2)
  maya_teen_f: {
    skinBase: '#F5C1A0',
    skinShadow: '#DE9F79',
    skinHighlight: '#FFE2CE',
    hairColor: '#3B2316',
    hairHighlight: '#633D28',
    shirtDefault: '#007AFF',
    hairStyle: 'teen_long_side',
    outfitStyle: 'denim_jacket',
    hasBuiltInGlasses: true,
  },
  // 7. Gui (Adolescente Masculino - Cabelo cacheado e moletom com capuz colorido, inspirado na Imagem 2)
  gui_teen_m: {
    skinBase: '#E5A97E',
    skinShadow: '#C6855A',
    skinHighlight: '#F7C6A1',
    hairColor: '#241811',
    hairHighlight: '#4A3427',
    shirtDefault: '#EAB308',
    hairStyle: 'teen_curly_top',
    outfitStyle: 'hoodie',
  },
  // 8. Lara (Adolescente Feminino - Cabelo chanel castanho e blusa com faixa colorida, inspirada na Imagem 2)
  lara_teen_f: {
    skinBase: '#F6C3A3',
    skinShadow: '#DF9F7A',
    skinHighlight: '#FFE3D0',
    hairColor: '#432717',
    hairHighlight: '#6E4229',
    shirtDefault: '#A855F7',
    hairStyle: 'teen_bob_cut',
    outfitStyle: 'collar_stripe',
  },
};

/**
 * 3D Clay / Pixar-Style Bust Avatar for Kids & Teens (Male & Female)
 * Based on the 2nd reference image provided by the user.
 */
export const AvatarIcon: React.FC<AvatarIconProps> = ({ avatarId, className = 'w-11 h-11' }) => {
  const { character, color, accessory } = parseAvatarDescriptor(avatarId);
  const profile = CHARACTER_PROFILES[character] || CHARACTER_PROFILES.leo_infantil_m;
  const uid = React.useId().replace(/:/g, '');
  const outfitColor = color || profile.shirtDefault;

  const renderBackHair = () => {
    switch (profile.hairStyle) {
      case 'girl_top_bun':
        return (
          <g>
            {/* Top 3D Bun */}
            <circle cx="32" cy="11" r="8.5" fill={profile.hairColor} />
            <ellipse cx="30" cy="8.5" rx="4" ry="2" fill={profile.hairHighlight} fillOpacity="0.6" />
            {/* Side Wavy Locks behind ears */}
            <path
              d="M17 26C14 33 15 41 20 43H44C49 41 50 33 47 26Z"
              fill={profile.hairColor}
            />
          </g>
        );
      case 'girl_curly_puff':
        return (
          <g>
            <circle cx="20" cy="19" r="8" fill={profile.hairColor} />
            <circle cx="44" cy="19" r="8" fill={profile.hairColor} />
            <circle cx="32" cy="14" r="9.5" fill={profile.hairColor} />
            <circle cx="43" cy="34" r="6" fill={profile.hairColor} />
          </g>
        );
      case 'teen_long_side':
        return (
          <path
            d="M16 22C13 31 14 43 18 47H46C50 43 51 31 48 22Z"
            fill={profile.hairColor}
          />
        );
      case 'teen_bob_cut':
        return (
          <path
            d="M15 24C13 33 14 42 20 44H44C50 42 51 33 49 24Z"
            fill={profile.hairColor}
          />
        );
      default:
        return null;
    }
  };

  const renderFrontHair = () => {
    switch (profile.hairStyle) {
      case 'boy_side_part':
        return (
          <g>
            <path
              d="M18 25C17 14 25 10 35 11C43 11.5 47 16 46 25C43 19 36 17 28 18C23 18.5 20 21 18 25Z"
              fill={profile.hairColor}
            />
            <path
              d="M23 14C28 12 36 12.5 41 15"
              stroke={profile.hairHighlight}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        );
      case 'girl_top_bun':
        return (
          <g>
            <path
              d="M18 26C18 16 25 13 32 13C39 13 46 16 46 26C42 20 36 18 32 18C28 18 22 20 18 26Z"
              fill={profile.hairColor}
            />
            <path
              d="M23 16C28 14 35 14 40 16"
              stroke={profile.hairHighlight}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
      case 'boy_curly_fade':
        return (
          <g>
            <path
              d="M18 24C18 13 24 10 32 10C40 10 46 13 46 24C43 19 38 18 32 18C26 18 21 19 18 24Z"
              fill={profile.hairColor}
            />
            <circle cx="24" cy="14" r="3.5" fill={profile.hairColor} />
            <circle cx="32" cy="13" r="4" fill={profile.hairColor} />
            <circle cx="40" cy="14" r="3.5" fill={profile.hairColor} />
          </g>
        );
      case 'girl_curly_puff':
        return (
          <g>
            <circle cx="23" cy="16" r="5.5" fill={profile.hairColor} />
            <circle cx="32" cy="14.5" r="6" fill={profile.hairColor} />
            <circle cx="41" cy="16" r="5.5" fill={profile.hairColor} />
            <circle cx="19" cy="21" r="4.5" fill={profile.hairColor} />
            <circle cx="45" cy="21" r="4.5" fill={profile.hairColor} />
          </g>
        );
      case 'teen_wavy_curls':
        return (
          <g>
            <circle cx="22" cy="16" r="5" fill={profile.hairColor} />
            <circle cx="29" cy="14" r="5.5" fill={profile.hairColor} />
            <circle cx="36" cy="14.5" r="5.5" fill={profile.hairColor} />
            <circle cx="42" cy="17" r="4.8" fill={profile.hairColor} />
            <circle cx="26" cy="14" r="2.2" fill={profile.hairHighlight} fillOpacity="0.65" />
            <circle cx="35" cy="14" r="2.2" fill={profile.hairHighlight} fillOpacity="0.65" />
          </g>
        );
      case 'teen_long_side':
        return (
          <g>
            <path
              d="M17 27C17 15 24 12 33 12C41 12 47 16 47 27C43 20 36 17 27 18C22 19 19 23 17 27Z"
              fill={profile.hairColor}
            />
            <path
              d="M23 15C29 13 36 14 41 17"
              stroke={profile.hairHighlight}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
      case 'teen_curly_top':
        return (
          <g>
            <circle cx="22" cy="16" r="4.8" fill={profile.hairColor} />
            <circle cx="28" cy="13.5" r="5.2" fill={profile.hairColor} />
            <circle cx="35" cy="13.5" r="5.2" fill={profile.hairColor} />
            <circle cx="41" cy="16" r="4.8" fill={profile.hairColor} />
          </g>
        );
      case 'teen_bob_cut':
      default:
        return (
          <g>
            <path
              d="M17 26C17 15 24 12 32 12C40 12 47 15 47 26C43 20 37 18 32 18C27 18 21 20 17 26Z"
              fill={profile.hairColor}
            />
            <path
              d="M24 15C29 13.5 35 13.5 40 15"
              stroke={profile.hairHighlight}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  const renderOutfit = () => {
    switch (profile.outfitStyle) {
      case 'striped':
        return (
          <g>
            <path d="M12 60C13 47 21 44 32 44C43 44 51 47 52 60H12Z" fill="#F8FAFC" />
            <path d="M15 50H49" stroke={outfitColor} strokeWidth="2.5" />
            <path d="M13 55H51" stroke={outfitColor} strokeWidth="2.5" />
            <path
              d="M25 44C27 47 37 47 39 44"
              stroke={outfitColor}
              strokeWidth="2.2"
              fill="none"
            />
          </g>
        );
      case 'denim_jacket':
        return (
          <g>
            <path d="M12 60C13 47 21 44 32 44C43 44 51 47 52 60H12Z" fill={outfitColor} />
            <path d="M26 44L28 60H36L38 44Z" fill="#F8FAFC" />
            <path d="M23 44L26 51L29 45" fill="#1E3A8A" />
            <path d="M41 44L38 51L35 45" fill="#1E3A8A" />
          </g>
        );
      case 'hoodie':
        return (
          <g>
            <path d="M12 60C13 47 21 44 32 44C43 44 51 47 52 60H12Z" fill="#78350F" />
            <path d="M24 44L26 60H38L40 44Z" fill={outfitColor} />
            <path
              d="M21 45C24 49 40 49 43 45"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      case 'collar_stripe':
        return (
          <g>
            <path d="M12 60C13 47 21 44 32 44C43 44 51 47 52 60H12Z" fill="#FACC15" />
            <rect x="14" y="52" width="36" height="4.5" fill={outfitColor} />
          </g>
        );
      case 'tshirt':
      default:
        return (
          <g>
            <path d="M12 60C13 47 21 44 32 44C43 44 51 47 52 60H12Z" fill={outfitColor} />
            <path
              d="M25 44C27 47.5 37 47.5 39 44"
              stroke="#FFFFFF"
              strokeOpacity="0.4"
              strokeWidth="2"
              fill="none"
            />
          </g>
        );
    }
  };

  const showGlasses = accessory === 'glasses' || (accessory === 'none' && profile.hasBuiltInGlasses);

  const renderAccessory = () => {
    switch (accessory) {
      case 'cap':
        // 3D Rounded Baseball Cap (like Row 1 Col 3 of Image 2)
        return (
          <g>
            <path d="M17 22C17 11 47 11 47 22Z" fill="#2563EB" />
            <path
              d="M15 21C22 18 42 18 49 21C45 23 19 23 15 21Z"
              fill="#1D4ED8"
              stroke="#93C5FD"
              strokeWidth="1"
            />
          </g>
        );
      case 'crown':
        return (
          <g>
            <path
              d="M20 15L24 7L32 12L40 7L44 15H20Z"
              fill="#FFD600"
              stroke="#B45309"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="11" r="1.8" fill="#EF4444" />
          </g>
        );
      case 'headphones':
        return (
          <g>
            <path
              d="M13 30C13 14 51 14 51 30"
              stroke="#FFD600"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="10" y="25" width="5.5" height="12" rx="2.7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
            <rect x="48.5" y="25" width="5.5" height="12" rx="2.7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        );
      default:
        return null;
    }
  };

  const isSmilingBlock =
    character === 'cube_happy' ||
    character === 'cube_star' ||
    character === 'cube_genius' ||
    character === 'robo_calc';

  const isAnimal3D =
    character === 'fox_scientist' ||
    character === 'owl_student' ||
    character === 'panda_genius' ||
    character === 'cat_astro';

  if (isSmilingBlock) {
    const blockSymbol =
      character === 'cube_star'
        ? '★'
        : character === 'cube_genius'
        ? '123'
        : character === 'robo_calc'
        ? '×÷'
        : '+';

    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <defs>
          <linearGradient id={`blockBg_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <clipPath id={`clipBlock_${uid}`}>
            <rect x="3" y="3" width="58" height="58" rx="16" />
          </clipPath>
        </defs>

        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="16"
          fill={`url(#blockBg_${uid})`}
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <circle cx="32" cy="34" r="24" fill={outfitColor} fillOpacity="0.25" />

        <g clipPath={`url(#clipBlock_${uid})`}>
          {/* Cute 3D Block Feet */}
          <rect x="20" y="49" width="8" height="7" rx="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="36" y="49" width="8" height="7" rx="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* 3D Extruded Bottom Shadow of Cube */}
          <rect
            x="14"
            y="18"
            width="36"
            height="34"
            rx="10"
            fill="rgba(0,0,0,0.45)"
          />

          {/* Main 3D Smiling Cube Body */}
          <rect
            x="14"
            y="14"
            width="36"
            height="34"
            rx="10"
            fill={outfitColor}
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />

          {/* 3D Top Gloss Highlight */}
          <rect
            x="17"
            y="16.5"
            width="30"
            height="7"
            rx="3.5"
            fill="#FFFFFF"
            fillOpacity="0.32"
          />

          {/* Robot Antenna for robo_calc */}
          {character === 'robo_calc' && (
            <g>
              <line x1="32" y1="7" x2="32" y2="14" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="6.5" r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
            </g>
          )}

          {/* Top Math Symbol Badge on the 3D Cube Forehead */}
          <rect
            x="24"
            y="16"
            width="16"
            height="7.5"
            rx="3.5"
            fill="rgba(0,0,0,0.28)"
          />
          <text
            x="32"
            y="21.5"
            textAnchor="middle"
            fill="#FFD600"
            fontSize="6.5"
            fontWeight="900"
            fontFamily="Fredoka, sans-serif"
          >
            {blockSymbol}
          </text>

          {/* Big Glossy 3D Eyes */}
          <circle cx="24.5" cy="29.5" r="4.2" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.2" />
          <circle cx="39.5" cy="29.5" r="4.2" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.2" />
          <circle cx="23.3" cy="28.2" r="1.4" fill="#FFFFFF" />
          <circle cx="38.3" cy="28.2" r="1.4" fill="#FFFFFF" />

          {/* Rosy 3D Cheeks */}
          <ellipse cx="19.5" cy="34" rx="2.8" ry="1.6" fill="#F43F5E" fillOpacity="0.55" />
          <ellipse cx="44.5" cy="34" rx="2.8" ry="1.6" fill="#F43F5E" fillOpacity="0.55" />

          {/* Big Cheerful 3D Smile */}
          {character === 'robo_calc' ? (
            <rect
              x="24"
              y="35.5"
              width="16"
              height="6"
              rx="3"
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
          ) : (
            <path
              d="M24.5 35C26.5 41 37.5 41 39.5 35Z"
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          )}

          {/* Optional 3D Glasses & Accessories */}
          {showGlasses && (
            <g>
              <circle cx="24.5" cy="29.5" r="5.6" fill="rgba(255,255,255,0.15)" stroke="#FFD600" strokeWidth="1.8" />
              <circle cx="39.5" cy="29.5" r="5.6" fill="rgba(255,255,255,0.15)" stroke="#FFD600" strokeWidth="1.8" />
              <line x1="30.1" y1="29.5" x2="33.9" y2="29.5" stroke="#FFD600" strokeWidth="1.8" />
            </g>
          )}
          {renderAccessory()}
        </g>
      </svg>
    );
  }

  if (isAnimal3D) {
    const primaryFur =
      character === 'fox_scientist'
        ? '#F97316'
        : character === 'owl_student'
        ? '#0284C7'
        : character === 'panda_genius'
        ? '#F8FAFC'
        : '#F472B6';

    const innerFur =
      character === 'fox_scientist'
        ? '#FFEDD5'
        : character === 'owl_student'
        ? '#E0F2FE'
        : character === 'panda_genius'
        ? '#1E293B'
        : '#FCE7F3';

    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <defs>
          <linearGradient id={`animalBg_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <clipPath id={`clipAnimal_${uid}`}>
            <rect x="3" y="3" width="58" height="58" rx="16" />
          </clipPath>
        </defs>

        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="16"
          fill={`url(#animalBg_${uid})`}
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <circle cx="32" cy="34" r="23" fill={outfitColor} fillOpacity="0.22" />

        <g clipPath={`url(#clipAnimal_${uid})`}>
          {/* 3D Shirt / Shoulders in Chosen Player Color */}
          <path
            d="M12 60C13 47 21 44 32 44C43 44 51 47 52 60H12Z"
            fill={outfitColor}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* 3D Animal Ears */}
          {character === 'panda_genius' ? (
            <g>
              <circle cx="19" cy="16" r="6.5" fill="#0F172A" />
              <circle cx="45" cy="16" r="6.5" fill="#0F172A" />
              <circle cx="19" cy="16" r="3.2" fill="#F43F5E" fillOpacity="0.6" />
              <circle cx="45" cy="16" r="3.2" fill="#F43F5E" fillOpacity="0.6" />
            </g>
          ) : character === 'owl_student' ? (
            <g>
              <path d="M16 12L24 18L17 24Z" fill="#0369A1" />
              <path d="M48 12L40 18L47 24Z" fill="#0369A1" />
            </g>
          ) : (
            <g>
              <path d="M16 24L18 9L28 18Z" fill={primaryFur} stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M48 24L46 9L36 18Z" fill={primaryFur} stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M18.5 21L19.5 12.5L25.5 18Z" fill={innerFur} />
              <path d="M45.5 21L44.5 12.5L38.5 18Z" fill={innerFur} />
            </g>
          )}

          {/* 3D Sculpted Animal Head */}
          <rect
            x="16.5"
            y="15"
            width="31"
            height="29"
            rx="14.5"
            fill={primaryFur}
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />

          {/* Species Facial Masks */}
          {character === 'fox_scientist' && (
            <path
              d="M17 31C21 27 26 35 32 36C38 35 43 27 47 31C46 39 40 44 32 44C24 44 18 39 17 31Z"
              fill="#FFF7ED"
            />
          )}
          {character === 'owl_student' && (
            <g>
              <circle cx="25.5" cy="28" r="6.5" fill="#E0F2FE" />
              <circle cx="38.5" cy="28" r="6.5" fill="#E0F2FE" />
            </g>
          )}
          {character === 'panda_genius' && (
            <g>
              <ellipse cx="25" cy="28.5" rx="5.2" ry="4.4" transform="rotate(-12 25 28.5)" fill="#0F172A" />
              <ellipse cx="39" cy="28.5" rx="5.2" ry="4.4" transform="rotate(12 39 28.5)" fill="#0F172A" />
            </g>
          )}

          {/* Glossy 3D Eyes */}
          <circle cx="25.5" cy="28.2" r="3" fill="#0F172A" />
          <circle cx="38.5" cy="28.2" r="3" fill="#0F172A" />
          <circle cx="24.5" cy="27.2" r="1.1" fill="#FFFFFF" />
          <circle cx="37.5" cy="27.2" r="1.1" fill="#FFFFFF" />

          {/* Cute 3D Nose / Beak & Smile */}
          {character === 'owl_student' ? (
            <path
              d="M29 31L35 31L32 36.5Z"
              fill="#FFD600"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ) : (
            <g>
              <ellipse
                cx="32"
                cy="32"
                rx="2.8"
                ry="2"
                fill={character === 'cat_astro' ? '#EC4899' : '#0F172A'}
              />
              <path
                d="M28 36C29.8 38.2 34.2 38.2 36 36"
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Cat Whiskers */}
          {character === 'cat_astro' && (
            <g stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round">
              <line x1="15" y1="31" x2="21" y2="32" />
              <line x1="15" y1="34.5" x2="21" y2="34.5" />
              <line x1="49" y1="31" x2="43" y2="32" />
              <line x1="49" y1="34.5" x2="43" y2="34.5" />
            </g>
          )}

          {/* Optional 3D Glasses & Top Accessories */}
          {showGlasses && (
            <g>
              <circle cx="25.5" cy="28.2" r="5.4" fill="rgba(255,255,255,0.18)" stroke="#78350F" strokeWidth="1.8" />
              <circle cx="38.5" cy="28.2" r="5.4" fill="rgba(255,255,255,0.18)" stroke="#78350F" strokeWidth="1.8" />
              <line x1="30.9" y1="28.2" x2="33.1" y2="28.2" stroke="#78350F" strokeWidth="1.8" />
            </g>
          )}
          {renderAccessory()}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`skin3d_${uid}`} cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor={profile.skinHighlight} />
          <stop offset="55%" stopColor={profile.skinBase} />
          <stop offset="100%" stopColor={profile.skinShadow} />
        </radialGradient>
        <linearGradient id={`cardBg_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <clipPath id={`clipCard_${uid}`}>
          <rect x="3" y="3" width="58" height="58" rx="16" />
        </clipPath>
      </defs>

      {/* Soft 3D Studio Card Backdrop (Inspired by Image 2 Grid Tiles) */}
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="16"
        fill={`url(#cardBg_${uid})`}
        stroke="#FFFFFF"
        strokeWidth="3"
      />
      {/* Subtle Color Halo behind Character */}
      <circle cx="32" cy="34" r="22" fill={outfitColor} fillOpacity="0.16" />

      <g clipPath={`url(#clipCard_${uid})`}>
        {/* Back Hair Layer */}
        {renderBackHair()}

        {/* 3D Neck & Chin Shadow */}
        <rect x="27" y="38" width="10" height="10" rx="4" fill={profile.skinShadow} />

        {/* 3D Shoulders & Kid/Teen Outfit */}
        {renderOutfit()}

        {/* 3D Ears */}
        <circle cx="17.5" cy="29.5" r="3.8" fill={profile.skinShadow} />
        <circle cx="46.5" cy="29.5" r="3.8" fill={profile.skinShadow} />
        <circle cx="18" cy="29.5" r="2.2" fill={profile.skinBase} />
        <circle cx="46" cy="29.5" r="2.2" fill={profile.skinBase} />

        {/* 3D Sculpted Clay Head */}
        <rect
          x="18.5"
          y="14.5"
          width="27"
          height="28.5"
          rx="13.5"
          fill={`url(#skin3d_${uid})`}
        />

        {/* Soft Rosy Cheeks */}
        <ellipse cx="23.5" cy="32.5" rx="3" ry="1.8" fill="#F43F5E" fillOpacity="0.28" />
        <ellipse cx="40.5" cy="32.5" rx="3" ry="1.8" fill="#F43F5E" fillOpacity="0.28" />

        {/* Expressive 3D Eyebrows */}
        <path
          d="M23 24.2C24.5 23.2 27 23.2 28.5 24"
          stroke={profile.hairColor}
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M35.5 24C37 23.2 39.5 23.2 41 24.2"
          stroke={profile.hairColor}
          strokeWidth="2.1"
          strokeLinecap="round"
        />

        {/* Glossy 3D Eyes */}
        <circle cx="26" cy="28.2" r="2.5" fill="#1E1B18" />
        <circle cx="38" cy="28.2" r="2.5" fill="#1E1B18" />
        <circle cx="25.2" cy="27.4" r="0.9" fill="#FFFFFF" />
        <circle cx="37.2" cy="27.4" r="0.9" fill="#FFFFFF" />

        {/* Cute 3D Rounded Nose */}
        <ellipse cx="32" cy="31.2" rx="2.2" ry="1.6" fill={profile.skinShadow} />
        <ellipse cx="31.6" cy="30.7" rx="1.2" ry="0.8" fill={profile.skinHighlight} fillOpacity="0.6" />

        {/* Warm Friendly Smile */}
        <path
          d="M27.8 35.5C29.5 37.8 34.5 37.8 36.2 35.5"
          stroke="#7C2D12"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Optional Round 3D Eyeglasses (Like Image 2 Teen Avatars) */}
        {showGlasses && (
          <g>
            <circle
              cx="26"
              cy="28.2"
              r="5"
              fill="rgba(255,255,255,0.18)"
              stroke="#78350F"
              strokeWidth="1.8"
            />
            <circle
              cx="38"
              cy="28.2"
              r="5"
              fill="rgba(255,255,255,0.18)"
              stroke="#78350F"
              strokeWidth="1.8"
            />
            <line x1="31" y1="28.2" x2="33" y2="28.2" stroke="#78350F" strokeWidth="1.8" />
          </g>
        )}

        {/* Front 3D Sculpted Hair */}
        {renderFrontHair()}

        {/* Optional Top Accessory */}
        {renderAccessory()}
      </g>
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
 * Crystal-clear, unobstructed "JOGO DE MATEMÁTICA" 3D Title Banner
 * flanked by +, −, ×, ÷ 3D blocks + Ricardo & Vania 3D Kid Avatars stacking blocks 1, 2, 3, 4, 5
 */
export const KidsMathSplashHero: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-3xl',
}) => (
  <div className={`relative flex flex-col items-center select-none ${className}`}>
    {/* Top Balloon Title Banner ("JOGO DE MATEMÁTICA") — 100% Unobstructed & Prominent */}
    <div className="relative z-10 w-full max-w-2xl px-6 sm:px-8 py-3 sm:py-3.5 rounded-[28px] bg-gradient-to-b from-[#007AFF] via-[#0284C7] to-[#0369A1] border-4 border-white shadow-[0_6px_0_#075985,0_12px_24px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
      {/* Left Pair of 3D Operator Blocks (+ and ×) */}
      <div className="hidden sm:flex flex-col items-center gap-2 shrink-0" aria-hidden="true">
        <div className="w-11 h-11 rounded-2xl bg-[#22C55E] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white -rotate-6">
          +
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#A855F7] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white rotate-6">
          ×
        </div>
      </div>

      {/* Center 3D Extruded Game Title — Clearly Visible! */}
      <div className="flex flex-col items-center text-center mx-auto">
        <span className="inline-block px-3.5 py-0.5 rounded-full bg-slate-950/35 border border-white/30 title-3d-white font-display font-black text-lg sm:text-xl lg:text-2xl tracking-widest uppercase leading-tight">
          JOGO DE
        </span>
        <h1 className="mt-0.5 title-3d-yellow font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]">
          Matemática
        </h1>
      </div>

      {/* Right Pair of 3D Operator Blocks (− and ÷) */}
      <div className="hidden sm:flex flex-col items-center gap-2 shrink-0" aria-hidden="true">
        <div className="w-11 h-11 rounded-2xl bg-[#F97316] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white rotate-6">
          −
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#EC4899] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white -rotate-6">
          ÷
        </div>
      </div>
    </div>

    {/* 3D Scene: Kids & Teens 3D Avatars Building the Tower of Number Blocks (1, 2, 3, 4, 5) */}
    <div className="mt-2.5 w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#0F172A]/90 to-[#1E293B]/95 border-3 border-white/30 px-5 pt-3 pb-3 panel-3d flex items-end justify-around gap-3 relative overflow-hidden">
      {/* Left Character: Ricardo (Infantil Masculino) & Lucas (Adolescente Masculino) */}
      <div className="flex items-end gap-2.5 z-10">
        <div className="flex flex-col items-center">
          <AvatarIcon
            avatarId="leo_infantil_m|#F97316|none"
            className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-xl"
          />
          <span className="mt-0.5 text-xs font-extrabold text-sky-200">Ricardo</span>
        </div>
        <div className="hidden sm:flex flex-col items-center">
          <AvatarIcon
            avatarId="lucas_teen_m|#0284C7|glasses"
            className="w-14 h-14 drop-shadow-lg"
          />
          <span className="mt-0.5 text-[11px] font-bold text-sky-300">Lucas</span>
        </div>
      </div>

      {/* Center Interactive 3D Block Tower (1, 2, 3, 4, 5) */}
      <div className="flex flex-col items-center gap-1 z-10 pb-0.5">
        <div className="flex items-center gap-1">
          <NumberCube3D number={5} colorHex="#A855F7" size="sm" className="-rotate-3" />
        </div>
        <div className="flex items-center gap-1">
          <NumberCube3D number={3} colorHex="#EF4444" size="sm" />
          <NumberCube3D number={4} colorHex="#22C55E" size="sm" className="rotate-2" />
        </div>
        <div className="flex items-center gap-1">
          <NumberCube3D number={1} colorHex="#007AFF" size="sm" />
          <NumberCube3D number={2} colorHex="#FFD600" size="sm" />
        </div>
      </div>

      {/* Right Character: Vania (Infantil Feminino) & Maya (Adolescente Feminino) */}
      <div className="flex items-end gap-2.5 z-10">
        <div className="hidden sm:flex flex-col items-center">
          <AvatarIcon
            avatarId="maya_teen_f|#007AFF|glasses"
            className="w-14 h-14 drop-shadow-lg"
          />
          <span className="mt-0.5 text-[11px] font-bold text-pink-300">Maya</span>
        </div>
        <div className="flex flex-col items-center">
          <AvatarIcon
            avatarId="bia_infantil_f|#EC4899|none"
            className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-xl"
          />
          <span className="mt-0.5 text-xs font-extrabold text-pink-200">Vania</span>
        </div>
      </div>

      {/* Warm Wooden Table Base Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#B45309] via-[#EAB308] to-[#B45309]" />
    </div>
  </div>
);

/**
 * MagnetSoftware Footer Badge
 */
export const MgnetSoftwareBadge: React.FC<{ onOpenParentalGate?: () => void }> = ({
  onOpenParentalGate,
}) => (
  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-[#0A192F] border-2 border-[#FFD600]/80 shadow-md">
    <span className="font-display font-bold text-xs tracking-wider text-white">
      Magnet<span className="text-[#FFD600]">Software</span>
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

/**
 * 3D Animated Block Counting Visual Hint ("Dica Visual 3D")
 * Triggered when a player misses the same question twice, animating 3D blocks being counted step-by-step.
 */
export const VisualHint3DAnimator: React.FC<{
  question: MathQuestion;
  compact?: boolean;
}> = ({ question, compact = false }) => {
  const op = question.operators?.[0] || '+';
  const a = question.terms?.[0] ?? 2;
  const b = question.terms?.[1] ?? 2;
  const isMissingAddend = question.equationFormat === 'MISSING_ADDEND';

  // Cap visual block count to keep layout crisp while teaching the exact counting logic
  const maxVisual = compact ? 12 : 16;

  let totalSteps = 6;
  if (isMissingAddend) {
    totalSteps = Math.min(maxVisual, (question.targetValue || a + b));
  } else if (op === '+') {
    totalSteps = Math.min(maxVisual, a + b);
  } else if (op === '-') {
    totalSteps = Math.min(maxVisual, a);
  } else if (op === '×') {
    totalSteps = Math.min(8, a);
  } else if (op === '÷') {
    totalSteps = Math.min(8, b);
  }

  const [step, setStep] = useState<number>(1);
  const [replaySeed, setReplaySeed] = useState<number>(0);

  useEffect(() => {
    setStep(1);
    const interval = setInterval(() => {
      setStep((prev) => (prev < totalSteps ? prev + 1 : 1));
    }, 700);
    return () => clearInterval(interval);
  }, [question.id, totalSteps, replaySeed]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] border-2 border-[#FFD600] p-3 sm:p-4 space-y-2.5 shadow-xl text-left"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-[#FFD600] text-slate-950 font-display font-black text-xs uppercase">
            💡 Dica Visual 3D
          </span>
          <span className="text-xs font-extrabold text-sky-200">
            Observe os blocos 3D sendo contados passo a passo:
          </span>
        </div>

        <button
          type="button"
          onClick={() => setReplaySeed((s) => s + 1)}
          className="px-2.5 py-1 rounded-xl bg-sky-800/80 hover:bg-sky-700 border border-white/30 text-[11px] font-black text-white transition-transform active:scale-95"
        >
          🔄 Repetir Contagem
        </button>
      </div>

      {/* CASO 1: MÓDULO 1 — QUANTOS BLOCOS FALTAM (ex: 3 + ? = 5) */}
      {isMissingAddend && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-emerald-300">
            Já temos <strong>{a}</strong> bloco(s) azuis. Contando em 3D quantos blocos dourados
            faltam até <strong>{question.targetValue}</strong>:
          </div>
          <div className="flex flex-wrap items-center gap-2 py-1">
            {Array.from({ length: Math.min(maxVisual, question.targetValue || a + b) }).map(
              (_, idx) => {
                const num = idx + 1;
                const isExisting = num <= a;
                const isRevealedNow = num <= step;
                const isCurrentFocus = num === step;
                const missingCounter = num - a;

                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: isCurrentFocus ? 1.2 : isRevealedNow ? 1 : 0.85,
                      y: isCurrentFocus ? -5 : 0,
                      opacity: isRevealedNow ? 1 : 0.35,
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div
                      className={`rounded-xl p-0.5 ${
                        isCurrentFocus ? 'ring-3 ring-[#FFD600] shadow-lg' : ''
                      }`}
                    >
                      <NumberCube3D
                        number={isExisting ? num : missingCounter}
                        colorHex={isExisting ? '#007AFF' : '#22C55E'}
                        size="sm"
                      />
                    </div>
                    <span className="text-[10px] font-mono font-black text-sky-200">
                      {isExisting ? `Tem ${num}` : `+${missingCounter}`}
                    </span>
                  </motion.div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* CASO 2: ADIÇÃO (+) — JUNTANDO DOIS GRUPOS DE BLOCOS */}
      {!isMissingAddend && op === '+' && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-emerald-300">
            Juntando <strong>{a}</strong> bloco(s) verdes com <strong>+{b}</strong> bloco(s) azuis —
            Contagem atual:{' '}
            <strong className="text-[#FFD600] font-mono text-sm">
              {a + b <= maxVisual
                ? `${step} bloco(s)`
                : `${a} + ${Math.min(b, step)} = ${a + Math.min(b, step)}`}
            </strong>
          </div>
          <div className="flex flex-wrap items-center gap-2 py-1">
            {a + b <= maxVisual ? (
              Array.from({ length: a + b }).map((_, idx) => {
                const num = idx + 1;
                const isFirstGroup = num <= a;
                const isActive = num <= step;
                const isCurrent = num === step;
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: isCurrent ? 1.22 : isActive ? 1 : 0.84,
                      y: isCurrent ? -6 : 0,
                      opacity: isActive ? 1 : 0.35,
                    }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <NumberCube3D
                      number={num}
                      colorHex={isFirstGroup ? '#22C55E' : '#007AFF'}
                      size="sm"
                    />
                    <span className="text-[10px] font-mono font-black text-[#FFD600]">{num}º</span>
                  </motion.div>
                );
              })
            ) : (
              // Para números maiores: mostra o bloco base A e soma +1 por passo do grupo B
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-2 rounded-2xl bg-[#22C55E] border-2 border-white font-mono font-black text-base text-white">
                  Base: {a}
                </div>
                {Array.from({ length: Math.min(10, b) }).map((_, idx) => {
                  const stepIdx = idx + 1;
                  const isCurrent = stepIdx === (step % Math.min(10, b)) + 1;
                  return (
                    <motion.div
                      key={idx}
                      animate={{ scale: isCurrent ? 1.18 : 1, y: isCurrent ? -4 : 0 }}
                      className="flex flex-col items-center"
                    >
                      <NumberCube3D number={a + stepIdx} colorHex="#007AFF" size="sm" />
                      <span className="text-[10px] font-mono font-black text-sky-200">
                        +{stepIdx}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASO 3: SUBTRAÇÃO (−) — RETIRANDO BLOCOS DA TORRE */}
      {!isMissingAddend && op === '-' && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-amber-300">
            Começamos com <strong>{a}</strong> blocos e retiramos <strong>{b}</strong> bloco(s)
            vermelhos. Conte os blocos verdes que ficam!
          </div>
          <div className="flex flex-wrap items-center gap-2 py-1">
            {Array.from({ length: Math.min(maxVisual, a) }).map((_, idx) => {
              const num = idx + 1;
              const remainingTarget = a - b;
              const isKept = num <= remainingTarget;
              const isCurrent = num === step;

              return (
                <motion.div
                  key={idx}
                  animate={{
                    scale: isCurrent ? 1.18 : isKept ? 1 : 0.82,
                    y: isCurrent ? -5 : 0,
                    opacity: isKept ? 1 : 0.45,
                  }}
                  className="flex flex-col items-center gap-0.5 relative"
                >
                  <NumberCube3D
                    number={isKept ? num : b - (num - remainingTarget - 1)}
                    colorHex={isKept ? '#22C55E' : '#EF4444'}
                    size="sm"
                  />
                  <span
                    className={`text-[10px] font-mono font-black ${
                      isKept ? 'text-emerald-300' : 'text-rose-400 line-through'
                    }`}
                  >
                    {isKept ? `Fica ${num}` : 'Saiu'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASO 4: MULTIPLICAÇÃO (×) — CONTANDO GRUPOS IGUAIS EM 3D */}
      {!isMissingAddend && op === '×' && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-purple-200">
            Somando <strong>{a} grupos</strong> com <strong>{b} blocos</strong> em cada grupo — Até
            o grupo {step}:{' '}
            <strong className="text-[#FFD600] font-mono text-sm">{step * b} blocos!</strong>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 py-1">
            {Array.from({ length: Math.min(8, a) }).map((_, gIdx) => {
              const groupNum = gIdx + 1;
              const isLit = groupNum <= step;
              const isCurrent = groupNum === step;
              return (
                <motion.div
                  key={gIdx}
                  animate={{
                    scale: isCurrent ? 1.12 : isLit ? 1 : 0.9,
                    y: isCurrent ? -4 : 0,
                    opacity: isLit ? 1 : 0.4,
                  }}
                  className={`px-3 py-2 rounded-2xl border-2 flex flex-col items-center gap-1 ${
                    isCurrent
                      ? 'bg-[#A855F7] border-[#FFD600] shadow-lg'
                      : isLit
                      ? 'bg-purple-950/90 border-purple-400'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-black text-sky-200">Grupo {groupNum}</span>
                  <span className="font-mono font-black text-base text-white">+{b}</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 font-mono font-black text-xs text-[#FFD600]">
                    = {groupNum * b}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASO 5: DIVISÃO (÷) — DISTRIBUINDO EM PARTES IGUAIS */}
      {!isMissingAddend && op === '÷' && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-pink-200">
            Distribuindo <strong>{a} blocos</strong> igualmente em <strong>{b} caixas 3D</strong>:
          </div>
          <div className="flex flex-wrap items-center gap-2.5 py-1">
            {Array.from({ length: Math.min(8, b) }).map((_, boxIdx) => {
              const boxNum = boxIdx + 1;
              const isCurrent = boxNum === step;
              return (
                <motion.div
                  key={boxIdx}
                  animate={{ scale: isCurrent ? 1.12 : 1, y: isCurrent ? -4 : 0 }}
                  className={`px-3 py-2 rounded-2xl border-2 flex flex-col items-center gap-1 ${
                    isCurrent
                      ? 'bg-[#EC4899] border-[#FFD600] shadow-lg'
                      : 'bg-slate-900 border-pink-400/50'
                  }`}
                >
                  <span className="text-[10px] font-black text-white">Parte #{boxNum}</span>
                  <NumberCube3D
                    number={question.correctAnswer}
                    colorHex="#007AFF"
                    size="sm"
                  />
                  <span className="text-[10px] font-mono font-black text-[#FFD600]">
                    {question.correctAnswer} blocos
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

