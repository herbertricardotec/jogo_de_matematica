import type { IncomingMessage, ServerResponse } from 'http';
import {
  BotAccuracyMode,
  buildBotPlannedOutcomes,
  buildSmartPedagogicalOptions,
  createEmptyOperationStats,
  CustomEquationItem,
  DifficultyLevel,
  ensureUniquePlayerAvatar,
  evaluatePlayerMedals,
  formatQuestionSpeechFormula,
  GameMode,
  GameSettings,
  LearningModuleId,
  lockMachineBotAnswer,
  MathQuestion,
  PLAYER_AVATARS,
  PowerUpType,
  resolveBotAccuracyTarget,
  RoomState,
  syncMachineBotInRoom,
  VisualBlockGroup,
} from '../src/types/game.ts';

// Global in-memory store across warm Vercel Serverless Function invocations
const globalStore = globalThis as unknown as {
  __mathshow_rooms?: Map<string, RoomState>;
};
if (!globalStore.__mathshow_rooms) {
  globalStore.__mathshow_rooms = new Map<string, RoomState>();
}
const rooms = globalStore.__mathshow_rooms;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePinCode(): string {
  for (let i = 0; i < 100; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    if (!rooms.has(pin)) return pin;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

function extractColorFromAvatarId(avatarId: string, fallbackSlot: number): string {
  if (avatarId.includes('|')) {
    const parts = avatarId.split('|');
    if (parts[1] && parts[1].startsWith('#')) return parts[1];
  }
  return PLAYER_AVATARS[fallbackSlot % PLAYER_AVATARS.length].color;
}

function buildModuleQuestion(
  roundNumber: number,
  totalRounds: number,
  difficulty: DifficultyLevel,
  moduleId: LearningModuleId,
  customQuestions?: CustomEquationItem[],
  useCustomQuestions?: boolean
): MathQuestion {
  const isLightningRound = roundNumber === totalRounds;
  const maxSimple = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 9 : 12;

  let terms: number[] = [];
  let operators: ('+' | '-' | '×' | '÷')[] = [];
  let correctAnswer = 0;
  let expression = '';
  let equationFormat: 'MISSING_ADDEND' | 'STANDARD_RESULT' = 'STANDARD_RESULT';
  let targetValue: number | undefined = undefined;
  let promptText = '';
  let speechText = '';
  let mentalMathTip = '';
  let categoryLabel = '';
  let visualBlocks: VisualBlockGroup[] = [];

  if (useCustomQuestions && customQuestions && customQuestions.length > 0) {
    const custom = customQuestions[(roundNumber - 1) % customQuestions.length];
    const a = custom.termA;
    const b = custom.termB;
    const op = custom.operator;
    correctAnswer = custom.correctAnswer;
    terms = [a, b];
    operators = [op];
    equationFormat = 'STANDARD_RESULT';
    expression = `${a} ${op} ${b}`;
    categoryLabel = 'Modo Professor · Partida Personalizada';
    if (op === '+') {
      promptText = `Desafio Personalizado: Qual é a soma de ${a} mais ${b}?`;
      speechText = `Atividade ${roundNumber}. Quanto é ${a} mais ${b}?`;
      mentalMathTip = `${a} + ${b} = ${correctAnswer}`;
      visualBlocks = [
        { count: Math.min(a, 10), colorHex: '#22C55E', label: `${a}` },
        { count: Math.min(b, 10), colorHex: '#007AFF', label: `+ ${b}` },
      ];
    } else if (op === '-') {
      promptText = `Desafio Personalizado: Quanto é ${a} menos ${b}?`;
      speechText = `Atividade ${roundNumber}. Quanto é ${a} menos ${b}?`;
      mentalMathTip = `${a} - ${b} = ${correctAnswer}`;
      visualBlocks = [
        { count: Math.min(a, 10), colorHex: '#F97316', label: `${a}` },
        { count: Math.min(b, 10), colorHex: '#EF4444', label: `- ${b}` },
      ];
    } else if (op === '×') {
      promptText = `Modo Professor: Quanto é ${a} vezes ${b}?`;
      speechText = `Atividade ${roundNumber}. Quanto é ${a} vezes ${b}?`;
      mentalMathTip = `${a} × ${b} = ${correctAnswer}`;
      visualBlocks = [
        { count: Math.min(a, 8), colorHex: '#A855F7', label: `${a} grupos` },
        { count: Math.min(b, 8), colorHex: '#FFD600', label: `× ${b} blocos` },
      ];
    } else {
      promptText = `Modo Professor: Quanto é ${a} dividido por ${b}?`;
      speechText = `Atividade ${roundNumber}. Quanto é ${a} dividido por ${b}?`;
      mentalMathTip = `${a} ÷ ${b} = ${correctAnswer}`;
      visualBlocks = [
        { count: Math.min(a, 10), colorHex: '#A855F7', label: `Total: ${a}` },
        { count: Math.min(b, 8), colorHex: '#EC4899', label: `÷ ${b} partes` },
      ];
    }
  } else if (moduleId === 'MODULE_1_NUMBERS') {
    const target = randomInt(3, Math.min(10, maxSimple + 2));
    const current = randomInt(1, target - 1);
    correctAnswer = target - current;
    terms = [current, correctAnswer];
    operators = ['+'];
    equationFormat = 'MISSING_ADDEND';
    targetValue = target;
    expression = `${current} + ? = ${target}`;
    promptText = `Quantos blocos faltam para chegar no ${target}?`;
    speechText = `Atividade ${roundNumber}. Temos ${current} blocos na mesa. Quantos blocos faltam para chegar no número ${target}?`;
    categoryLabel = 'Módulo 1 · Conhecendo os Números';
    mentalMathTip = `Já temos ${current} bloco(s). Adicionando mais ${correctAnswer} bloco(s): ${current} + ${correctAnswer} = ${target}!`;
    visualBlocks = [
      { count: current, colorHex: '#007AFF', label: `Temos ${current}` },
      { count: target, colorHex: '#FFD600', label: `Meta: ${target}` },
    ];
  } else if (moduleId === 'MODULE_2_ADDITION') {
    const maxTerm = difficulty === 'EASY' ? 8 : difficulty === 'MEDIUM' ? 25 : 65;
    const a = randomInt(2, maxTerm);
    const b = randomInt(2, maxTerm);
    correctAnswer = a + b;
    terms = [a, b];
    operators = ['+'];
    expression = `${a} + ${b}`;
    promptText = `Qual é a soma dos blocos ${a} mais ${b}?`;
    speechText = `Atividade ${roundNumber}. Quanto é ${a} mais ${b}?`;
    categoryLabel = 'Módulo 2 · Somando com Blocos';
    mentalMathTip = `Empilhando ${a} com ${b}, chegamos ao total de ${correctAnswer}!`;
    visualBlocks = [
      { count: Math.min(a, 10), colorHex: '#22C55E', label: `${a}` },
      { count: Math.min(b, 10), colorHex: '#007AFF', label: `+ ${b}` },
    ];
  } else if (moduleId === 'MODULE_3_SUBTRACTION') {
    const maxTop = difficulty === 'EASY' ? 12 : difficulty === 'MEDIUM' ? 40 : 95;
    const a = randomInt(5, maxTop);
    const b = randomInt(2, a - 1);
    correctAnswer = a - b;
    terms = [a, b];
    operators = ['-'];
    expression = `${a} - ${b}`;
    promptText = `Se tirarmos ${b} blocos de ${a}, quantos ficam?`;
    speechText = `Atividade ${roundNumber}. Quanto é ${a} menos ${b}?`;
    categoryLabel = 'Módulo 3 · Subtraindo e Desmontando';
    mentalMathTip = `Começando com ${a} e desmontando ${b} bloco(s), restam ${correctAnswer}.`;
    visualBlocks = [
      { count: Math.min(a, 10), colorHex: '#F97316', label: `Torre: ${a}` },
      { count: Math.min(b, 10), colorHex: '#EF4444', label: `Tirar: -${b}` },
    ];
  } else {
    const a = randomInt(2, 6);
    const b = randomInt(2, 6);
    correctAnswer = a * b;
    terms = [a, b];
    operators = ['×'];
    expression = `${a} × ${b}`;
    promptText = `${a} grupos de ${b} blocos formam quantos blocos?`;
    speechText = `Desafio dos símbolos! Quanto é ${a} vezes ${b}?`;
    categoryLabel = 'Módulo 4 · Desafio dos Símbolos';
    mentalMathTip = `${a} grupos com ${b} unidades somam ${correctAnswer}!`;
    visualBlocks = [
      { count: Math.min(a, 8), colorHex: '#A855F7', label: `${a} grupos` },
      { count: Math.min(b, 8), colorHex: '#FFD600', label: `× ${b} blocos` },
    ];
  }

  speechText = formatQuestionSpeechFormula({
    equationFormat,
    terms,
    operators,
    targetValue,
  });

  const { options, correctIndex } = buildSmartPedagogicalOptions(
    correctAnswer,
    terms,
    operators[0] || '+'
  );

  return {
    id: `q_${Date.now()}_${roundNumber}`,
    roundNumber,
    totalRounds,
    expression,
    equationFormat,
    targetValue,
    promptText,
    speechText,
    terms,
    operators,
    correctAnswer,
    correctIndex,
    options,
    mentalMathTip,
    categoryLabel: isLightningRound ? `⭐ Rodada Estrela em Dobro (2x)` : categoryLabel,
    visualBlocks,
    startedAt: Date.now(),
    durationMs: 18000,
    isLightningRound,
  };
}

function createRoomState(codeOverride?: string): RoomState {
  const code = codeOverride && codeOverride.length === 4 ? codeOverride : generatePinCode();
  const settings: GameSettings = {
    mode: 'COMPETITIVE',
    difficulty: 'EASY',
    moduleId: 'MODULE_1_NUMBERS',
    totalRounds: 5,
    timePerQuestionSec: 18,
    useCustomQuestions: false,
    customQuestions: [],
    vsMachine: false,
    botAccuracyMode: 'RANDOM',
    resolvedBotTargetPct: 60,
  };
  const state: RoomState = {
    code,
    status: 'TITLE_MENU',
    settings,
    players: [],
    currentQuestion: null,
    teamScore: 0,
    teamTarget: 3000,
    pausedRemainingMs: null,
    lastPowerUpAnnouncement: null,
    gameOverStartedAt: null,
    gameOverDurationMs: 25000,
    lastUpdatedAt: Date.now(),
  };
  rooms.set(code, state);
  return state;
}

function advanceTimersOnRead(room: RoomState) {
  const now = Date.now();
  if (room.status === 'QUESTION_ACTIVE' && room.currentQuestion) {
    const elapsed = now - room.currentQuestion.startedAt;
    // Have the Machine Bot lock its answer around 3 seconds into the question
    if (elapsed >= 3000) {
      lockMachineBotAnswer(room);
    }
    if (elapsed >= room.currentQuestion.durationMs) {
      lockMachineBotAnswer(room);
      revealCurrentRound(room);
    }
  } else if (room.status === 'ROUND_REVEAL' && room.currentQuestion) {
    const revealStart = room.currentQuestion.revealStartedAt || now;
    const revealDur = room.currentQuestion.revealDurationMs || 4000;
    if (now - revealStart >= revealDur) {
      if (room.currentQuestion.roundNumber >= room.settings.totalRounds) {
        room.status = 'GAME_OVER';
        room.gameOverStartedAt = now;
        for (const p of room.players) {
          p.continueChoice = p.isBot ? 'YES' : 'PENDING';
          p.medals = evaluatePlayerMedals(p, room.settings.totalRounds);
        }
      } else {
        startQuestion(room, room.currentQuestion.roundNumber + 1);
      }
    }
  } else if (room.status === 'GAME_OVER' && room.gameOverStartedAt) {
    if (now - room.gameOverStartedAt >= room.gameOverDurationMs) {
      room.status = 'TITLE_MENU';
      room.currentQuestion = null;
      room.gameOverStartedAt = null;
    }
  }
}

function startQuestion(room: RoomState, roundNumber: number) {
  const q = buildModuleQuestion(
    roundNumber,
    room.settings.totalRounds,
    room.settings.difficulty,
    room.settings.moduleId,
    room.settings.customQuestions,
    room.settings.useCustomQuestions
  );
  q.durationMs = room.settings.timePerQuestionSec * 1000;
  q.startedAt = Date.now();
  room.status = 'QUESTION_ACTIVE';
  room.currentQuestion = q;
  room.lastPowerUpAnnouncement = null;
  for (const p of room.players) {
    p.currentAnswer = null;
    p.answerTimeMs = null;
    p.lastPointsEarned = 0;
    p.eliminatedOptions = [];
    p.doubleStarsActive = false;
    p.wrongAttemptsOnCurrent = 0;
    p.failedOptionsOnCurrent = [];
    p.visualHintUnlocked = false;
    p.visualHintActive = false;
  }
  room.lastUpdatedAt = Date.now();
}

function revealCurrentRound(room: RoomState) {
  const q = room.currentQuestion;
  if (!q) return;
  room.status = 'ROUND_REVEAL';
  q.revealStartedAt = Date.now();
  q.revealDurationMs = 4000;

  const currentOp = q.operators?.[0] || '+';

  for (const p of room.players) {
    if (!p.operationStats) {
      p.operationStats = createEmptyOperationStats();
    }
    p.operationStats[currentOp].total += 1;

    if (p.currentAnswer === q.correctIndex) {
      p.operationStats[currentOp].correct += 1;
      const answerMs = p.answerTimeMs ?? q.durationMs;
      const speedRatio = Math.max(0, 1 - answerMs / q.durationMs);
      const speedBonus = Math.round(speedRatio * 400);
      p.streak += 1;
      if (p.streak > p.bestStreak) p.bestStreak = p.streak;
      const streakBonus = Math.min(300, (p.streak - 1) * 100);
      const mult = (q.isLightningRound ? 2 : 1) * (p.doubleStarsActive ? 2 : 1);
      const earned = (500 + speedBonus + streakBonus) * mult;
      p.lastPointsEarned = earned;
      p.score += earned;
      p.stars += p.doubleStarsActive ? 2 : 1;
      p.correctCount += 1;
      room.teamScore += earned;
    } else {
      p.streak = 0;
      p.lastPointsEarned = 0;
    }
  }
  room.lastUpdatedAt = Date.now();
}

function hydrateOrGetRoom(code: string, snapshot?: RoomState | null): { room: RoomState; recovered: boolean } {
  const cleanCode = code && code.length === 4 ? code : generatePinCode();
  const existing = rooms.get(cleanCode);
  if (existing) {
    return { room: existing, recovered: false };
  }
  if (snapshot && snapshot.code === cleanCode && Array.isArray(snapshot.players)) {
    const hydrated: RoomState = {
      ...snapshot,
      code: cleanCode,
      lastUpdatedAt: Date.now(),
    };
    rooms.set(cleanCode, hydrated);
    return { room: hydrated, recovered: false };
  }
  const created = createRoomState(cleanCode);
  return { room: created, recovered: true };
}

export default async function handler(req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'GET') {
    const url = new URL(req.url || '/', 'http://localhost');
    const code = (url.searchParams.get('code') || '').trim();
    const { room, recovered } = hydrateOrGetRoom(code);
    advanceTimersOnRead(room);
    res.statusCode = 200;
    res.end(JSON.stringify({ state: room, recovered }));
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (!body || typeof body === 'string') {
      const chunks: Buffer[] = [];
      let totalBytes = 0;
      for await (const chunk of req) {
        const buf = Buffer.from(chunk);
        totalBytes += buf.length;
        // Buffer overflow protection: cap request payload at 256KB
        if (totalBytes > 262144) break;
        chunks.push(buf);
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = {};
      }
    }

    const type = body.type;
    const code = String(body.code || '').trim();
    const snapshot = body.stateSnapshot as RoomState | undefined;

    if (type === 'room:create') {
      const { room } = hydrateOrGetRoom(code, snapshot);
      advanceTimersOnRead(room);
      res.statusCode = 200;
      res.end(JSON.stringify({ state: room }));
      return;
    }

    const { room } = hydrateOrGetRoom(code, snapshot);

    if (type === 'room:sync_snapshot' && snapshot && snapshot.code === room.code) {
      // Merge client buffer snapshot when serverless isolate cold-started
      if (snapshot.lastUpdatedAt >= room.lastUpdatedAt || room.players.length === 0) {
        Object.assign(room, snapshot);
        rooms.set(room.code, room);
      }
      advanceTimersOnRead(room);
      res.statusCode = 200;
      res.end(JSON.stringify({ state: room }));
      return;
    }

    advanceTimersOnRead(room);

    if (type === 'room:watch') {
      res.statusCode = 200;
      res.end(JSON.stringify({ state: room }));
      return;
    }

    if (type === 'room:join') {
      const playerId = String(body.playerId || `p_${Date.now()}`);
      const name = String(body.name || 'Jogador').trim().slice(0, 14) || 'Jogador';
      const rawAvatarId = String(body.avatarId || PLAYER_AVATARS[0].id);
      const avatarId = ensureUniquePlayerAvatar(rawAvatarId, room.players, playerId);

      let existing = room.players.find((p) => p.id === playerId && !p.isBot);
      if (existing) {
        existing.name = name;
        existing.avatarId = avatarId;
        existing.color = extractColorFromAvatarId(avatarId, existing.slotIndex);
        existing.isConnected = true;
      } else {
        const humanPlayers = room.players.filter((p) => !p.isBot);
        if (humanPlayers.length >= 1) {
          room.players = room.players.filter((p) => !p.isBot);
          room.settings.vsMachine = false;
        }
        const usedSlots = new Set(room.players.map((p) => p.slotIndex));
        let slotIndex = 0;
        while (usedSlots.has(slotIndex) && slotIndex < 4) slotIndex++;
        existing = {
          id: playerId,
          name,
          avatarId,
          color: extractColorFromAvatarId(avatarId, slotIndex),
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
          isHost: humanPlayers.length === 0,
          powerUpsUsed: { FIFTY_FIFTY: false, FREEZE_TIME: false, DOUBLE_STARS: false },
          eliminatedOptions: [],
          doubleStarsActive: false,
          continueChoice: 'PENDING',
          medals: [],
          operationStats: createEmptyOperationStats(),
          wrongAttemptsOnCurrent: 0,
          failedOptionsOnCurrent: [],
          visualHintUnlocked: false,
          visualHintActive: false,
        };
        room.players.push(existing);
      }
      syncMachineBotInRoom(room);
      if (room.status === 'TITLE_MENU') room.status = 'LOBBY';
      room.lastUpdatedAt = Date.now();
    } else if (type === 'admin:kick_player') {
      const idx = room.players.findIndex((p) => p.id === body.playerId);
      if (idx !== -1) {
        const removed = room.players[idx];
        room.players.splice(idx, 1);
        if (removed.isHost && room.players.length > 0 && !room.players.some((p) => p.isHost)) {
          room.players[0].isHost = true;
        }
        room.lastPowerUpAnnouncement = `${removed.name} foi desconectado pelo Painel Administrativo.`;
      }
    } else if (type === 'admin:rotate_pin') {
      const newPin = generatePinCode();
      rooms.delete(room.code);
      room.code = newPin;
      rooms.set(newPin, room);
      room.lastPowerUpAnnouncement = `Novo código PIN gerado: ${newPin}`;
    } else if (type === 'admin:set_custom_questions') {
      const customList = Array.isArray(body.customQuestions)
        ? (body.customQuestions as CustomEquationItem[])
        : [];
      const useCustom = Boolean(body.useCustomQuestions) && customList.length > 0;
      room.settings.customQuestions = customList;
      room.settings.useCustomQuestions = useCustom;
      if (useCustom && customList.length > 0) {
        room.settings.totalRounds = Math.min(15, Math.max(1, customList.length));
        room.lastPowerUpAnnouncement = `Modo Professor ativado com ${customList.length} conta(s) personalizada(s)!`;
      } else {
        room.lastPowerUpAnnouncement = `Modo Professor desativado. Usando módulos padrão.`;
      }
    } else if (type === 'game:set_status') {
      if (body.status === 'LOBBY' || body.status === 'TITLE_MENU') {
        room.status = body.status;
      }
    } else if (type === 'game:configure') {
      if (body.mode) room.settings.mode = body.mode;
      if (body.difficulty) room.settings.difficulty = body.difficulty;
      if (body.moduleId) room.settings.moduleId = body.moduleId;
      if (typeof body.totalRounds === 'number') room.settings.totalRounds = body.totalRounds;
      if (typeof body.vsMachine === 'boolean') {
        room.settings.vsMachine = body.vsMachine;
        if (
          room.settings.vsMachine &&
          !room.settings.useCustomQuestions &&
          room.settings.totalRounds % 5 !== 0
        ) {
          room.settings.totalRounds = 5;
        }
      }
      if (
        body.botAccuracyMode === 'RANDOM' ||
        body.botAccuracyMode === 100 ||
        body.botAccuracyMode === 60 ||
        body.botAccuracyMode === 40 ||
        body.botAccuracyMode === 20
      ) {
        room.settings.botAccuracyMode = body.botAccuracyMode as BotAccuracyMode;
        room.settings.resolvedBotTargetPct = resolveBotAccuracyTarget(room.settings.botAccuracyMode);
      }
      syncMachineBotInRoom(room);
    } else if (type === 'game:start') {
      const humanPlayers = room.players.filter((p) => !p.isBot);
      if (humanPlayers.length === 0) {
        room.players.unshift({
          id: 'tv_local_player_1',
          name: 'Jogador TV 1',
          avatarId: PLAYER_AVATARS[0].id,
          color: PLAYER_AVATARS[0].color,
          slotIndex: 0,
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
          isHost: true,
          powerUpsUsed: { FIFTY_FIFTY: false, FREEZE_TIME: false, DOUBLE_STARS: false },
          eliminatedOptions: [],
          doubleStarsActive: false,
          continueChoice: 'PENDING',
          medals: [],
          operationStats: createEmptyOperationStats(),
          wrongAttemptsOnCurrent: 0,
          failedOptionsOnCurrent: [],
          visualHintUnlocked: false,
          visualHintActive: false,
        });
      }
      if (room.settings.vsMachine) {
        room.settings.resolvedBotTargetPct = resolveBotAccuracyTarget(
          room.settings.botAccuracyMode
        );
        if (!room.settings.useCustomQuestions && room.settings.totalRounds % 5 !== 0) {
          room.settings.totalRounds = 5;
        }
      }
      syncMachineBotInRoom(room);
      for (const p of room.players) {
        p.score = 0;
        p.stars = 0;
        p.streak = 0;
        p.bestStreak = 0;
        p.correctCount = 0;
        p.totalAnswered = 0;
        p.totalAnswerTimeMs = 0;
        p.medals = [];
        p.powerUpsUsed = { FIFTY_FIFTY: false, FREEZE_TIME: false, DOUBLE_STARS: false };
        p.wrongAttemptsOnCurrent = 0;
        p.failedOptionsOnCurrent = [];
        p.visualHintUnlocked = false;
        p.visualHintActive = false;
        if (p.isBot) {
          const pct =
            room.settings.resolvedBotTargetPct ||
            resolveBotAccuracyTarget(room.settings.botAccuracyMode);
          p.botTargetAccuracyPct = pct;
          p.botPlannedOutcomes = buildBotPlannedOutcomes(room.settings.totalRounds, pct);
        }
      }
      startQuestion(room, 1);
    } else if (type === 'player:answer') {
      const q = room.currentQuestion;
      const p = room.players.find((pl) => pl.id === body.playerId) || room.players[0];
      const optionIndex = Number(body.optionIndex);
      if (
        q &&
        p &&
        p.currentAnswer === null &&
        !isNaN(optionIndex) &&
        optionIndex >= 0 &&
        optionIndex <= 3
      ) {
        const isCorrectChoice = optionIndex === q.correctIndex;
        const attemptsSoFar = p.wrongAttemptsOnCurrent || 0;

        if (!isCorrectChoice && attemptsSoFar < 2) {
          p.wrongAttemptsOnCurrent = attemptsSoFar + 1;
          if (!p.failedOptionsOnCurrent) p.failedOptionsOnCurrent = [];
          if (!p.failedOptionsOnCurrent.includes(optionIndex)) {
            p.failedOptionsOnCurrent.push(optionIndex);
          }

          if (p.wrongAttemptsOnCurrent === 1) {
            room.lastPowerUpAnnouncement = `${p.name} tentou um bloco incorreto (1/2) — tente mais uma vez!`;
          } else if (p.wrongAttemptsOnCurrent >= 2) {
            p.visualHintUnlocked = true;
            p.visualHintActive = true;
            q.durationMs += 6000;
            room.lastPowerUpAnnouncement = `💡 Dica Visual 3D ativada para ${p.name}! Veja os blocos sendo contados!`;
          }
        } else {
          p.currentAnswer = optionIndex;
          p.answerTimeMs = Math.max(100, Date.now() - q.startedAt);
          p.totalAnswered += 1;
          p.totalAnswerTimeMs += p.answerTimeMs;
          const humans = room.players.filter((pl) => !pl.isBot);
          if (humans.length > 0 && humans.every((pl) => pl.currentAnswer !== null)) {
            lockMachineBotAnswer(room);
          }
          if (room.players.every((pl) => pl.currentAnswer !== null)) {
            revealCurrentRound(room);
          }
        }
      }
    } else if (type === 'player:activate_visual_hint') {
      const p = room.players.find((pl) => pl.id === body.playerId) || room.players[0];
      if (p && p.visualHintUnlocked) {
        p.visualHintActive = true;
      }
    } else if (type === 'player:use_powerup') {
      const q = room.currentQuestion;
      const p = room.players.find((pl) => pl.id === body.playerId) || room.players[0];
      const powerUp = body.powerUp as PowerUpType;
      if (q && p && powerUp && !p.powerUpsUsed[powerUp]) {
        p.powerUpsUsed[powerUp] = true;
        if (powerUp === 'FIFTY_FIFTY') {
          p.eliminatedOptions = [0, 1, 2, 3].filter((i) => i !== q.correctIndex).slice(0, 2);
        } else if (powerUp === 'FREEZE_TIME') {
          q.durationMs += 5000;
        } else if (powerUp === 'DOUBLE_STARS') {
          p.doubleStarsActive = true;
        }
      }
    } else if (type === 'game:next_round') {
      if (room.currentQuestion) {
        if (room.currentQuestion.roundNumber >= room.settings.totalRounds) {
          room.status = 'GAME_OVER';
          room.gameOverStartedAt = Date.now();
          for (const p of room.players) {
            p.medals = evaluatePlayerMedals(p, room.settings.totalRounds);
          }
        } else {
          startQuestion(room, room.currentQuestion.roundNumber + 1);
        }
      }
    } else if (type === 'game:restart') {
      room.status = 'LOBBY';
      room.currentQuestion = null;
    } else if (type === 'player:continue_decision') {
      const idx = room.players.findIndex((p) => p.id === body.playerId);
      if (idx !== -1) {
        if (body.continueGame) {
          room.players[idx].continueChoice = 'YES';
        } else {
          room.players.splice(idx, 1);
          const newPin = generatePinCode();
          rooms.delete(room.code);
          room.code = newPin;
          rooms.set(newPin, room);
        }
      }
    }

    room.lastUpdatedAt = Date.now();
    res.statusCode = 200;
    res.end(JSON.stringify({ state: room }));
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
