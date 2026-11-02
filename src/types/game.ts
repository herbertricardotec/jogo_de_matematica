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
    subtitle: 'Atividades com os blocos 1 a 5',
    symbol: '123',
    bgColor: '#007AFF',
    borderColor: '#60A5FA',
    badgeColor: '#FFD600',
  },
  {
    id: 'MODULE_2_ADDITION',
    numberLabel: 'Módulo 2',
    title: 'Somando com Blocos',
    subtitle: 'Operação de Adição +',
    symbol: '+',
    bgColor: '#22C55E',
    borderColor: '#86EFAC',
    badgeColor: '#16A34A',
  },
  {
    id: 'MODULE_3_SUBTRACTION',
    numberLabel: 'Módulo 3',
    title: 'Subtraindo e Desmontando',
    subtitle: 'Operação de Subtração -',
    symbol: '−',
    bgColor: '#F97316',
    borderColor: '#FDBA74',
    badgeColor: '#EA580C',
  },
  {
    id: 'MODULE_4_SYMBOLS',
    numberLabel: 'Módulo 4',
    title: 'Desafio dos Símbolos',
    subtitle: 'Multiplicação × e Divisão ÷',
    symbol: '×÷',
    bgColor: '#A855F7',
    borderColor: '#D8B4FE',
    badgeColor: '#9333EA',
  },
];

export type MathOperator = '+' | '-' | '×' | '÷';

export interface CustomEquationItem {
  id: string;
  termA: number;
  operator: MathOperator;
  termB: number;
  correctAnswer: number;
}

export interface OperationAccuracyStat {
  correct: number;
  total: number;
}

export type PlayerOperationStats = Record<MathOperator, OperationAccuracyStat>;

export function createEmptyOperationStats(): PlayerOperationStats {
  return {
    '+': { correct: 0, total: 0 },
    '-': { correct: 0, total: 0 },
    '×': { correct: 0, total: 0 },
    '÷': { correct: 0, total: 0 },
  };
}

export interface GameSettings {
  mode: GameMode;
  difficulty: DifficultyLevel;
  moduleId: LearningModuleId;
  totalRounds: number;
  timePerQuestionSec: number;
  useCustomQuestions?: boolean;
  customQuestions?: CustomEquationItem[];
}

export type AvatarBaseCharacterId =
  | 'leo_infantil_m'
  | 'bia_infantil_f'
  | 'kaua_infantil_m'
  | 'sofia_infantil_f'
  | 'lucas_teen_m'
  | 'maya_teen_f'
  | 'gui_teen_m'
  | 'lara_teen_f'
  | 'cube_happy'
  | 'owl_student'
  | 'fox_scientist'
  | 'panda_genius'
  | 'cat_astro'
  | 'robo_calc'
  | 'boy_blue'
  | 'girl_pink';

export type AvatarAccessoryId = 'none' | 'cap' | 'glasses' | 'crown' | 'headphones';

export interface AvatarGeneratorPreset {
  id: AvatarBaseCharacterId;
  label: string;
  ageGroup: 'Infantil' | 'Adolescente';
  gender: 'Masculino' | 'Feminino';
  defaultColor: string;
}

