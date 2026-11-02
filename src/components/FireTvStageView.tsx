import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ANSWER_OPTIONS_META,
  DifficultyLevel,
  GameMode,
  PLAYER_AVATARS,
  RoomState,
} from '../types/game.ts';
import { StudioStageCanvas } from './StudioStageCanvas.tsx';
import { AvatarIcon, MathShowTitleEmblem } from './AvatarIcon.tsx';
import { MobileControllerView } from './MobileControllerView.tsx';
import { soundEngine } from '../utils/sound.ts';
import {
  Check,
  Crown,
  Pause,
  Play,
  QrCode,
  RotateCcw,
  Smartphone,
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
    totalRounds?: number;
  }) => void;
  onStartGame: () => void;
  onTogglePause: () => void;
  onRestartGame: () => void;
  onNextRound: () => void;
  onLocalTvAnswer: (optionIndex: number) => void;
  onSwitchToFullMobile: () => void;
  // Props for the built-in PiP Virtual Phone Simulator so users can test multi-phone gameplay on 1 screen
  simPlayerId: string;
  simError: string | null;
  onSimJoin: (code: string, name: string, avatarId: string) => void;
  onSimAnswer: (optionIndex: number) => void;
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
  onSwitchToFullMobile,
  simPlayerId,
  simError,
  onSimJoin,
  onSimAnswer,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(soundEngine.isMuted());
  const [remainingSec, setRemainingSec] = useState<number>(15);
  const [showVirtualPhone, setShowVirtualPhone] = useState<boolean>(false);

  const mobileJoinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomState.code}&role=controller`
      : '';

  // Generate QR Code data URL whenever room code changes
  useEffect(() => {
    if (!roomState.code || !mobileJoinUrl) return;
    QRCode.toDataURL(mobileJoinUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#080D1E',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [roomState.code, mobileJoinUrl]);

  // Countdown clock during QUESTION_ACTIVE
  useEffect(() => {
    if (roomState.status !== 'QUESTION_ACTIVE' || !roomState.currentQuestion) {
      return;
    }
    const q = roomState.currentQuestion;
    let lastBeepSecond = -1;

    const interval = setInterval(() => {
      const elapsed = Date.now() - q.startedAt;
      const leftMs = Math.max(0, q.durationMs - elapsed);
      const sec = Math.ceil(leftMs / 1000);
      setRemainingSec(sec);

      if (sec <= 5 && sec > 0 && sec !== lastBeepSecond) {
        lastBeepSecond = sec;
        soundEngine.playTick(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [roomState.status, roomState.currentQuestion]);

  // Fire TV Remote D-Pad & Keyboard Shortcuts (`Enter`/`Space` Start, `1-4` Answer, `Esc` Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input in the virtual phone simulator
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (roomState.status === 'TITLE_MENU') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          soundEngine.playPlayerJoin();
          onSetStatus('LOBBY');
        }
      } else if (roomState.status === 'LOBBY') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          soundEngine.playNewQuestion();
          onStartGame();
        }
      } else if (roomState.status === 'QUESTION_ACTIVE') {
        if (e.key === '1' || e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(0);
        } else if (e.key === '2' || e.key.toLowerCase() === 'b' || e.key === 'ArrowUp') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(1);
        } else if (e.key === '3' || e.key.toLowerCase() === 'c' || e.key === 'ArrowRight') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(2);
        } else if (e.key === '4' || e.key.toLowerCase() === 'd' || e.key === 'ArrowDown') {
          soundEngine.playBuzzerLock(0);
          onLocalTvAnswer(3);
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          onTogglePause();
        }
      } else if (roomState.status === 'PAUSED') {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTogglePause();
        }
      } else if (roomState.status === 'ROUND_REVEAL') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNextRound();
        }
      } else if (roomState.status === 'GAME_OVER') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRestartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    roomState.status,
    onSetStatus,
    onStartGame,
    onLocalTvAnswer,
    onTogglePause,
    onNextRound,
    onRestartGame,
  ]);

  const handleToggleMute = () => {
    setMuted(soundEngine.toggleMute());
  };

  const question = roomState.currentQuestion;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080D1E] text-[#F8FAFC] select-none flex flex-col justify-between">
      {/* Isolated 60fps Canvas Stage Background */}
      <StudioStageCanvas
        status={roomState.status}
        burstTrigger={burstTrigger}
        shakeTrigger={shakeTrigger}
        isLightningRound={Boolean(question?.isLightningRound)}
      />

      {/* TOP PERIMETER HUD (Low-Occlusion, No backdrop-filter over WebGL/Canvas) */}
      <header className="relative z-10 flex items-center justify-between gap-8 px-6 lg:px-10 py-4 border-b border-slate-800/80 bg-[#0A1128]/90">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => onSetStatus('TITLE_MENU')}
            className="tv-focusable font-display font-black text-xl tracking-tight text-amber-400 whitespace-nowrap shrink-0"
          >
            MATHSHOW TV
          </button>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
            Sala PIN:{' '}
            <strong className="font-mono font-bold text-sm text-white tabular-nums">
              {roomState.code}
            </strong>
          </span>
        </div>

        {/* Zone 2: Unboxed Game Telemetry Metadata */}
        <div className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-300 tabular-nums">
          <span>
            Modo:{' '}
            <strong className="text-white">
              {roomState.settings.mode === 'COMPETITIVE'
                ? 'Competitivo (Corrida)'
                : 'Cooperativo (Equipe)'}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Nível:{' '}
            <strong className="text-white">
              {roomState.settings.difficulty === 'EASY'
                ? 'Iniciante'
                : roomState.settings.difficulty === 'MEDIUM'
                ? 'Intermediário'
                : 'Mestre'}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Controles Conectados: <strong className="text-amber-400">{roomState.players.length}/4</strong>
          </span>
        </div>

        {/* Zone 3: Utility & Simulator Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowVirtualPhone((v) => !v)}
            className={`tv-focusable min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
              showVirtualPhone
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{showVirtualPhone ? 'Ocultar Celular Virtual' : 'Testar Controle na Tela'}</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToFullMobile}
            className="tv-focusable min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0"
          >
            Visão Celular
          </button>

          {(roomState.status === 'QUESTION_ACTIVE' || roomState.status === 'PAUSED') && (
            <button
              type="button"
              onClick={onTogglePause}
              aria-label="Pausar jogo"
              className="tv-focusable min-h-[40px] min-w-[40px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200"
            >
              {roomState.status === 'PAUSED' ? (
                <Play className="w-4 h-4 text-amber-400" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="tv-focusable min-h-[40px] min-w-[40px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN STAGE AREA */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-6 lg:px-12 py-4 overflow-hidden">
        {/* 1. TITLE SCREEN */}
        {roomState.status === 'TITLE_MENU' && (
          <div className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center text-center space-y-6">
            <MathShowTitleEmblem className="w-full max-w-xl" />

            <p className="text-base lg:text-lg text-slate-300 max-w-2xl text-balance">
              Transforme sua Amazon Fire TV em um programa de auditório de adição e subtração! Use
              de 1 a 4 celulares como controles remotos para responder antes do tempo acabar.
            </p>

            {/* QR + PIN Quick Preview Banner */}
            <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 rounded-3xl bg-[#1E293B]/95 border border-slate-700 shadow-2xl">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR Code para conectar na sala ${roomState.code}`}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-xl bg-white p-1.5"
                />
              )}
              <div className="text-left space-y-1">
                <div className="text-xs font-medium text-slate-400">
                  Aponte a câmera do celular ou acesse com o código:
                </div>
                <div className="font-mono font-black text-4xl text-amber-400 tracking-widest tabular-nums">
                  {roomState.code}
                </div>
                <div className="text-xs text-emerald-400 font-medium">
                  {roomState.players.length > 0
                    ? `${roomState.players.length} celular(es) já conectado(s)!`
                    : 'Aguardando celulares ou pressione Iniciar no controle da TV'}
                </div>
              </div>
            </div>

            {/* Primary Start CTA */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPlayerJoin();
                  onSetStatus('LOBBY');
                }}
                className="tv-focusable min-h-[56px] px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-lg flex items-center gap-3 shadow-xl transition-transform active:scale-95 whitespace-nowrap"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Abrir Palco &amp; Conectar Celulares (Enter)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVirtualPhone(true)}
                className="tv-focusable min-h-[56px] px-6 py-3.5 rounded-2xl bg-[#1E293B] hover:bg-slate-800 border border-slate-700 text-white font-display font-bold text-base flex items-center gap-2.5 whitespace-nowrap"
              >
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>Simular Celular na Tela</span>
              </button>
            </div>

            {/* Single Flat Control-Hint Line */}
            <div className="text-xs text-slate-400 font-mono tracking-wide pt-1">
              Celular QR Code Pareamento Rápido · Enter/Espaço Iniciar · Teclas 1-4 ou Setas Responder · Esc Pausar
            </div>
          </div>
        )}

        {/* 2. LOBBY SCREEN (Pairing Phones + Game Setup) */}
        {roomState.status === 'LOBBY' && (
          <div className="my-auto max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: QR Code & 4-Digit PIN Card */}
            <div className="lg:col-span-5 rounded-3xl bg-[#1E293B]/95 border border-slate-700 p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <QrCode className="w-4 h-4" />
                  <span>PASSO 1 · CONECTE OS CELULARES</span>
                </div>
                <h2 className="font-display text-2xl font-extrabold text-white">
                  Escaneie o QR Code com a câmera do celular
                </h2>
                <p className="text-xs text-slate-300">
                  Até 4 celulares podem entrar na mesma partida sem instalar nada.
                </p>
              </div>

              <div className="my-4 flex items-center gap-5 bg-[#0F172A] p-4 rounded-2xl border border-slate-800">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Sala ${roomState.code}`}
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 rounded-xl bg-white p-2 shrink-0"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                    QR Code
                  </div>
                )}

                <div className="space-y-2 min-w-0">
                  <div className="text-xs text-slate-400">Código PIN de 4 dígitos:</div>
                  <div className="font-mono font-black text-4xl lg:text-5xl text-amber-400 tracking-wider tabular-nums">
                    {roomState.code}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVirtualPhone(true)}
                    className="tv-focusable px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Abrir Controle Virtual</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>Operações: Adição (+) e Subtração (-)</span>
                <span className="font-mono text-slate-300">{roomState.settings.totalRounds} Rodadas</span>
              </div>
            </div>

            {/* Right Column: Show Configuration & Start Button */}
            <div className="lg:col-span-7 rounded-3xl bg-[#1E293B]/95 border border-slate-700 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-400">
                      PASSO 2 · CONFIGURE O PROGRAMA
                    </div>
                    <h2 className="font-display text-2xl font-extrabold text-white">
                      Regras da Partida na Fire TV
                    </h2>
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Modo de Jogo (1 a 4 Celulares)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onConfigureGame({ mode: 'COMPETITIVE' })}
                      className={`tv-focusable p-3.5 rounded-2xl border text-left transition-colors ${
                        roomState.settings.mode === 'COMPETITIVE'
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-display font-bold text-sm text-amber-400">
                        Competitivo · Duelo no Palco
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Quem responde certo mais rápido ganha bônus de velocidade e sobe no pódio.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onConfigureGame({ mode: 'COOPERATIVE' })}
                      className={`tv-focusable p-3.5 rounded-2xl border text-left transition-colors ${
                        roomState.settings.mode === 'COOPERATIVE'
                          ? 'bg-emerald-500/15 border-emerald-400 text-white'
                          : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-display font-bold text-sm text-emerald-400">
                        Cooperativo · Desafio da Família
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Todos os celulares somam pontos juntos para bater a meta de {roomState.teamTarget} pts!
                      </div>
                    </button>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Nível das Contas de Adição e Subtração
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        {
                          id: 'EASY',
                          title: 'Iniciante',
                          desc: 'Somas e subtrações até 20',
                        },
                        {
                          id: 'MEDIUM',
                          title: 'Intermediário',
                          desc: 'Dezenas até 100 e raciocínio rápido',
                        },
                        {
                          id: 'HARD',
                          title: 'Mestre do Cálculo',
                          desc: 'Centenas e expressões de 3 números',
                        },
                      ] as { id: DifficultyLevel; title: string; desc: string }[]
                    ).map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => onConfigureGame({ difficulty: lvl.id })}
                        className={`tv-focusable p-3 rounded-2xl border text-left transition-colors ${
                          roomState.settings.difficulty === lvl.id
                            ? 'bg-blue-600/25 border-blue-400 text-white'
                            : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-display font-bold text-sm">{lvl.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  {roomState.players.length === 0
                    ? 'Você pode iniciar agora mesmo ou conectar celulares primeiro.'
                    : `${roomState.players.length} competidor(es) prontos no palco!`}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playNewQuestion();
                    onStartGame();
                  }}
                  className="tv-focusable min-h-[54px] px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-base flex items-center gap-2.5 shadow-xl transition-transform active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Começar Show Agora (Enter)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. ACTIVE QUESTION OR ROUND REVEAL */}
        {(roomState.status === 'QUESTION_ACTIVE' ||
          roomState.status === 'ROUND_REVEAL' ||
          roomState.status === 'PAUSED') &&
          question && (
            <div className="my-auto max-w-5xl w-full mx-auto flex flex-col justify-between gap-5">
              {/* Top Question Telemetry Bar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-[#1E293B]/95 border border-slate-700">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-200 tabular-nums">
                  <span className="text-amber-400 font-display font-bold">
                    RODADA {question.roundNumber}/{question.totalRounds}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{question.categoryLabel}</span>
                </div>

                {roomState.settings.mode === 'COOPERATIVE' && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tabular-nums">
                    <span>Meta da Equipe:</span>
                    <strong className="font-mono text-sm">
                      {roomState.teamScore} / {roomState.teamTarget} pts
                    </strong>
                  </div>
                )}

                {/* Countdown Timer Readout */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Tempo:</span>
                  <span
                    className={`font-mono font-black text-2xl tabular-nums ${
                      remainingSec <= 5 && roomState.status === 'QUESTION_ACTIVE'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {roomState.status === 'ROUND_REVEAL' ? 'FIM' : `${remainingSec}s`}
                  </span>
                </div>
              </div>

              {/* Giant Broadcast Equation Screen */}
              <div className="rounded-3xl bg-[#0F172A]/95 border-2 border-slate-700 px-8 py-7 text-center shadow-2xl space-y-2">
                <div className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight text-white tabular-nums">
                  {question.expression} ={' '}
                  <span
                    className={
                      roomState.status === 'ROUND_REVEAL' ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {roomState.status === 'ROUND_REVEAL' ? question.correctAnswer : '?'}
                  </span>
                </div>

                {roomState.status === 'ROUND_REVEAL' ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-emerald-300 font-medium">
                    <span>💡 Dica de Cálculo Mental: {question.mentalMathTip}</span>
                    <button
                      type="button"
                      onClick={onNextRound}
                      className="tv-focusable px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs whitespace-nowrap"
                    >
                      Próxima Rodada (Enter)
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    Toque na alternativa correta no seu celular (ou pressione 1, 2, 3, 4 no controle)
                  </div>
                )}
              </div>

              {/* 4 Big Broadcast Answer Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {ANSWER_OPTIONS_META.map((meta) => {
                  const val = question.options[meta.index];
                  const isCorrect = question.correctIndex === meta.index;
                  const isRevealState = roomState.status === 'ROUND_REVEAL';

                  // Which players chose this option (only shown during ROUND_REVEAL!)
                  const choosers = isRevealState
                    ? roomState.players.filter((p) => p.currentAnswer === meta.index)
                    : [];

                  let cardAppearance = `${meta.bgClass} border-2 ${meta.borderClass} text-white`;
                  if (isRevealState) {
                    if (isCorrect) {
                      cardAppearance =
                        'bg-emerald-600 border-4 border-emerald-300 text-white scale-[1.03] shadow-2xl';
                    } else {
                      cardAppearance =
                        'bg-slate-900/80 border border-slate-800 text-slate-500 opacity-45';
                    }
                  }

                  return (
                    <button
                      key={meta.letter}
                      type="button"
                      disabled={roomState.status !== 'QUESTION_ACTIVE'}
                      onClick={() => {
                        soundEngine.playBuzzerLock(0);
                        onLocalTvAnswer(meta.index);
                      }}
                      className={`tv-focusable rounded-3xl p-5 flex flex-col justify-between min-h-[130px] transition-all ${cardAppearance}`}
                    >
                      <div className="w-full flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <span>{meta.shape}</span>
                          <span>ALTERNATIVA {meta.letter}</span>
                        </span>
                        {isRevealState && isCorrect && (
                          <span className="flex items-center gap-1 text-emerald-100">
                            <Check className="w-4 h-4" /> CORRETA
                          </span>
                        )}
                      </div>

                      <div className="font-mono font-black text-4xl lg:text-5xl tabular-nums my-2">
                        {val}
                      </div>

                      <div className="w-full min-h-[20px] flex items-center justify-between text-[11px] font-semibold">
                        {isRevealState ? (
                          choosers.length > 0 ? (
                            <span className="truncate">
                              Escolhido por: {choosers.map((c) => c.name).join(', ')}
                            </span>
                          ) : (
                            <span className="opacity-60">—</span>
                          )
                        ) : (
                          <span className="opacity-80">No celular: botão {meta.letter}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 4. GAME OVER / PODIUM CELEBRATION */}
        {roomState.status === 'GAME_OVER' && (
          <div className="my-auto max-w-4xl w-full mx-auto rounded-3xl bg-[#1E293B]/95 border-2 border-amber-400/60 p-8 text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-black text-4xl text-white">
                Grande Final do MathShow TV!
              </h2>
              <p className="text-sm text-slate-300">
                {roomState.settings.mode === 'COOPERATIVE'
                  ? roomState.teamScore >= roomState.teamTarget
                    ? `Meta da Equipe Batida com Sucesso! (${roomState.teamScore} de ${roomState.teamTarget} pts)`
                    : `Bom esforço da equipe! (${roomState.teamScore} de ${roomState.teamTarget} pts)`
                  : 'Confira a classificação final dos competidores:'}
              </p>
            </div>

            {/* Podium Ranking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {[...roomState.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => {
                  const avgSec =
                    p.totalAnswered > 0
                      ? (p.totalAnswerTimeMs / p.totalAnswered / 1000).toFixed(1)
                      : '0.0';
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border ${
                        idx === 0
                          ? 'bg-amber-500/15 border-amber-400'
                          : 'bg-[#0F172A] border-slate-800'
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-lg text-amber-400">
                          #{idx + 1} Lugar
                        </span>
                        {idx === 0 && <Crown className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <AvatarIcon avatarId={p.avatarId} className="w-9 h-9 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-base text-white truncate">
                            {p.name}
                          </div>
                          <div className="font-mono font-extrabold text-lg text-emerald-400 tabular-nums">
                            {p.score} pts
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 tabular-nums">
                        Acertos: {p.correctCount}/{roomState.settings.totalRounds} · Média: {avgSec}s
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={onRestartGame}
                className="tv-focusable min-h-[52px] px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-base flex items-center gap-2.5 shadow-xl transition-transform active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Jogar Novamente (Enter)</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM STAGE PEDESTALS (1 to 4 Connected Phone Controllers) */}
        <section
          aria-label="Pedestais dos Jogadores"
          className="grid grid-cols-4 gap-4 pt-2"
        >
          {[0, 1, 2, 3].map((slotIdx) => {
            const player = roomState.players.find((p) => p.slotIndex === slotIdx);
            const fallbackAvatar = PLAYER_AVATARS[slotIdx];

            if (!player) {
              return (
                <div
                  key={slotIdx}
                  className="rounded-2xl bg-[#0F172A]/80 border border-dashed border-slate-800 p-3 flex items-center justify-between text-slate-500"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold">
                      P{slotIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-400 truncate">
                        Pedestal {slotIdx + 1} Livre
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        PIN {roomState.code} no celular
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
                className={`rounded-2xl p-3 border-2 transition-all flex items-center justify-between gap-2 ${
                  isReveal
                    ? isRight
                      ? 'bg-emerald-950/90 border-emerald-400'
                      : 'bg-rose-950/80 border-rose-500/70'
                    : lockedIn
                    ? 'bg-[#1E293B] border-amber-400 shadow-lg'
                    : 'bg-[#1E293B]/90 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AvatarIcon avatarId={player.avatarId || fallbackAvatar.id} className="w-10 h-10 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white truncate">
                        {player.name}
                      </span>
                      {player.streak >= 2 && (
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          🔥{player.streak}x
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 tabular-nums">
                      {isReveal ? (
                        isRight ? (
                          <span className="text-emerald-400 font-semibold">
                            +{player.lastPointsEarned} pts
                          </span>
                        ) : (
                          <span className="text-rose-300">Errou</span>
                        )
                      ) : lockedIn ? (
                        <span className="text-amber-400 font-semibold">✓ Pronto!</span>
                      ) : roomState.status === 'QUESTION_ACTIVE' ? (
                        <span className="text-slate-400">Calculando...</span>
                      ) : (
                        <span className="text-emerald-400">Conectado</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400">SCORE</div>
                  <div className="font-mono font-extrabold text-base text-white tabular-nums">
                    {player.score}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* PAUSE MODAL OVERLAY */}
      {roomState.status === 'PAUSED' && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-[#1E293B] border-2 border-amber-400 p-6 text-center space-y-5 shadow-2xl">
            <h2 className="font-display font-black text-3xl text-white">Partida Pausada</h2>
            <p className="text-sm text-slate-300">
              O cronômetro da rodada está congelado. Todos os celulares permanecem conectados na
              sala <strong>{roomState.code}</strong>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onTogglePause}
                className="tv-focusable w-full min-h-[48px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-base"
              >
                Continuar Partida (Enter)
              </button>
              <button
                type="button"
                onClick={onRestartGame}
                className="tv-focusable w-full min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-semibold text-sm"
              >
                Reiniciar no Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUILT-IN PIP VIRTUAL SMARTPHONE CONTROLLER (For instant single-screen testing) */}
      {showVirtualPhone && (
        <aside
          aria-label="Simulador de Controle no Celular"
          className="fixed bottom-4 right-4 z-40 w-[350px] h-[600px] max-h-[86vh] rounded-[32px] bg-[#080D1E] border-4 border-slate-600 shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Controle Celular (Simulador)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowVirtualPhone(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
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
