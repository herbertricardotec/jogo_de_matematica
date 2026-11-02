import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ANSWER_OPTIONS_META,
  AVATAR_3D_COLORS,
  AVATAR_ACCESSORIES,
  AVATAR_BASE_CHARACTERS,
  AvatarAccessoryId,
  AvatarBaseCharacterId,
  AvatarCategory,
  BotAccuracyMode,
  buildMultiplicationTablePack,
  CustomEquationItem,
  DifficultyLevel,
  ensureUniquePlayerAvatar,
  evaluatePlayerMedals,
  formatAnswerRevealSpeech,
  formatQuestionSpeechFormula,
  GameMode,
  LEARNING_MODULES,
  LearningModuleId,
  MathOperator,
  PlayerState,
  PowerUpType,
  RoomState,
  shuffleCustomEquations,
} from '../types/game.ts';
import {
  AvatarIcon,
  Medal3DBadge,
  MgnetSoftwareBadge,
  Module3DIllustration,
  NumberCube3D,
  VisualHint3DAnimator,
} from './AvatarIcon.tsx';
import { soundEngine } from '../utils/sound.ts';
import {
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Crown,
  Dices,
  Lightbulb,
  LogOut,
  Play,
  Plus,
  RotateCcw,
  Scissors,
  Shuffle,
  Snowflake,
  Sparkles,
  Star,
  Trash2,
  Volume2,
} from 'lucide-react';

interface MobileControllerViewProps {
  roomState: RoomState | null;
  playerId: string;
  initialRoomCode: string;
  errorMessage: string | null;
  onJoinRoom: (code: string, name: string, avatarId: string) => void;
  onSelectAnswer: (optionIndex: number) => void;
  onUsePowerUp: (powerUp: PowerUpType) => void;
  onActivateVisualHint?: () => void;
  onContinueDecision: (continueGame: boolean) => void;
  onConfigureGame: (config: {
    mode?: GameMode;
    difficulty?: DifficultyLevel;
    moduleId?: LearningModuleId;
    totalRounds?: number;
    vsMachine?: boolean;
    botAccuracyMode?: BotAccuracyMode;
  }) => void;
  onSetCustomQuestions?: (
    customQuestions: CustomEquationItem[],
    useCustomQuestions: boolean
  ) => void;
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
  onActivateVisualHint,
  onContinueDecision,
  onConfigureGame,
  onSetCustomQuestions,
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

  // 3D Avatar Generator State (Blocos Sorridentes 3D, Animais 3D & Estudantes 3D)
  const [avatarTab, setAvatarTab] = useState<'DESTAQUES' | AvatarCategory>('DESTAQUES');
  const [baseCharacter, setBaseCharacter] = useState<AvatarBaseCharacterId>('cube_happy');
  const [avatarColor, setAvatarColor] = useState<string>('#007AFF');
  const [avatarAccessory, setAvatarAccessory] = useState<AvatarAccessoryId>('none');

  const [remainingRatio, setRemainingRatio] = useState<number>(1);
  const [remainingSec, setRemainingSec] = useState<number>(18);

