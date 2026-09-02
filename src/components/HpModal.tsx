import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Flame, X, Delete, Heart, RotateCcw } from "lucide-react";

interface HpModalProps {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  onUpdateHp: (current: number, temp: number) => void;
  onClose: () => void;
}

export default function HpModal({ currentHp, maxHp, tempHp, onUpdateHp, onClose }: HpModalProps) {
  const [valueStr, setValueStr] = useState("");

  const handleNumClick = (num: string) => {
    if (valueStr.length < 3) {
      if (valueStr === "0") {
        setValueStr(num);
      } else {
        setValueStr((prev) => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    setValueStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setValueStr("");
  };

  const handleAddPreset = (amount: number) => {
    const currentVal = parseInt(valueStr) || 0;
    const nextVal = Math.min(999, Math.max(0, currentVal + amount));
    setValueStr(nextVal.toString());
  };

  const handleSetMaxHp = () => {
    setValueStr(maxHp.toString());
  };

  const value = parseInt(valueStr) || 0;

  // D&D 5E Damage resolution: Temp HP absorbs damage first, then current HP
  const handleDamage = () => {
    if (value <= 0) return;
    
    let remainingDamage = value;
    let newTempHp = tempHp;
    let newCurrentHp = currentHp;

    if (newTempHp > 0) {
      if (newTempHp >= remainingDamage) {
        newTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newTempHp;
        newTempHp = 0;
      }
    }

    if (remainingDamage > 0) {
      newCurrentHp = Math.max(0, newCurrentHp - remainingDamage);
    }

    onUpdateHp(newCurrentHp, newTempHp);
    onClose();
  };

  // D&D 5E Heal resolution: Capped at maxHp
  const handleHeal = () => {
    if (value <= 0) return;
    const newCurrentHp = Math.min(maxHp, currentHp + value);
    onUpdateHp(newCurrentHp, tempHp);
    onClose();
  };

  // D&D 5E Temp HP resolution: Sets to new amount
  const handleTempHp = () => {
    if (value < 0) return;
    onUpdateHp(currentHp, value);
    onClose();
  };

  // Full Heal quick action
  const handleFullHeal = () => {
    onUpdateHp(maxHp, tempHp);
    onClose();
  };

  // Real-time damage simulation
  const simulatedDamage = () => {
    let dmg = value;
    let t = tempHp;
    let c = currentHp;
    if (t > 0) {
      if (t >= dmg) {
        t -= dmg;
        dmg = 0;
      } else {
        dmg -= t;
        t = 0;
      }
    }
    if (dmg > 0) {
      c = Math.max(0, c - dmg);
    }
    return { c, t };
  };

  const simDmg = simulatedDamage();
  const simHealHp = Math.min(maxHp, currentHp + value);

  const isLowHp = currentHp <= maxHp * 0.4;
  const currentPct = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));
  const simDmgPct = Math.min(100, Math.max(0, (simDmg.c / maxHp) * 100));
  const simHealPct = Math.min(100, Math.max(0, (simHealHp / maxHp) * 100));

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="w-full max-w-md bg-fantasy-slate-900 border-t sm:border border-red-900/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col safe-bottom"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Sheet Drag Pill Handle */}
          <div className="w-12 h-1 bg-stone-700/70 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-fantasy-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-fantasy-crimson-light">
                <Heart className={`w-4 h-4 ${isLowHp ? "animate-pulse fill-red-500" : ""}`} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-display text-white tracking-wide flex items-center gap-1.5">
                  Pontos de Vida
                  <span className="text-[10px] font-mono text-stone-400 font-normal">
                    (HP)
                  </span>
                </h3>
                <p className="text-[10px] font-mono text-stone-400">
                  Percival • Paladino Nv. 5
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-fantasy-slate-800 hover:bg-fantasy-slate-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors touch-manipulation active:scale-95 border border-fantasy-slate-700/50"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* HP Live Status & Simulation Gauge */}
          <div className="p-4 bg-fantasy-slate-950/70 border-b border-fantasy-slate-800/80 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs uppercase tracking-wider font-bold text-stone-400 font-mono">
                  PV Atual:
                </span>
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isLowHp ? "text-red-400 blood-glow-text" : "text-white"}`}>
                  {currentHp}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  / {maxHp}
                </span>
              </div>

              {tempHp > 0 && (
                <div className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  +{tempHp} Temp
                </div>
              )}
            </div>

            {/* Health Bar with Ghost Simulation Layer */}
            <div className="relative w-full h-3 bg-fantasy-slate-900 rounded-full overflow-hidden border border-fantasy-slate-800">
              {/* Simulated Heal Ghost */}
              {value > 0 && simHealPct > currentPct && (
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/50 transition-all duration-200"
                  style={{ width: `${simHealPct}%` }}
                />
              )}

              {/* Current HP Bar */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                  isLowHp
                    ? "bg-gradient-to-r from-red-950 to-red-500"
                    : "bg-gradient-to-r from-red-800 via-rose-600 to-red-500"
                }`}
                style={{ width: `${currentPct}%` }}
              />

              {/* Simulated Damage Ghost (dark overlay showing loss) */}
              {value > 0 && (
                <div
                  className="absolute inset-y-0 bg-red-950/90 border-l border-red-400/80 transition-all duration-200"
                  style={{
                    left: `${simDmgPct}%`,
                    width: `${Math.max(0, currentPct - simDmgPct)}%`
                  }}
                />
              )}
            </div>

            {/* Real-time simulation feedback badges */}
            {value > 0 ? (
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-rose-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Dano resulta em: <strong className="font-bold text-white">{simDmg.c} PV</strong>
                  {simDmg.t > 0 ? ` (+${simDmg.t} Temp)` : ""}
                </span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Cura resulta em: <strong className="font-bold text-white">{simHealHp} PV</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                <span>Toque no teclado ou atalhos para calcular</span>
                <button
                  onClick={handleFullHeal}
                  className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 touch-manipulation"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Curar Tudo ({maxHp} PV)
                </button>
              </div>
            )}
          </div>

          {/* Input Readout & Quick Adjustment Chips */}
          <div className="px-4 py-3 bg-fantasy-slate-900 border-b border-fantasy-slate-800 flex items-center justify-between gap-3">
            {/* Input Value Display Box */}
            <div className="flex-1 bg-fantasy-slate-950/80 border border-fantasy-gold/30 rounded-2xl px-3.5 py-2 flex items-center justify-between shadow-inner">
              <span className="text-[10px] uppercase tracking-wider font-bold text-fantasy-gold-light font-mono">
                Valor:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-fantasy-gold">
                  {valueStr || "0"}
                </span>
                <span className="text-xs font-mono text-stone-400">PV</span>
              </div>
              {valueStr ? (
                <button
                  onClick={handleClear}
                  className="p-1 rounded-lg text-stone-400 hover:text-rose-400 transition-colors touch-manipulation"
                  aria-label="Limpar valor"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-4" />
              )}
            </div>

            {/* Fast Preset Chips */}
            <div className="flex gap-1.5 shrink-0">
              {[1, 5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAddPreset(amt)}
                  className="h-10 px-2.5 rounded-xl bg-fantasy-slate-800 hover:bg-fantasy-slate-750 active:bg-fantasy-slate-700 text-stone-200 text-xs font-mono font-bold border border-fantasy-slate-700/60 active:scale-95 touch-manipulation transition-all flex items-center justify-center"
                >
                  +{amt}
                </button>
              ))}
              <button
                onClick={handleSetMaxHp}
                className="h-10 px-2.5 rounded-xl bg-fantasy-slate-800 hover:bg-fantasy-slate-750 active:bg-fantasy-slate-700 text-fantasy-gold-light text-xs font-mono font-bold border border-fantasy-gold/25 active:scale-95 touch-manipulation transition-all flex items-center justify-center"
                title="Preencher com PV Máximo"
              >
                Máx
              </button>
            </div>
          </div>

          {/* Numeric Keypad (46px touch targets for mobile thumbs) */}
          <div className="p-4 grid grid-cols-3 gap-2 bg-fantasy-slate-900/60">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num)}
                className="h-12 bg-fantasy-slate-800/80 hover:bg-fantasy-slate-750 active:bg-fantasy-slate-700 rounded-xl text-lg font-bold font-mono text-stone-100 border border-fantasy-slate-700/50 active:scale-95 touch-manipulation transition-all flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-12 bg-fantasy-slate-800/40 hover:bg-rose-950/30 active:bg-rose-950/60 border border-fantasy-slate-700/50 hover:border-rose-900/50 rounded-xl text-xs font-bold text-rose-300 font-mono flex items-center justify-center active:scale-95 touch-manipulation transition-all"
            >
              LIMPAR
            </button>
            <button
              onClick={() => handleNumClick("0")}
              className="h-12 bg-fantasy-slate-800/80 hover:bg-fantasy-slate-750 active:bg-fantasy-slate-700 rounded-xl text-lg font-bold font-mono text-stone-100 border border-fantasy-slate-700/50 active:scale-95 touch-manipulation transition-all flex items-center justify-center shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-12 bg-fantasy-slate-800/40 hover:bg-fantasy-slate-750 active:bg-fantasy-slate-700 border border-fantasy-slate-700/50 rounded-xl font-mono flex items-center justify-center active:scale-95 touch-manipulation transition-all text-stone-300"
              aria-label="Apagar dígito"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Action Trigger Buttons (Within thumb reach with safe bottom margin) */}
          <div className="p-4 pt-1 space-y-2.5 bg-fantasy-slate-900">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDamage}
                disabled={value <= 0}
                className="h-13 px-4 bg-gradient-to-r from-red-800 via-fantasy-crimson to-red-700 hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-red-950/60 border border-red-500/30 touch-manipulation transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide uppercase">
                  <Flame className="w-4 h-4 text-red-200" />
                  Dano
                </div>
                {value > 0 && (
                  <span className="text-[10px] font-mono text-rose-200 font-normal">
                    -{value} PV
                  </span>
                )}
              </button>

              <button
                onClick={handleHeal}
                disabled={value <= 0}
                className="h-13 px-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-500 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-emerald-950/60 border border-emerald-400/30 touch-manipulation transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide uppercase">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  Cura
                </div>
                {value > 0 && (
                  <span className="text-[10px] font-mono text-emerald-200 font-normal">
                    +{Math.min(value, maxHp - currentHp)} PV
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleTempHp}
              disabled={value < 0 || valueStr === ""}
              className="w-full h-11 px-4 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none rounded-xl text-cyan-300 hover:text-cyan-200 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow border border-cyan-500/25 touch-manipulation transition-all"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Definir PV Temporário {value > 0 ? `(+${value} Temp)` : ""}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
