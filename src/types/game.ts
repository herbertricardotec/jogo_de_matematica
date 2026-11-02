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

export type BotTargetAccuracy = 100 | 60 | 40 | 20;
export type BotAccuracyMode = 'RANDOM' | BotTargetAccuracy;

export const BOT_ACCURACY_TARGETS: BotTargetAccuracy[] = [100, 60, 40, 20];

export function resolveBotAccuracyTarget(mode?: BotAccuracyMode): BotTargetAccuracy {
  if (mode === 100 || mode === 60 || mode === 40 || mode === 20) {
    return mode;
  }
  const idx = Math.floor(Math.random() * BOT_ACCURACY_TARGETS.length);
  return BOT_ACCURACY_TARGETS[idx];
}

export function buildBotPlannedOutcomes(
  totalRounds: number,
  targetPct: BotTargetAccuracy
): boolean[] {
  const rounds = Math.max(1, totalRounds);
  const targetCorrectCount = Math.max(
    0,
    Math.min(rounds, Math.round((targetPct / 100) * rounds))
  );
  const outcomes: boolean[] = [];
  for (let i = 0; i < rounds; i++) {
    outcomes.push(i < targetCorrectCount);
  }
  // Fisher-Yates shuffle so the machine's correct/wrong answers happen in random rounds
  for (let i = outcomes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = outcomes[i];
    outcomes[i] = outcomes[j];
    outcomes[j] = temp;
  }
  return outcomes;
}

export interface GameSettings {
  mode: GameMode;
  difficulty: DifficultyLevel;
  moduleId: LearningModuleId;
  totalRounds: number;
  timePerQuestionSec: number;
  useCustomQuestions?: boolean;
  customQuestions?: CustomEquationItem[];
  vsMachine?: boolean;
  botAccuracyMode?: BotAccuracyMode;
  resolvedBotTargetPct?: BotTargetAccuracy;
}

export type AvatarCategory = 'BLOCOS' | 'ANIMAIS' | 'ESTUDANTES';

export type AvatarBaseCharacterId =
  | 'cube_happy'
  | 'cube_star'
  | 'cube_genius'
  | 'robo_calc'
  | 'fox_scientist'
  | 'owl_student'
  | 'panda_genius'
  | 'cat_astro'
  | 'leo_infantil_m'
  | 'ricardo_infantil_m'
  | 'bia_infantil_f'
  | 'vania_infantil_f'
  | 'kaua_infantil_m'
  | 'sofia_infantil_f'
  | 'lucas_teen_m'
  | 'maya_teen_f'
  | 'gui_teen_m'
  | 'lara_teen_f'
  | 'boy_blue'
  | 'girl_pink';

export type AvatarAccessoryId = 'none' | 'cap' | 'glasses' | 'crown' | 'headphones';

export interface AvatarGeneratorPreset {
  id: AvatarBaseCharacterId;
  label: string;
  category: AvatarCategory;
  categoryLabel: string;
  ageGroup: 'Bloco 3D' | 'Animal 3D' | 'Infantil' | 'Adolescente';
  gender: 'Mascote' | 'Masculino' | 'Feminino';
  defaultColor: string;
}

