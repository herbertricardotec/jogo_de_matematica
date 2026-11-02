/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ACHIEVEMENT_MEDALS,
  DifficultyLevel,
  evaluatePlayerMedals,
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
  const useHttpFallbackRef = useRef<boolean>(false);
  const activeRoomCodeRef = useRef<string>(initialRoomParam || '');

  const prevStatusRef = useRef<string>('');
  const prevQuestionIdRef = useRef<string>('');
  const prevPlayersCountRef = useRef<number>(0);
  const prevAnsweredCountRef = useRef<number>(0);

  const applyIncomingState = useCallback((nextState: RoomState) => {
    activeRoomCodeRef.current = nextState.code;
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

    // Round Reveal & Victory Transitions with 3D Medals Fanfare & Confetti
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

        // Additional confetti & 3D medal fanfare wave
        setTimeout(() => {
          soundEngine.playMedalFanfare();
          setBurstTrigger((c) => c + 1);
        }, 750);

        const sorted = [...nextState.players].sort((a, b) => b.score - a.score);
        if (sorted[0]) {
          const topMedals =
            sorted[0].medals && sorted[0].medals.length > 0
              ? sorted[0].medals
              : evaluatePlayerMedals(sorted[0], nextState.settings.totalRounds);
          const firstMedalTitle =
            ACHIEVEMENT_MEDALS[topMedals[0]]?.title || 'Construtor Dedicado';
          soundEngine.speak(
            `Fim do jogo! Parabéns ${sorted[0].name}, vencedor com a medalha 3D ${firstMedalTitle}! Confirme no celular se deseja continuar na próxima jogada.`,
            true
          );
        }
      }
      prevStatusRef.current = nextState.status;
    }

    setRoomState(nextState);
  }, []);

  const sendAction = useCallback(
    async (payload: Record<string, unknown>) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
        return;
      }

      // Serverless HTTP Fallback (for Vercel deployments where persistent WebSockets aren't active)
      try {
        const code =
          (payload.code as string) ||
          activeRoomCodeRef.current ||
          window.sessionStorage.getItem('mathshow_room_code') ||
          initialRoomParam;
        const res = await fetch('/api/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'Erro ao comunicar com a sala.');
          return;
        }
        if (data.state) {
          setErrorMessage(null);
          applyIncomingState(data.state);
        }
      } catch {
        // Ignore network errors while reconnecting
      }
    },
    [applyIncomingState, initialRoomParam]
  );

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let isUnmounted = false;

    const startHttpFallbackPolling = () => {
      if (pollInterval || isUnmounted) return;
      useHttpFallbackRef.current = true;
      const savedCode =
        window.sessionStorage.getItem('mathshow_room_code') || initialRoomParam || '';

      if (viewMode === 'TV') {
        sendAction({ type: 'room:create', code: savedCode || undefined });
      } else if (savedCode.length === 4) {
        sendAction({ type: 'room:watch', code: savedCode });
      }

      pollInterval = setInterval(async () => {
        if (isUnmounted) return;
        const code =
          activeRoomCodeRef.current ||
          window.sessionStorage.getItem('mathshow_room_code') ||
          initialRoomParam;
        if (!code || code.length !== 4) return;
        try {
          const res = await fetch(`/api/room?code=${encodeURIComponent(code)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.state) applyIncomingState(data.state);
          }
        } catch {
          // Ignore transient polling errors
        }
      }, 900);
    };

    const connectWebSocket = () => {
      if (isUnmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      let opened = false;

      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          opened = true;
          useHttpFallbackRef.current = false;
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
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
              applyIncomingState(data.state);
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

        socket.onerror = () => {
          if (!opened) {
            startHttpFallbackPolling();
          }
        };

        socket.onclose = () => {
          if (!opened) {
            startHttpFallbackPolling();
          } else if (!isUnmounted) {
            reconnectTimeout = setTimeout(connectWebSocket, 1500);
          }
        };
      } catch {
        startHttpFallbackPolling();
      }
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollInterval) clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewMode, initialRoomParam, applyIncomingState, sendAction]);

  const handleJoinRoom = useCallback(
    (code: string, name: string, avatarId: string, customPlayerId?: string) => {
      setErrorMessage(null);
      activeRoomCodeRef.current = code;
      sendAction({
        type: 'room:join',
        code,
        name,
        avatarId,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendAction, mobilePlayerId]
  );

  const handleSelectAnswer = useCallback(
    (optionIndex: number, customPlayerId?: string) => {
      sendAction({
        type: 'player:answer',
        optionIndex,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendAction, mobilePlayerId]
  );

  const handleUsePowerUp = useCallback(
    (powerUp: PowerUpType, customPlayerId?: string) => {
      sendAction({
        type: 'player:use_powerup',
        powerUp,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendAction, mobilePlayerId]
  );

  const handleContinueDecision = useCallback(
    (continueGame: boolean, customPlayerId?: string) => {
      sendAction({
        type: 'player:continue_decision',
        continueGame,
        playerId: customPlayerId || mobilePlayerId,
      });
    },
    [sendAction, mobilePlayerId]
  );

  const handleConfigureGame = useCallback(
    (config: {
      mode?: GameMode;
      difficulty?: DifficultyLevel;
      moduleId?: LearningModuleId;
      totalRounds?: number;
    }) => {
      sendAction({
        type: 'game:configure',
        ...config,
      });
    },
    [sendAction]
  );

  const handleStartGame = useCallback(() => {
    sendAction({ type: 'game:start' });
  }, [sendAction]);

  const handleTogglePause = useCallback(() => {
    sendAction({ type: 'game:toggle_pause' });
  }, [sendAction]);

  const handleRestartGame = useCallback(() => {
    sendAction({ type: 'game:restart' });
  }, [sendAction]);

  const handleNextRound = useCallback(() => {
    sendAction({ type: 'game:next_round' });
  }, [sendAction]);

  const handleSetStatus = useCallback(
    (status: 'TITLE_MENU' | 'LOBBY') => {
      sendAction({ type: 'game:set_status', status });
    },
    [sendAction]
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
          sendAction({ type: 'room:create', code: roomState?.code });
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
      onCelebrateMedals={() => setBurstTrigger((c) => c + 1)}
    />
  );
}
