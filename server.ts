import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  DifficultyLevel,
  GameMode,
  GameSettings,
  MathQuestion,
  PLAYER_AVATARS,
  PlayerState,
  RoomState,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InternalRoom {
  state: RoomState;
  clients: Set<WebSocket>;
  playerSockets: Map<string, WebSocket>;
  roundTimer: NodeJS.Timeout | null;
  revealTimer: NodeJS.Timeout | null;
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

function buildAdditionSubtractionQuestion(
  roundNumber: number,
  totalRounds: number,
  difficulty: DifficultyLevel
): MathQuestion {
  const isLightningRound = roundNumber >= totalRounds - 1;
  // Progressive difficulty scaling across rounds
  const progressRatio = (roundNumber - 1) / Math.max(1, totalRounds - 1);

  let terms: number[] = [];
  let operators: ('+' | '-')[] = [];
  let correctAnswer = 0;
  let expression = '';
  let mentalMathTip = '';
  let categoryLabel = 'Adição & Subtração';

  if (difficulty === 'EASY') {
    const maxVal = progressRatio < 0.5 ? 12 : 20;
    const isAddition = Math.random() > 0.42;
    if (isAddition) {
      const a = randomInt(3, maxVal);
      const b = randomInt(2, maxVal - 2);
      correctAnswer = a + b;
      terms = [a, b];
      operators = ['+'];
      expression = `${a} + ${b}`;
      categoryLabel = 'Soma Rápida';
      if (a + b >= 10 && a < 10) {
        const toTen = 10 - a;
        const rest = b - toTen;
        mentalMathTip = `Complete 10 primeiro: ${a} + ${toTen} = 10, depois + ${rest} = ${correctAnswer}`;
      } else {
        mentalMathTip = `Contagem direta: ${Math.max(a, b)} somado com ${Math.min(a, b)} resulta em ${correctAnswer}`;
      }
    } else {
      const a = randomInt(8, maxVal + 5);
      const b = randomInt(2, a - 1);
      correctAnswer = a - b;
      terms = [a, b];
      operators = ['-'];
      expression = `${a} - ${b}`;
      categoryLabel = 'Subtração Direta';
      mentalMathTip = `Pense na soma inversa: ${b} + ${correctAnswer} = ${a}`;
    }
  } else if (difficulty === 'MEDIUM') {
    const useThreeTerms = progressRatio >= 0.75;
    if (useThreeTerms) {
      const a = randomInt(15, 45);
      const b = randomInt(10, 30);
      const c = randomInt(5, 20);
      correctAnswer = a + b - c;
      terms = [a, b, c];
      operators = ['+', '-'];
      expression = `${a} + ${b} - ${c}`;
      categoryLabel = 'Desafio Combinado';
      mentalMathTip = `Passo 1: ${a} + ${b} = ${a + b} · Passo 2: ${a + b} - ${c} = ${correctAnswer}`;
    } else {
      const isAddition = Math.random() > 0.45;
      if (isAddition) {
        const a = randomInt(14, 58);
        const b = randomInt(12, 42);
        correctAnswer = a + b;
        terms = [a, b];
        operators = ['+'];
        expression = `${a} + ${b}`;
        categoryLabel = 'Soma de Dezenas';
        const tensA = Math.floor(a / 10) * 10;
        const tensB = Math.floor(b / 10) * 10;
        const units = (a % 10) + (b % 10);
        mentalMathTip = `Some as dezenas (${tensA} + ${tensB} = ${tensA + tensB}) e as unidades (${a % 10} + ${b % 10} = ${units}) → ${correctAnswer}`;
      } else {
        const a = randomInt(32, 95);
        const b = randomInt(11, a - 8);
        correctAnswer = a - b;
        terms = [a, b];
        operators = ['-'];
        expression = `${a} - ${b}`;
        categoryLabel = 'Subtração de Dezenas';
        const tensB = Math.floor(b / 10) * 10;
        const unitB = b % 10;
        mentalMathTip = `Tire as dezenas (${a} - ${tensB} = ${a - tensB}) e depois as unidades (- ${unitB}) → ${correctAnswer}`;
      }
    }
  } else {
    // HARD: Larger 2-digit / 3-digit mental addition & subtraction or 3-term chains
    const useThreeTerms = Math.random() > 0.35;
    if (useThreeTerms) {
      const a = randomInt(35, 90);
      const b = randomInt(18, 55);
      const op1: '+' | '-' = Math.random() > 0.4 ? '+' : '-';
      const firstResult = op1 === '+' ? a + b : a - b;
      const op2: '+' | '-' = op1 === '+' ? '-' : '+';
      const c = op2 === '-' ? randomInt(12, Math.max(15, firstResult - 10)) : randomInt(14, 48);
      correctAnswer = op2 === '+' ? firstResult + c : firstResult - c;
      terms = [a, b, c];
      operators = [op1, op2];
      expression = `${a} ${op1} ${b} ${op2} ${c}`;
      categoryLabel = 'Cálculo Mestre';
      mentalMathTip = `Resolva da esquerda para a direita: (${a} ${op1} ${b} = ${firstResult}) ${op2} ${c} = ${correctAnswer}`;
    } else {
      const isAddition = Math.random() > 0.5;
      if (isAddition) {
        const a = randomInt(45, 145);
        const b = randomInt(28, 95);
        correctAnswer = a + b;
        terms = [a, b];
        operators = ['+'];
        expression = `${a} + ${b}`;
        categoryLabel = 'Super Soma';
        mentalMathTip = `Decomponha: ${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}, mais ${b % 10} = ${correctAnswer}`;
      } else {
        const a = randomInt(75, 180);
        const b = randomInt(29, a - 15);
        correctAnswer = a - b;
        terms = [a, b];
        operators = ['-'];
        expression = `${a} - ${b}`;
        categoryLabel = 'Super Subtração';
        mentalMathTip = `Arredonde para facilitar: ${a} - ${Math.ceil(b / 10) * 10} + ${Math.ceil(b / 10) * 10 - b} = ${correctAnswer}`;
      }
    }
  }

  // Generate 3 plausible distractors (e.g., off by 1, 2, 10, or sign mistake)
  const distractors = new Set<number>();
  const candidateOffsets = [1, -1, 2, -2, 10, -10, 3, -3, 5, -5, 11, -9, 4, -4];
  for (const offset of candidateOffsets.sort(() => Math.random() - 0.5)) {
    const val = correctAnswer + offset;
    if (val >= 0 && val !== correctAnswer) {
      distractors.add(val);
    }
    if (distractors.size >= 3) break;
  }
  while (distractors.size < 3) {
    const fallback = Math.max(0, correctAnswer + randomInt(-12, 12));
    if (fallback !== correctAnswer) distractors.add(fallback);
  }

  const options = [correctAnswer, ...Array.from(distractors).slice(0, 3)].sort(
    () => Math.random() - 0.5
  );
  const correctIndex = options.indexOf(correctAnswer);

  return {
    id: `q_${Date.now()}_${roundNumber}`,
    roundNumber,
    totalRounds,
    expression,
    terms,
    operators,
    correctAnswer,
    correctIndex,
    options,
    mentalMathTip,
    categoryLabel: isLightningRound ? `⚡ Rodada Relâmpago (Pontos 2x)` : categoryLabel,
    startedAt: Date.now(),
    durationMs: 15000,
    isLightningRound,
  };
}

function createRoom(initialStatus: 'TITLE_MENU' | 'LOBBY' = 'TITLE_MENU'): InternalRoom {
  const code = generatePinCode();
  const defaultSettings: GameSettings = {
    mode: 'COMPETITIVE',
    difficulty: 'EASY',
    totalRounds: 8,
    timePerQuestionSec: 15,
  };

  const room: InternalRoom = {
    state: {
      code,
      status: initialStatus,
      settings: defaultSettings,
      players: [],
      currentQuestion: null,
      teamScore: 0,
      teamTarget: 5000,
      pausedRemainingMs: null,
      lastUpdatedAt: Date.now(),
    },
    clients: new Set(),
    playerSockets: new Map(),
    roundTimer: null,
    revealTimer: null,
    questionRemainingMs: 15000,
  };

  rooms.set(code, room);
  return room;
}

function broadcastRoomState(room: InternalRoom) {
  room.state.lastUpdatedAt = Date.now();
  const payload = JSON.stringify({
    type: 'room:state',
    state: room.state,
  });

  for (const client of room.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
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
}

function startNextQuestion(room: InternalRoom, nextRoundNumber: number) {
  clearRoomTimers(room);

  const { settings } = room.state;
  const durationMs = settings.timePerQuestionSec * 1000;
  const question = buildAdditionSubtractionQuestion(
    nextRoundNumber,
    settings.totalRounds,
    settings.difficulty
  );
  question.durationMs = durationMs;
  question.startedAt = Date.now();

  room.state.status = 'QUESTION_ACTIVE';
  room.state.currentQuestion = question;
  room.state.pausedRemainingMs = null;

  for (const p of room.state.players) {
    p.currentAnswer = null;
    p.answerTimeMs = null;
    p.lastPointsEarned = 0;
  }

  broadcastRoomState(room);

  room.roundTimer = setTimeout(() => {
    revealCurrentRound(room);
  }, durationMs);
}

function revealCurrentRound(room: InternalRoom) {
  clearRoomTimers(room);
  const question = room.state.currentQuestion;
  if (!question) return;

  room.state.status = 'ROUND_REVEAL';

  // Calculate scores for each player
  let roundTeamGain = 0;
  for (const p of room.state.players) {
    if (p.currentAnswer === question.correctIndex) {
      const answerMs = p.answerTimeMs ?? question.durationMs;
      const speedRatio = Math.max(0, 1 - answerMs / question.durationMs);
      const basePoints = 500;
      const speedBonus = Math.round(speedRatio * 500);
      p.streak += 1;
      if (p.streak > p.bestStreak) p.bestStreak = p.streak;
      const streakBonus = Math.min(300, (p.streak - 1) * 100);
      const multiplier = question.isLightningRound ? 2 : 1;
      const earned = (basePoints + speedBonus + streakBonus) * multiplier;

      p.lastPointsEarned = earned;
      p.score += earned;
      p.correctCount += 1;
      roundTeamGain += earned;
    } else {
      p.streak = 0;
      p.lastPointsEarned = 0;
    }
  }

  room.state.teamScore += roundTeamGain;
  broadcastRoomState(room);

  // Automatically advance after 5.5 seconds of dramatic reveal
  room.revealTimer = setTimeout(() => {
    if (question.roundNumber >= room.state.settings.totalRounds) {
      room.state.status = 'GAME_OVER';
      broadcastRoomState(room);
    } else {
      startNextQuestion(room, question.roundNumber + 1);
    }
  }, 5500);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  // REST helper to check or create room
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
            const avatarId = String(msg.avatarId || PLAYER_AVATARS[0].id);

            let existing = room.state.players.find((p) => p.id === playerId);
            if (existing) {
              existing.name = name;
              existing.avatarId = avatarId;
              const avatarMeta =
                PLAYER_AVATARS.find((a) => a.id === avatarId) ||
                PLAYER_AVATARS[existing.slotIndex % PLAYER_AVATARS.length];
              existing.color = avatarMeta.color;
              existing.isConnected = true;
            } else {
              if (room.state.players.length >= 4) {
                ws.send(
                  JSON.stringify({
                    type: 'room:error',
                    message: 'Esta sala já está com os 4 pedestais ocupados!',
                  })
                );
                return;
              }
              const slotIndex = room.state.players.length;
              const avatarMeta =
                PLAYER_AVATARS.find((a) => a.id === avatarId) ||
                PLAYER_AVATARS[slotIndex % PLAYER_AVATARS.length];

              existing = {
                id: playerId,
                name,
                avatarId: avatarMeta.id,
                color: avatarMeta.color,
                slotIndex,
                score: 0,
                streak: 0,
                bestStreak: 0,
                correctCount: 0,
                totalAnswered: 0,
                totalAnswerTimeMs: 0,
                currentAnswer: null,
                answerTimeMs: null,
                lastPointsEarned: 0,
                isConnected: true,
                isHost: slotIndex === 0,
              };
              room.state.players.push(existing);
            }

            currentPlayerId = existing.id;
            room.playerSockets.set(existing.id, ws);

            // Ensure at least one connected player is host
            if (!room.state.players.some((p) => p.isHost && p.isConnected)) {
              existing.isHost = true;
            }

            // If TV was on TITLE_MENU, move to LOBBY automatically when a phone connects
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

          case 'game:set_status': {
            if (!currentRoom) return;
            if (msg.status === 'LOBBY' || msg.status === 'TITLE_MENU') {
              clearRoomTimers(currentRoom);
              currentRoom.state.status = msg.status;
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
            if (typeof msg.totalRounds === 'number' && msg.totalRounds >= 5 && msg.totalRounds <= 15) {
              s.totalRounds = msg.totalRounds;
            }
            if (
              typeof msg.timePerQuestionSec === 'number' &&
              msg.timePerQuestionSec >= 10 &&
              msg.timePerQuestionSec <= 30
            ) {
              s.timePerQuestionSec = msg.timePerQuestionSec;
            }
            const activePlayers = Math.max(1, currentRoom.state.players.length);
            currentRoom.state.teamTarget = activePlayers * s.totalRounds * 600;
            broadcastRoomState(currentRoom);
            break;
          }

          case 'game:start': {
            if (!currentRoom) return;
            // If no phone players joined yet and TV remote presses Start, create a local TV Player 1
            if (currentRoom.state.players.length === 0) {
              const avatar = PLAYER_AVATARS[0];
              currentRoom.state.players.push({
                id: 'tv_local_player_1',
                name: 'Jogador TV 1',
                avatarId: avatar.id,
                color: avatar.color,
                slotIndex: 0,
                score: 0,
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
              });
            }

            // Reset scores for a fresh show
            currentRoom.state.teamScore = 0;
            const activePlayers = Math.max(1, currentRoom.state.players.length);
            currentRoom.state.teamTarget =
              activePlayers * currentRoom.state.settings.totalRounds * 600;

            for (const p of currentRoom.state.players) {
              p.score = 0;
              p.streak = 0;
              p.bestStreak = 0;
              p.correctCount = 0;
              p.totalAnswered = 0;
              p.totalAnswerTimeMs = 0;
              p.currentAnswer = null;
              p.answerTimeMs = null;
              p.lastPointsEarned = 0;
            }

            startNextQuestion(currentRoom, 1);
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

            const elapsed = Math.max(100, Date.now() - question.startedAt);
            player.currentAnswer = optionIndex;
            player.answerTimeMs = Math.min(elapsed, question.durationMs);
            player.totalAnswered += 1;
            player.totalAnswerTimeMs += player.answerTimeMs;

            broadcastRoomState(currentRoom);

            // Check if all connected players have answered
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
              clearRoomTimers(currentRoom);
              currentRoom.state.status = 'GAME_OVER';
              broadcastRoomState(currentRoom);
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
            for (const p of currentRoom.state.players) {
              p.score = 0;
              p.streak = 0;
              p.currentAnswer = null;
              p.answerTimeMs = null;
              p.lastPointsEarned = 0;
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
    console.log(`MathShow TV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