export const AVATAR_BASE_CHARACTERS: AvatarGeneratorPreset[] = [
  // BLOCOS SORRIDENTES 3D
  {
    id: 'cube_happy',
    label: 'Cubo Feliz (+)',
    category: 'BLOCOS',
    categoryLabel: 'Bloco Sorridente 3D',
    ageGroup: 'Bloco 3D',
    gender: 'Mascote',
    defaultColor: '#007AFF',
  },
  {
    id: 'cube_star',
    label: 'Bloco Estrela (★)',
    category: 'BLOCOS',
    categoryLabel: 'Bloco Sorridente 3D',
    ageGroup: 'Bloco 3D',
    gender: 'Mascote',
    defaultColor: '#FFD600',
  },
  {
    id: 'cube_genius',
    label: 'Cubo Gênio (123)',
    category: 'BLOCOS',
    categoryLabel: 'Bloco Sorridente 3D',
    ageGroup: 'Bloco 3D',
    gender: 'Mascote',
    defaultColor: '#22C55E',
  },
  {
    id: 'robo_calc',
    label: 'Bloco Robô (×÷)',
    category: 'BLOCOS',
    categoryLabel: 'Bloco Sorridente 3D',
    ageGroup: 'Bloco 3D',
    gender: 'Mascote',
    defaultColor: '#A855F7',
  },
  // ANIMAIS 3D
  {
    id: 'fox_scientist',
    label: 'Raposa Sabida',
    category: 'ANIMAIS',
    categoryLabel: 'Animal 3D',
    ageGroup: 'Animal 3D',
    gender: 'Mascote',
    defaultColor: '#F97316',
  },
  {
    id: 'owl_student',
    label: 'Coruja Mestre',
    category: 'ANIMAIS',
    categoryLabel: 'Animal 3D',
    ageGroup: 'Animal 3D',
    gender: 'Mascote',
    defaultColor: '#007AFF',
  },
  {
    id: 'panda_genius',
    label: 'Panda Gênio',
    category: 'ANIMAIS',
    categoryLabel: 'Animal 3D',
    ageGroup: 'Animal 3D',
    gender: 'Mascote',
    defaultColor: '#22C55E',
  },
  {
    id: 'cat_astro',
    label: 'Gatinho Astro',
    category: 'ANIMAIS',
    categoryLabel: 'Animal 3D',
    ageGroup: 'Animal 3D',
    gender: 'Mascote',
    defaultColor: '#EC4899',
  },
  // ESTUDANTES 3D
  {
    id: 'leo_infantil_m',
    label: 'Ricardo (Infantil M)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Infantil',
    gender: 'Masculino',
    defaultColor: '#F97316',
  },
  {
    id: 'bia_infantil_f',
    label: 'Vania (Infantil F)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Infantil',
    gender: 'Feminino',
    defaultColor: '#EC4899',
  },
  {
    id: 'kaua_infantil_m',
    label: 'Kauã (Infantil M)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Infantil',
    gender: 'Masculino',
    defaultColor: '#007AFF',
  },
  {
    id: 'sofia_infantil_f',
    label: 'Sofia (Infantil F)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Infantil',
    gender: 'Feminino',
    defaultColor: '#22C55E',
  },
  {
    id: 'lucas_teen_m',
    label: 'Lucas (Teen M)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Adolescente',
    gender: 'Masculino',
    defaultColor: '#0284C7',
  },
  {
    id: 'maya_teen_f',
    label: 'Maya (Teen F)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Adolescente',
    gender: 'Feminino',
    defaultColor: '#007AFF',
  },
  {
    id: 'gui_teen_m',
    label: 'Gui (Teen M)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
    ageGroup: 'Adolescente',
    gender: 'Masculino',
    defaultColor: '#EAB308',
  },
  {
    id: 'lara_teen_f',
    label: 'Lara (Teen F)',
    category: 'ESTUDANTES',
    categoryLabel: 'Estudante 3D',
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
  { id: 'cube_happy|#007AFF|none', label: 'Cubo Feliz', color: '#007AFF', accentBg: 'rgba(0, 122, 255, 0.2)' },
  { id: 'fox_scientist|#F97316|none', label: 'Raposa Sabida', color: '#F97316', accentBg: 'rgba(249, 115, 22, 0.2)' },
  { id: 'panda_genius|#22C55E|glasses', label: 'Panda Gênio', color: '#22C55E', accentBg: 'rgba(34, 197, 94, 0.2)' },
  { id: 'cat_astro|#EC4899|crown', label: 'Gatinho Astro', color: '#EC4899', accentBg: 'rgba(236, 72, 153, 0.2)' },
];

export function ensureUniquePlayerAvatar(
  requestedAvatarId: string,
  existingPlayers: { id: string; avatarId: string; isBot?: boolean }[],
  currentPlayerId?: string
): string {
  const parts = (requestedAvatarId || '').split('|');
  let charId = (parts[0] || 'cube_happy') as AvatarBaseCharacterId;
  let colorHex = parts[1] || '#007AFF';
  const accId = (parts[2] || 'none') as AvatarAccessoryId;

  const others = existingPlayers.filter((p) => !p.isBot && p.id !== currentPlayerId);
  const usedBaseChars = new Set(others.map((p) => (p.avatarId || '').split('|')[0]));
  const usedColors = new Set(others.map((p) => (p.avatarId || '').split('|')[1]));

  if (usedBaseChars.has(charId)) {
    const freeChar = AVATAR_BASE_CHARACTERS.find((c) => !usedBaseChars.has(c.id));
    if (freeChar) {
      charId = freeChar.id;
      colorHex = freeChar.defaultColor;
    }
  }

  if (usedColors.has(colorHex)) {
    const freeColor = AVATAR_3D_COLORS.find((c) => !usedColors.has(c.hex));
    if (freeColor) {
      colorHex = freeColor.hex;
    }
  }

  return `${charId}|${colorHex}|${accId}`;
}

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
  isBot?: boolean;
  botTargetAccuracyPct?: BotTargetAccuracy;
  botPlannedOutcomes?: boolean[];
}

