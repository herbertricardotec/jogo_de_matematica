/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DifficultyLevel,
  GameMode,
  LearningModuleId,
  PowerUpType,
  RoomState,
} from './types/game.ts';
import { FireTvStageView } from './components/FireTvStageView.tsx';
import { MobileControllerView } from './components/MobileControllerView.tsx';
import { soundEngine } from './utils/sound.ts';

function getOrCreatePlayerId(storageKey: string): string {
  if (typeof window === 'undefined') return `p_${Date.now()}`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const created = `p_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
  window.localStorage.setItem(storageKey, created);
  return created;
}

export default function App() {
  const urlParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialRoomParam = urlParams?.get('room') || '';
  const initialRoleParam = urlParams?.get('role') || '';

  const [viewMode, setViewMode] = useState<'TV' | 'CONTROLLER'>(() => {
    if (initialRoleParam === 'controller' || initialRoomParam.length === 4) {
      return 'CONTROLLER';
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'CONTROLLER';
    }
    return 'TV';
  });

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [burstTrigger, setBurstTrigger] = useState<number>(0);
  const [shakeTrigger, setShakeTrigger] = useState<number>(0);

  const mobilePlayerId = useRef<string>(getOrCreatePlayerId('mathshow_mobile_player_id')).current;
  const simPlayerId = useRef<string>(getOrCreatePlayerId('mathshow_sim_player_id')).current;

  const wsRef = useRef<WebSocket | null>(null);
  const prevStatusRef = useRef<string>('');
  const prevQuestionIdRef = useRef<string>('');
  const prevPlayersCountRef = useRef<number>(0);
  const prevAnsweredCountRef = useRef<number>(0);

  const sendWsMessage = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setErrorMessage(null);
        const savedRoomCode = window.sessionStorage.getItem('mathshow_room_code');
        if (viewMode === 'TV') {
          socket.send(
            JSON.stringify({
              type: 'room:create',
              code: savedRoomCode || initialRoomParam || undefined,
            })
          );
        } else if (initialRoomParam.length === 4) {
          socket.send(
            JSON.stringify({
              type: 'room:watch',
              code: initialRoomParam,
            })
          );
        } else if (savedRoomCode) {
          socket.send(
            JSON.stringify({
              type: 'room:watch',
              code: savedRoomCode,
            })
          );
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room:state' && data.state) {
            const nextState: RoomState = data.state;
            window.sessionStorage.setItem('mathshow_room_code', nextState.code);

            // Player joined celebration + Narrator welcome
            if (nextState.players.length > prevPlayersCountRef.current) {
              const newest = nextState.players[nextState.players.length - 1];
              soundEngine.playPlayerJoin();
              setBurstTrigger((c) => c + 1);
              if (newest) {
                soundEngine.speak(`${newest.name} entrou no jogo!`, false);
              }
            }
            prevPlayersCountRef.current = nextState.players.length;

            // Player locked in answer
            const answeredNow = nextState.players.filter((p) => p.currentAnswer !== null).length;
            if (
              nextState.status === 'QUESTION_ACTIVE' &&
              answeredNow > prevAnsweredCountRef.current
            ) {
              soundEngine.playBuzzerLock(answeredNow - 1);
              setShakeTrigger((s) => s + 1);
            }
            prevAnsweredCountRef.current = answeredNow;

            // New Question Spoken Narration (Text-to-Speech TV Presenter)
            if (
              nextState.status === 'QUESTION_ACTIVE' &&
              nextState.currentQuestion &&
              nextState.currentQuestion.id !== prevQuestionIdRef.current
            ) {
              prevQuestionIdRef.current = nextState.currentQuestion.id;
              soundEngine.playNewQuestion();
              soundEngine.speak(nextState.currentQuestion.speechText, true);
            }

            // Round Reveal & Victory Transitions
            if (nextState.status !== prevStatusRef.current) {
              if (nextState.status === 'ROUND_REVEAL') {
                const q = nextState.currentQuestion;
                const anyRight = Boolean(
                  q && nextState.players.some((p) => p.currentAnswer === q.correctIndex)
                );
                soundEngine.playRoundReveal(anyRight);
                soundEngine.vibrate(anyRight ? 'success' : 'encourage');
                setShakeTrigger((s) => s + 1);
                if (anyRight) {
                  setBurstTrigger((c) => c + 1);
                }
                if (q) {
                  soundEngine.speak(
                    anyRight
                      ? `Muito bem! A resposta certa é ${q.correctAnswer}!`
                      : `A resposta certa é ${q.correctAnswer}. Vamos tentar a próxima!`,
                    true
                  );
                }
              } else if (nextState.status === 'GAME_OVER') {
                soundEngine.playVictoryFanfare();
                soundEngine.vibrate('success');
                setBurstTrigger((c) => c + 1);
                const sorted = [...nextState.players].sort((a, b) => b.score - a.score);
                if (sorted[0]) {
                  soundEngine.speak(
                    `Fim do jogo! Parabéns ${sorted[0].name}! Confirme no celular se deseja continuar na próxima jogada.`,
                    true
                  );
                }
              }
              prevStatusRef.current = nextState.status;
            }

            setRoomState(nextState);
          } else if (data.type === 'player:logged_out') {
            if (data.newRoomCode) {
              window.sessionStorage.setItem('mathshow_room_code', String(data.newRoomCode));
            }
          } else if (data.type === 'room:error') {
            setErrorMessage(data.message || 'Erro ao conectar na sala.');
          }
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      socket.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connectWebSocket, 1500);
        }
      };
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewMode, initialRoomParam]);

  const handleJoinRoom = useCallback(
    (code: string, name: string, avatarId: string, customPlayerId?: string) => {
      setErrorMessage(null);
      sendWsMessage({
        type: 'room:join',
        code,
        name,
        avatarId,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendWsMessage, mobilePlayerId]
  );

  const handleSelectAnswer = useCallback(
    (optionIndex: number, customPlayerId?: string) => {
      sendWsMessage({
        type: 'player:answer',
        optionIndex,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendWsMessage, mobilePlayerId]
  );

  const handleUsePowerUp = useCallback(
    (powerUp: PowerUpType, customPlayerId?: string) => {
      sendWsMessage({
        type: 'player:use_powerup',
        powerUp,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendWsMessage, mobilePlayerId]
  );

  const handleContinueDecision = useCallback(
    (continueGame: boolean, customPlayerId?: string) => {
      sendWsMessage({
        type: 'player:continue_decision',
        continueGame,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendWsMessage, mobilePlayerId]
  );

  const handleConfigureGame = useCallback(
    (config: {
      mode?: GameMode;
      difficulty?: DifficultyLevel;
      moduleId?: LearningModuleId;
      totalRounds?: number;
    }) => {
      sendWsMessage({
        type: 'game:configure',
        ...config,
      });
    },
    [sendWsMessage]
  );

  const handleStartGame = useCallback(() => {
    sendWsMessage({ type: 'game:start' });
  }, [sendWsMessage]);

  const handleTogglePause = useCallback(() => {
    sendWsMessage({ type: 'game:toggle_pause' });
  }, [sendWsMessage]);

  const handleRestartGame = useCallback(() => {
    sendWsMessage({ type: 'game:restart' });
  }, [sendWsMessage]);

  const handleNextRound = useCallback(() => {
    sendWsMessage({ type: 'game:next_round' });
  }, [sendWsMessage]);

  const handleSetStatus = useCallback(
    (status: 'TITLE_MENU' | 'LOBBY') => {
      sendWsMessage({ type: 'game:set_status', status });
    },
    [sendWsMessage]
  );

  if (viewMode === 'CONTROLLER') {
    return (
      <MobileControllerView
        roomState={roomState}
        playerId={mobilePlayerId}
        initialRoomCode={initialRoomParam || roomState?.code || ''}
        errorMessage={errorMessage}
        onJoinRoom={(code, name, avatarId) => handleJoinRoom(code, name, avatarId, mobilePlayerId)}
        onSelectAnswer={(idx) => handleSelectAnswer(idx, mobilePlayerId)}
        onUsePowerUp={(p) => handleUsePowerUp(p, mobilePlayerId)}
        onContinueDecision={(cont) => handleContinueDecision(cont, mobilePlayerId)}
        onConfigureGame={handleConfigureGame}
        onStartGame={handleStartGame}
        onRestartGame={handleRestartGame}
        onNextRound={handleNextRound}
        onSwitchToTvMode={() => {
          setViewMode('TV');
          sendWsMessage({ type: 'room:create', code: roomState?.code });
        }}
      />
    );
  }

  const effectiveRoomState: RoomState = roomState || {
    code: '----',
    status: 'TITLE_MENU',
    settings: {
      mode: 'COMPETITIVE',
      difficulty: 'EASY',
      moduleId: 'MODULE_1_NUMBERS',
      totalRounds: 6,
      timePerQuestionSec: 18,
    },
    players: [],
    currentQuestion: null,
    teamScore: 0,
    teamTarget: 3600,
    pausedRemainingMs: null,
    lastPowerUpAnnouncement: null,
    gameOverStartedAt: null,
    gameOverDurationMs: 25000,
    lastUpdatedAt: Date.now(),
  };

  return (
    <FireTvStageView
      roomState={effectiveRoomState}
      burstTrigger={burstTrigger}
      shakeTrigger={shakeTrigger}
      onSetStatus={handleSetStatus}
      onConfigureGame={handleConfigureGame}
      onStartGame={handleStartGame}
      onTogglePause={handleTogglePause}
      onRestartGame={handleRestartGame}
      onNextRound={handleNextRound}
      onLocalTvAnswer={(idx) => handleSelectAnswer(idx, effectiveRoomState.players[0]?.id)}
      onSwitchToFullMobile={() => setViewMode('CONTROLLER')}
      simPlayerId={simPlayerId}
      simError={errorMessage}
      onSimJoin={(code, name, avatarId) => handleJoinRoom(code, name, avatarId, simPlayerId)}
      onSimAnswer={(idx) => handleSelectAnswer(idx, simPlayerId)}
      onSimUsePowerUp={(p) => handleUsePowerUp(p, simPlayerId)}
      onSimContinueDecision={(cont) => handleContinueDecision(cont, simPlayerId)}
    />
  );
}
