import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
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
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InternalRoom {
  state: RoomState;
  clients: Set<WebSocket>;
  playerSockets: Map<string, WebSocket>;
  roundTimer: NodeJS.Timeout | null;
  revealTimer: NodeJS.Timeout | null;
  gameOverTimer: NodeJS.Timeout | null;
  botTimer: NodeJS.Timeout | null;
  questionRemainingMs: number;
}

const rooms = new Map<string, InternalRoom>();

function generatePinCode(): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    if (!rooms.has(pin)) return pin;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extractColorFromAvatarId(avatarId: string, fallbackSlot: number): string {
  if (avatarId.includes('|')) {
    const parts = avatarId.split('|');
    if (parts[1] && parts[1].startsWith('#')) {
      return parts[1];
    }
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
    // Module 1: Conhecendo os Números (e.g., 3 + [ ? ] = 4)
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
    // Module 2: Somando com Blocos (+)
    const maxTerm = difficulty === 'EASY' ? 8 : difficulty === 'MEDIUM' ? 25 : 65;
    const a = randomInt(2, maxTerm);
    const b = randomInt(2, maxTerm);
    correctAnswer = a + b;
    terms = [a, b];
    operators = ['+'];
    equationFormat = 'STANDARD_RESULT';
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
    // Module 3: Subtraindo e Desmontando (-)
    const maxTop = difficulty === 'EASY' ? 12 : difficulty === 'MEDIUM' ? 40 : 95;
    const a = randomInt(5, maxTop);
    const b = randomInt(2, a - 1);
    correctAnswer = a - b;
    terms = [a, b];
    operators = ['-'];
    equationFormat = 'STANDARD_RESULT';
    expression = `${a} - ${b}`;
    promptText = `Se tirarmos ${b} blocos de ${a}, quantos ficam?`;
    speechText = `Atividade ${roundNumber}. Quanto é ${a} menos ${b}?`;
    categoryLabel = 'Módulo 3 · Subtraindo e Desmontando';
    mentalMathTip = `Começando com ${a} e desmontando ${b} bloco(s), restam ${correctAnswer} (${b} + ${correctAnswer} = ${a}).`;
    visualBlocks = [
      { count: Math.min(a, 10), colorHex: '#F97316', label: `Torre: ${a}` },
      { count: Math.min(b, 10), colorHex: '#EF4444', label: `Tirar: -${b}` },
    ];
  } else {
    // Module 4: Desafio dos Símbolos (×, ÷)
    const isMult = Math.random() > 0.45;
    equationFormat = 'STANDARD_RESULT';
    if (isMult) {
      const maxFactor = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 9 : 12;
      const a = randomInt(2, maxFactor);
      const b = randomInt(2, maxFactor);
      correctAnswer = a * b;
      terms = [a, b];
      operators = ['×'];
      expression = `${a} × ${b}`;
      promptText = `${a} grupos de ${b} blocos formam quantos blocos?`;
      speechText = `Desafio dos símbolos! Quanto é ${a} vezes ${b}?`;
      categoryLabel = 'Módulo 4 · Desafio dos Símbolos';
      mentalMathTip = `${a} grupos com ${b} unidades em cada grupo somam ${correctAnswer}!`;
      visualBlocks = [
        { count: Math.min(a, 8), colorHex: '#A855F7', label: `${a} grupos` },
        { count: Math.min(b, 8), colorHex: '#FFD600', label: `× ${b} blocos` },
      ];
    } else {
      const maxDiv = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 8 : 10;
      const divisor = randomInt(2, maxDiv);
      const quotient = randomInt(2, maxDiv);
      const dividend = divisor * quotient;
      correctAnswer = quotient;
      terms = [dividend, divisor];
      operators = ['÷'];
      expression = `${dividend} ÷ ${divisor}`;
      promptText = `Dividindo ${dividend} blocos em ${divisor} partes iguais:`;
      speechText = `Desafio dos símbolos! Quanto é ${dividend} dividido por ${divisor}?`;
      categoryLabel = 'Módulo 4 · Desafio dos Símbolos';
      mentalMathTip = `Porque ${divisor} × ${quotient} é igual a ${dividend}!`;
      visualBlocks = [
        { count: Math.min(dividend, 10), colorHex: '#A855F7', label: `Total: ${dividend}` },
        { count: Math.min(divisor, 8), colorHex: '#EC4899', label: `÷ ${divisor} partes` },
      ];
    }
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

function createRoom(initialStatus: 'TITLE_MENU' | 'LOBBY' = 'TITLE_MENU'): InternalRoom {
  const code = generatePinCode();
  const defaultSettings: GameSettings = {
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

  const room: InternalRoom = {
    state: {
      code,
      status: initialStatus,
      settings: defaultSettings,
      players: [],
      currentQuestion: null,
      teamScore: 0,
      teamTarget: 3000,
      pausedRemainingMs: null,
      lastPowerUpAnnouncement: null,
      gameOverStartedAt: null,
      gameOverDurationMs: 25000,
      lastUpdatedAt: Date.now(),
    },
    clients: new Set(),
    playerSockets: new Map(),
    roundTimer: null,
    revealTimer: null,
    gameOverTimer: null,
    botTimer: null,
    questionRemainingMs: 18000,
  };

  rooms.set(code, room);
  return room;
}

function rotateRoomPinCode(room: InternalRoom): string {
  const oldCode = room.state.code;
  const newCode = generatePinCode();
  rooms.delete(oldCode);
  room.state.code = newCode;
  rooms.set(newCode, room);
  return newCode;
}

function broadcastRoomState(room: InternalRoom) {
  room.state.lastUpdatedAt = Date.now();
  const payload = JSON.stringify({
    type: 'room:state',
    state: room.state,
  });

  for (const client of room.clients) {
    if (client.readyState === WebSocket.OPEN) {
      // Buffer verification: avoid queuing messages if client socket buffer is congested (>64KB)
      if (client.bufferedAmount < 65536) {
        client.send(payload);
      }
    }
  }
}

function clearRoomTimers(room: InternalRoom) {
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }
  if (room.revealTimer) {
    clearTimeout(room.revealTimer);
    room.revealTimer = null;
  }
  if (room.gameOverTimer) {
    clearTimeout(room.gameOverTimer);
    room.gameOverTimer = null;
  }
  if (room.botTimer) {
    clearTimeout(room.botTimer);
    room.botTimer = null;
  }
}

function transitionToGameOver(room: InternalRoom) {
  clearRoomTimers(room);
  const gameOverDurationMs = 25000;
  room.state.status = 'GAME_OVER';
  room.state.gameOverStartedAt = Date.now();
  room.state.gameOverDurationMs = gameOverDurationMs;
  for (const p of room.state.players) {
    p.continueChoice = p.isBot ? 'YES' : 'PENDING';
    p.medals = evaluatePlayerMedals(p, room.state.settings.totalRounds);
  }
  broadcastRoomState(room);

  // Automatic return to TITLE_MENU if nobody presses Play Again within 25 seconds
  room.gameOverTimer = setTimeout(() => {
    clearRoomTimers(room);
    room.state.status = 'TITLE_MENU';
    room.state.currentQuestion = null;
    room.state.gameOverStartedAt = null;
    room.state.lastPowerUpAnnouncement = null;
    broadcastRoomState(room);
  }, gameOverDurationMs);
}

function startNextQuestion(room: InternalRoom, nextRoundNumber: number) {
  clearRoomTimers(room);

  const { settings } = room.state;
  const durationMs = settings.timePerQuestionSec * 1000;
  const question = buildModuleQuestion(
    nextRoundNumber,
    settings.totalRounds,
    settings.difficulty,
    settings.moduleId,
    settings.customQuestions,
    settings.useCustomQuestions
  );
  question.durationMs = durationMs;
  question.startedAt = Date.now();

  room.state.status = 'QUESTION_ACTIVE';
  room.state.currentQuestion = question;
  room.state.pausedRemainingMs = null;
  room.state.lastPowerUpAnnouncement = null;
  room.state.gameOverStartedAt = null;

  for (const p of room.state.players) {
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

  broadcastRoomState(room);

  // If playing vs Machine, schedule the Machine's answer between 2.4s and 4.5s
  if (room.state.players.some((p) => p.isBot)) {
    const botDelayMs = randomInt(2400, 4500);
    room.botTimer = setTimeout(() => {
      if (room.state.status !== 'QUESTION_ACTIVE') return;
      if (lockMachineBotAnswer(room.state)) {
        broadcastRoomState(room);
        const connectedPlayers = room.state.players.filter((p) => p.isConnected);
        const allAnswered =
          connectedPlayers.length > 0 &&
          connectedPlayers.every((p) => p.currentAnswer !== null);
        if (allAnswered) {
          if (room.roundTimer) {
            clearTimeout(room.roundTimer);
            room.roundTimer = null;
          }
          room.roundTimer = setTimeout(() => {
            if (room.state.status === 'QUESTION_ACTIVE') {
              revealCurrentRound(room);
            }
          }, 650);
        }
      }
    }, botDelayMs);
  }

  room.roundTimer = setTimeout(() => {
    revealCurrentRound(room);
  }, durationMs);
}

function revealCurrentRound(room: InternalRoom) {
  clearRoomTimers(room);
  const question = room.state.currentQuestion;
  if (!question) return;

  const revealDurationMs = 4000;
  room.state.status = 'ROUND_REVEAL';
  question.revealStartedAt = Date.now();
  question.revealDurationMs = revealDurationMs;

  const currentOp = question.operators?.[0] || '+';

  let roundTeamGain = 0;
  for (const p of room.state.players) {
    if (!p.operationStats) {
      p.operationStats = createEmptyOperationStats();
    }
    p.operationStats[currentOp].total += 1;

    if (p.currentAnswer === question.correctIndex) {
      p.operationStats[currentOp].correct += 1;
      const answerMs = p.answerTimeMs ?? question.durationMs;
      const speedRatio = Math.max(0, 1 - answerMs / question.durationMs);
      const basePoints = 500;
      const speedBonus = Math.round(speedRatio * 400);
      p.streak += 1;
      if (p.streak > p.bestStreak) p.bestStreak = p.streak;
      const streakBonus = Math.min(300, (p.streak - 1) * 100);
      const lightningMult = question.isLightningRound ? 2 : 1;
      const powerUpMult = p.doubleStarsActive ? 2 : 1;
      const earned = (basePoints + speedBonus + streakBonus) * lightningMult * powerUpMult;

      p.lastPointsEarned = earned;
      p.score += earned;
      p.stars += p.doubleStarsActive ? 2 : 1;
      p.correctCount += 1;
      roundTeamGain += earned;
    } else {
      p.streak = 0;
      p.lastPointsEarned = 0;
    }
  }

  room.state.teamScore += roundTeamGain;
  broadcastRoomState(room);

  room.revealTimer = setTimeout(() => {
    if (question.roundNumber >= room.state.settings.totalRounds) {
      transitionToGameOver(room);
    } else {
      startNextQuestion(room, question.roundNumber + 1);
    }
  }, revealDurationMs);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  wss.on('connection', (ws) => {
    let currentRoom: InternalRoom | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case 'room:create': {
            const requestedCode = typeof msg.code === 'string' ? msg.code.trim() : '';
            let room = requestedCode ? rooms.get(requestedCode) : undefined;
            if (!room) {
              room = createRoom(msg.initialStatus === 'LOBBY' ? 'LOBBY' : 'TITLE_MENU');
            }
            currentRoom = room;
            room.clients.add(ws);
            broadcastRoomState(room);
            break;
          }

          case 'room:watch': {
            const code = String(msg.code || '').trim();
            const room = rooms.get(code);
            if (!room) {
              ws.send(
                JSON.stringify({
                  type: 'room:error',
                  message: 'Sala não encontrada. Verifique o código de 4 dígitos na TV.',
                })
              );
              return;
            }
            currentRoom = room;
            room.clients.add(ws);
            ws.send(JSON.stringify({ type: 'room:state', state: room.state }));
            break;
          }

          case 'room:join': {
            const code = String(msg.code || '').trim();
            const room = rooms.get(code);
            if (!room) {
              ws.send(
                JSON.stringify({
                  type: 'room:error',
                  message: 'Código de sala inválido! Confira os 4 dígitos na tela da TV.',
                })
              );
              return;
            }

            currentRoom = room;
            room.clients.add(ws);

            const playerId = String(msg.playerId || `p_${Date.now()}`);
            const name = String(msg.name || 'Jogador').trim().slice(0, 14) || 'Jogador';
            const rawAvatarId = String(msg.avatarId || PLAYER_AVATARS[0].id);
            const avatarId = ensureUniquePlayerAvatar(
              rawAvatarId,
              room.state.players,
              playerId
            );

            let existing = room.state.players.find((p) => p.id === playerId && !p.isBot);
            if (existing) {
              existing.name = name;
              existing.avatarId = avatarId;
              existing.color = extractColorFromAvatarId(avatarId, existing.slotIndex);
              existing.isConnected = true;
              existing.continueChoice = 'PENDING';
            } else {
              const humanPlayers = room.state.players.filter((p) => !p.isBot);
              if (humanPlayers.length >= 4) {
                ws.send(
                  JSON.stringify({
                    type: 'room:error',
                    message: 'Esta sala já está com os 4 blocos de jogadores ocupados!',
                  })
                );
                return;
              }
              // Remove bot first if a 2nd human is joining so slot 1 is available
              if (humanPlayers.length >= 1) {
                room.state.players = room.state.players.filter((p) => !p.isBot);
                room.state.settings.vsMachine = false;
              }

              const usedSlots = new Set(room.state.players.map((p) => p.slotIndex));
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
                powerUpsUsed: {
                  FIFTY_FIFTY: false,
                  FREEZE_TIME: false,
                  DOUBLE_STARS: false,
                },
                eliminatedOptions: [],
                doubleStarsActive: false,
                continueChoice: 'PENDING',
                medals: [],
                operationStats: createEmptyOperationStats(),
              };
              room.state.players.push(existing);
            }

            syncMachineBotInRoom(room.state);

            currentPlayerId = existing.id;
            room.playerSockets.set(existing.id, ws);

            if (!room.state.players.some((p) => !p.isBot && p.isHost && p.isConnected)) {
              existing.isHost = true;
            }

            if (room.state.status === 'TITLE_MENU') {
              room.state.status = 'LOBBY';
            }

            ws.send(
              JSON.stringify({
                type: 'player:joined',
                playerId: existing.id,
                code: room.state.code,
              })
            );
            broadcastRoomState(room);
            break;
          }

          case 'player:continue_decision': {
            if (!currentRoom) return;
            const targetId = String(msg.playerId || currentPlayerId || '');
            const continueGame = Boolean(msg.continueGame);
            const playerIndex = currentRoom.state.players.findIndex((p) => p.id === targetId);
            if (playerIndex === -1) return;

            if (continueGame) {
              currentRoom.state.players[playerIndex].continueChoice = 'YES';
              broadcastRoomState(currentRoom);
            } else {
              // Player chose NOT to continue: remove player from main screen, release phone login, and rotate QR code PIN!
              const removedPlayer = currentRoom.state.players[playerIndex];
              currentRoom.state.players.splice(playerIndex, 1);

              // If host left, assign host to another connected player without shifting slotIndex
              if (
                removedPlayer.isHost &&
                currentRoom.state.players.length > 0 &&
                !currentRoom.state.players.some((p) => p.isHost)
              ) {
                currentRoom.state.players[0].isHost = true;
              }

              // Rotate room 4-digit PIN code so QR Code updates on the main TV screen
              const newPinCode = rotateRoomPinCode(currentRoom);
              currentRoom.state.lastPowerUpAnnouncement = `${removedPlayer.name} saiu do jogo · Novo PIN QR: ${newPinCode}`;

              // Notify the leaving player's socket to clear login state
              const leavingSocket = currentRoom.playerSockets.get(removedPlayer.id) || ws;
              if (leavingSocket && leavingSocket.readyState === WebSocket.OPEN) {
                leavingSocket.send(
                  JSON.stringify({
                    type: 'player:logged_out',
                    playerId: removedPlayer.id,
                    newRoomCode: newPinCode,
                  })
                );
              }
              currentRoom.playerSockets.delete(removedPlayer.id);

              // If no players remain after leaving, return TV to TITLE_MENU
              if (currentRoom.state.players.length === 0) {
                clearRoomTimers(currentRoom);
                currentRoom.state.status = 'TITLE_MENU';
                currentRoom.state.currentQuestion = null;
                currentRoom.state.gameOverStartedAt = null;
              }

              broadcastRoomState(currentRoom);
            }
            break;
          }

          case 'admin:kick_player': {
            if (!currentRoom) return;
            const targetId = String(msg.playerId || '');
            const playerIndex = currentRoom.state.players.findIndex((p) => p.id === targetId);
            if (playerIndex === -1) return;

            const kickedPlayer = currentRoom.state.players[playerIndex];
            currentRoom.state.players.splice(playerIndex, 1);

            if (
              kickedPlayer.isHost &&
              currentRoom.state.players.length > 0 &&
              !currentRoom.state.players.some((p) => p.isHost)
            ) {
              currentRoom.state.players[0].isHost = true;
            }

            const kickedSocket = currentRoom.playerSockets.get(kickedPlayer.id);
            if (kickedSocket && kickedSocket.readyState === WebSocket.OPEN) {
              kickedSocket.send(
                JSON.stringify({
                  type: 'player:logged_out',
                  playerId: kickedPlayer.id,
                  newRoomCode: currentRoom.state.code,
                })
              );
            }
            currentRoom.playerSockets.delete(kickedPlayer.id);
            currentRoom.state.lastPowerUpAnnouncement = `${kickedPlayer.name} foi desconectado pelo Painel Administrativo.`;

            broadcastRoomState(currentRoom);
            break;
          }

          case 'admin:rotate_pin': {
            if (!currentRoom) return;
            const newPinCode = rotateRoomPinCode(currentRoom);
            currentRoom.state.lastPowerUpAnnouncement = `Novo código PIN gerado: ${newPinCode}`;
            broadcastRoomState(currentRoom);
            break;
          }

          case 'admin:set_custom_questions': {
            if (!currentRoom) return;
            const customList = Array.isArray(msg.customQuestions)
              ? (msg.customQuestions as CustomEquationItem[])
              : [];
            const useCustom = Boolean(msg.useCustomQuestions) && customList.length > 0;
            currentRoom.state.settings.customQuestions = customList;
            currentRoom.state.settings.useCustomQuestions = useCustom;
            if (useCustom && customList.length > 0) {
              currentRoom.state.settings.totalRounds = Math.min(15, Math.max(1, customList.length));
              currentRoom.state.lastPowerUpAnnouncement = `Modo Professor ativado com ${customList.length} conta(s) personalizada(s)!`;
            } else {
              currentRoom.state.lastPowerUpAnnouncement = `Modo Professor desativado. Usando módulos padrão.`;
            }
            broadcastRoomState(currentRoom);
            break;
          }

          case 'game:set_status': {
            if (!currentRoom) return;
            if (msg.status === 'LOBBY' || msg.status === 'TITLE_MENU') {
              clearRoomTimers(currentRoom);
              currentRoom.state.status = msg.status;
              currentRoom.state.gameOverStartedAt = null;
              broadcastRoomState(currentRoom);
            }
            break;
          }

          case 'game:configure': {
            if (!currentRoom) return;
            const s = currentRoom.state.settings;
            if (msg.mode === 'COMPETITIVE' || msg.mode === 'COOPERATIVE') {
              s.mode = msg.mode as GameMode;
            }
            if (msg.difficulty === 'EASY' || msg.difficulty === 'MEDIUM' || msg.difficulty === 'HARD') {
              s.difficulty = msg.difficulty as DifficultyLevel;
            }
            if (
              msg.moduleId === 'MODULE_1_NUMBERS' ||
              msg.moduleId === 'MODULE_2_ADDITION' ||
              msg.moduleId === 'MODULE_3_SUBTRACTION' ||
              msg.moduleId === 'MODULE_4_SYMBOLS'
            ) {
              s.moduleId = msg.moduleId as LearningModuleId;
            }
            if (typeof msg.totalRounds === 'number' && msg.totalRounds >= 1 && msg.totalRounds <= 15) {
              s.totalRounds = msg.totalRounds;
            }
            if (typeof msg.vsMachine === 'boolean') {
              s.vsMachine = msg.vsMachine;
              if (s.vsMachine && !s.useCustomQuestions && s.totalRounds % 5 !== 0) {
                s.totalRounds = 5;
              }
            }
            if (
              msg.botAccuracyMode === 'RANDOM' ||
              msg.botAccuracyMode === 100 ||
              msg.botAccuracyMode === 60 ||
              msg.botAccuracyMode === 40 ||
              msg.botAccuracyMode === 20
            ) {
              s.botAccuracyMode = msg.botAccuracyMode as BotAccuracyMode;
              s.resolvedBotTargetPct = resolveBotAccuracyTarget(s.botAccuracyMode);
            }

            syncMachineBotInRoom(currentRoom.state);

            const activePlayers = Math.max(1, currentRoom.state.players.length);
            currentRoom.state.teamTarget = activePlayers * s.totalRounds * 550;
            broadcastRoomState(currentRoom);
            break;
          }

          case 'game:start': {
            if (!currentRoom) return;
            const humanPlayers = currentRoom.state.players.filter((p) => !p.isBot);
            if (humanPlayers.length === 0) {
              const avatar = PLAYER_AVATARS[0];
              currentRoom.state.players.unshift({
                id: 'tv_local_player_1',
                name: 'Jogador TV 1',
                avatarId: avatar.id,
                color: avatar.color,
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
                powerUpsUsed: {
                  FIFTY_FIFTY: false,
                  FREEZE_TIME: false,
                  DOUBLE_STARS: false,
                },
                eliminatedOptions: [],
                doubleStarsActive: false,
                continueChoice: 'PENDING',
                medals: [],
                operationStats: createEmptyOperationStats(),
              });
            }

            // Re-resolve bot target accuracy at match start (especially if mode is 'RANDOM')
            if (currentRoom.state.settings.vsMachine) {
              currentRoom.state.settings.resolvedBotTargetPct = resolveBotAccuracyTarget(
                currentRoom.state.settings.botAccuracyMode
              );
              if (
                !currentRoom.state.settings.useCustomQuestions &&
                currentRoom.state.settings.totalRounds % 5 !== 0
              ) {
                currentRoom.state.settings.totalRounds = 5;
              }
            }
            syncMachineBotInRoom(currentRoom.state);

            currentRoom.state.teamScore = 0;
            const activePlayers = Math.max(1, currentRoom.state.players.length);
            currentRoom.state.teamTarget =
              activePlayers * currentRoom.state.settings.totalRounds * 550;

            for (const p of currentRoom.state.players) {
              p.score = 0;
              p.stars = 0;
              p.streak = 0;
              p.bestStreak = 0;
              p.correctCount = 0;
              p.totalAnswered = 0;
              p.totalAnswerTimeMs = 0;
              p.currentAnswer = null;
              p.answerTimeMs = null;
              p.lastPointsEarned = 0;
              p.powerUpsUsed = {
                FIFTY_FIFTY: false,
                FREEZE_TIME: false,
                DOUBLE_STARS: false,
              };
              p.eliminatedOptions = [];
              p.doubleStarsActive = false;
              p.continueChoice = p.isBot ? 'YES' : 'PENDING';
              p.medals = [];
              if (p.isBot) {
                const pct =
                  currentRoom.state.settings.resolvedBotTargetPct ||
                  resolveBotAccuracyTarget(currentRoom.state.settings.botAccuracyMode);
                p.botTargetAccuracyPct = pct;
                p.botPlannedOutcomes = buildBotPlannedOutcomes(
                  currentRoom.state.settings.totalRounds,
                  pct
                );
              }
            }

            startNextQuestion(currentRoom, 1);
            break;
          }

          case 'player:use_powerup': {
            if (!currentRoom || currentRoom.state.status !== 'QUESTION_ACTIVE') return;
            const question = currentRoom.state.currentQuestion;
            if (!question) return;

            const targetId = String(msg.playerId || currentPlayerId || '');
            const player =
              currentRoom.state.players.find((p) => p.id === targetId) ||
              currentRoom.state.players[0];

            const powerUp = msg.powerUp as PowerUpType;
            if (!player || !powerUp || player.powerUpsUsed[powerUp] || player.currentAnswer !== null) {
              return;
            }

            player.powerUpsUsed[powerUp] = true;

            if (powerUp === 'FIFTY_FIFTY') {
              const wrongIndices = [0, 1, 2, 3]
                .filter((idx) => idx !== question.correctIndex)
                .sort(() => Math.random() - 0.5);
              player.eliminatedOptions = wrongIndices.slice(0, 2);
              currentRoom.state.lastPowerUpAnnouncement = `${player.name} usou Ajuda 50/50!`;
            } else if (powerUp === 'FREEZE_TIME') {
              const bonusMs = 5000;
              question.durationMs += bonusMs;
              const elapsed = Date.now() - question.startedAt;
              const remaining = Math.max(1000, question.durationMs - elapsed);
              if (currentRoom.roundTimer) {
                clearTimeout(currentRoom.roundTimer);
              }
              currentRoom.roundTimer = setTimeout(() => {
                if (currentRoom && currentRoom.state.status === 'QUESTION_ACTIVE') {
                  revealCurrentRound(currentRoom);
                }
              }, remaining);
              currentRoom.state.lastPowerUpAnnouncement = `${player.name} congelou o relógio (+5s)!`;
            } else if (powerUp === 'DOUBLE_STARS') {
              player.doubleStarsActive = true;
              currentRoom.state.lastPowerUpAnnouncement = `${player.name} ativou Estrela em Dobro (2x)!`;
            }

            broadcastRoomState(currentRoom);
            break;
          }

          case 'player:activate_visual_hint': {
            if (!currentRoom || currentRoom.state.status !== 'QUESTION_ACTIVE') return;
            const targetId = String(msg.playerId || currentPlayerId || '');
            const player =
              currentRoom.state.players.find((p) => p.id === targetId) ||
              currentRoom.state.players[0];
            if (!player) return;
            if ((player.wrongAttemptsOnCurrent || 0) >= 2 || player.visualHintUnlocked) {
              player.visualHintUnlocked = true;
              player.visualHintActive = true;
              currentRoom.state.lastPowerUpAnnouncement = `💡 ${player.name} ativou a Dica Visual 3D!`;
              broadcastRoomState(currentRoom);
            }
            break;
          }

          case 'player:answer': {
            if (!currentRoom || currentRoom.state.status !== 'QUESTION_ACTIVE') return;
            const question = currentRoom.state.currentQuestion;
            if (!question) return;

            const targetId = String(msg.playerId || currentPlayerId || '');
            const player =
              currentRoom.state.players.find((p) => p.id === targetId) ||
              currentRoom.state.players[0];

            if (!player || player.currentAnswer !== null) return;

            const optionIndex = Number(msg.optionIndex);
            if (isNaN(optionIndex) || optionIndex < 0 || optionIndex > 3) return;
            if (player.eliminatedOptions.includes(optionIndex)) return;
            if (player.failedOptionsOnCurrent?.includes(optionIndex)) return;

            const elapsed = Math.max(100, Date.now() - question.startedAt);
            const isCorrect = optionIndex === question.correctIndex;

            if (isCorrect) {
              player.currentAnswer = optionIndex;
              player.answerTimeMs = Math.min(elapsed, question.durationMs);
              player.totalAnswered += 1;
              player.totalAnswerTimeMs += player.answerTimeMs;
            } else {
              player.wrongAttemptsOnCurrent = (player.wrongAttemptsOnCurrent || 0) + 1;
              if (!player.failedOptionsOnCurrent) {
                player.failedOptionsOnCurrent = [];
              }
              if (!player.failedOptionsOnCurrent.includes(optionIndex)) {
                player.failedOptionsOnCurrent.push(optionIndex);
              }

              if (player.wrongAttemptsOnCurrent === 1) {
                // 1st wrong attempt: let the player try again on the same question
                player.currentAnswer = null;
                currentRoom.state.lastPowerUpAnnouncement = `${player.name} tentou um bloco e tem mais uma chance!`;
              } else if (player.wrongAttemptsOnCurrent === 2) {
                // 2nd wrong attempt on the same question: unlock & activate 3D Visual Hint!
                player.currentAnswer = null;
                player.visualHintUnlocked = true;
                player.visualHintActive = true;
                question.durationMs += 6000;
                const remaining = Math.max(1500, question.durationMs - elapsed);
                if (currentRoom.roundTimer) {
                  clearTimeout(currentRoom.roundTimer);
                }
                currentRoom.roundTimer = setTimeout(() => {
                  if (currentRoom && currentRoom.state.status === 'QUESTION_ACTIVE') {
                    revealCurrentRound(currentRoom);
                  }
                }, remaining);
                currentRoom.state.lastPowerUpAnnouncement = `💡 Dica Visual 3D ativada para ${player.name}! Conte os blocos animados!`;
              } else {
                // 3rd wrong attempt: lock answer so round can proceed
                player.currentAnswer = optionIndex;
                player.answerTimeMs = Math.min(elapsed, question.durationMs);
                player.totalAnswered += 1;
                player.totalAnswerTimeMs += player.answerTimeMs;
              }
            }

            // If all human players have locked their answer, make sure the Machine also locks its answer so the round doesn't stall
            const connectedHumans = currentRoom.state.players.filter(
              (p) => p.isConnected && !p.isBot
            );
            const allHumansAnswered =
              connectedHumans.length > 0 &&
              connectedHumans.every((p) => p.currentAnswer !== null);
            if (allHumansAnswered) {
              lockMachineBotAnswer(currentRoom.state);
            }

            broadcastRoomState(currentRoom);

            const connectedPlayers = currentRoom.state.players.filter((p) => p.isConnected);
            const allAnswered =
              connectedPlayers.length > 0 &&
              connectedPlayers.every((p) => p.currentAnswer !== null);

            if (allAnswered) {
              if (currentRoom.roundTimer) {
                clearTimeout(currentRoom.roundTimer);
                currentRoom.roundTimer = null;
              }
              currentRoom.roundTimer = setTimeout(() => {
                if (currentRoom && currentRoom.state.status === 'QUESTION_ACTIVE') {
                  revealCurrentRound(currentRoom);
                }
              }, 650);
            }
            break;
          }

          case 'game:next_round': {
            if (!currentRoom || currentRoom.state.status !== 'ROUND_REVEAL') return;
            const q = currentRoom.state.currentQuestion;
            if (!q) return;
            if (q.roundNumber >= currentRoom.state.settings.totalRounds) {
              transitionToGameOver(currentRoom);
            } else {
              startNextQuestion(currentRoom, q.roundNumber + 1);
            }
            break;
          }

          case 'game:toggle_pause': {
            if (!currentRoom) return;
            const q = currentRoom.state.currentQuestion;
            if (currentRoom.state.status === 'QUESTION_ACTIVE' && q) {
              clearRoomTimers(currentRoom);
              const elapsed = Date.now() - q.startedAt;
              currentRoom.state.pausedRemainingMs = Math.max(1000, q.durationMs - elapsed);
              currentRoom.state.status = 'PAUSED';
              broadcastRoomState(currentRoom);
            } else if (currentRoom.state.status === 'PAUSED' && q) {
              const remaining = currentRoom.state.pausedRemainingMs ?? 8000;
              q.startedAt = Date.now() - (q.durationMs - remaining);
              currentRoom.state.pausedRemainingMs = null;
              currentRoom.state.status = 'QUESTION_ACTIVE';
              broadcastRoomState(currentRoom);
              currentRoom.roundTimer = setTimeout(() => {
                if (currentRoom) revealCurrentRound(currentRoom);
              }, remaining);
            }
            break;
          }

          case 'game:restart': {
            if (!currentRoom) return;
            clearRoomTimers(currentRoom);
            currentRoom.state.status = 'LOBBY';
            currentRoom.state.currentQuestion = null;
            currentRoom.state.teamScore = 0;
            currentRoom.state.gameOverStartedAt = null;
            currentRoom.state.lastPowerUpAnnouncement = null;
            for (const p of currentRoom.state.players) {
              p.score = 0;
              p.stars = 0;
              p.streak = 0;
              p.currentAnswer = null;
              p.answerTimeMs = null;
              p.lastPointsEarned = 0;
              p.powerUpsUsed = {
                FIFTY_FIFTY: false,
                FREEZE_TIME: false,
                DOUBLE_STARS: false,
              };
              p.eliminatedOptions = [];
              p.doubleStarsActive = false;
              p.continueChoice = 'PENDING';
              p.medals = [];
            }
            broadcastRoomState(currentRoom);
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoom) {
        currentRoom.clients.delete(ws);
        if (currentPlayerId) {
          const p = currentRoom.state.players.find((pl) => pl.id === currentPlayerId);
          if (p) {
            p.isConnected = false;
            if (p.isHost) {
              const nextHost = currentRoom.state.players.find((pl) => pl.isConnected);
              if (nextHost) {
                p.isHost = false;
                nextHost.isHost = true;
              }
            }
            broadcastRoomState(currentRoom);
          }
        }
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Jogo de Matemática TV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