export function createMachineBotPlayer(
  slotIndex: number,
  totalRounds: number,
  targetPct: BotTargetAccuracy
): PlayerState {
  return {
    id: 'bot_machine_player',
    name: 'Máquina (Robô)',
    avatarId: 'robo_calc|#A855F7|headphones',
    color: '#A855F7',
    slotIndex,
    score: 0,
    stars: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    totalAnswered: 0,
    totalAnswerTimeMs: 0,
    currentAnswer: null,
    answerTimeMs: null,
    lastPointsEarned: 0,
    isConnected: true,
    isHost: false,
    powerUpsUsed: {
      FIFTY_FIFTY: false,
      FREEZE_TIME: false,
      DOUBLE_STARS: false,
    },
    eliminatedOptions: [],
    doubleStarsActive: false,
    continueChoice: 'YES',
    medals: [],
    operationStats: createEmptyOperationStats(),
    wrongAttemptsOnCurrent: 0,
    failedOptionsOnCurrent: [],
    visualHintUnlocked: false,
    visualHintActive: false,
    isBot: true,
    botTargetAccuracyPct: targetPct,
    botPlannedOutcomes: buildBotPlannedOutcomes(totalRounds, targetPct),
  };
}

export function syncMachineBotInRoom(state: RoomState): void {
  const humanPlayers = state.players.filter((p) => !p.isBot);

  if (humanPlayers.length > 1 || !state.settings.vsMachine) {
    state.players = state.players.filter((p) => !p.isBot);
    if (humanPlayers.length > 1) {
      state.settings.vsMachine = false;
    }
    return;
  }

  // Only 0 or 1 human player and vsMachine is enabled
  if (!state.settings.botAccuracyMode) {
    state.settings.botAccuracyMode = 'RANDOM';
  }
  const targetPct =
    state.settings.resolvedBotTargetPct ||
    resolveBotAccuracyTarget(state.settings.botAccuracyMode);
  state.settings.resolvedBotTargetPct = targetPct;

  let existingBot = state.players.find((p) => p.isBot);
  if (!existingBot) {
    const usedSlots = new Set(humanPlayers.map((p) => p.slotIndex));
    // Prefer slot 1 so slot 0 remains available for Player 1
    let slotIndex = usedSlots.has(0) ? 1 : 1;
    while (usedSlots.has(slotIndex) && slotIndex < 4) slotIndex++;
    existingBot = createMachineBotPlayer(slotIndex, state.settings.totalRounds, targetPct);
    state.players.push(existingBot);
  } else {
    existingBot.isConnected = true;
    existingBot.botTargetAccuracyPct = targetPct;
    if (
      !existingBot.botPlannedOutcomes ||
      existingBot.botPlannedOutcomes.length !== state.settings.totalRounds
    ) {
      existingBot.botPlannedOutcomes = buildBotPlannedOutcomes(
        state.settings.totalRounds,
        targetPct
      );
    }
  }
}

