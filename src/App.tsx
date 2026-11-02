/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DifficultyLevel, GameMode, RoomState } from './types/game.ts';
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
  // Detect if opened via QR Code on a smartphone (`?room=1234` or `?role=controller`)
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

            // Trigger audio & visual stage effects on state transitions
            if (nextState.players.length > prevPlayersCountRef.current) {
              soundEngine.playPlayerJoin();
              setBurstTrigger((c) => c + 1);
            }
            prevPlayersCountRef.current = nextState.players.length;

            const answeredNow = nextState.players.filter((p) => p.currentAnswer !== null).length;
            if (
              nextState.status === 'QUESTION_ACTIVE' &&
              answeredNow > prevAnsweredCountRef.current
            ) {
              soundEngine.playBuzzerLock(answeredNow - 1);
              setShakeTrigger((s) => s + 1);
            }
            prevAnsweredCountRef.current = answeredNow;

            if (nextState.status !== prevStatusRef.current) {
              if (nextState.status === 'QUESTION_ACTIVE') {
                soundEngine.playNewQuestion();
              } else if (nextState.status === 'ROUND_REVEAL') {
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
              }
              prevStatusRef.current = nextState.status;
            }

            setRoomState(nextState);
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

  const handleConfigureGame = useCallback(
    (config: { mode?: GameMode; difficulty?: DifficultyLevel; totalRounds?: number }) => {
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

  // Fallback skeleton while room is being created (usually < 50ms)
  const effectiveRoomState: RoomState = roomState || {
    code: '----',
    status: 'TITLE_MENU',
    settings: {
      mode: 'COMPETITIVE',
      difficulty: 'EASY',
      totalRounds: 8,
      timePerQuestionSec: 15,
    },
    players: [],
    currentQuestion: null,
    teamScore: 0,
    teamTarget: 4800,
    pausedRemainingMs: null,
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
    />
  );
}
