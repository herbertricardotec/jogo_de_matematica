import React, { useState } from 'react';
import {
  ANSWER_OPTIONS_META,
  DifficultyLevel,
  GameMode,
  PLAYER_AVATARS,
  PlayerState,
  RoomState,
} from '../types/game.ts';
import { AvatarIcon } from './AvatarIcon.tsx';
import { soundEngine } from '../utils/sound.ts';
import { CheckCircle2, Crown, Play, RotateCcw, Tv, Users, Volume2, VolumeX, XCircle } from 'lucide-react';

interface MobileControllerViewProps {
  roomState: RoomState | null;
  playerId: string;
  initialRoomCode: string;
  errorMessage: string | null;
  onJoinRoom: (code: string, name: string, avatarId: string) => void;
  onSelectAnswer: (optionIndex: number) => void;
  onConfigureGame: (config: {
    mode?: GameMode;
    difficulty?: DifficultyLevel;
    totalRounds?: number;
  }) => void;
  onStartGame: () => void;
  onRestartGame: () => void;
  onNextRound: () => void;
  onSwitchToTvMode?: () => void;
  isEmbeddedPiP?: boolean;
}

export const MobileControllerView: React.FC<MobileControllerViewProps> = ({
  roomState,
  playerId,
  initialRoomCode,
  errorMessage,
  onJoinRoom,
  onSelectAnswer,
  onConfigureGame,
  onStartGame,
  onRestartGame,
  onNextRound,
  onSwitchToTvMode,
  isEmbeddedPiP = false,
}) => {
  const [pinCode, setPinCode] = useState(initialRoomCode || '');
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('mathshow_player_name') || '';
    }
    return '';
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PLAYER_AVATARS[0].id);
  const [muted, setMuted] = useState(soundEngine.isMuted());

  const myPlayer: PlayerState | undefined = roomState?.players.find((p) => p.id === playerId);
  const isJoined = Boolean(roomState && myPlayer);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();
    const cleanName = playerName.trim() || 'Competidor';
    if (cleanPin.length !== 4) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mathshow_player_name', cleanName);
    }
    soundEngine.playPlayerJoin();
    onJoinRoom(cleanPin, cleanName, selectedAvatar);
  };

  const handleToggleMute = () => {
    setMuted(soundEngine.toggleMute());
  };

  // 1. JOIN FORM (Before connecting to a TV room)
  if (!isJoined || !roomState || !myPlayer) {
    return (
      <div
        className={`${
          isEmbeddedPiP ? 'h-full' : 'min-h-screen'
        } w-full bg-[#080D1E] text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6`}
      >
        {/* Top Bar (Compact 52px) */}
        <header className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight text-amber-400 whitespace-nowrap shrink-0">
              MathShow Controle
            </span>
          </div>
          {!isEmbeddedPiP && onSwitchToTvMode && (
            <button
              type="button"
              onClick={onSwitchToTvMode}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Abrir Modo Fire TV</span>
            </button>
          )}
        </header>

        {/* Form Body */}
        <form onSubmit={handleJoinSubmit} className="my-auto py-4 max-w-md w-full mx-auto space-y-5">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-extrabold text-white">
              Conectar ao Palco da TV
            </h1>
            <p className="text-sm text-slate-400">
              Digite o código de 4 dígitos exibido na sua Amazon Fire TV.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Código da Sala (PIN de 4 dígitos)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              required
              className="w-full h-14 px-4 rounded-2xl bg-[#1E293B] border border-slate-700 focus:border-amber-400 focus:outline-none font-mono text-2xl font-bold tracking-[0.35em] text-center text-amber-400 tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Seu Nome no Placar
            </label>
            <input
              type="text"
              maxLength={14}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ex: Lucas, Sofia, Pai..."
              required
              className="w-full h-12 px-4 rounded-2xl bg-[#1E293B] border border-slate-700 focus:border-amber-400 focus:outline-none text-base font-semibold text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Escolha seu Competidor
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {PLAYER_AVATARS.map((av) => {
                const active = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`min-h-[64px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
                      active
                        ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-[#1E293B]/70 border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <AvatarIcon avatarId={av.id} className="w-8 h-8" />
                    <span className="text-[11px] font-medium text-slate-200 truncate max-w-full">
                      {av.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action in Natural Thumb Zone */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={pinCode.trim().length !== 4}
              className="w-full min-h-[54px] rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Entrar no Palco</span>
            </button>
          </div>
        </form>

        <footer className="text-center text-xs text-slate-500 pt-2">
          Pareamento em tempo real para Amazon Fire TV Stick
        </footer>
      </div>
    );
  }

  // 2. ACTIVE CONTROLLER VIEW (Connected to Room)
  const question = roomState.currentQuestion;
  const isQuestionActive = roomState.status === 'QUESTION_ACTIVE' && question !== null;
  const isReveal = roomState.status === 'ROUND_REVEAL' && question !== null;
  const hasAnswered = myPlayer.currentAnswer !== null;
  const isMyAnswerCorrect =
    question !== null && myPlayer.currentAnswer === question.correctIndex;

  // Player rank calculation
  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex((p) => p.id === myPlayer.id) + 1;

  return (
    <div
      className={`${
        isEmbeddedPiP ? 'h-full' : 'min-h-screen'
      } w-full bg-[#080D1E] text-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-5 select-none`}
    >
      {/* Compact Sticky Top App Bar (<= 10% mobile height) */}
      <header className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-[#1E293B] border border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <AvatarIcon avatarId={myPlayer.avatarId} className="w-8 h-8 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-white truncate">
                {myPlayer.name}
              </span>
              {myPlayer.isHost && (
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Anfitrião" />
              )}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 tabular-nums">
              <span>Sala {roomState.code}</span>
              <span aria-hidden="true">·</span>
              <span>{myRank}º Lugar</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400">Pontos</div>
            <div className="font-mono font-bold text-sm text-amber-400 tabular-nums">
              {myPlayer.score}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MIDDLE + BOTTOM THUMB ZONE */}
      <main className="flex-1 flex flex-col justify-between my-3 gap-3 max-w-md w-full mx-auto">
        {/* STATE A: LOBBY / TITLE MENU (Host can configure & start) */}
        {(roomState.status === 'LOBBY' || roomState.status === 'TITLE_MENU') && (
          <div className="flex-1 flex flex-col justify-between gap-4 bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-4">
            <div className="space-y-2 text-center my-auto">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Você está no Palco #{myPlayer.slotIndex + 1}!
              </h2>
              <p className="text-xs text-slate-300">
                {roomState.players.length} de 4 controles conectados na TV.
              </p>
            </div>

            {myPlayer.isHost ? (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-amber-400">
                  Controle VIP do Anfitrião (Configurar Partida)
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onConfigureGame({ mode: 'COMPETITIVE' })}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                      roomState.settings.mode === 'COMPETITIVE'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Competitivo (1º a 4º)
                  </button>
                  <button
                    type="button"
                    onClick={() => onConfigureGame({ mode: 'COOPERATIVE' })}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                      roomState.settings.mode === 'COOPERATIVE'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Cooperativo (Equipe)
                  </button>
                </div>

                {/* Difficulty Selector */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'EASY', label: 'Iniciante (≤20)' },
                      { id: 'MEDIUM', label: 'Médio (≤100)' },
                      { id: 'HARD', label: 'Mestre (3 nºs)' },
                    ] as { id: DifficultyLevel; label: string }[]
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onConfigureGame({ difficulty: d.id })}
                      className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                        roomState.settings.difficulty === d.id
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playNewQuestion();
                    onStartGame();
                  }}
                  className="w-full min-h-[54px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] whitespace-nowrap"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Iniciar Show na TV</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-300">
                Aguardando o Jogador 1 iniciar o show na TV...
              </div>
            )}
          </div>
        )}

        {/* STATE B: ACTIVE QUESTION (4 Big Ergonomic Thumb Buttons) */}
        {isQuestionActive && question && (
          <>
            {/* Equation Mirror Header on Phone */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-center space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-2 tabular-nums">
                <span>
                  Rodada {question.roundNumber} de {question.totalRounds}
                </span>
                <span aria-hidden="true">·</span>
                <span>{question.categoryLabel}</span>
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
                {question.expression} = ?
              </div>
            </div>

            {/* 4 Tactile Buzzer Buttons in Natural Thumb Zone */}
            {!hasAnswered ? (
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-[260px]">
                {ANSWER_OPTIONS_META.map((meta) => {
                  const value = question.options[meta.index];
                  return (
                    <button
                      key={meta.letter}
                      type="button"
                      onClick={() => {
                        soundEngine.playBuzzerLock(myPlayer.slotIndex);
                        onSelectAnswer(meta.index);
                      }}
                      className={`${meta.bgClass} border-2 ${meta.borderClass} rounded-3xl p-4 flex flex-col items-center justify-between text-white shadow-lg active:scale-95 transition-transform min-h-[110px]`}
                    >
                      <div className="w-full flex items-center justify-between text-xs font-bold opacity-90">
                        <span>OPÇÃO {meta.letter}</span>
                        <span className="text-base">{meta.shape}</span>
                      </div>
                      <div className="font-mono font-extrabold text-3xl sm:text-4xl tabular-nums my-auto">
                        {value}
                      </div>
                      <div className="text-[11px] font-medium opacity-80">
                        Toque para travar
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 rounded-3xl bg-[#1E293B] border-2 border-amber-400/60 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-2xl font-extrabold">
                  {ANSWER_OPTIONS_META[myPlayer.currentAnswer ?? 0].shape}{' '}
                  {ANSWER_OPTIONS_META[myPlayer.currentAnswer ?? 0].letter}
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  Resposta Travada: {question.options[myPlayer.currentAnswer ?? 0]}
                </h3>
                <p className="text-xs text-slate-300">
                  Olhe para a TV! A revelação acontece assim que todos responderem.
                </p>
              </div>
            )}
          </>
        )}

        {/* STATE C: ROUND REVEAL */}
        {isReveal && question && (
          <div
            className={`flex-1 rounded-3xl p-5 border-2 flex flex-col justify-between text-center ${
              isMyAnswerCorrect
                ? 'bg-emerald-950/60 border-emerald-500'
                : 'bg-rose-950/60 border-rose-500'
            }`}
          >
            <div className="my-auto space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900/70 mx-auto">
                {isMyAnswerCorrect ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                ) : (
                  <XCircle className="w-9 h-9 text-rose-400" />
                )}
              </div>

              <h2 className="font-display text-2xl font-black text-white">
                {isMyAnswerCorrect
                  ? `Certa Resposta! +${myPlayer.lastPointsEarned} pts`
                  : hasAnswered
                  ? 'Quase lá! Tente na próxima'
                  : 'Tempo Esgotado!'}
              </h2>

              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Resultado Correto</div>
                <div className="font-mono text-2xl font-extrabold text-emerald-400 tabular-nums">
                  {question.expression} = {question.correctAnswer}
                </div>
                <p className="text-xs text-slate-300 pt-1">{question.mentalMathTip}</p>
              </div>
            </div>

            {myPlayer.isHost && (
              <button
                type="button"
                onClick={onNextRound}
                className="w-full min-h-[48px] rounded-2xl bg-white text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform whitespace-nowrap"
              >
                <span>Próxima Rodada Agora</span>
              </button>
            )}
          </div>
        )}

        {/* STATE D: PAUSED */}
        {roomState.status === 'PAUSED' && (
          <div className="flex-1 rounded-3xl bg-[#1E293B] border border-slate-700 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <h2 className="font-display text-xl font-bold text-amber-400">Show Pausado na TV</h2>
            <p className="text-xs text-slate-300">
              Aguarde a retomada da partida para responder.
            </p>
          </div>
        )}

        {/* STATE E: GAME OVER */}
        {roomState.status === 'GAME_OVER' && (
          <div className="flex-1 rounded-3xl bg-[#1E293B] border border-amber-500/40 p-5 flex flex-col justify-between text-center space-y-4">
            <div className="my-auto space-y-2">
              <div className="text-xs font-semibold text-amber-400">Fim do Show!</div>
              <h2 className="font-display text-3xl font-black text-white">
                {myRank}º Lugar no Palco
              </h2>
              <div className="font-mono text-2xl font-extrabold text-emerald-400 tabular-nums">
                {myPlayer.score} pontos
              </div>
              <div className="text-xs text-slate-300 tabular-nums">
                Acertos: {myPlayer.correctCount} de {roomState.settings.totalRounds} · Melhor
                Sequência: {myPlayer.bestStreak}x
              </div>
            </div>

            <button
              type="button"
              onClick={onRestartGame}
              className="w-full min-h-[52px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform whitespace-nowrap"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