export function lockMachineBotAnswer(state: RoomState): boolean {
  if (state.status !== 'QUESTION_ACTIVE' || !state.currentQuestion) return false;
  const bot = state.players.find((p) => p.isBot);
  if (!bot || bot.currentAnswer !== null) return false;

  const q = state.currentQuestion;
  const targetPct =
    bot.botTargetAccuracyPct ||
    state.settings.resolvedBotTargetPct ||
    resolveBotAccuracyTarget(state.settings.botAccuracyMode);

  if (!bot.botPlannedOutcomes || bot.botPlannedOutcomes.length !== state.settings.totalRounds) {
    bot.botPlannedOutcomes = buildBotPlannedOutcomes(state.settings.totalRounds, targetPct);
  }

  const roundIdx = Math.max(0, Math.min(bot.botPlannedOutcomes.length - 1, q.roundNumber - 1));
  const shouldBeCorrect = Boolean(bot.botPlannedOutcomes[roundIdx]);

  let chosenIndex = q.correctIndex;
  if (!shouldBeCorrect) {
    const wrongOptions = [0, 1, 2, 3].filter((idx) => idx !== q.correctIndex);
    chosenIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  }

  const elapsed = Math.max(1500, Math.min(q.durationMs - 400, Date.now() - q.startedAt));
  bot.currentAnswer = chosenIndex;
  bot.answerTimeMs = elapsed;
  bot.totalAnswered += 1;
  bot.totalAnswerTimeMs += elapsed;
  return true;
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

/**
 * Generates a complete 1-to-10 Multiplication Table pack for a specific number (1..10)
 */
export function buildMultiplicationTablePack(tableNumber: number): CustomEquationItem[] {
  const n = Math.max(1, Math.min(12, Math.round(tableNumber)));
  const now = Date.now();
  const list: CustomEquationItem[] = [];
  for (let factor = 1; factor <= 10; factor++) {
    list.push({
      id: `tab_${n}x${factor}_${now}_${factor}`,
      termA: n,
      operator: '×',
      termB: factor,
      correctAnswer: n * factor,
    });
  }
  return list;
}

/**
 * Fisher-Yates shuffle for custom equations that guarantees a new order when length > 1
 */
export function shuffleCustomEquations(items: CustomEquationItem[]): CustomEquationItem[] {
  const current = [...items];
  if (current.length <= 1) return current;
  const shuffled = [...current];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  const isSameOrder = shuffled.every((item, idx) => item.id === current[idx].id);
  if (isSameOrder) {
    const first = shuffled[0];
    shuffled[0] = shuffled[shuffled.length - 1];
    shuffled[shuffled.length - 1] = first;
  }
  return shuffled;
}

/**
 * Generates 4 multiple-choice options with smart pedagogical distractors
 * (adjacent multiples, ±10 decade errors, digit transposition, and close neighbors)
 */
export function buildSmartPedagogicalOptions(
  correctAnswer: number,
  terms: number[],
  operator: MathOperator
): { options: number[]; correctIndex: number } {
  const a = terms[0] ?? 2;
  const b = terms[1] ?? 2;
  const candidates: number[] = [];

  if (operator === '×') {
    // Adjacent multiplication table results (most realistic student slip-ups)
    candidates.push(
      a * Math.max(1, b - 1),
      a * (b + 1),
      Math.max(1, a - 1) * b,
      (a + 1) * b,
      correctAnswer + a,
      correctAnswer - a,
      correctAnswer + b,
      correctAnswer - b,
      correctAnswer + 2,
      correctAnswer - 2,
      correctAnswer + 1,
      correctAnswer - 1
    );
  } else if (operator === '÷') {
    candidates.push(
      correctAnswer - 1,
      correctAnswer + 1,
      correctAnswer - 2,
      correctAnswer + 2,
      b !== correctAnswer ? b : correctAnswer + 3,
      correctAnswer + 3
    );
  } else {
    // Addition & Subtraction: close neighbors and ±10 decade slips
    candidates.push(
      correctAnswer + 1,
      correctAnswer - 1,
      correctAnswer + 2,
      correctAnswer - 2
    );
    if (correctAnswer > 10) {
      candidates.push(correctAnswer + 10, correctAnswer - 10);
    }
    candidates.push(correctAnswer + 3, correctAnswer - 3);
  }

  // Add digit transposition for 2-digit answers (e.g., 56 -> 65, 24 -> 42)
  if (correctAnswer >= 12 && correctAnswer <= 98) {
    const tens = Math.floor(correctAnswer / 10);
    const ones = correctAnswer % 10;
    if (ones !== 0 && tens !== ones) {
      candidates.push(ones * 10 + tens);
    }
  }

  // Shuffle candidate pool and pick 3 unique positive distractors
  const shuffledCandidates = candidates.sort(() => Math.random() - 0.5);
  const distractors = new Set<number>();

  for (const val of shuffledCandidates) {
    const rounded = Math.round(val);
    if (rounded >= 1 && rounded !== correctAnswer) {
      distractors.add(rounded);
    }
    if (distractors.size >= 3) break;
  }

  let fallbackOffset = 1;
  while (distractors.size < 3) {
    const candidate = Math.max(1, correctAnswer + fallbackOffset);
    if (candidate !== correctAnswer && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    fallbackOffset = fallbackOffset > 0 ? -fallbackOffset : -fallbackOffset + 1;
  }

  const options = [correctAnswer, ...Array.from(distractors).slice(0, 3)].sort(
    () => Math.random() - 0.5
  );
  return {
    options,
    correctIndex: options.indexOf(correctAnswer),
  };
}

/**
 * Converts a mathematical operator symbol into spoken Portuguese (pt-BR)
 */
export function operatorToSpokenPtBr(op: MathOperator | string): string {
  switch (op) {
    case '+':
      return 'mais';
    case '-':
    case '−':
      return 'menos';
    case '×':
    case '*':
    case 'x':
      return 'vezes';
    case '÷':
    case '/':
      return 'dividido por';
    default:
      return 'mais';
  }
}

/**
 * Formats a question into the spoken formula: "Quanto é N [equação] N?"
 */
export function formatQuestionSpeechFormula(question: {
  equationFormat?: 'MISSING_ADDEND' | 'STANDARD_RESULT';
  terms: number[];
  operators: MathOperator[];
  targetValue?: number;
}): string {
  const a = question.terms[0] ?? 0;
  const b = question.terms[1] ?? 0;
  const opWord = operatorToSpokenPtBr(question.operators[0] || '+');

  if (question.equationFormat === 'MISSING_ADDEND' && typeof question.targetValue === 'number') {
    return `Quanto é ${a} mais quanto igual a ${question.targetValue}?`;
  }

  return `Quanto é ${a} ${opWord} ${b}?`;
}

/**
 * Formats the spoken correct answer reveal: "Resposta certa N"
 */
export function formatAnswerRevealSpeech(correctAnswer: number): string {
  return `Resposta certa ${correctAnswer}`;
}


