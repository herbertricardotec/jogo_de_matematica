import React, { useEffect, useState } from 'react';
import {
  Award,
  Crown,
  Medal,
  Music,
  Play,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  DifficultyLevel,
  LearningModuleId,
  LEARNING_MODULES,
  AchievementMedalId,
  RoomState,
  evaluatePlayerMedals,
} from '../types/game.ts';
import { AvatarIcon } from './AvatarIcon.tsx';
import { soundEngine } from '../utils/sound.ts';

const LEADERBOARD_STORAGE_KEY = 'mathshow_highscore_leaderboard_v1';
const LAST_RECORDED_MATCH_KEY = 'mathshow_last_recorded_match_sig';

export interface HighScoreEntry {
  id: string;
  playerName: string;
  avatarId: string;
  score: number;
  stars: number;
  correctCount: number;
  totalRounds: number;
  accuracyPct: number;
  moduleId: LearningModuleId;
  difficulty: DifficultyLevel;
  medals: AchievementMedalId[];
  isBot?: boolean;
  playedAt: number;
}

export interface CumulativePlayerRank {
  playerName: string;
  avatarId: string;
  bestScore: number;
  totalScore: number;
  totalStars: number;
  matchesPlayed: number;
  avgAccuracyPct: number;
  totalMedals: number;
  isBot?: boolean;
  lastPlayedAt: number;
}

export function loadHighScoreEntries(): HighScoreEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HighScoreEntry[];
  } catch {
    return [];
  }
}

export function saveHighScoreEntries(entries: HighScoreEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearHighScoreEntries(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    window.localStorage.removeItem(LAST_RECORDED_MATCH_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Persists all players' results from a finished match into browser localStorage.
 * Deduplicates using the room code + gameOverStartedAt timestamp so a single match is never saved twice.
 */
export function recordMatchResultsToLeaderboard(roomState: RoomState): HighScoreEntry[] {
  if (typeof window === 'undefined') return [];
  if (roomState.status !== 'GAME_OVER' || roomState.players.length === 0) {
    return loadHighScoreEntries();
  }

  const matchSignature = `${roomState.code}_${roomState.gameOverStartedAt || roomState.currentQuestion?.roundNumber || 0}_${roomState.players
    .map((p) => `${p.id}:${p.score}`)
    .join('|')}`;

  try {
    const lastSig = window.localStorage.getItem(LAST_RECORDED_MATCH_KEY);
    if (lastSig === matchSignature) {
      return loadHighScoreEntries();
    }
    window.localStorage.setItem(LAST_RECORDED_MATCH_KEY, matchSignature);
  } catch {
    // Continue
  }

  const existing = loadHighScoreEntries();
  const now = Date.now();
  const totalRounds = Math.max(1, roomState.settings.totalRounds);

  const newEntries: HighScoreEntry[] = roomState.players.map((p) => {
    const denominator = Math.max(1, p.totalAnswered || totalRounds);
    const accuracyPct = Math.min(100, Math.round((p.correctCount / denominator) * 100));
    const medals =
      p.medals && p.medals.length > 0 ? p.medals : evaluatePlayerMedals(p, totalRounds);

    return {
      id: `hs_${now}_${p.id}_${Math.random().toString(36).slice(2, 6)}`,
      playerName: p.name,
      avatarId: p.avatarId,
      score: p.score,
      stars: p.stars,
      correctCount: p.correctCount,
      totalRounds,
      accuracyPct,
      moduleId: roomState.settings.moduleId,
      difficulty: roomState.settings.difficulty,
      medals,
      isBot: p.isBot,
      playedAt: now,
    };
  });

  const combined = [...newEntries, ...existing].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.stars !== a.stars) return b.stars - a.stars;
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    return b.playedAt - a.playedAt;
  });

  const trimmed = combined.slice(0, 40);
  saveHighScoreEntries(trimmed);
  return trimmed;
}

