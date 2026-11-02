/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CustomEquationItem,
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
  const wsDisabledRef = useRef<boolean>(false);
  const useHttpFallbackRef = useRef<boolean>(false);
  const activeRoomCodeRef = useRef<string>(initialRoomParam || '');
  const roomStateRef = useRef<RoomState | null>(null);

  // Buffer & in-flight request guards to prevent request pile-up or UI freezes
  const inFlightPollRef = useRef<boolean>(false);
  const inFlightActionCountRef = useRef<number>(0);
  const lastSyncTimestampRef = useRef<number>(0);

  const prevStatusRef = useRef<string>('');
  const prevQuestionIdRef = useRef<string>('');
  const prevPlayersCountRef = useRef<number>(0);
  const prevAnsweredCountRef = useRef<number>(0);

  useEffect(() => {
    soundEngine.setControllerMode(viewMode === 'CONTROLLER');
  }, [viewMode]);

  const applyIncomingState = useCallback((nextState: RoomState) => {
    if (!nextState || !nextState.code) return;
    activeRoomCodeRef.current = nextState.code;
    roomStateRef.current = nextState;
    window.sessionStorage.setItem('mathshow_room_code', nextState.code);

    // Player joined celebration on TV
    if (nextState.players.length > prevPlayersCountRef.current) {
      soundEngine.playPlayerJoin();
      setBurstTrigger((c) => c + 1);
    }
    prevPlayersCountRef.current = nextState.players.length;

    // Player locked in answer on TV
    const answeredNow = nextState.players.filter((p) => p.currentAnswer !== null).length;
    if (
      nextState.status === 'QUESTION_ACTIVE' &&
      answeredNow > prevAnsweredCountRef.current
    ) {
      soundEngine.playBuzzerLock(answeredNow - 1);
      setShakeTrigger((s) => s + 1);
    }
    prevAnsweredCountRef.current = answeredNow;

    // New Question Start: Chime on TV + Gentle vibration ("leve tremida") on Mobile Controller
    if (
      nextState.status === 'QUESTION_ACTIVE' &&
      nextState.currentQuestion &&
      nextState.currentQuestion.id !== prevQuestionIdRef.current
    ) {
      prevQuestionIdRef.current = nextState.currentQuestion.id;
      soundEngine.playNewQuestion();
      soundEngine.vibrate('question_start');
    }

    // Round Reveal & Victory Transitions with 3D Medals Fanfare & Confetti on TV
    if (nextState.status !== prevStatusRef.current) {
      if (nextState.status === 'ROUND_REVEAL') {
        const q = nextState.currentQuestion;
        const anyRight = Boolean(
          q && nextState.players.some((p) => p.currentAnswer === q.correctIndex)
        );
        soundEngine.playRoundReveal(anyRight);
        setShakeTrigger((s) => s + 1);
        if (anyRight) {
          setBurstTrigger((c) => c + 1);
        }
      } else if (nextState.status === 'GAME_OVER') {
        soundEngine.playVictoryFanfare();
        setBurstTrigger((c) => c + 1);

        // Additional confetti & 3D medal fanfare wave on TV
        setTimeout(() => {
          soundEngine.playMedalFanfare();
          setBurstTrigger((c) => c + 1);
        }, 750);
      }
      prevStatusRef.current = nextState.status;
    }

    setRoomState(nextState);
  }, []);

  const sendAction = useCallback(
    async (payload: Record<string, unknown>) => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        wsRef.current.bufferedAmount < 65536
      ) {
        wsRef.current.send(JSON.stringify(payload));
        return;
      }

      // Buffer verification: avoid stacking more than 3 concurrent POST actions
      if (inFlightActionCountRef.current >= 3) {
        return;
      }

      inFlightActionCountRef.current += 1;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const code =
          (payload.code as string) ||
          activeRoomCodeRef.current ||
          window.sessionStorage.getItem('mathshow_room_code') ||
          initialRoomParam;

        // Include lightweight stateSnapshot buffer so Vercel serverless cold-starts hydrate seamlessly without 404s
        const currentSnap =
          roomStateRef.current && roomStateRef.current.code !== '----'
            ? roomStateRef.current
            : undefined;

        const res = await fetch('/api/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            code,
            stateSnapshot: currentSnap,
          }),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data.error) {
            setErrorMessage(data.error);
          }
          return;
        }
        if (data.state) {
          setErrorMessage(null);
          applyIncomingState(data.state);
        }
      } catch {
        // Ignore transient network timeouts while reconnecting
      } finally {
        clearTimeout(timeoutId);
        inFlightActionCountRef.current = Math.max(0, inFlightActionCountRef.current - 1);
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
        // Buffer guard: never start a new poll if a poll or action is already in flight
        if (isUnmounted || inFlightPollRef.current || inFlightActionCountRef.current > 0) {
          return;
        }

        const code =
          activeRoomCodeRef.current ||
          window.sessionStorage.getItem('mathshow_room_code') ||
          initialRoomParam;
        if (!code || code.length !== 4) return;

        inFlightPollRef.current = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3200);

        try {
          const res = await fetch(`/api/room?code=${encodeURIComponent(code)}`, {
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.state) {
              const localSnap = roomStateRef.current;
              const serverIsFreshEmpty =
                Boolean(data.recovered) &&
                data.state.players?.length === 0 &&
                data.state.status === 'TITLE_MENU';
              const localHasActiveSession =
                Boolean(localSnap) &&
                localSnap!.code === code &&
                (localSnap!.players.length > 0 || localSnap!.status !== 'TITLE_MENU');

              // If Vercel serverless spun up a new instance, push our local snapshot buffer to hydrate it immediately
              if (
                serverIsFreshEmpty &&
                localHasActiveSession &&
                Date.now() - lastSyncTimestampRef.current > 2000
              ) {
                lastSyncTimestampRef.current = Date.now();
                sendAction({
                  type: 'room:sync_snapshot',
                  code,
                  stateSnapshot: localSnap,
                });
              } else {
                applyIncomingState(data.state);
              }
            }
          }
        } catch {
          // Ignore transient polling timeouts
        } finally {
          clearTimeout(timeoutId);
          inFlightPollRef.current = false;
        }
      }, 1000);
    };

    const connectWebSocket = () => {
      if (isUnmounted) return;

      // On Vercel serverless (.vercel.app) or after a failed WS handshake, use HTTP Polling directly without WS console errors
      const hostname = window.location.hostname || '';
      if (wsDisabledRef.current || hostname.endsWith('.vercel.app')) {
        wsDisabledRef.current = true;
        startHttpFallbackPolling();
        return;
      }

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
            wsDisabledRef.current = true;
            startHttpFallbackPolling();
          }
        };

        socket.onclose = () => {
          if (!opened) {
            wsDisabledRef.current = true;
            startHttpFallbackPolling();
          } else if (!isUnmounted) {
            reconnectTimeout = setTimeout(connectWebSocket, 2000);
          }
        };
      } catch {
        wsDisabledRef.current = true;
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

  const handleActivateVisualHint = useCallback(
    (customPlayerId?: string) => {
      sendAction({
        type: 'player:activate_visual_hint',
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

  const handleAdminKickPlayer = useCallback(
    (targetPlayerId: string) => {
      sendAction({ type: 'admin:kick_player', playerId: targetPlayerId });
    },
    [sendAction]
  );

  const handleAdminRotatePin = useCallback(() => {
    sendAction({ type: 'admin:rotate_pin' });
  }, [sendAction]);

  const handleAdminSetCustomQuestions = useCallback(
    (customQuestions: CustomEquationItem[], useCustomQuestions: boolean) => {
      sendAction({
        type: 'admin:set_custom_questions',
        customQuestions,
        useCustomQuestions,
      });
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
        onActivateVisualHint={() => handleActivateVisualHint(mobilePlayerId)}
        onContinueDecision={(cont) => handleContinueDecision(cont, mobilePlayerId)}
        onConfigureGame={handleConfigureGame}
        onStartGame={handleStartGame}
        onRestartGame={handleRestartGame}
        onNextRound={handleNextRound}
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
      useCustomQuestions: false,
      customQuestions: [],
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
      onActivateVisualHint={() => handleActivateVisualHint(effectiveRoomState.players[0]?.id)}
      onSwitchToFullMobile={() => setViewMode('CONTROLLER')}
      onAdminKickPlayer={handleAdminKickPlayer}
      onAdminRotatePin={handleAdminRotatePin}
      onAdminSetCustomQuestions={handleAdminSetCustomQuestions}
      simPlayerId={simPlayerId}
      simError={errorMessage}
      onSimJoin={(code, name, avatarId) => handleJoinRoom(code, name, avatarId, simPlayerId)}
      onSimAnswer={(idx) => handleSelectAnswer(idx, simPlayerId)}
      onSimUsePowerUp={(p) => handleUsePowerUp(p, simPlayerId)}
      onSimActivateVisualHint={() => handleActivateVisualHint(simPlayerId)}
      onSimContinueDecision={(cont) => handleContinueDecision(cont, simPlayerId)}
      onCelebrateMedals={() => setBurstTrigger((c) => c + 1)}
    />
  );
}
