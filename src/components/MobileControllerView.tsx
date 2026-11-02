import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ANSWER_OPTIONS_META,
  DifficultyLevel,
  GameMode,
  LEARNING_MODULES,
  LearningModuleId,
  PLAYER_AVATARS,
  PlayerState,
  PowerUpType,
  RoomState,
} from '../types/game.ts';
import { AvatarIcon, MgnetSoftwareBadge, NumberCube3D } from './AvatarIcon.tsx';
import { soundEngine } from '../utils/sound.ts';
import {
  CheckCircle2,
  Crown,
  Play,
  RotateCcw,
  Scissors,
  Snowflake,
  Sparkles,
  Star,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MobileControllerViewProps {
  roomState: RoomState | null;
  playerId: string;
  initialRoomCode: string;
  errorMessage: string | null;
  onJoinRoom: (code: string, name: string, avatarId: string) => void;
  onSelectAnswer: (optionIndex: number) => void;
  onUsePowerUp: (powerUp: PowerUpType) => void;
  onConfigureGame: (config: {
    mode?: GameMode;
    difficulty?: DifficultyLevel;
    moduleId?: LearningModuleId;
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
  onUsePowerUp,
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
    const cleanName = playerName.trim() || 'Campeão';
    if (cleanPin.length !== 4) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mathshow_player_name', cleanName);
    }
    soundEngine.vibrate('tap');
    soundEngine.playPlayerJoin();
    onJoinRoom(cleanPin, cleanName, selectedAvatar);
  };

  const handleToggleMute = () => {
    soundEngine.vibrate('tap');
    setMuted(soundEngine.toggleMute());
  };

  // 1. JOIN SCREEN (Kid-Friendly Big Touch Inputs >= 64px)
  if (!isJoined || !roomState || !myPlayer) {
    return (
      <div
        className={`${
          isEmbeddedPiP ? 'h-full' : 'min-h-screen'
        } w-full bg-gradient-to-b from-[#007AFF] via-[#072B59] to-[#0A192F] text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6`}
      >
        <header className="flex items-center justify-between gap-4 pb-3 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="title-3d-yellow font-display font-black text-xl tracking-tight whitespace-nowrap shrink-0">
              Jogo de Matemática
            </span>
          </div>
          {!isEmbeddedPiP && onSwitchToTvMode && (
            <button
              type="button"
              onClick={onSwitchToTvMode}
              className="min-h-[48px] px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Tv className="w-4 h-4 text-[#FFD600]" />
              <span>Ver Tela da TV</span>
            </button>
          )}
        </header>

        <form onSubmit={handleJoinSubmit} className="my-auto py-3 max-w-md w-full mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h1 className="title-3d-white font-display text-2xl sm:text-3xl font-black">
              Controle Mágico de Blocos
            </h1>
            <p className="text-xs sm:text-sm text-sky-200 font-semibold">
              Digite os 4 números que aparecem na sua Fire TV!
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-600/90 border-2 border-white text-white text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sky-100 text-center">
              Código da Sala na TV (4 Dígitos)
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
              className="w-full h-16 px-4 rounded-2xl bg-[#0F172A] border-3 border-[#FFD600] focus:outline-none font-mono text-3xl font-black tracking-[0.35em] text-center text-[#FFD600] tabular-nums shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sky-100">
              Seu Nome ou Apelido
            </label>
            <input
              type="text"
              maxLength={14}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ex: Léo, Bia, Lucas..."
              required
              className="w-full h-14 px-4 rounded-2xl bg-[#0F172A] border-2 border-sky-400 focus:border-[#FFD600] focus:outline-none text-base font-bold text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sky-100">
              Escolha Seu Personagem
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {PLAYER_AVATARS.map((av) => {
                const active = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      soundEngine.vibrate('tap');
                      setSelectedAvatar(av.id);
                    }}
                    className={`min-h-[68px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
                      active
                        ? 'bg-[#007AFF] border-[#FFD600] scale-105 shadow-lg'
                        : 'bg-[#0F172A]/80 border-white/20 opacity-80'
                    }`}
                  >
                    <AvatarIcon avatarId={av.id} className="w-9 h-9" />
                    <span className="text-[11px] font-extrabold text-white truncate max-w-full">
                      {av.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pinCode.trim().length !== 4}
              className="cube-3d w-full min-h-[64px] rounded-3xl bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-slate-800 disabled:text-slate-500 border-3 border-white text-white font-display font-black text-xl flex items-center justify-center gap-2.5 transition-transform active:scale-95 whitespace-nowrap"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR NA TV!</span>
            </button>
          </div>
        </form>

        <footer className="flex justify-center pt-1">
          <MgnetSoftwareBadge />
        </footer>
      </div>
    );
  }

  // 2. ACTIVE CONTROLLER VIEW
  const question = roomState.currentQuestion;
  const isQuestionActive = roomState.status === 'QUESTION_ACTIVE' && question !== null;
  const isReveal = roomState.status === 'ROUND_REVEAL' && question !== null;
  const hasAnswered = myPlayer.currentAnswer !== null;
  const isMyAnswerCorrect =
    question !== null && myPlayer.currentAnswer === question.correctIndex;

  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex((p) => p.id === myPlayer.id) + 1;

  return (
    <div
      className={`${
        isEmbeddedPiP ? 'h-full' : 'min-h-screen'
      } w-full bg-gradient-to-b from-[#0284C7] via-[#072B59] to-[#0A192F] text-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-5 select-none`}
    >
      {/* Compact Top Bar */}
      <header className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0F172A]/95 border-2 border-sky-400/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <AvatarIcon avatarId={myPlayer.avatarId} className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-white truncate">
                {myPlayer.name}
              </span>
              {myPlayer.isHost && (
                <Crown className="w-4 h-4 text-[#FFD600] shrink-0" aria-label="Líder da Sala" />
              )}
            </div>
            <div className="text-xs text-sky-300 font-bold flex items-center gap-1.5 tabular-nums">
              <span>Sala {roomState.code}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FFD600]">⭐ {myPlayer.stars}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right px-3 py-1 rounded-xl bg-slate-900 border border-slate-700">
            <div className="text-[10px] font-bold text-sky-300">PONTOS</div>
            <div className="font-mono font-black text-sm text-[#FFD600] tabular-nums">
              {myPlayer.score}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTROLLER WORKSPACE */}
      <main className="flex-1 flex flex-col justify-between my-3 gap-3 max-w-md w-full mx-auto">
        {/* STATE A: LOBBY / MODULE SELECTION */}
        {(roomState.status === 'LOBBY' || roomState.status === 'TITLE_MENU') && (
          <div className="flex-1 flex flex-col justify-between gap-3 bg-[#0F172A]/90 border-2 border-sky-400/40 rounded-3xl p-4">
            <div className="space-y-1.5 text-center my-auto">
              <div className="flex justify-center gap-1.5">
                <NumberCube3D number={1} colorHex="#007AFF" size="sm" />
                <NumberCube3D number={2} colorHex="#FFD600" size="sm" />
                <NumberCube3D number={3} colorHex="#EF4444" size="sm" />
              </div>
              <h2 className="font-display text-xl font-black text-white pt-1">
                Controle #{myPlayer.slotIndex + 1} Pronto!
              </h2>
              <p className="text-xs text-sky-200 font-semibold">
                {roomState.players.length} de 4 jogadores conectados na Fire TV.
              </p>
            </div>

            {myPlayer.isHost ? (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="text-xs font-extrabold text-[#FFD600]">
                  Escolha o Módulo da Trilha Educativa:
                </div>

                {/* 4 Learning Modules Selector */}
                <div className="grid grid-cols-2 gap-2">
                  {LEARNING_MODULES.map((mod) => {
                    const selected = roomState.settings.moduleId === mod.id;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          soundEngine.vibrate('tap');
                          onConfigureGame({ moduleId: mod.id });
                        }}
                        style={{
                          backgroundColor: selected ? mod.bgColor : '#1E293B',
                        }}
                        className={`min-h-[56px] p-2.5 rounded-2xl border-2 text-left transition-transform active:scale-95 ${
                          selected ? 'border-white shadow-lg' : 'border-slate-700 opacity-85'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase text-white/90">
                          {mod.numberLabel}
                        </div>
                        <div className="font-display font-black text-xs text-white leading-tight">
                          {mod.title}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Difficulty Selector */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'EASY', label: 'Fácil (1-10)' },
                      { id: 'MEDIUM', label: 'Médio' },
                      { id: 'HARD', label: 'Super' },
                    ] as { id: DifficultyLevel; label: string }[]
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        soundEngine.vibrate('tap');
                        onConfigureGame({ difficulty: d.id });
                      }}
                      className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-colors whitespace-nowrap ${
                        roomState.settings.difficulty === d.id
                          ? 'bg-[#FFD600] text-slate-950 border-white'
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
                    soundEngine.vibrate('success');
                    soundEngine.playNewQuestion();
                    onStartGame();
                  }}
                  className="cube-3d w-full min-h-[60px] rounded-3xl bg-[#22C55E] hover:bg-[#16A34A] border-3 border-white text-white font-display font-black text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>COMEÇAR JOGO NA TV!</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-sky-400/30 text-center text-xs font-bold text-sky-200">
                Olhe para a TV! O Jogador 1 está escolhendo o módulo...
              </div>
            )}
          </div>
        )}

        {/* STATE B: ACTIVE QUESTION (4 Big 3D Cubes >= 64px + 3 Power-Up Buttons at Bottom) */}
        {isQuestionActive && question && (
          <>
            {/* Question Visual Header on Phone */}
            <div className="p-3 rounded-2xl bg-[#0F172A]/95 border-2 border-sky-400/50 text-center space-y-1">
              <div className="text-[11px] font-bold text-sky-300 flex items-center justify-center gap-1.5">
                <span>
                  Atividade {question.roundNumber}/{question.totalRounds}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#FFD600]">{question.promptText}</span>
              </div>
              <div className="font-display font-black text-3xl text-white tracking-tight tabular-nums">
                {question.expression}
              </div>
            </div>

            {/* 4 Big 3D Cube Answer Buttons (64px+ minimum touch target) */}
            {!hasAnswered ? (
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-[230px]">
                {ANSWER_OPTIONS_META.map((meta) => {
                  const value = question.options[meta.index];
                  const isEliminated = myPlayer.eliminatedOptions?.includes(meta.index);

                  if (isEliminated) {
                    return (
                      <div
                        key={meta.letter}
                        className="rounded-3xl bg-slate-900/50 border-2 border-dashed border-slate-700 p-4 flex flex-col items-center justify-center text-slate-500 min-h-[108px]"
                      >
                        <span className="text-xs font-bold line-through">
                          Bloco {meta.letter} Removido (50/50)
                        </span>
                      </div>
                    );
                  }

                  return (
                    <motion.button
                      key={meta.letter}
                      type="button"
                      whileTap={{ scale: 0.92, y: 4 }}
                      onClick={() => {
                        soundEngine.vibrate('tap');
                        soundEngine.playBuzzerLock(myPlayer.slotIndex);
                        onSelectAnswer(meta.index);
                      }}
                      style={{ backgroundColor: meta.hexColor }}
                      className="cube-3d border-3 border-white rounded-3xl p-4 flex flex-col items-center justify-between text-white min-h-[112px]"
                    >
                      <div className="w-full flex items-center justify-between text-xs font-black drop-shadow">
                        <span>BLOCO {meta.letter}</span>
                        <span className="text-base">{meta.shape}</span>
                      </div>
                      <div className="font-display font-black text-4xl sm:text-5xl tabular-nums my-auto drop-shadow-[0_3px_3px_rgba(0,0,0,0.45)]">
                        {value}
                      </div>
                      <div className="text-[11px] font-extrabold bg-black/20 px-2.5 py-0.5 rounded-lg">
                        Toque no Cubo
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-6 flex flex-col items-center justify-center text-center space-y-3"
              >
                <NumberCube3D
                  number={question.options[myPlayer.currentAnswer ?? 0]}
                  colorHex={ANSWER_OPTIONS_META[myPlayer.currentAnswer ?? 0].hexColor}
                  size="lg"
                />
                <h3 className="font-display text-2xl font-black text-white">
                  Bloco Escolhido!
                </h3>
                <p className="text-xs font-bold text-sky-200">
                  Olhe para a TV para ver a torre de blocos!
                </p>
              </motion.div>
            )}

            {/* 3 TACTICAL SINGLE-USE POWER-UP BUTTONS AT BOTTOM OF MOBILE CONTROLLER */}
            <div className="pt-1">
              <div className="text-[11px] font-extrabold text-sky-200 mb-1.5 text-center">
                Ajudas Especiais (1 uso por partida):
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Power-Up 1: 50/50 Cut 2 Wrong Options */}
                <button
                  type="button"
                  disabled={hasAnswered || myPlayer.powerUpsUsed?.FIFTY_FIFTY}
                  onClick={() => {
                    soundEngine.vibrate('powerup');
                    soundEngine.playPowerUp();
                    onUsePowerUp('FIFTY_FIFTY');
                  }}
                  className={`min-h-[64px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
                    myPlayer.powerUpsUsed?.FIFTY_FIFTY
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50'
                      : 'bg-[#A855F7] hover:bg-[#9333EA] border-white text-white cube-3d'
                  }`}
                >
                  <Scissors className="w-5 h-5" />
                  <span className="text-[11px] font-black leading-none whitespace-nowrap">
                    Cortar 2 (50/50)
                  </span>
                </button>

                {/* Power-Up 2: Freeze / Add +5s */}
                <button
                  type="button"
                  disabled={hasAnswered || myPlayer.powerUpsUsed?.FREEZE_TIME}
                  onClick={() => {
                    soundEngine.vibrate('powerup');
                    soundEngine.playPowerUp();
                    onUsePowerUp('FREEZE_TIME');
                  }}
                  className={`min-h-[64px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
                    myPlayer.powerUpsUsed?.FREEZE_TIME
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50'
                      : 'bg-[#007AFF] hover:bg-[#0284C7] border-white text-white cube-3d'
                  }`}
                >
                  <Snowflake className="w-5 h-5" />
                  <span className="text-[11px] font-black leading-none whitespace-nowrap">
                    +5 Segundos
                  </span>
                </button>

                {/* Power-Up 3: Double Stars 2x */}
                <button
                  type="button"
                  disabled={hasAnswered || myPlayer.powerUpsUsed?.DOUBLE_STARS}
                  onClick={() => {
                    soundEngine.vibrate('powerup');
                    soundEngine.playPowerUp();
                    onUsePowerUp('DOUBLE_STARS');
                  }}
                  className={`min-h-[64px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
                    myPlayer.powerUpsUsed?.DOUBLE_STARS
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50'
                      : 'bg-[#F97316] hover:bg-[#EA580C] border-white text-white cube-3d'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[11px] font-black leading-none whitespace-nowrap">
                    Estrela 2x
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* STATE C: ROUND REVEAL (Kid-Safe Positive Reinforcement: "Sem Punições Severas") */}
        {isReveal && question && (
          <div
            className={`flex-1 rounded-3xl p-5 border-3 flex flex-col justify-between text-center ${
              isMyAnswerCorrect
                ? 'bg-[#16A34A]/90 border-white'
                : 'bg-[#0F172A]/95 border-[#FFD600]'
            }`}
          >
            <div className="my-auto space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/20 mx-auto">
                {isMyAnswerCorrect ? (
                  <CheckCircle2 className="w-10 h-10 text-[#FFD600]" />
                ) : (
                  <Star className="w-10 h-10 text-[#FFD600]" />
                )}
              </div>

              <h2 className="font-display text-2xl font-black text-white">
                {isMyAnswerCorrect
                  ? `Muito Bem! +${myPlayer.lastPointsEarned} pts ⭐`
                  : 'Boa tentativa! Tente de novo na próxima!'}
              </h2>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/20 space-y-1">
                <div className="text-xs font-bold text-sky-300">Resposta dos Blocos</div>
                <div className="font-display text-2xl font-black text-[#FFD600] tabular-nums">
                  {question.expression} = {question.correctAnswer}
                </div>
                <p className="text-xs font-semibold text-white pt-1">{question.mentalMathTip}</p>
              </div>
            </div>

            {myPlayer.isHost && (
              <button
                type="button"
                onClick={onNextRound}
                className="cube-3d w-full min-h-[54px] rounded-2xl bg-[#FFD600] text-slate-950 font-display font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform whitespace-nowrap"
              >
                <span>Próximo Desafio</span>
              </button>
            )}
          </div>
        )}

        {/* STATE D: PAUSED */}
        {roomState.status === 'PAUSED' && (
          <div className="flex-1 rounded-3xl bg-[#0F172A] border-2 border-[#FFD600] p-6 flex flex-col items-center justify-center text-center space-y-3">
            <h2 className="font-display text-2xl font-black text-[#FFD600]">Jogo em Pausa</h2>
            <p className="text-xs font-semibold text-sky-200">
              Olhe para a tela da TV para continuar a brincadeira!
            </p>
          </div>
        )}

        {/* STATE E: GAME OVER */}
        {roomState.status === 'GAME_OVER' && (
          <div className="flex-1 rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-5 flex flex-col justify-between text-center space-y-4">
            <div className="my-auto space-y-2">
              <div className="text-xs font-black text-[#FFD600] uppercase">Parabéns!</div>
              <h2 className="font-display text-3xl font-black text-white">
                {myRank}º Lugar · ⭐ {myPlayer.stars} Estrelas
              </h2>
              <div className="font-mono text-2xl font-black text-[#22C55E] tabular-nums">
                {myPlayer.score} pontos
              </div>
              <div className="text-xs font-bold text-sky-200 tabular-nums">
                Acertos: {myPlayer.correctCount} de {roomState.settings.totalRounds} atividades
              </div>
            </div>

            <button
              type="button"
              onClick={onRestartGame}
              className="cube-3d w-full min-h-[60px] rounded-3xl bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white font-display font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform whitespace-nowrap"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Brincar de Novo!</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