export function computeCumulativePlayerRanks(entries: HighScoreEntry[]): CumulativePlayerRank[] {
  const map = new Map<
    string,
    {
      playerName: string;
      avatarId: string;
      bestScore: number;
      totalScore: number;
      totalStars: number;
      matchesPlayed: number;
      sumAccuracy: number;
      totalMedals: number;
      isBot?: boolean;
      lastPlayedAt: number;
    }
  >();

  entries.forEach((entry) => {
    const key = entry.playerName.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        playerName: entry.playerName,
        avatarId: entry.avatarId,
        bestScore: entry.score,
        totalScore: entry.score,
        totalStars: entry.stars,
        matchesPlayed: 1,
        sumAccuracy: entry.accuracyPct,
        totalMedals: entry.medals?.length || 0,
        isBot: entry.isBot,
        lastPlayedAt: entry.playedAt,
      });
    } else {
      existing.bestScore = Math.max(existing.bestScore, entry.score);
      existing.totalScore += entry.score;
      existing.totalStars += entry.stars;
      existing.matchesPlayed += 1;
      existing.sumAccuracy += entry.accuracyPct;
      existing.totalMedals += entry.medals?.length || 0;
      if (entry.playedAt >= existing.lastPlayedAt) {
        existing.lastPlayedAt = entry.playedAt;
        existing.avatarId = entry.avatarId;
      }
    }
  });

  return Array.from(map.values())
    .map((item) => ({
      playerName: item.playerName,
      avatarId: item.avatarId,
      bestScore: item.bestScore,
      totalScore: item.totalScore,
      totalStars: item.totalStars,
      matchesPlayed: item.matchesPlayed,
      avgAccuracyPct: Math.round(item.sumAccuracy / Math.max(1, item.matchesPlayed)),
      totalMedals: item.totalMedals,
      isBot: item.isBot,
      lastPlayedAt: item.lastPlayedAt,
    }))
    .sort((a, b) => {
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.totalStars - a.totalStars;
    });
}

/**
 * Global Sound Settings Toggle (Independent Background Music & Sound Effects Mute/Unmute)
 */
export const GlobalSoundSettingsToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [sfxMuted, setSfxMuted] = useState<boolean>(soundEngine.isSfxMuted());
  const [bgmMuted, setBgmMuted] = useState<boolean>(soundEngine.isBgmMuted());

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((state) => {
      setSfxMuted(state.sfxMuted);
      setBgmMuted(state.bgmMuted);
    });
    return unsubscribe;
  }, []);

  const handleToggleBgm = () => {
    soundEngine.toggleBgmMute();
  };

  const handleToggleSfx = () => {
    soundEngine.toggleSfxMute();
  };

  return (
    <div
      role="group"
      aria-label="Configurações Globais de Áudio (Música e Efeitos Sonoros)"
      className="inline-flex items-center gap-1.5 bg-[#0F172A] border border-white/25 rounded-xl p-1 shrink-0"
    >
      {/* Independent Background Music Toggle */}
      <button
        type="button"
        data-tv-focusable="true"
        onClick={handleToggleBgm}
        title={bgmMuted ? 'Ativar Música de Fundo' : 'Silenciar Música de Fundo'}
        aria-pressed={!bgmMuted}
        className={`tv-focusable min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
          bgmMuted
            ? 'bg-slate-800/90 text-slate-400 hover:text-white border border-slate-700'
            : 'bg-[#A855F7] text-white border border-white/50 shadow-sm'
        }`}
      >
        <Music className={`w-3.5 h-3.5 ${bgmMuted ? 'text-rose-400 opacity-75' : 'text-[#FFD600]'}`} />
        {!compact && <span>{bgmMuted ? 'Música Off' : 'Música On'}</span>}
      </button>

      {/* Independent Sound Effects (SFX) Toggle */}
      <button
        type="button"
        data-tv-focusable="true"
        onClick={handleToggleSfx}
        title={sfxMuted ? 'Ativar Efeitos Sonoros (SFX)' : 'Silenciar Efeitos Sonoros (SFX)'}
        aria-pressed={!sfxMuted}
        className={`tv-focusable min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
          sfxMuted
            ? 'bg-slate-800/90 text-slate-400 hover:text-white border border-slate-700'
            : 'bg-[#22C55E] text-white border border-white/50 shadow-sm'
        }`}
      >
        {sfxMuted ? (
          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-white" />
        )}
        {!compact && <span>{sfxMuted ? 'Efeitos Off' : 'Efeitos On'}</span>}
      </button>
    </div>
  );
};

interface HighScoreLeaderboardModalProps {
  entries: HighScoreEntry[];
  onClearEntries: () => void;
  onClose?: () => void;
  onStartPlay?: () => void;
  isEmbeddedInAdmin?: boolean;
}

