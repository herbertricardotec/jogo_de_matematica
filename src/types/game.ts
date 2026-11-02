export type GameStatus =
  | 'TITLE_MENU'
  | 'LOBBY'
  | 'QUESTION_ACTIVE'
  | 'ROUND_REVEAL'
  | 'PAUSED'
  | 'GAME_OVER';

export type GameMode = 'COMPETITIVE' | 'COOPERATIVE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type LearningModuleId =
  | 'MODULE_1_NUMBERS'
  | 'MODULE_2_ADDITION'
  | 'MODULE_3_SUBTRACTION'
  | 'MODULE_4_SYMBOLS';

export type PowerUpType = 'FIFTY_FIFTY' | 'FREEZE_TIME' | 'DOUBLE_STARS';

export interface LearningModuleMeta {
  id: LearningModuleId;
  numberLabel: string;
  title: string;
  subtitle: string;
  symbol: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
}

export const LEARNING_MODULES: LearningModuleMeta[] = [
  {
    id: 'MODULE_1_NUMBERS',
    numberLabel: 'Módulo 1',
    title: 'Conhecendo os Números',
    subtitle: 'Contagem visual e completar torres de blocos (1 a 10)',
    symbol: '123',
    bgColor: '#007AFF',
    borderColor: '#60A5FA',
    badgeColor: '#FFD600',
  },
  {
    id: 'MODULE_2_ADDITION',
    numberLabel: 'Módulo 2',
    title: 'Somando com Blocos',
    subtitle: 'Operações divertidas de Adição (+) empilhando cubos',
    symbol: '+',
    bgColor: '#22C55E',
    borderColor: '#86EFAC',
    badgeColor: '#16A34A',
  },
  {
    id: 'MODULE_3_SUBTRACTION',
    numberLabel: 'Módulo 3',
    title: 'Subtraindo e Desmontando',
    subtitle: 'Operações de Subtração (-) tirando blocos da torre',
    symbol: '−',
    bgColor: '#F97316',
    borderColor: '#FDBA74',
    badgeColor: '#EA580C',
  },
  {
    id: 'MODULE_4_SYMBOLS',
    numberLabel: 'Módulo 4',
    title: 'Desafio dos Símbolos',
    subtitle: 'Multiplicação (×), Divisão (÷) e misturas de símbolos',
    symbol: '×÷',
    bgColor: '#A855F7',
    borderColor: '#D8B4FE',
    badgeColor: '#9333EA',
  },
];

export interface GameSettings {
  mode: GameMode;
  difficulty: DifficultyLevel;
  moduleId: LearningModuleId;
  totalRounds: number;
  timePerQuestionSec: number;
}

export interface PlayerAvatar {
  id: string;
  label: string;
  color: string;
  accentBg: string;
}

export interface PlayerState {
  id: string;
  name: string;
  avatarId: string;
  color: string;
  slotIndex: number; // 0 to 3
  score: number;
  stars: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  totalAnswered: number;
  totalAnswerTimeMs: number;
  currentAnswer: number | null; // 0, 1, 2, 3 (option index)
  answerTimeMs: number | null;
  lastPointsEarned: number;
  isConnected: boolean;
  isHost: boolean;
  // Single-use Power-Ups per match
  powerUpsUsed: Record<PowerUpType, boolean>;
  eliminatedOptions: number[]; // Populated when player uses FIFTY_FIFTY on current question
  doubleStarsActive: boolean;  // Active when player uses DOUBLE_STARS on current question
}

export interface VisualBlockGroup {
  count: number;
  colorHex: string;
  label?: string;
}

export interface MathQuestion {
  id: string;
  roundNumber: number;
  totalRounds: number;
  expression: string;
  promptText: string;
  speechText: string;
  terms: number[];
  operators: ('+' | '-' | '×' | '÷')[];
  correctAnswer: number;
  correctIndex: number; // 0 to 3
  options: number[];
  mentalMathTip: string;
  categoryLabel: string;
  visualBlocks: VisualBlockGroup[];
  startedAt: number;
  durationMs: number;
  isLightningRound: boolean;
}

export interface RoomState {
  code: string;
  status: GameStatus;
  settings: GameSettings;
  players: PlayerState[];
  currentQuestion: MathQuestion | null;
  teamScore: number;
  teamTarget: number;
  pausedRemainingMs: number | null;
  lastPowerUpAnnouncement: string | null;
  lastUpdatedAt: number;
}

export const PLAYER_AVATARS: PlayerAvatar[] = [
  { id: 'boy_blue', label: 'Leo Blocos', color: '#007AFF', accentBg: 'rgba(0, 122, 255, 0.2)' },
  { id: 'girl_pink', label: 'Bia Estrela', color: '#EC4899', accentBg: 'rgba(236, 72, 153, 0.2)' },
  { id: 'fox', label: 'Raposa Turbo', color: '#F97316', accentBg: 'rgba(249, 115, 22, 0.2)' },
  { id: 'tiger', label: 'Tigre Limão', color: '#22C55E', accentBg: 'rgba(34, 197, 94, 0.2)' },
];

export interface OptionMeta {
  index: number;
  letter: 'A' | 'B' | 'C' | 'D';
  blockNumber: number;
  shape: '▲' | '◆' | '●' | '■';
  shapeName: string;
  bgClass: string;
  borderClass: string;
  activeBgClass: string;
  hexColor: string;
}

export const ANSWER_OPTIONS_META: OptionMeta[] = [
  {
    index: 0,
    letter: 'A',
    blockNumber: 1,
    shape: '▲',
    shapeName: 'Bloco Azul',
    bgClass: 'bg-[#007AFF] hover:bg-[#0284C7]',
    borderClass: 'border-[#93C5FD]',
    activeBgClass: 'bg-[#007AFF]',
    hexColor: '#007AFF',
  },
  {
    index: 1,
    letter: 'B',
    blockNumber: 2,
    shape: '◆',
    shapeName: 'Bloco Amarelo',
    bgClass: 'bg-[#EAB308] hover:bg-[#CA8A04]',
    borderClass: 'border-[#FEF08A]',
    activeBgClass: 'bg-[#EAB308]',
    hexColor: '#FFD600',
  },
  {
    index: 2,
    letter: 'C',
    blockNumber: 3,
    shape: '●',
    shapeName: 'Bloco Vermelho',
    bgClass: 'bg-[#EF4444] hover:bg-[#DC2626]',
    borderClass: 'border-[#FCA5A5]',
    activeBgClass: 'bg-[#EF4444]',
    hexColor: '#EF4444',
  },
  {
    index: 3,
    letter: 'D',
    blockNumber: 4,
    shape: '■',
    shapeName: 'Bloco Verde',
    bgClass: 'bg-[#22C55E] hover:bg-[#16A34A]',
    borderClass: 'border-[#86EFAC]',
    activeBgClass: 'bg-[#22C55E]',
    hexColor: '#22C55E',
  },
];

export const BLOCK_PALETTE_HEX = [
  '#007AFF', // 1 - Azul Primário
  '#FFD600', // 2 - Amarelo Vibrante
  '#EF4444', // 3 - Vermelho Vivo
  '#22C55E', // 4 - Verde Limão
  '#A855F7', // 5 - Roxo/Lilás
  '#F97316', // 6 - Laranja
  '#EC4899', // 7 - Rosa Infantil
];