  // Mobile Host Modo Professor State
  const [showMobileTeacherMode, setShowMobileTeacherMode] = useState<boolean>(false);
  const [mobileTermA, setMobileTermA] = useState<string>('7');
  const [mobileOperator, setMobileOperator] = useState<MathOperator>('×');
  const [mobileTermB, setMobileTermB] = useState<string>('8');
  const [mobileTeacherError, setMobileTeacherError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode && initialRoomCode.length === 4) {
      setPinCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Identify avatars and colors already used by other players on the TV to guarantee a unique visual identity
  const otherConnectedPlayers = (roomState?.players || []).filter(
    (p) => !p.isBot && p.id !== playerId
  );
  const usedCharactersOnTv = new Set(
    otherConnectedPlayers.map((p) => (p.avatarId || '').split('|')[0])
  );
  const usedColorsOnTv = new Set(
    otherConnectedPlayers.map((p) => (p.avatarId || '').split('|')[1])
  );

  // Automatically switch to an unused 3D avatar & color if another player on the TV already took the current one
  useEffect(() => {
    if (usedCharactersOnTv.has(baseCharacter)) {
      const freePreset = AVATAR_BASE_CHARACTERS.find((c) => !usedCharactersOnTv.has(c.id));
      if (freePreset) {
        setBaseCharacter(freePreset.id);
        const freeCol = !usedColorsOnTv.has(freePreset.defaultColor)
          ? freePreset.defaultColor
          : AVATAR_3D_COLORS.find((c) => !usedColorsOnTv.has(c.hex))?.hex || freePreset.defaultColor;
        setAvatarColor(freeCol);
      }
    }
  }, [roomState?.players, baseCharacter]);

  const composedAvatarId = `${baseCharacter}|${avatarColor}|${avatarAccessory}`;
  const myPlayer: PlayerState | undefined = roomState?.players.find((p) => p.id === playerId);
  const isJoined = Boolean(roomState && myPlayer);

  // Smooth countdown progress bar on Mobile during QUESTION_ACTIVE or ROUND_REVEAL
  useEffect(() => {
    if (!roomState) return;
    if (roomState.status === 'QUESTION_ACTIVE' && roomState.currentQuestion) {
      const q = roomState.currentQuestion;
      const interval = setInterval(() => {
        const elapsed = Date.now() - q.startedAt;
        const leftMs = Math.max(0, q.durationMs - elapsed);
        setRemainingRatio(Math.max(0, Math.min(1, leftMs / q.durationMs)));
        setRemainingSec(Math.ceil(leftMs / 1000));
      }, 80);
      return () => clearInterval(interval);
    }
    if (roomState.status === 'ROUND_REVEAL' && roomState.currentQuestion) {
      const q = roomState.currentQuestion;
      const start = q.revealStartedAt || Date.now();
      const total = q.revealDurationMs || 5800;
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const leftMs = Math.max(0, total - elapsed);
        setRemainingRatio(Math.max(0, Math.min(1, leftMs / total)));
        setRemainingSec(Math.ceil(leftMs / 1000));
      }, 80);
      return () => clearInterval(interval);
    }
  }, [roomState]);

  const handleRandomizeAvatar = () => {
    const availableChars = AVATAR_BASE_CHARACTERS.filter((c) => !usedCharactersOnTv.has(c.id));
    const pool = availableChars.length > 0 ? availableChars : AVATAR_BASE_CHARACTERS;
    const randChar = pool[Math.floor(Math.random() * pool.length)];

    const availableColors = AVATAR_3D_COLORS.filter((c) => !usedColorsOnTv.has(c.hex));
    const colorPool = availableColors.length > 0 ? availableColors : AVATAR_3D_COLORS;
    const randColor = colorPool[Math.floor(Math.random() * colorPool.length)];

    const randAcc =
      AVATAR_ACCESSORIES[Math.floor(Math.random() * AVATAR_ACCESSORIES.length)];
    setBaseCharacter(randChar.id);
    setAvatarColor(randColor.hex);
    setAvatarAccessory(randAcc.id);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();
    const cleanName = playerName.trim() || 'Campeão';
    if (cleanPin.length !== 4) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mathshow_player_name', cleanName);
    }
    const uniqueAvatarId = ensureUniquePlayerAvatar(
      composedAvatarId,
      roomState?.players || [],
      playerId
    );
    onJoinRoom(cleanPin, cleanName, uniqueAvatarId);
  };

  // 1. LOGIN SCREEN WITH INTERACTIVE 3D AVATAR GENERATOR
  if (!isJoined || !roomState || !myPlayer) {
    return (
      <div
        className={`${
          isEmbeddedPiP ? 'h-full' : 'min-h-screen'
        } w-full bg-gradient-to-b from-[#007AFF] via-[#072B59] to-[#0A192F] text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6`}
      >
        <header className="flex items-center justify-center pb-3 border-b border-white/15">
          <span className="title-3d-yellow font-display font-black text-xl tracking-tight whitespace-nowrap shrink-0">
            Jogo de Matemática
          </span>
        </header>

        <form onSubmit={handleJoinSubmit} className="my-auto py-3 max-w-md w-full mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h1 className="title-3d-white font-display text-2xl sm:text-3xl font-black">
              Crie Seu Avatar 3D &amp; Entre!
            </h1>
            <p className="text-xs text-sky-200 font-semibold">
              Personalize seu estudante 3D e digite o código PIN da sua TV.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-600/90 border-2 border-white text-white text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          {/* 3D AVATAR STUDIO GENERATOR CARD */}
          <div className="rounded-3xl bg-[#0F172A]/95 border-2 border-sky-400/50 p-3.5 space-y-3 panel-3d">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  key={composedAvatarId}
                  initial={{ scale: 0.85, rotate: -6 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="p-1.5 rounded-2xl bg-slate-900 border-2 border-[#FFD600] shadow-lg"
                >
                  <AvatarIcon avatarId={composedAvatarId} className="w-16 h-16" />
                </motion.div>
                <div>
                  <div className="text-[11px] font-black uppercase text-[#FFD600]">
                    Identidade Única na TV ·{' '}
                    {AVATAR_BASE_CHARACTERS.find((c) => c.id === baseCharacter)?.categoryLabel}
                  </div>
                  <div className="font-display font-black text-base text-white">
                    {AVATAR_BASE_CHARACTERS.find((c) => c.id === baseCharacter)?.label}
                  </div>
                  <div className="text-xs font-bold text-sky-300">
                    Acessório: {AVATAR_ACCESSORIES.find((a) => a.id === avatarAccessory)?.label}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRandomizeAvatar}
                className="cube-3d min-h-[48px] px-3 py-2 rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] border-2 border-white text-white font-display font-black text-xs flex flex-col items-center justify-center gap-0.5 shrink-0"
              >
                <Dices className="w-5 h-5" />
                <span>Sortear 3D</span>
              </button>
            </div>

            {/* Step 1: 3D Avatar Selector (Blocos Sorridentes 3D, Animais 3D & Estudantes 3D) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-extrabold text-sky-200">
                  1. Escolha seu Avatar 3D exclusivo na TV:
                </div>
                {usedCharactersOnTv.size > 0 && (
                  <span className="text-[10px] font-black text-[#FFD600]">
                    {usedCharactersOnTv.size} em uso na sala
                  </span>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { id: 'DESTAQUES', label: '🎲 Blocos & Animais' },
                    { id: 'BLOCOS', label: '😊 Blocos 3D' },
                    { id: 'ANIMAIS', label: '🐾 Animais 3D' },
                    { id: 'ESTUDANTES', label: '🧒 Estudantes' },
                  ] as { id: 'DESTAQUES' | AvatarCategory; label: string }[]
                ).map((tab) => {
                  const isTabActive = avatarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAvatarTab(tab.id)}
                      className={`px-1.5 py-1.5 rounded-xl text-[10px] font-black border transition-all truncate ${
                        isTabActive
                          ? 'bg-[#FFD600] text-slate-950 border-white shadow'
                          : 'bg-slate-900 text-sky-200 border-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {AVATAR_BASE_CHARACTERS.filter((preset) =>
                  avatarTab === 'DESTAQUES'
                    ? preset.category === 'BLOCOS' || preset.category === 'ANIMAIS'
                    : preset.category === avatarTab
                ).map((preset) => {
                  const active = baseCharacter === preset.id;
                  const isTakenByOther = usedCharactersOnTv.has(preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isTakenByOther}
                      onClick={() => {
                        if (isTakenByOther) return;
                        setBaseCharacter(preset.id);
                        const preferredColor = !usedColorsOnTv.has(preset.defaultColor)
                          ? preset.defaultColor
                          : AVATAR_3D_COLORS.find((c) => !usedColorsOnTv.has(c.hex))?.hex ||
                            preset.defaultColor;
                        setAvatarColor(preferredColor);
                      }}
                      className={`relative p-1.5 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-transform active:scale-95 ${
                        isTakenByOther
                          ? 'bg-slate-950/60 border-rose-500/40 opacity-45 cursor-not-allowed'
                          : active
                          ? 'bg-[#007AFF]/40 border-[#FFD600] scale-105'
                          : 'bg-slate-900/80 border-slate-800 opacity-90'
                      }`}
                    >
                      {isTakenByOther && (
                        <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-rose-600 text-[8px] font-black text-white uppercase z-10">
                          Em uso
                        </span>
                      )}
                      <AvatarIcon
                        avatarId={`${preset.id}|${
                          active ? avatarColor : preset.defaultColor
                        }|${avatarAccessory}`}
                        className="w-11 h-11"
                      />
                      <span className="text-[10px] font-extrabold text-white truncate max-w-full">
                        {preset.label.split(' (')[0]}
                      </span>
                      <span className="text-[9px] font-bold text-sky-300 leading-none truncate max-w-full">
                        {preset.category === 'BLOCOS'
                          ? 'Bloco 3D'
                          : preset.category === 'ANIMAIS'
                          ? 'Animal 3D'
                          : `${preset.ageGroup === 'Infantil' ? 'Infantil' : 'Teen'} · ${
                              preset.gender === 'Masculino' ? 'M' : 'F'
                            }`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: 3D Color Picker */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-extrabold text-sky-200">2. Cor 3D:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_3D_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    aria-label={c.label}
                    onClick={() => {
                      setAvatarColor(c.hex);
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      avatarColor === c.hex
                        ? 'border-white scale-125 ring-2 ring-[#FFD600]'
                        : 'border-white/40 opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 3: 3D Student Accessory Picker */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-extrabold text-sky-200">
                3. Acessório Estudante 3D:
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {AVATAR_ACCESSORIES.map((acc) => {
                  const active = avatarAccessory === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setAvatarAccessory(acc.id);
                      }}
                      className={`min-h-[42px] px-1 py-1 rounded-xl border text-[10px] font-extrabold flex flex-col items-center justify-center ${
                        active
                          ? 'bg-[#FFD600] text-slate-950 border-white font-black'
                          : 'bg-slate-900 text-slate-200 border-slate-700'
                      }`}
                    >
                      <span className="text-sm leading-none">{acc.icon}</span>
                      <span className="truncate max-w-full mt-0.5">{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Room PIN & Player Name */}
          <div className="grid grid-cols-5 gap-2.5">
            <div className="col-span-2 space-y-1">
              <label className="block text-[11px] font-extrabold text-sky-100">
                PIN da TV (4 nºs)
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
                className="w-full h-13 px-2 rounded-2xl bg-[#0F172A] border-2 border-[#FFD600] focus:outline-none font-mono text-2xl font-black tracking-widest text-center text-[#FFD600] tabular-nums"
              />
            </div>

            <div className="col-span-3 space-y-1">
              <label className="block text-[11px] font-extrabold text-sky-100">
                Seu Nome no Jogo
              </label>
              <input
                type="text"
                maxLength={14}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex: Ricardo, Vania..."
                required
                className="w-full h-13 px-3.5 rounded-2xl bg-[#0F172A] border-2 border-sky-400 focus:border-[#FFD600] focus:outline-none text-base font-bold text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pinCode.trim().length !== 4}
            className="cube-3d w-full min-h-[60px] rounded-3xl bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-slate-800 disabled:text-slate-500 border-3 border-white text-white font-display font-black text-xl flex items-center justify-center gap-2.5 transition-transform active:scale-95 whitespace-nowrap"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>ENTRAR NO JOGO!</span>
          </button>
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

  // Format equation for phone header without duplicate `= ?`
  const renderPhoneEquation = () => {
    if (!question) return null;
    if (question.equationFormat === 'MISSING_ADDEND') {
      const shownVal =
        isReveal
          ? question.correctAnswer
          : hasAnswered
          ? question.options[myPlayer.currentAnswer ?? 0]
          : '?';
      return (
        <span>
          {question.terms[0]} +{' '}
          <span className="inline-block px-2.5 py-0.5 rounded-xl bg-[#FFD600] text-slate-950 font-black">
            {shownVal}
          </span>{' '}
          = {question.targetValue}
        </span>
      );
    }
    const shownResult =
      isReveal
        ? question.correctAnswer
        : hasAnswered
        ? question.options[myPlayer.currentAnswer ?? 0]
        : '?';
    return (
      <span>
        {question.expression} ={' '}
        <span className="inline-block px-2.5 py-0.5 rounded-xl bg-[#FFD600] text-slate-950 font-black">
          {shownResult}
        </span>
      </span>
    );
  };

  return (
    <div
      className={`${
        isEmbeddedPiP ? 'h-full' : 'min-h-screen'
      } w-full bg-gradient-to-b from-[#0284C7] via-[#072B59] to-[#0A192F] text-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-5 select-none`}
    >
      {/* Clean, Uncluttered Top Bar on Mobile (Only Avatar/Name/Sala on Left + Points on Right — Fixes Image 2!) */}
      <header className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#0F172A]/95 border-2 border-sky-400/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <AvatarIcon avatarId={myPlayer.avatarId} className="w-11 h-11 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base text-white truncate">
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

        <div className="text-right px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
          <div className="text-[10px] font-bold text-sky-300">PONTOS</div>
          <div className="font-mono font-black text-base text-[#FFD600] tabular-nums">
            {myPlayer.score}
          </div>
        </div>
      </header>

      {/* MAIN CONTROLLER WORKSPACE */}
      <main className="flex-1 flex flex-col justify-between my-3 gap-3 max-w-lg w-full mx-auto">
        {/* STATE A: LOBBY / MODULE SELECTION WITH COMPLETE MODULE DESCRIPTIONS */}
        {(roomState.status === 'LOBBY' || roomState.status === 'TITLE_MENU') && (
          <div className="flex-1 flex flex-col justify-between gap-3 bg-[#0F172A]/95 border-2 border-sky-400/40 rounded-3xl p-4 panel-3d">
            <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-white/15">
              <AvatarIcon avatarId={myPlayer.avatarId} className="w-12 h-12 shrink-0" />
              <div>
                <h2 className="font-display text-lg font-black text-white">
                  Controle #{myPlayer.slotIndex + 1} Pronto!
                </h2>
                <p className="text-xs text-sky-200 font-semibold">
                  {roomState.players.length} de 4 jogadores conectados na Fire TV.
                </p>
              </div>
            </div>

            {myPlayer.isHost ? (
              <div className="space-y-3 pt-1">
                <div className="text-xs font-extrabold text-[#FFD600]">
                  Escolha o Módulo da Trilha Educativa:
                </div>

                {/* 4 Learning Modules Selector with FULL Complete Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LEARNING_MODULES.map((mod) => {
                    const selected = roomState.settings.moduleId === mod.id;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          onConfigureGame({ moduleId: mod.id });
                        }}
                        style={{
                          backgroundColor: selected ? mod.bgColor : '#1E293B',
                        }}
                        className={`cube-3d p-3 rounded-2xl border-2 text-left transition-transform active:scale-95 flex flex-col justify-between gap-1 ${
                          selected ? 'border-white shadow-lg' : 'border-slate-700 opacity-90'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-black uppercase text-[#FFD600]">
                            {mod.numberLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-black/30 font-display font-black text-xs text-white">
                            {mod.symbol}
                          </span>
                        </div>
                        <div className="font-display font-black text-sm text-white leading-snug">
                          {mod.title}
                        </div>
                        <div className="text-[11px] font-semibold text-white/90 leading-snug">
                          {mod.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Difficulty Selector */}
                {/* Difficulty Selector */}
                <div className="grid grid-cols-3 gap-2">
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

                {/* 1-PLAYER ONLY: OPTION TO COMPETE AGAINST THE MACHINE (TARGET ACCURACY RANDOMLY SELECTED BY SYSTEM) */}
                {roomState.players.filter((p) => !p.isBot).length <= 1 && (
                  <div className="rounded-2xl bg-slate-900/95 border-2 border-purple-400/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-[#A855F7]" />
                        <div>
                          <div className="text-xs font-black text-white">
                            Disputar contra a Máquina (Robô)
                          </div>
                          <div className="text-[10px] font-bold text-sky-300">
                            Exclusivo quando há apenas 1 jogador na sala
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onConfigureGame({
                            vsMachine: !roomState.settings.vsMachine,
                            botAccuracyMode: 'RANDOM',
                          });
                        }}
                        className={`cube-3d px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all whitespace-nowrap ${
                          roomState.settings.vsMachine
                            ? 'bg-[#A855F7] text-white border-white'
                            : 'bg-slate-800 text-slate-300 border-slate-600'
                        }`}
                      >
                        {roomState.settings.vsMachine ? '✓ Ativado' : 'Ativar Máquina'}
                      </button>
                    </div>
                  </div>
                )}

                {/* MODO PROFESSOR NO CELULAR DO HOST (JOGADOR 1) */}
                {onSetCustomQuestions && (
                  <div className="rounded-2xl bg-slate-900/95 border-2 border-sky-400/50 p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-5 h-5 text-[#FFD600] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate">
                            Modo Professor no Celular ({roomState.settings.customQuestions?.length || 0} contas)
                          </div>
                          <div className="text-[10px] font-bold text-sky-300">
                            {roomState.settings.useCustomQuestions &&
                            (roomState.settings.customQuestions?.length || 0) > 0
                              ? '✓ Partida personalizada ativa na TV'
                              : 'Crie contas ou escolha uma tabuada de 1 a 10'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMobileTeacherMode((v) => !v)}
                        className="cube-3d px-3 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#0284C7] text-white text-xs font-black border-2 border-white whitespace-nowrap shrink-0"
                      >
                        {showMobileTeacherMode ? 'Fechar' : 'Modo Professor'}
                      </button>
                    </div>

                    {showMobileTeacherMode && (
                      <div className="pt-2 border-t border-white/15 space-y-2.5">
                        {/* Gerador Rápido de Tabuada Específica (1 a 10) */}
                        <div>
                          <div className="text-[11px] font-black text-[#FFD600] mb-1.5">
                            ⚡ Gerar Tabuada Completa (1 Clique):
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => {
                                  const pack = buildMultiplicationTablePack(num);
                                  onSetCustomQuestions(pack, true);
                                  setMobileTeacherError(null);
                                }}
                                className="min-h-[36px] rounded-xl bg-[#071936] hover:bg-[#007AFF] border border-sky-400/50 text-xs font-display font-black text-white active:scale-95 transition-transform"
                              >
                                ×{num}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cadastro Manual Rápido no Celular */}
                        <div className="rounded-xl bg-[#071936] border border-white/15 p-2.5 space-y-2">
                          <div className="text-[11px] font-black text-sky-200">
                            ➕ Cadastrar Conta Específica:
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 items-center">
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={mobileTermA}
                              onChange={(e) => setMobileTermA(e.target.value)}
                              className="h-10 rounded-xl bg-slate-900 border border-sky-400 text-center font-mono font-black text-sm text-white"
                              aria-label="Primeiro número"
                            />
                            <div className="grid grid-cols-4 gap-1">
                              {(['+', '-', '×', '÷'] as MathOperator[]).map((op) => (
                                <button
                                  key={op}
                                  type="button"
                                  onClick={() => setMobileOperator(op)}
                                  className={`h-10 rounded-lg font-display font-black text-sm border ${
                                    mobileOperator === op
                                      ? 'bg-[#FFD600] text-slate-950 border-white'
                                      : 'bg-slate-900 text-white border-slate-700'
                                  }`}
                                >
                                  {op}
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={mobileTermB}
                              onChange={(e) => setMobileTermB(e.target.value)}
                              className="h-10 rounded-xl bg-slate-900 border border-sky-400 text-center font-mono font-black text-sm text-white"
                              aria-label="Segundo número"
                            />
                          </div>

                          {mobileTeacherError && (
                            <div className="text-[11px] font-bold text-rose-300">
                              {mobileTeacherError}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const a = parseInt(mobileTermA, 10);
                              const b = parseInt(mobileTermB, 10);
                              if (isNaN(a) || isNaN(b) || a < 1 || b < 1) {
                                setMobileTeacherError('Digite números maiores que zero.');
                                return;
                              }
                              if (mobileOperator === '-' && a <= b) {
                                setMobileTeacherError('Na subtração, o 1º número deve ser maior.');
                                return;
                              }
                              if (mobileOperator === '÷' && a % b !== 0) {
                                setMobileTeacherError('Escolha números com divisão exata.');
                                return;
                              }
                              const ans =
                                mobileOperator === '+'
                                  ? a + b
                                  : mobileOperator === '-'
                                  ? a - b
                                  : mobileOperator === '×'
                                  ? a * b
                                  : Math.round(a / b);

                              const newItem: CustomEquationItem = {
                                id: `mob_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                                termA: a,
                                operator: mobileOperator,
                                termB: b,
                                correctAnswer: ans,
                              };
                              const nextList = [
                                ...(roomState.settings.customQuestions || []),
                                newItem,
                              ];
                              onSetCustomQuestions(nextList, true);
                              setMobileTeacherError(null);
                            }}
                            className="w-full min-h-[38px] rounded-xl bg-[#007AFF] hover:bg-[#0284C7] border border-white text-white font-display font-black text-xs flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Conta na Lista</span>
                          </button>
                        </div>

                        {/* Lista Compacta e Botões Embaralhar / Limpar */}
                        {(roomState.settings.customQuestions?.length || 0) > 0 && (
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const shuffled = shuffleCustomEquations(
                                    roomState.settings.customQuestions || []
                                  );
                                  onSetCustomQuestions(
                                    shuffled,
                                    roomState.settings.useCustomQuestions ?? true
                                  );
                                }}
                                className="cube-3d px-3 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-black border border-white flex items-center gap-1"
                              >
                                <Shuffle className="w-3.5 h-3.5" />
                                <span>Embaralhar as contas</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onSetCustomQuestions([], false)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Limpar</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                              {(roomState.settings.customQuestions || []).map((qItem, idx) => (
                                <div
                                  key={qItem.id}
                                  className="rounded-lg bg-[#071936] border border-sky-400/30 px-2.5 py-1.5 flex items-center justify-between text-xs font-mono font-bold text-white tabular-nums"
                                >
                                  <span>
                                    #{idx + 1}: {qItem.termA}
                                    {qItem.operator}
                                    {qItem.termB}={qItem.correctAnswer}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = (
                                        roomState.settings.customQuestions || []
                                      ).filter((item) => item.id !== qItem.id);
                                      onSetCustomQuestions(filtered, filtered.length > 0);
                                    }}
                                    className="text-rose-400 hover:text-rose-200 ml-1"
                                    aria-label="Remover conta"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onStartGame();
                  }}
                  className="cube-3d w-full min-h-[60px] rounded-3xl bg-[#22C55E] hover:bg-[#16A34A] border-3 border-white text-white font-display font-black text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>COMEÇAR JOGO NA TV!</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-400/30 text-center space-y-2">
                <Module3DIllustration moduleId={roomState.settings.moduleId} />
                <div className="text-xs font-bold text-sky-200">
                  Olhe para a TV! O Jogador 1 está escolhendo o módulo...
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATE B: ACTIVE QUESTION (With Animated Time Passage Bar + 4 3D Cubes + 3 Power-Ups) */}
        {isQuestionActive && question && (
          <>
            {/* Question Visual Header + Animated Time Passage Bar */}
            <div className="p-3.5 rounded-2xl bg-[#0F172A]/95 border-2 border-sky-400/50 text-center space-y-2 panel-3d">
              <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                <span>
                  Atividade {question.roundNumber}/{question.totalRounds}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      soundEngine.speakQuestion(
                        formatQuestionSpeechFormula(question),
                        true
                      )
                    }
                    className="px-2 py-0.5 rounded-lg bg-[#007AFF] text-white text-[11px] font-black flex items-center gap-1 border border-white/40"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ouvir</span>
                  </button>
                  <span className="flex items-center gap-1 font-mono font-black text-sm text-[#FFD600] tabular-nums">
                    <Clock className="w-4 h-4" />
                    {remainingSec}s
                  </span>
                </div>
              </div>

              {/* Animated Time Passage Bar */}
              <div className="w-full h-3.5 rounded-full bg-slate-900 border border-white/20 overflow-hidden p-0.5">
                <div
                  style={{
                    width: `${Math.max(4, remainingRatio * 100)}%`,
                    backgroundColor:
                      remainingRatio > 0.5
                        ? '#22C55E'
                        : remainingRatio > 0.25
                        ? '#FFD600'
                        : '#EF4444',
                  }}
                  className="h-full rounded-full time-bar-stripes transition-all duration-100"
                />
              </div>

              <div className="text-xs font-extrabold text-[#FFD600]">{question.promptText}</div>
              <div className="font-display font-black text-3xl text-white tracking-tight tabular-nums">
                {renderPhoneEquation()}
              </div>

              {/* 1st Wrong Attempt Notice */}
              {(myPlayer.wrongAttemptsOnCurrent || 0) === 1 && !myPlayer.visualHintActive && (
                <div className="mt-1 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-[#FFD600] text-xs font-extrabold text-[#FFD600]">
                  ⚠️ Ops, quase lá! Tente outro bloco (se errar mais 1 vez, a Dica Visual 3D será ativada!).
                </div>
              )}

              {/* Button to Activate Visual Hint 3D if unlocked */}
              {myPlayer.visualHintUnlocked && !myPlayer.visualHintActive && (
                <button
                  type="button"
                  onClick={() => onActivateVisualHint?.()}
                  className="cube-3d w-full mt-1 py-2 px-3 rounded-xl bg-[#FFD600] text-slate-950 font-display font-black text-xs flex items-center justify-center gap-1.5 border-2 border-white animate-pulse"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>💡 Ativar Dica Visual 3D (Contar Blocos)</span>
                </button>
              )}
            </div>

            {/* 3D VISUAL HINT ANIMATION (Automatically shown after 2 wrong attempts on the same question) */}
            {myPlayer.visualHintActive && (
              <VisualHint3DAnimator question={question} compact />
            )}

            {/* 4 Big 3D Cube Answer Buttons (64px+ minimum touch target) */}
            {!hasAnswered ? (
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-[210px]">
                {ANSWER_OPTIONS_META.map((meta) => {
                  const value = question.options[meta.index];
                  const isEliminated = myPlayer.eliminatedOptions?.includes(meta.index);
                  const isFailedAttempt = myPlayer.failedOptionsOnCurrent?.includes(meta.index);

                  if (isEliminated) {
                    return (
                      <div
                        key={meta.letter}
                        className="rounded-3xl bg-slate-900/50 border-2 border-dashed border-slate-700 p-4 flex flex-col items-center justify-center text-slate-500 min-h-[104px]"
                      >
                        <span className="text-xs font-bold line-through">
                          Bloco {meta.letter} Removido (50/50)
                        </span>
                      </div>
                    );
                  }

                  if (isFailedAttempt) {
                    return (
                      <div
                        key={meta.letter}
                        className="rounded-3xl bg-rose-950/60 border-2 border-dashed border-rose-500/60 p-3 flex flex-col items-center justify-center text-rose-300 min-h-[104px] text-center"
                      >
                        <span className="font-display font-black text-2xl line-through opacity-70">
                          {value}
                        </span>
                        <span className="text-[11px] font-extrabold mt-1">
                          ✗ Bloco {meta.letter} já tentado
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
                        onSelectAnswer(meta.index);
                      }}
                      style={{ backgroundColor: meta.hexColor }}
                      className="cube-3d border-3 border-white rounded-3xl p-4 flex flex-col items-center justify-between text-white min-h-[108px]"
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
                className="flex-1 rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-5 flex flex-col items-center justify-center text-center space-y-2.5 panel-3d"
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
                  Aguarde a revelação na TV!
                </p>
              </motion.div>
            )}

            {/* 3 TACTICAL SINGLE-USE POWER-UP BUTTONS (Shown only while choosing an answer) */}
            {!hasAnswered && (
              <div className="pt-1">
                <div className="text-[11px] font-extrabold text-sky-200 mb-1.5 text-center">
                  Ajudas Especiais (1 uso por partida):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={myPlayer.powerUpsUsed?.FIFTY_FIFTY}
                    onClick={() => {
                      onUsePowerUp('FIFTY_FIFTY');
                    }}
                    className={`min-h-[60px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
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

                  <button
                    type="button"
                    disabled={myPlayer.powerUpsUsed?.FREEZE_TIME}
                    onClick={() => {
                      onUsePowerUp('FREEZE_TIME');
                    }}
                    className={`min-h-[60px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
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

                  <button
                    type="button"
                    disabled={myPlayer.powerUpsUsed?.DOUBLE_STARS}
                    onClick={() => {
                      onUsePowerUp('DOUBLE_STARS');
                    }}
                    className={`min-h-[60px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
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
            )}
          </>
        )}

        {/* STATE C: ROUND REVEAL (With Animated Time Passage Bar to Next Question) */}
        {isReveal && question && (
          <div
            className={`flex-1 rounded-3xl p-5 border-3 flex flex-col justify-between text-center panel-3d ${
              isMyAnswerCorrect
                ? 'bg-[#16A34A]/90 border-white'
                : 'bg-[#0F172A]/95 border-[#FFD600]'
            }`}
          >
            {/* Next Activity Time Passage Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-white/90">
                <span>Próxima atividade em instantes...</span>
                <span className="font-mono tabular-nums">{remainingSec}s</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/35 overflow-hidden">
                <div
                  style={{ width: `${Math.max(4, remainingRatio * 100)}%` }}
                  className="h-full bg-[#FFD600] time-bar-stripes transition-all duration-100"
                />
              </div>
            </div>

            <div className="my-auto space-y-3 py-2">
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

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300">Resposta da Atividade</span>
                  <button
                    type="button"
                    onClick={() =>
                      soundEngine.speakQuestion(
                        `${formatQuestionSpeechFormula(question)} ${formatAnswerRevealSpeech(question.correctAnswer)}`,
                        true
                      )
                    }
                    className="px-2 py-0.5 rounded-lg bg-[#007AFF] text-white text-[11px] font-black flex items-center gap-1 border border-white/40"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ouvir</span>
                  </button>
                </div>
                <div className="font-display text-2xl font-black text-[#FFD600] tabular-nums">
                  {renderPhoneEquation()}
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
                <span>Próximo Desafio Agora</span>
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

        {/* STATE E: GAME OVER — PROMPT IF PLAYER WANTS TO CONTINUE OR LEAVE & ROTATE QR PIN */}
        {roomState.status === 'GAME_OVER' && (
          <div className="flex-1 rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-5 flex flex-col justify-between text-center space-y-4 panel-3d">
            <div className="space-y-2">
              <div className="flex justify-center">
                <AvatarIcon avatarId={myPlayer.avatarId} className="w-16 h-16" />
              </div>
              <div className="text-xs font-black text-[#FFD600] uppercase">Fim da Partida!</div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
                {myRank}º Lugar · ⭐ {myPlayer.stars} Estrelas
              </h2>
              <div className="font-mono text-2xl font-black text-[#22C55E] tabular-nums">
                {myPlayer.score} pontos
              </div>
              <div className="text-xs font-bold text-sky-200 tabular-nums">
                Acertos: {myPlayer.correctCount} de {roomState.settings.totalRounds} atividades
              </div>

              {/* Player's Earned 3D Animated Medals */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-center gap-1 text-xs font-black text-[#FFD600] uppercase">
                  <Award className="w-4 h-4" />
                  <span>Suas Medalhas 3D Conquistadas:</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(myPlayer.medals && myPlayer.medals.length > 0
                    ? myPlayer.medals
                    : evaluatePlayerMedals(myPlayer, roomState.settings.totalRounds)
                  ).map((mId, idx) => (
                    <Medal3DBadge
                      key={mId}
                      medalId={mId}
                      size="md"
                      delay={idx * 0.15}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Prompt: "Deseja continuar no jogo ou sair?" */}
            <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-sky-400/40 space-y-3">
              <h3 className="font-display font-black text-base text-white">
                Você quer continuar jogando na próxima partida?
              </h3>

              {myPlayer.continueChoice === 'YES' ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-xs font-black text-emerald-300">
                    ✓ Presença Confirmada! Você continua conectado na sala.
                  </div>
                  <button
                    type="button"
                    onClick={onRestartGame}
                    className="cube-3d w-full min-h-[54px] rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white font-display font-black text-base flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Iniciar Nova Jogada Agora</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onContinueDecision(true);
                    }}
                    className="cube-3d min-h-[56px] px-4 py-3 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white font-display font-black text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Sim, Continuar!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onContinueDecision(false);
                    }}
                    className="cube-3d min-h-[56px] px-4 py-3 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] border-2 border-white text-white font-display font-black text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Não, Sair e Liberar Vaga</span>
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                Ao escolher &ldquo;Não&rdquo;, seu login na TV é liberado e um novo código QR é gerado.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
