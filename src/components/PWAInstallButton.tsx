import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Download, Maximize2, Minimize2, Tv, X } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isFullscreen, install, toggleFullscreen } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        {!isInstalled && (
          <button
            type="button"
            data-tv-focusable="true"
            onClick={handleInstallClick}
            title="Instalar Aplicativo PWA na TV ou Celular"
            className={`tv-focusable cube-3d rounded-xl bg-[#22C55E] hover:bg-[#16A34A] border-2 border-white text-white font-display font-black text-[11px] flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              compact ? 'min-h-[36px] px-2.5 py-1' : 'min-h-[36px] px-3 py-1'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{compact ? 'Instalar' : 'Instalar App (PWA)'}</span>
          </button>
        )}

        {!compact && (
          <button
            type="button"
            data-tv-focusable="true"
            onClick={toggleFullscreen}
            title="Alternar Tela Cheia na Fire TV"
            className="tv-focusable min-h-[36px] min-w-[36px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {showGuideModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0F172A] border-3 border-[#FFD600] p-5 text-left space-y-3.5 panel-3d">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#FFD600]">
                <Tv className="w-6 h-6" />
                <h3 className="font-display font-black text-xl text-white">
                  Instalar App na TV ou Celular
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2 text-xs sm:text-sm text-sky-100 font-semibold bg-slate-900 p-4 rounded-2xl border border-white/15">
                <p className="text-[#FFD600] font-black">No iPhone / iPad (Safari):</p>
                <p>
                  1. Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.
                </p>
                <p>
                  2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm text-sky-100 font-semibold">
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/15 space-y-1">
                  <div className="text-[#FFD600] font-black">
                    📺 Na Amazon Fire TV Stick (Navegador Silk):
                  </div>
                  <p>
                    1. Pressione o botão <strong>Menu (☰)</strong> no controle da Fire TV.
                  </p>
                  <p>
                    2. Selecione <strong>Adicionar aos Favoritos</strong> e ative o modo{' '}
                    <strong>Tela Cheia</strong>.
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/15 space-y-1">
                  <div className="text-[#22C55E] font-black">
                    📱 No Celular Android / Chrome:
                  </div>
                  <p>
                    1. Toque no menu <strong>⋮ (3 pontos)</strong> do navegador.
                  </p>
                  <p>
                    2. Toque em <strong>Instalar aplicativo</strong> ou{' '}
                    <strong>Adicionar à tela inicial</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => setShowGuideModal(false)}
              className="tv-focusable cube-3d w-full min-h-[48px] rounded-2xl bg-[#007AFF] hover:bg-[#0284C7] border-2 border-white text-white font-display font-black text-sm"
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
