import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import {
  ANSWER_OPTIONS_META,
  createEmptyOperationStats,
  CustomEquationItem,
  DifficultyLevel,
  evaluatePlayerMedals,
  GameMode,
  LEARNING_MODULES,
  LearningModuleId,
  MathOperator,
  PLAYER_AVATARS,
  PowerUpType,
  RoomState,
} from '../types/game.ts';
import { StudioStageCanvas } from './StudioStageCanvas.tsx';
import {
  AvatarIcon,
  KidsMathSplashHero,
  Medal3DBadge,
  MgnetSoftwareBadge,
  Module3DIllustration,
  NumberCube3D,
  VisualHint3DAnimator,
} from './AvatarIcon.tsx';
import { MobileControllerView } from './MobileControllerView.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { soundEngine } from '../utils/sound.ts';
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Crown,
  Home,
  Lock,
  LogOut,
  Pause,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Settings,
  Smartphone,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface FireTvStageViewProps {
  roomState: RoomState;
  burstTrigger: number;
  shakeTrigger: number;
  onSetStatus: (status: 'TITLE_MENU' | 'LOBBY') => void;
  onConfigureGame: (config: {
    mode?: GameMode;
    difficulty?: DifficultyLevel;
    moduleId?: LearningModuleId;
    totalRounds?: number;
  }) => void;
  onStartGame: () => void;
  onTogglePause: () => void;
  onRestartGame: () => void;
  onNextRound: () => void;
  onLocalTvAnswer: (optionIndex: number) => void;
  onActivateVisualHint?: () => void;
  onSwitchToFullMobile: () => void;
  onAdminKickPlayer: (playerId: string) => void;
  onAdminRotatePin: () => void;
  onAdminSetCustomQuestions: (
    customQuestions: CustomEquationItem[],
    useCustomQuestions: boolean
  ) => void;
  // Built-in PiP Virtual Phone Simulator props
  simPlayerId: string;
  simError: string | null;
  onSimJoin: (code: string, name: string, avatarId: string) => void;
  onSimAnswer: (optionIndex: number) => void;
  onSimUsePowerUp: (powerUp: PowerUpType) => void;
  onSimActivateVisualHint?: () => void;
  onSimContinueDecision: (continueGame: boolean) => void;
  onCelebrateMedals?: () => void;
}

/**
 * Spatial 2D D-Pad Navigation Helper for Amazon Fire TV Remote
 */
function navigateSpatialDpad(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): boolean {
  const focusables = Array.from(
    document.querySelectorAll<HTMLElement>('[data-tv-focusable="true"]:not([disabled])')
  ).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  if (focusables.length === 0) return false;

  const current = document.activeElement as HTMLElement | null;
  if (!current || !focusables.includes(current)) {
    focusables[0].focus();
    return true;
  }

  const curRect = current.getBoundingClientRect();
  const curCx = curRect.left + curRect.width / 2;
  const curCy = curRect.top + curRect.height / 2;

  let bestCandidate: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const candidate of focusables) {
    if (candidate === current) continue;
    const rect = candidate.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = cx - curCx;
    const dy = cy - curCy;

    let isValidDirection = false;
    let primaryDist = 0;
    let secondaryDist = 0;

    if (direction === 'RIGHT' && dx > 12) {
      isValidDirection = true;
      primaryDist = dx;
      secondaryDist = Math.abs(dy);
    } else if (direction === 'LEFT' && dx < -12) {
      isValidDirection = true;
      primaryDist = -dx;
      secondaryDist = Math.abs(dy);
    } else if (direction === 'DOWN' && dy > 12) {
      isValidDirection = true;
      primaryDist = dy;
      secondaryDist = Math.abs(dx);
    } else if (direction === 'UP' && dy < -12) {
      isValidDirection = true;
      primaryDist = -dy;
      secondaryDist = Math.abs(dx);
    }

    if (isValidDirection) {
      const score = primaryDist + secondaryDist * 2.4;
      if (score < bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }
  }

  if (bestCandidate) {
    bestCandidate.focus();
    return true;
  }
  return false;
}