export const HighScoreLeaderboardView: React.FC<HighScoreLeaderboardModalProps> = ({
  entries,
  onClearEntries,
  onClose,
  onStartPlay,
  isEmbeddedInAdmin = false,
}) => {
  const [viewMode, setViewMode] = useState<'BEST_MATCHES' | 'CUMULATIVE'>('BEST_MATCHES');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const cumulativeRanks = computeCumulativePlayerRanks(entries);

  const formatModuleLabel = (modId: LearningModuleId) => {
    const found = LEARNING_MODULES.find((m) => m.id === modId);
    return found ? `${found.numberLabel}` : modId;
  };

  const formatDifficultyLabel = (diff: DifficultyLevel) => {
    if (diff === 'EASY') return 'Fácil';
    if (diff === 'MEDIUM') return 'Médio';
    return 'Mestre';
  };

  return (
    <div className="flex flex-col justify-between gap-2.5 h-full min-h-0">
      {/* Top Toolbar */}
      <div className="rounded-2xl bg-[#071936] border border-white/15 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFD600]/20 border border-[#FFD600] flex items-center justify-center text-[#FFD600] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-[#FFD600]">
              Hall da Fama Persistente · Salvo no Navegador (localStorage)
            </div>
            <h3 className="font-display font-black text-sm sm:text-base text-white leading-tight">
              Ranking de Recordes &amp; Histórico de Sessões ({entries.length} registros)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-tv-focusable="true"
            onClick={() => {
              soundEngine.playTick();
              setViewMode('BEST_MATCHES');
            }}
            className={`tv-focusable min-h-[34px] px-3 py-1 rounded-xl font-display font-black text-xs border-2 transition-all ${
              viewMode === 'BEST_MATCHES'
                ? 'bg-[#FFD600] text-slate-950 border-white'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            🏆 Melhores Partidas (Top Scores)
          </button>

          <button
            type="button"
            data-tv-focusable="true"
            onClick={() => {
              soundEngine.playTick();
              setViewMode('CUMULATIVE');
            }}
            className={`tv-focusable min-h-[34px] px-3 py-1 rounded-xl font-display font-black text-xs border-2 transition-all ${
              viewMode === 'CUMULATIVE'
                ? 'bg-[#22C55E] text-white border-white'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            ⭐ Ranking Acumulado (Múltiplas Sessões)
          </button>

          {entries.length > 0 && (
            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => {
                soundEngine.playTick();
                if (!confirmClear) {
                  setConfirmClear(true);
                  return;
                }
                onClearEntries();
                setConfirmClear(false);
              }}
              className="tv-focusable min-h-[34px] px-3 py-1 rounded-xl bg-rose-600/90 hover:bg-rose-500 border border-white/40 text-white text-xs font-black flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Confirmar Limpeza?' : 'Zerar Recordes'}</span>
            </button>
          )}

          {onStartPlay && (
            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => {
                soundEngine.playPlayerJoin();
                onStartPlay();
              }}
              className="tv-focusable cube-3d min-h-[34px] px-4 py-1 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white text-xs font-display font-black flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>JOGAR</span>
            </button>
          )}

          {!isEmbeddedInAdmin && onClose && (
            <button
              type="button"
              data-tv-focusable="true"
              onClick={onClose}
              className="tv-focusable min-h-[34px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/30 text-white text-xs font-black flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fechar</span>
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Body */}
      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-2xl bg-[#071936] border-2 border-dashed border-white/20 p-6 space-y-2">
          <Trophy className="w-10 h-10 text-[#FFD600]" />
          <div className="font-display font-black text-base text-white">
            Nenhum recorde registrado ainda neste dispositivo
          </div>
          <p className="text-xs text-sky-200 max-w-md">
            Complete uma partida até o pódio final para que as pontuações, estrelas e medalhas 3D
            dos jogadores fiquem salvas automaticamente entre sessões!
          </p>
        </div>
      ) : viewMode === 'BEST_MATCHES' ? (
        <div className="flex-1 grid grid-cols-2 gap-2.5 overflow-y-auto pr-1 content-start min-h-0">
          {entries.slice(0, 12).map((entry, idx) => {
            const isTop3 = idx < 3;
            const rankBadgeColors = [
              'bg-[#FFD600] text-slate-950 border-white',
              'bg-slate-200 text-slate-950 border-white',
              'bg-amber-600 text-white border-white',
            ];

            return (
              <div
                key={entry.id}
                className={`rounded-2xl px-3.5 py-2.5 border-2 flex items-center justify-between gap-3 ${
                  idx === 0
                    ? 'bg-gradient-to-r from-[#007AFF]/40 to-[#0F172A] border-[#FFD600]'
                    : 'bg-[#071936] border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl font-display font-black text-xs flex items-center justify-center border-2 shrink-0 ${
                      isTop3
                        ? rankBadgeColors[idx]
                        : 'bg-slate-900 text-sky-300 border-slate-700'
                    }`}
                  >
                    #{idx + 1}
                  </div>

                  <AvatarIcon avatarId={entry.avatarId} className="w-11 h-11 shrink-0" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-sm text-white truncate">
                        {entry.playerName}
                      </span>
                      {idx === 0 && <Crown className="w-4 h-4 text-[#FFD600] shrink-0" />}
                      {entry.isBot && (
                        <span className="px-1.5 py-0.5 rounded bg-[#A855F7]/30 border border-[#A855F7] text-[9px] font-black text-purple-200">
                          🤖 Máquina
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-sky-300 tabular-nums">
                      <span>
                        {formatModuleLabel(entry.moduleId)} ({formatDifficultyLabel(entry.difficulty)})
                      </span>
                      <span>·</span>
                      <span>
                        Acertos: <strong className="text-white">{entry.accuracyPct}%</strong> (
                        {entry.correctCount}/{entry.totalRounds})
                      </span>
                      {entry.medals && entry.medals.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[#FFD600] flex items-center gap-0.5">
                            <Award className="w-3 h-3" /> {entry.medals.length} med.
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 tabular-nums">
                  <div className="font-mono font-black text-lg text-[#22C55E] leading-tight">
                    {entry.score} pts
                  </div>
                  <div className="text-[11px] font-black text-[#FFD600]">
                    ⭐ {entry.stars} Estrelas
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 gap-2.5 overflow-y-auto pr-1 content-start min-h-0">
          {cumulativeRanks.slice(0, 12).map((player, idx) => (
            <div
              key={player.playerName}
              className={`rounded-2xl px-3.5 py-2.5 border-2 flex items-center justify-between gap-3 ${
                idx === 0
                  ? 'bg-gradient-to-r from-[#22C55E]/30 to-[#0F172A] border-[#FFD600]'
                  : 'bg-[#071936] border-white/20'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl font-display font-black text-xs flex items-center justify-center border-2 shrink-0 ${
                    idx === 0
                      ? 'bg-[#FFD600] text-slate-950 border-white'
                      : 'bg-slate-900 text-sky-300 border-slate-700'
                  }`}
                >
                  #{idx + 1}
                </div>

                <AvatarIcon avatarId={player.avatarId} className="w-11 h-11 shrink-0" />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-sm text-white truncate">
                      {player.playerName}
                    </span>
                    {idx === 0 && <Sparkles className="w-4 h-4 text-[#FFD600] shrink-0" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-sky-300 tabular-nums">
                    <span>
                      Partidas: <strong className="text-white">{player.matchesPlayed}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Precisão Média: <strong className="text-[#FFD600]">{player.avgAccuracyPct}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Total Acumulado: <strong className="text-emerald-300">{player.totalScore} pts</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <div className="text-[10px] font-bold text-sky-200 uppercase">Recorde Pessoal</div>
                <div className="font-mono font-black text-lg text-[#22C55E] leading-tight">
                  {player.bestScore} pts
                </div>
                <div className="text-[11px] font-black text-[#FFD600]">
                  ⭐ {player.totalStars} · 🏅 {player.totalMedals}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Attract Mode Records Display for Idle Rotation on Title Screen
 * Dimensions & structure match KidsMathSplashHero so the JOGAR button below sits at the exact same location!
 */
export const AttractRecordsHero: React.FC<{
  entries: HighScoreEntry[];
  className?: string;
}> = ({ entries, className = 'w-full max-w-3xl' }) => {
  const top4 = entries.slice(0, 4);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Top Balloon Banner ("HALL DA FAMA · RECORDES DA SALA") — Matches KidsMathSplashHero banner */}
      <div className="relative z-10 w-full max-w-2xl px-6 sm:px-8 py-3 sm:py-3.5 rounded-[28px] bg-gradient-to-b from-[#007AFF] via-[#0284C7] to-[#0369A1] border-4 border-white shadow-[0_6px_0_#075985,0_12px_24px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
        {/* Left 3D Trophy */}
        <div className="hidden sm:flex flex-col items-center gap-1 shrink-0" aria-hidden="true">
          <div className="w-11 h-11 rounded-2xl bg-[#FFD600] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-slate-950 -rotate-6 shadow-md">
            🏆
          </div>
          <span className="text-[10px] font-black text-yellow-300">TOP 1</span>
        </div>

        {/* Center Title */}
        <div className="flex flex-col items-center text-center mx-auto">
          <span className="inline-block px-3.5 py-0.5 rounded-full bg-slate-950/35 border border-white/30 title-3d-white font-display font-black text-xs sm:text-sm lg:text-base tracking-widest uppercase leading-tight">
            HALL DA FAMA · SALVAMENTO LOCAL
          </span>
          <h2 className="mt-0.5 title-3d-yellow font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]">
            Recordes da Sala
          </h2>
        </div>

        {/* Right 3D Star Badge */}
        <div className="hidden sm:flex flex-col items-center gap-1 shrink-0" aria-hidden="true">
          <div className="w-11 h-11 rounded-2xl bg-[#22C55E] border-2 border-white cube-3d flex items-center justify-center font-display font-black text-xl text-white rotate-6 shadow-md">
            ⭐
          </div>
          <span className="text-[10px] font-black text-emerald-300">{entries.length} Jogos</span>
        </div>
      </div>

      {/* 3D Scene / Records Cards container matching KidsMathSplashHero */}
      <div className="mt-2.5 w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#0F172A]/90 to-[#1E293B]/95 border-3 border-white/30 px-5 pt-3 pb-3 panel-3d flex flex-col justify-center relative overflow-hidden min-h-[178px]">
        {top4.length === 0 ? (
          <div className="flex items-center justify-around gap-4 py-1 z-10">
            <div className="flex flex-col items-center">
              <AvatarIcon
                avatarId="leo_infantil_m|#F97316|none"
                className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md"
              />
              <span className="text-xs font-bold text-sky-200 mt-0.5">Ricardo</span>
            </div>
            <div className="flex flex-col items-center text-center max-w-xs space-y-1">
              <div className="text-sm font-black text-[#FFD600] flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FFD600]" />
                <span>Nenhum Recorde Gravado</span>
              </div>
              <p className="text-xs text-sky-200 leading-snug">
                Complete uma rodada para cravar sua pontuação e estrelas no Hall da Fama!
              </p>
              <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide">
                ⭐ Salvo automaticamente entre sessões
              </div>
            </div>
            <div className="flex flex-col items-center">
              <AvatarIcon
                avatarId="bia_infantil_f|#EC4899|none"
                className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md"
              />
              <span className="text-xs font-bold text-pink-200 mt-0.5">Vania</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 z-10">
            {top4.map((entry, idx) => {
              const rankMedals = ['🥇 #1', '🥈 #2', '🥉 #3', '🎖️ #4'];
              const borderStyles = [
                'border-[#FFD600] bg-gradient-to-r from-[#FFD600]/20 to-[#0F172A]',
                'border-slate-300/80 bg-gradient-to-r from-slate-300/15 to-[#0F172A]',
                'border-amber-600/80 bg-gradient-to-r from-amber-600/15 to-[#0F172A]',
                'border-sky-500/50 bg-[#071936]',
              ];

              return (
                <div
                  key={entry.id}
                  className={`rounded-2xl px-3 py-1.5 border-2 flex items-center justify-between gap-2 shadow-sm ${
                    borderStyles[idx] || 'border-white/20 bg-[#071936]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-black shrink-0 tabular-nums">
                      {rankMedals[idx] || `#${idx + 1}`}
                    </span>
                    <AvatarIcon
                      avatarId={entry.avatarId}
                      className="w-9 h-9 shrink-0 drop-shadow"
                    />
                    <div className="min-w-0">
                      <div className="font-display font-black text-xs text-white truncate leading-tight">
                        {entry.playerName}
                      </div>
                      <div className="text-[10px] text-sky-300 font-bold tabular-nums">
                        {entry.accuracyPct}% acertos
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 tabular-nums">
                    <div className="font-mono font-black text-sm text-[#22C55E] leading-tight">
                      {entry.score} pts
                    </div>
                    <div className="text-[10px] font-black text-[#FFD600]">
                      ⭐ {entry.stars}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Warm Wooden Table Base Strip */}
        <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#B45309] via-[#EAB308] to-[#B45309]" />
      </div>
    </div>
  );
};