export const AVATAR_BASE_CHARACTERS: AvatarGeneratorPreset[] = [
  {
    id: 'leo_infantil_m',
    label: 'Léo (Infantil M)',
    ageGroup: 'Infantil',
    gender: 'Masculino',
    defaultColor: '#F97316',
  },
  {
    id: 'bia_infantil_f',
    label: 'Bia (Infantil F)',
    ageGroup: 'Infantil',
    gender: 'Feminino',
    defaultColor: '#EC4899',
  },
  {
    id: 'kaua_infantil_m',
    label: 'Kauã (Infantil M)',
    ageGroup: 'Infantil',
    gender: 'Masculino',
    defaultColor: '#007AFF',
  },
  {
    id: 'sofia_infantil_f',
    label: 'Sofia (Infantil F)',
    ageGroup: 'Infantil',
    gender: 'Feminino',
    defaultColor: '#22C55E',
  },
  {
    id: 'lucas_teen_m',
    label: 'Lucas (Teen M)',
    ageGroup: 'Adolescente',
    gender: 'Masculino',
    defaultColor: '#0284C7',
  },
  {
    id: 'maya_teen_f',
    label: 'Maya (Teen F)',
    ageGroup: 'Adolescente',
    gender: 'Feminino',
    defaultColor: '#007AFF',
  },
  {
    id: 'gui_teen_m',
    label: 'Gui (Teen M)',
    ageGroup: 'Adolescente',
    gender: 'Masculino',
    defaultColor: '#EAB308',
  },
  {
    id: 'lara_teen_f',
    label: 'Lara (Teen F)',
    ageGroup: 'Adolescente',
    gender: 'Feminino',
    defaultColor: '#A855F7',
  },
];

export const AVATAR_3D_COLORS: { hex: string; label: string }[] = [
  { hex: '#007AFF', label: 'Azul Céu' },
  { hex: '#FFD600', label: 'Amarelo Sol' },
  { hex: '#EF4444', label: 'Vermelho Vivo' },
  { hex: '#22C55E', label: 'Verde Limão' },
  { hex: '#A855F7', label: 'Roxo Mágico' },
  { hex: '#F97316', label: 'Laranja Vivo' },
  { hex: '#EC4899', label: 'Rosa Estrela' },
];

export const AVATAR_ACCESSORIES: { id: AvatarAccessoryId; label: string; icon: string }[] = [
  { id: 'none', label: 'Natural', icon: '✨' },
  { id: 'cap', label: 'Boné 3D', icon: '🧢' },
  { id: 'glasses', label: 'Óculos', icon: '👓' },
  { id: 'crown', label: 'Tiara/Coroa', icon: '👑' },
  { id: 'headphones', label: 'Fone Gamer', icon: '🎧' },
];

export interface PlayerAvatar {
  id: string;
  label: string;
  color: string;
  accentBg: string;
}

export const PLAYER_AVATARS: PlayerAvatar[] = [
  { id: 'leo_infantil_m|#F97316|none', label: 'Léo', color: '#F97316', accentBg: 'rgba(249, 115, 22, 0.2)' },
  { id: 'bia_infantil_f|#EC4899|none', label: 'Bia', color: '#EC4899', accentBg: 'rgba(236, 72, 153, 0.2)' },
  { id: 'lucas_teen_m|#007AFF|glasses', label: 'Lucas', color: '#007AFF', accentBg: 'rgba(0, 122, 255, 0.2)' },
  { id: 'maya_teen_f|#22C55E|glasses', label: 'Maya', color: '#22C55E', accentBg: 'rgba(34, 197, 94, 0.2)' },
];

export type AchievementMedalId =
  | 'mestre_soma'
  | 'velocista'
  | 'combo_imparavel'
  | 'autodidata'
  | 'cacador_estrelas'
  | 'construtor_blocos';

export interface AchievementMedalMeta {
  id: AchievementMedalId;
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  ribbonColor: string;
  symbol: string;
}

