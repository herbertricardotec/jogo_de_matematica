export type GameStatus =
  | 'TITLE_MENU'
  | 'LOBBY'
  | 'QUESTION_ACTIVE'
  | 'ROUND_REVEAL'
  | 'PAUSED'
  | 'GAME_OVER';

export type GameMode = 'COMPETITIVE' | 'COOPERATIVE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameSettings {
  mode: GameMode;
  difficulty: DifficultyLevel;
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
}

export interface MathQuestion {
  id: string;
  roundNumber: number;
  totalRounds: number;
  expression: string;
  terms: number[];
  operators: ('+' | '-')[];
  correctAnswer: number;
  correctIndex: number; // 0 to 3
  options: number[];
  mentalMathTip: string;
  categoryLabel: string;
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
  lastUpdatedAt: number;
}

export const PLAYER_AVATARS: PlayerAvatar[] = [
  { id: 'fox', label: 'Raposa Turbo', color: '#F59E0B', accentBg: 'rgba(245, 158, 11, 0.18)' },
  { id: 'falcon', label: 'Falcão Azul', color: '#3B82F6', accentBg: 'rgba(59, 130, 246, 0.18)' },
  { id: 'panther', label: 'Pantera Violeta', color: '#8B5CF6', accentBg: 'rgba(139, 92, 246, 0.18)' },
  { id: 'tiger', label: 'Tigre Esmeralda', color: '#10B981', accentBg: 'rgba(16, 185, 129, 0.18)' },
];

export interface OptionMeta {
  index: number;
  letter: 'A' | 'B' | 'C' | 'D';
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
    shape: '▲',
    shapeName: 'Triângulo',
    bgClass: 'bg-[#1D4ED8] hover:bg-[#2563EB]',
    borderClass: 'border-[#60A5FA]',
    activeBgClass: 'bg-[#2563EB]',
    hexColor: '#2563EB',
  },
  {
    index: 1,
    letter: 'B',
    shape: '◆',
    shapeName: 'Losango',
    bgClass: 'bg-[#B45309] hover:bg-[#D97706]',
    borderClass: 'border-[#FBBF24]',
    activeBgClass: 'bg-[#D97706]',
    hexColor: '#D97706',
  },
  {
    index: 2,
    letter: 'C',
    shape: '●',
    shapeName: 'Círculo',
    bgClass: 'bg-[#6D28D9] hover:bg-[#7C3AED]',
    borderClass: 'border-[#C084FC]',
    activeBgClass: 'bg-[#7C3AED]',
    hexColor: '#7C3AED',
  },
  {
    index: 3,
    letter: 'D',
    shape: '■',
    shapeName: 'Quadrado',
    bgClass: 'bg-[#0F766E] hover:bg-[#0D9488]',
    borderClass: 'border-[#2DD4BF]',
    activeBgClass: 'bg-[#0D9488]',
    hexColor: '#0D9488',
  },
];