export const FireTvStageView: React.FC<FireTvStageViewProps> = ({
  roomState,
  burstTrigger,
  shakeTrigger,
  onSetStatus,
  onConfigureGame,
  onStartGame,
  onTogglePause,
  onRestartGame,
  onNextRound,
  onLocalTvAnswer,
  onActivateVisualHint,
  onSwitchToFullMobile,
  onAdminKickPlayer,
  onAdminRotatePin,
  onAdminSetCustomQuestions,
  simPlayerId,
  simError,
  onSimJoin,
  onSimAnswer,
  onSimUsePowerUp,
  onSimActivateVisualHint,
  onSimContinueDecision,
  onCelebrateMedals,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(soundEngine.isMuted());
  const [remainingSec, setRemainingSec] = useState<number>(18);
  const [remainingRatio, setRemainingRatio] = useState<number>(1);
  const [gameOverLeftSec, setGameOverLeftSec] = useState<number>(25);
  const [gameOverRatio, setGameOverRatio] = useState<number>(1);
  const [showVirtualPhone, setShowVirtualPhone] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'PLAYERS' | 'TEACHER_CREATOR' | 'PEDAGOGICAL_REPORT'>(
    'PLAYERS'
  );

  // Modo Professor (Criador de Partidas Personalizadas) Form State
  const [termAInput, setTermAInput] = useState<string>('7');
  const [operatorInput, setOperatorInput] = useState<MathOperator>('×');
  const [termBInput, setTermBInput] = useState<string>('8');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Parental Gate Modal State
  const [showParentalGate, setShowParentalGate] = useState<boolean>(false);
  const [parentalAnswer, setParentalAnswer] = useState<string>('');
  const [parentalUnlocked, setParentalUnlocked] = useState<boolean>(false);

  const mobileJoinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomState.code}&role=controller`
      : '';

  // Generate QR Code data URL whenever roomState.code changes (including when rotated!)
  useEffect(() => {
    if (!roomState.code || !mobileJoinUrl) return;
    QRCode.toDataURL(mobileJoinUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#071936',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [roomState.code, mobileJoinUrl]);

  // Auto-focus primary CTA on screen status change for Fire TV D-Pad
  useEffect(() => {
    const timer = setTimeout(() => {
      const primary = document.querySelector<HTMLElement>('[data-tv-primary="true"]');
      if (primary) {
        primary.focus();
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [roomState.status]);

  // Animated Time Passage Clock during QUESTION_ACTIVE and ROUND_REVEAL
  useEffect(() => {
    if (roomState.status === 'QUESTION_ACTIVE' && roomState.currentQuestion) {
      const q = roomState.currentQuestion;
      let lastBeepSecond = -1;

      const interval = setInterval(() => {
        const elapsed = Date.now() - q.startedAt;
        const leftMs = Math.max(0, q.durationMs - elapsed);
        const sec = Math.ceil(leftMs / 1000);
        setRemainingSec(sec);
        setRemainingRatio(Math.max(0, Math.min(1, leftMs / q.durationMs)));

        if (sec <= 5 && sec > 0 && sec !== lastBeepSecond) {
          lastBeepSecond = sec;
          soundEngine.playTick(true);
        }
      }, 60);

      return () => clearInterval(interval);
    }

    if (roomState.status === 'ROUND_REVEAL' && roomState.currentQuestion) {
      const q = roomState.currentQuestion;
      const start = q.revealStartedAt || Date.now();
      const total = q.revealDurationMs || 5800;

      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const leftMs = Math.max(0, total - elapsed);
        setRemainingSec(Math.ceil(leftMs / 1000));
        setRemainingRatio(Math.max(0, Math.min(1, leftMs / total)));
      }, 60);

      return () => clearInterval(interval);
    }
  }, [roomState.status, roomState.currentQuestion]);

  // Countdown Clock during GAME_OVER to automatically return to TITLE_MENU (fixes Image 2!)
  useEffect(() => {
    if (roomState.status !== 'GAME_OVER') return;
    const startedAt = roomState.gameOverStartedAt || Date.now();
    const durationMs = roomState.gameOverDurationMs || 25000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const leftMs = Math.max(0, durationMs - elapsed);
      const sec = Math.ceil(leftMs / 1000);
      setGameOverLeftSec(sec);
      setGameOverRatio(Math.max(0, Math.min(1, leftMs / durationMs)));

      if (leftMs <= 0) {
        clearInterval(interval);
        onSetStatus('TITLE_MENU');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [roomState.status, roomState.gameOverStartedAt, roomState.gameOverDurationMs, onSetStatus]);

  // Full Spatial D-Pad & Keyboard Navigation for Amazon Fire TV Remote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        soundEngine.playTick(false);
        navigateSpatialDpad('RIGHT');
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        soundEngine.playTick(false);
        navigateSpatialDpad('LEFT');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        soundEngine.playTick(false);
        navigateSpatialDpad('DOWN');
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        soundEngine.playTick(false);
        navigateSpatialDpad('UP');
        return;
      }

      if (roomState.status === 'QUESTION_ACTIVE') {
        if (e.key === '1' || e.key.toLowerCase() === 'a') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(0);
        } else if (e.key === '2' || e.key.toLowerCase() === 'b') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(1);
        } else if (e.key === '3' || e.key.toLowerCase() === 'c') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(2);
        } else if (e.key === '4' || e.key.toLowerCase() === 'd') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(3);
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          onTogglePause();
        }
      } else if (roomState.status === 'PAUSED') {
        if (e.key === 'Escape') {
          e.preventDefault();
          onTogglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roomState.status, onLocalTvAnswer, onTogglePause]);

  const handleToggleMute = () => {
    setMuted(soundEngine.toggleMute());
  };

  const question = roomState.currentQuestion;

  // Render the 3D Equation on the TV — NEVER show the player's selected phone answer during QUESTION_ACTIVE!
  // Only reveal the answer on the TV when status === 'ROUND_REVEAL'.
  const renderTvEquation = () => {
    if (!question) return null;
    const isReveal = roomState.status === 'ROUND_REVEAL';

    if (question.equationFormat === 'MISSING_ADDEND') {
      const slotDisplay = isReveal ? question.correctAnswer : '?';
      const slotColor = isReveal ? '#22C55E' : '#FFD600';

      return (
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white tabular-nums">
          <span>{question.terms[0]}</span>
          <span className="text-[#22C55E]">+</span>
          <motion.span
            key={String(slotDisplay)}
            initial={{ scale: 0.8, y: -6 }}
            animate={{ scale: 1, y: 0 }}
            style={{ backgroundColor: slotColor }}
            className={`cube-3d inline-flex items-center justify-center min-w-[68px] sm:min-w-[82px] px-4 py-1.5 rounded-2xl border-3 border-white ${
              slotColor === '#FFD600' ? 'text-slate-950' : 'text-white'
            }`}
          >
            {slotDisplay}
          </motion.span>
          <span>=</span>
          <span className="text-[#FFD600]">{question.targetValue}</span>
        </div>
      );
    }

    // Standard Result format (Modules 2, 3, 4): e.g. `4 + 3 = [ ? ]`
    const resultDisplay = isReveal ? question.correctAnswer : '?';
    const resultColor = isReveal ? '#22C55E' : '#FFD600';

    return (
      <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white tabular-nums">
        <span>{question.expression}</span>
        <span>=</span>
        <motion.span
          key={String(resultDisplay)}
          initial={{ scale: 0.8, y: -6 }}
          animate={{ scale: 1, y: 0 }}
          style={{ backgroundColor: resultColor }}
          className={`cube-3d inline-flex items-center justify-center min-w-[68px] sm:min-w-[82px] px-4 py-1.5 rounded-2xl border-3 border-white ${
            resultColor === '#FFD600' ? 'text-slate-950' : 'text-white'
          }`}
        >
          {resultDisplay}
        </motion.span>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#071936] text-[#F8FAFC] select-none flex flex-col justify-between">
      {/* 60fps Classroom & Floating 3D Math Symbols Canvas */}
      <StudioStageCanvas
        status={roomState.status}
        burstTrigger={burstTrigger}
        shakeTrigger={shakeTrigger}
        isLightningRound={Boolean(question?.isLightningRound)}
      />

      {/* TOP BAR HUD + ALWAYS-VISIBLE RECONNECTION QR CODE WIDGET */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 lg:px-8 py-2.5 border-b-2 border-white/15 bg-[#0A192F]/95">
        {/* Left Zone: Prominent Brand Name (Removed "Módulo 1: Conhecendo os Números" per user request!) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            data-tv-focusable="true"
            onClick={() => onSetStatus('TITLE_MENU')}
            className="tv-focusable flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#007AFF] border-2 border-white shadow-md shrink-0"
          >
            <span className="w-6 h-6 rounded-lg bg-[#FFD600] text-slate-950 font-display font-black text-xs flex items-center justify-center">
              +
            </span>
            <span className="font-display font-black text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
              Jogo de <span className="text-[#FFD600]">Matemática</span>
            </span>
          </button>
        </div>

        {/* Center Zone: ALWAYS-VISIBLE RECONNECTION QR CODE & PIN PILL (Click opens Admin Panel) */}
        <button
          type="button"
          data-tv-focusable="true"
          onClick={() => setShowAdminPanel(true)}
          title="Abrir Tela Administrativa dos 4 Jogadores"
          className="tv-focusable flex items-center gap-3 px-3.5 py-1 rounded-2xl bg-[#0F172A] hover:bg-slate-900 border-2 border-[#FFD600] shadow-md text-left transition-transform active:scale-95"
        >
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={`QR Code Sala ${roomState.code}`}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg bg-white p-0.5 shrink-0"
            />
          )}
          <div className="leading-tight">
            <div className="text-[10px] font-bold text-sky-300 uppercase">
              Conectar Celular (QR ou PIN)
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg text-[#FFD600] tracking-wider tabular-nums">
                {roomState.code}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-bold text-emerald-400 tabular-nums">
                {roomState.players.length}/4 Controles
              </span>
            </div>
          </div>
        </button>

        {/* Right Zone: Admin Panel & Audio Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {roomState.settings.useCustomQuestions &&
            (roomState.settings.customQuestions?.length ?? 0) > 0 && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-[#FFD600] text-[11px] font-black text-[#FFD600]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Modo Professor Ativo ({roomState.settings.customQuestions?.length})</span>
              </span>
            )}

          <button
            type="button"
            data-tv-focusable="true"
            onClick={() => setShowAdminPanel((v) => !v)}
            className={`tv-focusable min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              showAdminPanel
                ? 'bg-[#FFD600] text-slate-950 border-2 border-white'
                : 'bg-[#A855F7] hover:bg-[#9333EA] text-white border border-white/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Painel Admin</span>
          </button>

          {(roomState.status === 'QUESTION_ACTIVE' || roomState.status === 'PAUSED') && (
            <button
              type="button"
              data-tv-focusable="true"
              onClick={onTogglePause}
              aria-label="Pausar jogo"
              className="tv-focusable min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white"
            >
              {roomState.status === 'PAUSED' ? (
                <Play className="w-4 h-4 text-[#FFD600]" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            data-tv-focusable="true"
            onClick={handleToggleMute}
            aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="tv-focusable min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN STAGE BODY */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-6 lg:px-10 py-2.5 overflow-y-auto">
        {/* TELA 1: SPLASH / MENU PRINCIPAL */}
        {roomState.status === 'TITLE_MENU' && (
          <div className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center text-center space-y-4">
            <KidsMathSplashHero />

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <button
                type="button"
                data-tv-focusable="true"
                data-tv-primary="true"
                onClick={() => {
                  soundEngine.playPlayerJoin();
                  onSetStatus('LOBBY');
                }}
                className="tv-focusable cube-3d min-h-[64px] px-12 py-3.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] border-4 border-white text-white font-display font-black text-2xl tracking-wide flex items-center gap-3 shadow-2xl transition-transform active:scale-95 whitespace-nowrap"
              >
                <Play className="w-7 h-7 fill-current" />
                <span>JOGAR</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-1.5 pt-1">
              <MgnetSoftwareBadge onOpenParentalGate={() => setShowParentalGate(true)} />
              <div className="text-[11px] text-sky-200 font-bold tracking-wide">
                Setas do Controle Fire TV Navegam · Enter Seleciona · Celular Pareamento via QR Code
              </div>
            </div>
          </div>
        )}

        {/* TELA 2: SELEÇÃO DE MÓDULOS COM DESCRIÇÃO COMPLETA E ILUSTRAÇÕES 3D */}
        {roomState.status === 'LOBBY' && (
          <div className="my-auto max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Card: Big QR Code & 4-Digit PIN */}
            <div className="lg:col-span-4 rounded-3xl bg-[#0F172A]/95 border-3 border-white/25 p-5 flex flex-col justify-between panel-3d">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#FFD600] text-xs font-black uppercase">
                  <QrCode className="w-4 h-4" />
                  <span>Controle no Celular (1 a 4 Jogadores)</span>
                </div>
                <h2 className="font-display text-xl font-black text-white">
                  Aponte a câmera do celular para criar seu Avatar 3D!
                </h2>
              </div>

              <div className="my-3 flex flex-col items-center gap-2.5 bg-[#071936] p-4 rounded-2xl border-2 border-sky-400/40 text-center">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Sala ${roomState.code}`}
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 rounded-2xl bg-white p-2"
                  />
                )}
                <div>
                  <div className="text-xs font-bold text-sky-200">Código PIN da Sala:</div>
                  <div className="font-mono font-black text-4xl text-[#FFD600] tracking-widest tabular-nums">
                    {roomState.code}
                  </div>
                </div>
              </div>

              <button
                type="button"
                data-tv-focusable="true"
                onClick={onSwitchToFullMobile}
                className="tv-focusable cube-3d w-full min-h-[46px] rounded-2xl bg-[#007AFF] hover:bg-[#0284C7] border-2 border-white text-xs font-black text-white"
              >
                Abrir Login do Celular Nesta Tela
              </button>
            </div>

            {/* Right Card: 4 Educational Modules Trail WITH COMPLETE UNTRUNCATED DESCRIPTIONS + 3D ILLUSTRATIONS */}
            <div className="lg:col-span-8 rounded-3xl bg-[#0F172A]/95 border-3 border-white/25 p-5 flex flex-col justify-between space-y-4 panel-3d">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-[#22C55E] uppercase">
                    TRILHA EDUCATIVA 3D · ESCOLHA COM O CONTROLE DA TV OU CELULAR
                  </div>
                  <h2 className="font-display text-2xl font-black text-white">
                    Selecione o Módulo de Matemática
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'EASY', label: 'Fácil' },
                      { id: 'MEDIUM', label: 'Médio' },
                      { id: 'HARD', label: 'Mestre' },
                    ] as { id: DifficultyLevel; label: string }[]
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      data-tv-focusable="true"
                      onClick={() => onConfigureGame({ difficulty: lvl.id })}
                      className={`tv-focusable min-h-[40px] px-3.5 py-1.5 rounded-xl font-display font-black text-xs border-2 transition-colors ${
                        roomState.settings.difficulty === lvl.id
                          ? 'bg-[#FFD600] text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Educational Modules Grid — Complete descriptions without truncation! */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {LEARNING_MODULES.map((mod) => {
                  const isSelected = roomState.settings.moduleId === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      data-tv-focusable="true"
                      onClick={() => {
                        soundEngine.playTick();
                        onConfigureGame({ moduleId: mod.id });
                      }}
                      style={{
                        backgroundColor: isSelected ? mod.bgColor : '#1E293B',
                      }}
                      className={`tv-focusable cube-3d p-4 rounded-3xl border-3 text-left flex flex-col justify-between gap-2.5 transition-all ${
                        isSelected
                          ? 'border-white scale-[1.01]'
                          : 'border-slate-700 hover:border-slate-500 opacity-95'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="px-2.5 py-0.5 rounded-lg bg-black/30 text-xs font-black uppercase text-[#FFD600]">
                          {mod.numberLabel}
                        </span>
                        <Module3DIllustration moduleId={mod.id} />
                      </div>

                      <div className="space-y-1">
                        <div className="font-display font-black text-lg sm:text-xl text-white leading-snug">
                          {mod.title}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white/95 leading-relaxed">
                          {mod.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mode + Start CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-tv-focusable="true"
                    onClick={() => onConfigureGame({ mode: 'COMPETITIVE' })}
                    className={`tv-focusable px-3.5 py-2 rounded-xl text-xs font-extrabold border-2 ${
                      roomState.settings.mode === 'COMPETITIVE'
                        ? 'bg-[#007AFF] text-white border-white'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    Modo Competitivo
                  </button>
                  <button
                    type="button"
                    data-tv-focusable="true"
                    onClick={() => onConfigureGame({ mode: 'COOPERATIVE' })}
                    className={`tv-focusable px-3.5 py-2 rounded-xl text-xs font-extrabold border-2 ${
                      roomState.settings.mode === 'COOPERATIVE'
                        ? 'bg-[#22C55E] text-white border-white'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    Modo Cooperativo
                  </button>
                </div>

                <button
                  type="button"
                  data-tv-focusable="true"
                  data-tv-primary="true"
                  onClick={() => {
                    soundEngine.playNewQuestion();
                    onStartGame();
                  }}
                  className="tv-focusable cube-3d min-h-[56px] px-9 py-3 rounded-full bg-[#22C55E] hover:bg-[#16A34A] border-3 border-white text-white font-display font-black text-lg flex items-center gap-2.5 whitespace-nowrap"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>COMEÇAR ATIVIDADE (Enter)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TELA 3: INTERFACE DE ATIVIDADE (COM ANIMAÇÃO DE PASSAGEM DE TEMPO + EQUAÇÃO CORRIGIDA) */}
        {(roomState.status === 'QUESTION_ACTIVE' ||
          roomState.status === 'ROUND_REVEAL' ||
          roomState.status === 'PAUSED') &&
          question && (
            <div className="my-auto max-w-5xl w-full mx-auto flex flex-col justify-between gap-3.5">
              {/* Top Activity Status + Animated Time Passage Bar */}
              <div className="rounded-2xl bg-[#0F172A]/95 border-2 border-white/25 px-5 py-3 space-y-2 panel-3d">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm font-extrabold text-white tabular-nums">
                    <span className="text-[#FFD600] font-display font-black">
                      ATIVIDADE {question.roundNumber}/{question.totalRounds}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{question.categoryLabel}</span>
                  </div>

                  {roomState.lastPowerUpAnnouncement && (
                    <div className="text-xs font-black text-[#FFD600] animate-bounce">
                      ✨ {roomState.lastPowerUpAnnouncement}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FFD600]" />
                    <span className="text-xs font-bold text-sky-200">
                      {roomState.status === 'ROUND_REVEAL' ? 'Próxima em:' : 'Tempo:'}
                    </span>
                    <span
                      className={`font-mono font-black text-2xl tabular-nums ${
                        remainingSec <= 5 && roomState.status === 'QUESTION_ACTIVE'
                          ? 'text-[#EF4444]'
                          : 'text-[#FFD600]'
                      }`}
                    >
                      {remainingSec}s
                    </span>
                  </div>
                </div>

                {/* 3D Animated Time Passage Tube */}
                <div className="w-full h-4 rounded-full bg-slate-950 border-2 border-white/25 overflow-hidden p-0.5 relative">
                  <div
                    style={{
                      width: `${Math.max(3, remainingRatio * 100)}%`,
                      backgroundColor:
                        roomState.status === 'ROUND_REVEAL'
                          ? '#007AFF'
                          : remainingRatio > 0.5
                          ? '#22C55E'
                          : remainingRatio > 0.25
                          ? '#FFD600'
                          : '#EF4444',
                    }}
                    className="h-full rounded-full time-bar-stripes transition-all duration-75"
                  />
                </div>
              </div>

              {/* Center Visual Question Board with 3D Stacked Blocks & Fixed Equation */}
              <div className="rounded-3xl bg-[#0F172A]/95 border-3 border-white/30 px-6 py-4 text-center panel-3d space-y-3">
                <div className="text-base sm:text-xl font-extrabold text-sky-200">
                  {question.promptText}
                </div>

                {/* Visual 3D Number Cubes Representation */}
                {question.visualBlocks && question.visualBlocks.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-6 py-1">
                    {question.visualBlocks.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="flex flex-col items-center gap-1.5 bg-slate-900/95 px-4 py-2.5 rounded-2xl border-2 border-white/20 shadow-inner"
                      >
                        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs">
                          {Array.from({ length: Math.min(group.count, 10) }).map((_, bIdx) => (
                            <NumberCube3D
                              key={bIdx}
                              number={bIdx + 1}
                              colorHex={group.colorHex}
                              size="sm"
                            />
                          ))}
                        </div>
                        {group.label && (
                          <span className="text-xs font-black text-white">{group.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Fixed 3D Equation Display (No duplicate `= ?` and no extra reveal footer text!) */}
                <div className="py-1">{renderTvEquation()}</div>

                {/* 3D Visual Hint Animator on TV (Shown when any player misses the same question twice!) */}
                {roomState.status === 'QUESTION_ACTIVE' &&
                  roomState.players.some((p) => p.visualHintActive) && (
                    <div className="pt-1">
                      <VisualHint3DAnimator question={question} />
                    </div>
                  )}

                {/* Button on TV to activate Visual Hint if unlocked */}
                {roomState.status === 'QUESTION_ACTIVE' &&
                  !roomState.players.some((p) => p.visualHintActive) &&
                  roomState.players.some((p) => p.visualHintUnlocked) && (
                    <div className="pt-1 flex justify-center">
                      <button
                        type="button"
                        data-tv-focusable="true"
                        onClick={() => onActivateVisualHint?.()}
                        className="tv-focusable cube-3d px-5 py-2 rounded-2xl bg-[#FFD600] text-slate-950 font-display font-black text-xs sm:text-sm border-2 border-white flex items-center gap-2"
                      >
                        <span>💡 Mostrar Dica Visual 3D (Contagem de Blocos)</span>
                      </button>
                    </div>
                  )}
              </div>

              {/* Bottom Area: 4 Giant 3D Number Cube Answer Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {ANSWER_OPTIONS_META.map((meta, idx) => {
                  const val = question.options[meta.index];
                  const isCorrect = question.correctIndex === meta.index;
                  const isRevealState = roomState.status === 'ROUND_REVEAL';

                  const choosers = isRevealState
                    ? roomState.players.filter((p) => p.currentAnswer === meta.index)
                    : [];

                  const isSingleLocalFailed =
                    roomState.status === 'QUESTION_ACTIVE' &&
                    roomState.players.length === 1 &&
                    Boolean(roomState.players[0]?.failedOptionsOnCurrent?.includes(meta.index));

                  return (
                    <motion.button
                      key={meta.letter}
                      type="button"
                      data-tv-focusable="true"
                      data-tv-primary={
                        idx === 0 && roomState.status === 'QUESTION_ACTIVE' ? 'true' : undefined
                      }
                      whileTap={{ scale: 0.95 }}
                      disabled={roomState.status !== 'QUESTION_ACTIVE' || isSingleLocalFailed}
                      onClick={() => {
                        soundEngine.playBuzzerLock(0);
                        onLocalTvAnswer(meta.index);
                      }}
                      style={{
                        backgroundColor: isRevealState
                          ? isCorrect
                            ? '#22C55E'
                            : '#1E293B'
                          : isSingleLocalFailed
                          ? '#334155'
                          : meta.hexColor,
                      }}
                      className={`tv-focusable cube-3d rounded-3xl p-4 flex flex-col justify-between min-h-[116px] border-3 transition-all text-white ${
                        isRevealState
                          ? isCorrect
                            ? 'border-white scale-105 shadow-2xl'
                            : 'border-slate-700 opacity-50'
                          : isSingleLocalFailed
                          ? 'border-rose-400/60 opacity-60'
                          : 'border-white'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between text-xs font-black">
                        <span className="bg-black/25 px-2.5 py-0.5 rounded-lg">
                          {meta.shape} BLOCO {meta.letter}
                        </span>
                        {isRevealState && isCorrect && (
                          <span className="flex items-center gap-1 bg-white text-emerald-700 px-2 py-0.5 rounded-lg">
                            <Check className="w-3.5 h-3.5" /> CERTO!
                          </span>
                        )}
                        {isSingleLocalFailed && (
                          <span className="bg-rose-600 text-white px-2 py-0.5 rounded-lg">
                            ✗ TENTADO
                          </span>
                        )}
                      </div>

                      <div
                        className={`font-display font-black text-4xl lg:text-5xl tabular-nums my-1 drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)] ${
                          isSingleLocalFailed ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {val}
                      </div>

                      <div className="w-full text-[11px] font-extrabold truncate">
                        {isRevealState
                          ? choosers.length > 0
                            ? `Escolhido por: ${choosers.map((c) => c.name).join(', ')}`
                            : '—'
                          : isSingleLocalFailed
                          ? 'Escolha outro bloco!'
                          : `Toque ${meta.letter} no celular`}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

        {/* TELA 4: GRANDE FINAL COM CONTADOR AUTOMÁTICO PARA VOLTAR À TELA PRINCIPAL (Fixes Image 2!) */}
        {roomState.status === 'GAME_OVER' && (
          <div className="my-auto max-w-4xl w-full mx-auto rounded-3xl bg-[#0F172A]/95 border-4 border-[#FFD600] p-6 text-center space-y-4 panel-3d">
            {/* Auto-return Countdown Bar */}
            <div className="space-y-1.5 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#FFD600]">
                <Clock className="w-4 h-4" />
                <span>
                  Retornando automaticamente para a Tela Principal em{' '}
                  <strong className="font-mono text-sm underline">{gameOverLeftSec}s</strong>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/20 overflow-hidden">
                <div
                  style={{ width: `${Math.max(3, gameOverRatio * 100)}%` }}
                  className="h-full bg-[#FFD600] time-bar-stripes transition-all duration-100"
                />
              </div>
            </div>

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#FFD600]/20 text-[#FFD600] mx-auto">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="title-3d-yellow font-display font-black text-3xl sm:text-4xl">
                Parabéns, Construtores da Matemática!
              </h2>
              <p className="text-xs sm:text-sm font-bold text-sky-200">
                No celular, cada jogador pode escolher continuar ou liberar sua vaga!
              </p>
            </div>

            {roomState.lastPowerUpAnnouncement && (
              <div className="inline-block px-4 py-1.5 rounded-xl bg-sky-950 border border-[#FFD600] text-xs font-black text-[#FFD600]">
                🔄 {roomState.lastPowerUpAnnouncement}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
              {[...roomState.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => {
                  const playerMedals =
                    p.medals && p.medals.length > 0
                      ? p.medals
                      : evaluatePlayerMedals(p, roomState.settings.totalRounds);
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border-2 ${
                        idx === 0
                          ? 'bg-[#007AFF]/30 border-[#FFD600]'
                          : 'bg-slate-900 border-slate-700'
                      } space-y-2.5 flex flex-col justify-between`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-sm text-[#FFD600]">
                            #{idx + 1} · ⭐ {p.stars} Estrelas
                          </span>
                          {idx === 0 && <Crown className="w-4 h-4 text-[#FFD600]" />}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <AvatarIcon avatarId={p.avatarId} className="w-11 h-11 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-display font-black text-base text-white truncate">
                              {p.name}
                            </div>
                            <div className="font-mono font-black text-lg text-[#22C55E] tabular-nums">
                              {p.score} pts
                            </div>
                          </div>
                        </div>

                        {/* 3D Animated Achievement Medals Earned by Player */}
                        <div className="pt-1.5 border-t border-white/10 space-y-1.5">
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#FFD600]">
                            <Award className="w-3.5 h-3.5" />
                            <span>Medalhas 3D Conquistadas:</span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {playerMedals.map((mId, mIdx) => (
                              <Medal3DBadge
                                key={mId}
                                medalId={mId}
                                size="sm"
                                delay={idx * 0.12 + mIdx * 0.15}
                                onClick={() => {
                                  soundEngine.playMedalFanfare();
                                  onCelebrateMedals?.();
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-sky-200 pt-1 border-t border-white/10 tabular-nums">
                        <span>
                          Acertos: {p.correctCount}/{roomState.settings.totalRounds}
                        </span>
                        {p.continueChoice === 'YES' && (
                          <span className="text-emerald-400 font-black">✓ Continua</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                data-tv-focusable="true"
                data-tv-primary="true"
                onClick={onRestartGame}
                className="tv-focusable cube-3d min-h-[54px] px-7 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] border-3 border-white text-white font-display font-black text-base flex items-center gap-2 whitespace-nowrap"
              >
                <RotateCcw className="w-5 h-5" />
                <span>JOGAR NOVAMENTE (Enter)</span>
              </button>

              <button
                type="button"
                data-tv-focusable="true"
                onClick={() => {
                  soundEngine.playMedalFanfare();
                  onCelebrateMedals?.();
                }}
                className="tv-focusable cube-3d min-h-[54px] px-6 py-2.5 rounded-full bg-[#FFD600] hover:bg-[#FACC15] border-3 border-white text-slate-950 font-display font-black text-base flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5" />
                <span>Celebrar Medalhas 3D &amp; Confete!</span>
              </button>

              <button
                type="button"
                data-tv-focusable="true"
                onClick={() => onSetStatus('TITLE_MENU')}
                className="tv-focusable cube-3d min-h-[54px] px-6 py-2.5 rounded-full bg-[#007AFF] hover:bg-[#0284C7] border-3 border-white text-white font-display font-black text-base flex items-center gap-2 whitespace-nowrap"
              >
                <Home className="w-5 h-5" />
                <span>Voltar à Tela Principal</span>
              </button>
            </div>
          </div>
        )}

        {/* PEDESTAIS DOS 4 JOGADORES NA MESA DE MADEIRA */}
        <section aria-label="Jogadores Conectados" className="grid grid-cols-4 gap-3.5 pt-1">
          {[0, 1, 2, 3].map((slotIdx) => {
            const player = roomState.players.find((p) => p.slotIndex === slotIdx);
            const fallbackAvatar = PLAYER_AVATARS[slotIdx];

            if (!player) {
              return (
                <div
                  key={slotIdx}
                  className="rounded-2xl bg-[#0F172A]/85 border-2 border-dashed border-white/25 p-2.5 flex items-center justify-between text-sky-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <NumberCube3D
                      number={slotIdx + 1}
                      colorHex={
                        slotIdx === 0
                          ? '#007AFF'
                          : slotIdx === 1
                          ? '#FFD600'
                          : slotIdx === 2
                          ? '#EF4444'
                          : '#22C55E'
                      }
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate">
                        Jogador {slotIdx + 1} Livre
                      </div>
                      <div className="text-[11px] font-bold text-[#FFD600] truncate">
                        PIN: {roomState.code}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const lockedIn = player.currentAnswer !== null;
            const isReveal = roomState.status === 'ROUND_REVEAL';
            const isRight =
              isReveal &&
              question !== null &&
              player.currentAnswer === question.correctIndex;

            return (
              <div
                key={player.id}
                className={`rounded-2xl p-2.5 border-2 transition-all flex items-center justify-between gap-2 ${
                  isReveal
                    ? isRight
                      ? 'bg-[#16A34A] border-white shadow-lg'
                      : 'bg-[#0F172A] border-[#FFD600]'
                    : lockedIn
                    ? 'bg-[#007AFF] border-[#FFD600] shadow-lg'
                    : 'bg-[#0F172A]/95 border-white/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AvatarIcon
                    avatarId={player.avatarId || fallbackAvatar.id}
                    className="w-11 h-11 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-display font-black text-sm text-white truncate">
                        {player.name}
                      </span>
                      <span className="text-xs font-bold text-[#FFD600]">⭐{player.stars}</span>
                    </div>
                    <div className="text-xs font-extrabold text-sky-100 tabular-nums">
                      {isReveal ? (
                        isRight ? (
                          <span className="text-[#FFD600]">+{player.lastPointsEarned} pts!</span>
                        ) : (
                          <span>Tente na próxima!</span>
                        )
                      ) : lockedIn ? (
                        <span className="text-[#FFD600]">✓ Bloco Pronto!</span>
                      ) : (
                        <span>Conectado</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-sky-200">PONTOS</div>
                    <div className="font-mono font-black text-base text-white tabular-nums">
                      {player.score}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-tv-focusable="true"
                    onClick={() => onAdminKickPlayer(player.id)}
                    title={`Fazer Logoff de ${player.name}`}
                    className="tv-focusable p-2 rounded-xl bg-red-600/90 hover:bg-red-500 border border-white/50 text-white transition-transform active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* TELA ADMINISTRATIVA — CONTROLE DOS 4 JOGADORES + MODO PROFESSOR + RELATÓRIO PEDAGÓGICO */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl w-full rounded-3xl bg-[#0F172A] border-4 border-[#FFD600] p-5 sm:p-6 space-y-5 shadow-2xl panel-3d my-auto max-h-[94vh] overflow-y-auto">
            {/* Admin Header with moved PWA Install & Testar Celular na Tela buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#A855F7] border-2 border-white flex items-center justify-center text-white shadow-lg shrink-0">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-[#FFD600]">
                    MagnetSoftware · Painel de Controle &amp; Modo Professor
                  </div>
                  <h2 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white">
                    Tela Administrativa da Sala ({roomState.code})
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Moved from main header: Instalar App (PWA) & Testar Celular na Tela */}
                <PWAInstallButton />

                <button
                  type="button"
                  data-tv-focusable="true"
                  onClick={() => {
                    setShowVirtualPhone((v) => !v);
                    setShowAdminPanel(false);
                  }}
                  className={`tv-focusable cube-3d min-h-[42px] px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 border-2 border-white transition-colors ${
                    showVirtualPhone
                      ? 'bg-[#FFD600] text-slate-950'
                      : 'bg-[#007AFF] hover:bg-[#0284C7] text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {showVirtualPhone ? 'Fechar Celular Virtual' : 'Testar Celular na Tela'}
                  </span>
                </button>

                <button
                  type="button"
                  data-tv-focusable="true"
                  onClick={() => {
                    soundEngine.playTick();
                    onAdminRotatePin();
                  }}
                  className="tv-focusable cube-3d min-h-[42px] px-3.5 py-2 rounded-2xl bg-sky-700 hover:bg-sky-600 border-2 border-white text-xs font-black text-white flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Novo PIN / QR ({roomState.code})</span>
                </button>

                {roomState.players.length > 0 && (
                  <button
                    type="button"
                    data-tv-focusable="true"
                    onClick={() => {
                      soundEngine.playTick();
                      roomState.players.forEach((p) => onAdminKickPlayer(p.id));
                    }}
                    className="tv-focusable cube-3d min-h-[42px] px-3.5 py-2 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] border-2 border-white text-xs font-black text-white flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logoff de Todos</span>
                  </button>
                )}

                <button
                  type="button"
                  data-tv-focusable="true"
                  onClick={() => setShowAdminPanel(false)}
                  className="tv-focusable cube-3d min-h-[42px] px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-white/40 text-xs font-black text-white flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Fechar</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Admin Panel */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-tv-focusable="true"
                onClick={() => {
                  soundEngine.playTick();
                  setAdminTab('PLAYERS');
                }}
                className={`tv-focusable cube-3d min-h-[46px] px-5 py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 border-2 transition-all ${
                  adminTab === 'PLAYERS'
                    ? 'bg-[#FFD600] text-slate-950 border-white'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Controle dos 4 Jogadores ({roomState.players.length}/4)</span>
              </button>

              <button
                type="button"
                data-tv-focusable="true"
                onClick={() => {
                  soundEngine.playTick();
                  setAdminTab('TEACHER_CREATOR');
                }}
                className={`tv-focusable cube-3d min-h-[46px] px-5 py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 border-2 transition-all ${
                  adminTab === 'TEACHER_CREATOR'
                    ? 'bg-[#22C55E] text-white border-white'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  Modo Professor · Partidas Personalizadas (
                  {roomState.settings.customQuestions?.length || 0})
                </span>
              </button>

              <button
                type="button"
                data-tv-focusable="true"
                onClick={() => {
                  soundEngine.playTick();
                  setAdminTab('PEDAGOGICAL_REPORT');
                }}
                className={`tv-focusable cube-3d min-h-[46px] px-5 py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 border-2 transition-all ${
                  adminTab === 'PEDAGOGICAL_REPORT'
                    ? 'bg-[#A855F7] text-white border-white'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Relatório Pedagógico Pós-Jogo (+, −, ×, ÷)</span>
              </button>
            </div>

            {/* ABA 1: CONTROLE DOS 4 JOGADORES */}
            {adminTab === 'PLAYERS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const player = roomState.players.find((p) => p.slotIndex === slotIdx);
                  const slotColors = ['#007AFF', '#FFD600', '#EF4444', '#22C55E'];
                  const badgeHex = slotColors[slotIdx];

                  if (!player) {
                    // JOGADOR NÃO LOGADO: Mostra QR Code e Código PIN da vaga!
                    return (
                      <div
                        key={slotIdx}
                        className="rounded-3xl bg-[#071936] border-3 border-dashed border-sky-400/50 p-4 flex flex-col items-center justify-between text-center space-y-3 panel-3d"
                      >
                        <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <NumberCube3D number={slotIdx + 1} colorHex={badgeHex} size="sm" />
                            <span className="font-display font-black text-base text-white">
                              Jogador {slotIdx + 1}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-[11px] font-black text-[#FFD600]">
                            Aguardando Login
                          </span>
                        </div>

                        {qrDataUrl && (
                          <div className="p-2.5 rounded-2xl bg-white shadow-lg">
                            <img
                              src={qrDataUrl}
                              alt={`QR Code Jogador ${slotIdx + 1} - PIN ${roomState.code}`}
                              referrerPolicy="no-referrer"
                              className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                            />
                          </div>
                        )}

                        <div className="w-full rounded-2xl bg-[#0F172A] border-2 border-[#FFD600] py-2 px-3">
                          <div className="text-[10px] font-extrabold text-sky-300 uppercase">
                            Código PIN para Conectar:
                          </div>
                          <div className="font-mono font-black text-3xl text-[#FFD600] tracking-widest tabular-nums">
                            {roomState.code}
                          </div>
                        </div>

                        <p className="text-[11px] font-semibold text-sky-200 leading-snug">
                          Escaneie o QR Code com o celular para assumir o Controle #{slotIdx + 1}
                        </p>
                      </div>
                    );
                  }

                  // JOGADOR LOGADO: Mostra Avatar 3D, Nome, Pontuação e Botão de Logoff (Desconectar)!
                  return (
                    <div
                      key={player.id}
                      className="rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#1E293B] border-3 border-[#22C55E] p-4 flex flex-col justify-between text-center space-y-3 panel-3d"
                    >
                      <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <NumberCube3D number={slotIdx + 1} colorHex={badgeHex} size="sm" />
                          <span className="font-display font-black text-base text-white">
                            Jogador {slotIdx + 1}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-[11px] font-black text-emerald-300">
                          ● Online
                        </span>
                      </div>

                      {/* Player 3D Avatar & Name */}
                      <div className="flex flex-col items-center space-y-1.5 py-1">
                        <div className="p-1.5 rounded-2xl bg-slate-900 border-2 border-[#FFD600] shadow-md">
                          <AvatarIcon avatarId={player.avatarId} className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-black text-xl text-white">
                            {player.name}
                          </h3>
                          {player.isHost && (
                            <Crown className="w-4 h-4 text-[#FFD600]" title="Líder da Sala" />
                          )}
                        </div>
                      </div>

                      {/* Player Score & Stats */}
                      <div className="grid grid-cols-2 gap-2 w-full bg-slate-950/80 p-2.5 rounded-2xl border border-white/15 tabular-nums">
                        <div>
                          <div className="text-[10px] font-bold text-sky-300 uppercase">
                            Pontuação
                          </div>
                          <div className="font-mono font-black text-xl text-[#22C55E]">
                            {player.score} pts
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-sky-300 uppercase">
                            Estrelas / Acertos
                          </div>
                          <div className="font-mono font-black text-base text-[#FFD600]">
                            ⭐ {player.stars} · {player.correctCount}✓
                          </div>
                        </div>
                      </div>

                      {/* Logoff / Disconnect Player Button */}
                      <button
                        type="button"
                        data-tv-focusable="true"
                        onClick={() => {
                          soundEngine.playTick();
                          onAdminKickPlayer(player.id);
                        }}
                        className="tv-focusable cube-3d w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] border-2 border-white text-white font-display font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Fazer Logoff (Desconectar)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ABA 2: MODO PROFESSOR — CRIADOR DE PARTIDAS PERSONALIZADAS */}
            {adminTab === 'TEACHER_CREATOR' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Presets + Add Specific Equation Form */}
                <div className="lg:col-span-5 rounded-3xl bg-[#071936] border-2 border-white/20 p-5 space-y-4">
                  <div>
                    <div className="text-xs font-black uppercase text-[#22C55E]">
                      1. Pacotes Prontos de Treino (1 Clique)
                    </div>
                    <p className="text-xs font-semibold text-sky-200">
                      Escolha uma trilha focada (ex: Tabuada do 7 e 8) ou cadastre contas abaixo:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Tabuada do 7 e 8',
                        color: '#A855F7',
                        items: [
                          { termA: 7, operator: '×' as MathOperator, termB: 6, correctAnswer: 42 },
                          { termA: 7, operator: '×' as MathOperator, termB: 7, correctAnswer: 49 },
                          { termA: 7, operator: '×' as MathOperator, termB: 8, correctAnswer: 56 },
                          { termA: 7, operator: '×' as MathOperator, termB: 9, correctAnswer: 63 },
                          { termA: 8, operator: '×' as MathOperator, termB: 6, correctAnswer: 48 },
                          { termA: 8, operator: '×' as MathOperator, termB: 7, correctAnswer: 56 },
                          { termA: 8, operator: '×' as MathOperator, termB: 8, correctAnswer: 64 },
                          { termA: 8, operator: '×' as MathOperator, termB: 9, correctAnswer: 72 },
                        ],
                      },
                      {
                        label: 'Tabuada do 2, 3 e 4',
                        color: '#007AFF',
                        items: [
                          { termA: 2, operator: '×' as MathOperator, termB: 6, correctAnswer: 12 },
                          { termA: 2, operator: '×' as MathOperator, termB: 8, correctAnswer: 16 },
                          { termA: 3, operator: '×' as MathOperator, termB: 5, correctAnswer: 15 },
                          { termA: 3, operator: '×' as MathOperator, termB: 7, correctAnswer: 21 },
                          { termA: 4, operator: '×' as MathOperator, termB: 6, correctAnswer: 24 },
                          { termA: 4, operator: '×' as MathOperator, termB: 8, correctAnswer: 32 },
                        ],
                      },
                      {
                        label: 'Tabuada do 5, 6 e 9',
                        color: '#F97316',
                        items: [
                          { termA: 5, operator: '×' as MathOperator, termB: 7, correctAnswer: 35 },
                          { termA: 6, operator: '×' as MathOperator, termB: 6, correctAnswer: 36 },
                          { termA: 6, operator: '×' as MathOperator, termB: 8, correctAnswer: 48 },
                          { termA: 9, operator: '×' as MathOperator, termB: 6, correctAnswer: 54 },
                          { termA: 9, operator: '×' as MathOperator, termB: 7, correctAnswer: 63 },
                          { termA: 9, operator: '×' as MathOperator, termB: 9, correctAnswer: 81 },
                        ],
                      },
                      {
                        label: 'Divisão Exata (÷)',
                        color: '#EC4899',
                        items: [
                          { termA: 12, operator: '÷' as MathOperator, termB: 3, correctAnswer: 4 },
                          { termA: 20, operator: '÷' as MathOperator, termB: 4, correctAnswer: 5 },
                          { termA: 36, operator: '÷' as MathOperator, termB: 6, correctAnswer: 6 },
                          { termA: 42, operator: '÷' as MathOperator, termB: 7, correctAnswer: 6 },
                          { termA: 56, operator: '÷' as MathOperator, termB: 8, correctAnswer: 7 },
                          { termA: 63, operator: '÷' as MathOperator, termB: 9, correctAnswer: 7 },
                        ],
                      },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        data-tv-focusable="true"
                        onClick={() => {
                          soundEngine.playTick();
                          const generated: CustomEquationItem[] = preset.items.map((it, idx) => ({
                            id: `preset_${Date.now()}_${idx}`,
                            ...it,
                          }));
                          onAdminSetCustomQuestions(generated, true);
                          setTeacherError(null);
                        }}
                        style={{ backgroundColor: preset.color }}
                        className="tv-focusable cube-3d px-3 py-2.5 rounded-2xl border-2 border-white text-white font-display font-black text-xs text-left flex items-center justify-between"
                      >
                        <span>{preset.label}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-black/30 text-[10px]">
                          {preset.items.length}x
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Manual Custom Equation Input */}
                  <div className="pt-3 border-t border-white/15 space-y-3">
                    <div className="text-xs font-black uppercase text-[#FFD600]">
                      2. Cadastrar Conta Específica Manualmente
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={termAInput}
                        onChange={(e) => setTermAInput(e.target.value)}
                        className="w-20 h-12 rounded-xl bg-slate-900 border-2 border-sky-400 text-center font-mono text-xl font-black text-white"
                        aria-label="Primeiro número"
                      />

                      <div className="flex gap-1">
                        {(['+', '-', '×', '÷'] as MathOperator[]).map((op) => (
                          <button
                            key={op}
                            type="button"
                            data-tv-focusable="true"
                            onClick={() => setOperatorInput(op)}
                            className={`tv-focusable w-11 h-12 rounded-xl font-mono font-black text-xl border-2 ${
                              operatorInput === op
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
                        max={200}
                        value={termBInput}
                        onChange={(e) => setTermBInput(e.target.value)}
                        className="w-20 h-12 rounded-xl bg-slate-900 border-2 border-sky-400 text-center font-mono text-xl font-black text-white"
                        aria-label="Segundo número"
                      />
                    </div>

                    {teacherError && (
                      <div className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 rounded-xl px-3 py-1.5">
                        {teacherError}
                      </div>
                    )}

                    <button
                      type="button"
                      data-tv-focusable="true"
                      onClick={() => {
                        const a = Math.max(1, parseInt(termAInput, 10) || 1);
                        const b = Math.max(1, parseInt(termBInput, 10) || 1);
                        let ans = 0;

                        if (operatorInput === '+') {
                          ans = a + b;
                        } else if (operatorInput === '-') {
                          if (a <= b) {
                            setTeacherError(
                              'Na subtração, o 1º número deve ser maior que o 2º para resultado positivo.'
                            );
                            return;
                          }
                          ans = a - b;
                        } else if (operatorInput === '×') {
                          ans = a * b;
                        } else {
                          if (b === 0 || a % b !== 0) {
                            setTeacherError(
                              `A divisão ${a} ÷ ${b} não é exata. Use um múltiplo de ${b} (ex: ${
                                b * 2
                              }, ${b * 3}, ${b * 4}).`
                            );
                            return;
                          }
                          ans = a / b;
                        }

                        setTeacherError(null);
                        soundEngine.playTick();
                        const currentList = roomState.settings.customQuestions || [];
                        const nextList: CustomEquationItem[] = [
                          ...currentList,
                          {
                            id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                            termA: a,
                            operator: operatorInput,
                            termB: b,
                            correctAnswer: ans,
                          },
                        ];
                        onAdminSetCustomQuestions(nextList, true);
                      }}
                      className="tv-focusable cube-3d w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white font-display font-black text-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Conta à Lista da Partida</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Active Custom Questions Queue & Launch Button */}
                <div className="lg:col-span-7 rounded-3xl bg-[#071936] border-2 border-white/20 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
                      <div>
                        <div className="text-xs font-black uppercase text-[#FFD600]">
                          Contas Cadastradas para a Próxima Partida (
                          {roomState.settings.customQuestions?.length || 0})
                        </div>
                        <p className="text-xs text-sky-200 font-semibold">
                          Quando ativo, a partida exibirá exatamente estas contas em sequência.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {(roomState.settings.customQuestions?.length || 0) > 0 && (
                          <>
                            <button
                              type="button"
                              data-tv-focusable="true"
                              onClick={() => {
                                soundEngine.playTick();
                                onAdminSetCustomQuestions(
                                  roomState.settings.customQuestions || [],
                                  !roomState.settings.useCustomQuestions
                                );
                              }}
                              className={`tv-focusable px-3.5 py-1.5 rounded-xl text-xs font-black border-2 ${
                                roomState.settings.useCustomQuestions
                                  ? 'bg-[#22C55E] text-white border-white'
                                  : 'bg-slate-800 text-slate-300 border-slate-600'
                              }`}
                            >
                              {roomState.settings.useCustomQuestions
                                ? '✓ Modo Professor ATIVO'
                                : 'Modo Professor Inativo'}
                            </button>

                            <button
                              type="button"
                              data-tv-focusable="true"
                              onClick={() => {
                                soundEngine.playTick();
                                onAdminSetCustomQuestions([], false);
                              }}
                              className="tv-focusable px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Limpar Tudo</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {(roomState.settings.customQuestions?.length || 0) === 0 ? (
                      <div className="py-10 text-center space-y-2 rounded-2xl bg-slate-900/70 border border-dashed border-white/20">
                        <BookOpen className="w-8 h-8 text-sky-400 mx-auto" />
                        <div className="font-display font-black text-base text-white">
                          Nenhuma conta personalizada cadastrada
                        </div>
                        <p className="text-xs text-sky-200 max-w-md mx-auto">
                          Clique em um pacote ao lado (ex: <strong>Tabuada do 7 e 8</strong>) ou
                          adicione contas específicas para criar sua aula gamificada!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {(roomState.settings.customQuestions || []).map((qItem, idx) => (
                          <div
                            key={qItem.id}
                            className="rounded-2xl bg-[#0F172A] border-2 border-sky-400/40 px-3.5 py-2.5 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="text-[10px] font-black text-sky-400 uppercase">
                                Atividade #{idx + 1}
                              </div>
                              <div className="font-mono font-black text-base text-white tabular-nums">
                                {qItem.termA} {qItem.operator} {qItem.termB} ={' '}
                                <span className="text-[#FFD600]">{qItem.correctAnswer}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              data-tv-focusable="true"
                              onClick={() => {
                                const filtered = (roomState.settings.customQuestions || []).filter(
                                  (item) => item.id !== qItem.id
                                );
                                onAdminSetCustomQuestions(filtered, filtered.length > 0);
                              }}
                              className="tv-focusable p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white"
                              title="Remover conta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-sky-200">
                      {roomState.settings.useCustomQuestions &&
                      (roomState.settings.customQuestions?.length || 0) > 0
                        ? `Pronto para jogar ${roomState.settings.customQuestions?.length} atividades personalizadas!`
                        : 'Usando gerador automático dos Módulos 1 a 4.'}
                    </span>

                    {(roomState.settings.customQuestions?.length || 0) > 0 && (
                      <button
                        type="button"
                        data-tv-focusable="true"
                        onClick={() => {
                          onAdminSetCustomQuestions(
                            roomState.settings.customQuestions || [],
                            true
                          );
                          setShowAdminPanel(false);
                          soundEngine.playNewQuestion();
                          onStartGame();
                        }}
                        className="tv-focusable cube-3d min-h-[48px] px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white font-display font-black text-sm flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Iniciar Partida Personalizada Agora!</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: RELATÓRIO PEDAGÓGICO PÓS-JOGO POR OPERAÇÃO (+, −, ×, ÷) */}
            {adminTab === 'PEDAGOGICAL_REPORT' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#071936] border border-white/15 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase text-[#FFD600]">
                      Acompanhamento Pedagógico para Pais e Professores
                    </div>
                    <p className="text-xs text-sky-200 font-semibold">
                      Percentual de acerto de cada jogador separado por operação matemática (Adição
                      +, Subtração −, Multiplicação × e Divisão ÷).
                    </p>
                  </div>
                </div>

                {roomState.players.length === 0 ? (
                  <div className="py-12 text-center rounded-3xl bg-[#071936] border-2 border-dashed border-white/20 space-y-2">
                    <BarChart3 className="w-10 h-10 text-sky-400 mx-auto" />
                    <div className="font-display font-black text-lg text-white">
                      Nenhum jogador conectado no momento
                    </div>
                    <p className="text-xs text-sky-200">
                      Assim que os jogadores responderem às atividades, o desempenho detalhado por
                      operação aparecerá aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomState.players.map((player) => {
                      const stats = player.operationStats || createEmptyOperationStats();
                      const overallAcc =
                        player.totalAnswered > 0
                          ? Math.round((player.correctCount / player.totalAnswered) * 100)
                          : 0;
                      const avgSec =
                        player.totalAnswered > 0
                          ? (player.totalAnswerTimeMs / player.totalAnswered / 1000).toFixed(1)
                          : '0.0';

                      const opMetaList: {
                        op: MathOperator;
                        label: string;
                        color: string;
                      }[] = [
                        { op: '+', label: 'Adição (+)', color: '#22C55E' },
                        { op: '-', label: 'Subtração (−)', color: '#F97316' },
                        { op: '×', label: 'Multiplicação (×)', color: '#A855F7' },
                        { op: '÷', label: 'Divisão (÷)', color: '#EC4899' },
                      ];

                      return (
                        <div
                          key={player.id}
                          className="rounded-3xl bg-[#071936] border-2 border-white/25 p-4 space-y-3.5 panel-3d"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div className="flex items-center gap-3">
                              <AvatarIcon avatarId={player.avatarId} className="w-14 h-14 shrink-0" />
                              <div>
                                <div className="font-display font-black text-lg text-white">
                                  {player.name}
                                </div>
                                <div className="text-xs font-bold text-sky-300 tabular-nums">
                                  Precisão Geral:{' '}
                                  <strong className="text-[#FFD600]">{overallAcc}%</strong> (
                                  {player.correctCount}/{player.totalAnswered}) · Tempo Médio:{' '}
                                  <strong className="text-white">{avgSec}s</strong>
                                </div>
                              </div>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black border ${
                                player.totalAnswered === 0
                                  ? 'bg-slate-800 text-slate-300 border-slate-600'
                                  : overallAcc >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                                  : overallAcc >= 50
                                  ? 'bg-amber-500/20 text-[#FFD600] border-amber-400'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-400'
                              }`}
                            >
                              {player.totalAnswered === 0
                                ? 'Sem Respostas'
                                : overallAcc >= 80
                                ? '🌟 Dominado'
                                : overallAcc >= 50
                                ? '📈 Em Evolução'
                                : '🎯 Reforçar Treino'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {opMetaList.map(({ op, label, color }) => {
                              const item = stats[op] || { correct: 0, total: 0 };
                              const pct =
                                item.total > 0 ? Math.round((item.correct / item.total) * 100) : null;

                              return (
                                <div
                                  key={op}
                                  className="rounded-2xl bg-[#0F172A] border border-white/15 p-3 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-xs font-black">
                                    <span className="text-white">{label}</span>
                                    <span
                                      style={{ color: pct !== null ? color : '#94A3B8' }}
                                      className="font-mono text-sm tabular-nums"
                                    >
                                      {pct !== null ? `${pct}%` : '—'}
                                    </span>
                                  </div>

                                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                                    <div
                                      style={{
                                        width: `${pct !== null ? Math.max(6, pct) : 0}%`,
                                        backgroundColor: color,
                                      }}
                                      className="h-full rounded-full transition-all duration-300"
                                    />
                                  </div>

                                  <div className="text-[11px] font-bold text-sky-300 tabular-nums">
                                    {item.total > 0
                                      ? `${item.correct} acerto(s) em ${item.total} conta(s)`
                                      : 'Nenhuma conta realizada'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PARENTAL GATE MODAL */}
      {showParentalGate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-6 text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFD600]/20 text-[#FFD600] mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-display font-black text-2xl text-white">
              Verificação Parental (MagnetSoftware)
            </h2>
            {!parentalUnlocked ? (
              <>
                <p className="text-xs font-semibold text-sky-200">
                  Para acessar as configurações de duração das rodadas, responda: Quanto é{' '}
                  <strong>12 × 4</strong>?
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={parentalAnswer}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParentalAnswer(val);
                    if (val.trim() === '48') {
                      setParentalUnlocked(true);
                    }
                  }}
                  placeholder="Resposta"
                  className="w-36 h-12 mx-auto block rounded-xl bg-slate-900 border-2 border-sky-400 text-center font-mono text-xl font-black text-white"
                />
              </>
            ) : (
              <div className="space-y-3 text-left bg-slate-900 p-4 rounded-2xl border border-slate-700">
                <div className="text-xs font-black text-[#22C55E]">
                  ✓ Acesso dos Pais Liberado
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Quantidade de Rodadas por Partida:</span>
                  <div className="flex gap-1.5">
                    {[5, 8, 10].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onConfigureGame({ totalRounds: r })}
                        className={`px-3 py-1 rounded-lg font-mono ${
                          roomState.settings.totalRounds === r
                            ? 'bg-[#FFD600] text-slate-950 font-black'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ambiente 100% seguro: sem anúncios externos, sem coleta de dados pessoais e sem
                  links externos desprotegidos.
                </p>
              </div>
            )}
            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => {
                setShowParentalGate(false);
                setParentalAnswer('');
                setParentalUnlocked(false);
              }}
              className="tv-focusable w-full min-h-[46px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {roomState.status === 'PAUSED' && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-6 text-center space-y-5 shadow-2xl">
            <h2 className="font-display font-black text-3xl text-white">Jogo Pausado</h2>
            <p className="text-sm font-semibold text-sky-200">
              Todos os celulares continuam conectados na sala <strong>{roomState.code}</strong>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                data-tv-focusable="true"
                data-tv-primary="true"
                onClick={onTogglePause}
                className="tv-focusable cube-3d w-full min-h-[52px] rounded-2xl bg-[#22C55E] text-white font-display font-black text-base"
              >
                Continuar Brincando (Enter)
              </button>
              <button
                type="button"
                data-tv-focusable="true"
                onClick={onRestartGame}
                className="tv-focusable w-full min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-sm"
              >
                Escolher Outro Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIP VIRTUAL SMARTPHONE CONTROLLER */}
      {showVirtualPhone && (
        <aside
          aria-label="Simulador de Controle no Celular"
          className="fixed bottom-4 right-4 z-40 w-[365px] h-[645px] max-h-[89vh] rounded-[32px] bg-[#071936] border-4 border-[#FFD600] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="bg-[#0A192F] px-4 py-2 flex items-center justify-between border-b border-white/15">
            <span className="text-xs font-black text-[#FFD600] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Controle Celular (Simulador)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowVirtualPhone(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Fechar simulador de celular"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MobileControllerView
              roomState={roomState}
              playerId={simPlayerId}
              initialRoomCode={roomState.code}
              errorMessage={simError}
              onJoinRoom={onSimJoin}
              onSelectAnswer={onSimAnswer}
              onUsePowerUp={onSimUsePowerUp}
              onActivateVisualHint={onSimActivateVisualHint}
              onContinueDecision={onSimContinueDecision}
              onConfigureGame={onConfigureGame}
              onStartGame={onStartGame}
              onRestartGame={onRestartGame}
              onNextRound={onNextRound}
              isEmbeddedPiP={true}
            />
          </div>
        </aside>
      )}
    </div>
  );
};