export const ACHIEVEMENT_MEDALS: Record<AchievementMedalId, AchievementMedalMeta> = {
  mestre_soma: {
    id: 'mestre_soma',
    title: 'Mestre da Soma',
    description: 'Alta precisão nos cálculos (80% ou mais de acertos)!',
    primaryColor: '#FFD600',
    secondaryColor: '#D97706',
    ribbonColor: '#007AFF',
    symbol: '+',
  },
  velocista: {
    id: 'velocista',
    title: 'Velocista',
    description: 'Respostas super rápidas em menos de 6 segundos em média!',
    primaryColor: '#38BDF8',
    secondaryColor: '#0284C7',
    ribbonColor: '#EF4444',
    symbol: '⚡',
  },
  combo_imparavel: {
    id: 'combo_imparavel',
    title: 'Sequência Imparável',
    description: 'Acertou 3 ou mais desafios seguidos sem errar!',
    primaryColor: '#F97316',
    secondaryColor: '#C2410C',
    ribbonColor: '#FFD600',
    symbol: '🔥',
  },
  autodidata: {
    id: 'autodidata',
    title: 'Gênio sem Ajudas',
    description: 'Acertou desafios sem usar nenhum botão de ajuda (Power-Up)!',
    primaryColor: '#A855F7',
    secondaryColor: '#7E22CE',
    ribbonColor: '#22C55E',
    symbol: '🧠',
  },
  cacador_estrelas: {
    id: 'cacador_estrelas',
    title: 'Caçador de Estrelas',
    description: 'Conquistou 5 ou mais estrelas douradas na partida!',
    primaryColor: '#22C55E',
    secondaryColor: '#15803D',
    ribbonColor: '#FFD600',
    symbol: '⭐',
  },
  construtor_blocos: {
    id: 'construtor_blocos',
    title: 'Construtor Dedicado',
    description: 'Completou a trilha de blocos com entusiasmo!',
    primaryColor: '#EC4899',
    secondaryColor: '#BE185D',
    ribbonColor: '#007AFF',
    symbol: '🧱',
  },
};

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
  powerUpsUsed: Record<PowerUpType, boolean>;
  eliminatedOptions: number[];
  doubleStarsActive: boolean;
  continueChoice: 'PENDING' | 'YES' | 'NO';
  medals: AchievementMedalId[];
  operationStats?: PlayerOperationStats;
  wrongAttemptsOnCurrent?: number;
  failedOptionsOnCurrent?: number[];
  visualHintUnlocked?: boolean;
  visualHintActive?: boolean;
}

export function evaluatePlayerMedals(
  player: PlayerState,
  totalRounds: number
): AchievementMedalId[] {
  const earned: AchievementMedalId[] = [];
  const rounds = Math.max(1, totalRounds);
  const accuracy = player.correctCount / rounds;

  // 1. Mestre da Soma: >= 80% accuracy (or >= 4 correct answers)
  if (accuracy >= 0.8 || player.correctCount >= Math.max(3, rounds - 1)) {
    earned.push('mestre_soma');
  }

  // 2. Velocista: average answer time <= 6500ms with at least 2 correct answers
  const avgTimeMs =
    player.totalAnswered > 0 ? player.totalAnswerTimeMs / player.totalAnswered : 99999;
  if (player.correctCount >= 2 && avgTimeMs <= 6500) {
    earned.push('velocista');
  }

  // 3. Sequência Imparável: bestStreak >= 3
  if (player.bestStreak >= 3) {
    earned.push('combo_imparavel');
  }

  // 4. Gênio sem Ajudas: no power-ups used and at least 2 correct answers
  const usedAnyPowerUp =
    player.powerUpsUsed?.FIFTY_FIFTY ||
    player.powerUpsUsed?.FREEZE_TIME ||
    player.powerUpsUsed?.DOUBLE_STARS;
  if (!usedAnyPowerUp && player.correctCount >= 2) {
    earned.push('autodidata');
  }

  // 5. Caçador de Estrelas: >= 5 stars
  if (player.stars >= 5) {
    earned.push('cacador_estrelas');
  }

  // Always guarantee at least 1 positive Kid-Safe 3D medal for every participant!
  if (earned.length === 0) {
    earned.push('construtor_blocos');
  }

  return earned.slice(0, 4);
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
  equationFormat: 'MISSING_ADDEND' | 'STANDARD_RESULT';
  targetValue?: number;
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
  revealStartedAt?: number;
  revealDurationMs?: number;
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
  gameOverStartedAt: number | null;
  gameOverDurationMs: number;
  lastUpdatedAt: number;
}

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
