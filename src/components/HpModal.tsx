import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Flame, X, Delete } from "lucide-react";

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
    if (valueStr.length < 4) {
      setValueStr((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setValueStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setValueStr("");
  };

  const value = parseInt(valueStr) || 0;

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

  const handleHeal = () => {
    if (value <= 0) return;
    const newCurrentHp = Math.min(maxHp, currentHp + value);
    onUpdateHp(newCurrentHp, tempHp);
    onClose();
  };

  const handleTempHp = () => {
    if (value < 0) return;
    onUpdateHp(currentHp, value);
    onClose();
  };

  const simulatedHpDamage = () => {
    let dmg = value;
    let t = tempHp;
    let c = currentHp;
    if (t > 0) {
      if (t >= dmg) { t -= dmg; dmg = 0; }
      else { dmg -= t; t = 0; }
    }
    if (dmg > 0) c = Math.max(0, c - dmg);
    return { c, t };
  };

  const simulatedHpHeal = () => {
    return Math.min(maxHp, currentHp + value);
  };

  const simDmg = simulatedHpDamage();
  const simHeal = simulatedHpHeal();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-fantasy-slate-800 border-t sm:border border-fantasy-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-fantasy-slate-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-display text-white">Modificar Pontos de Vida (HP)</h3>
              <p className="text-xs text-gray-400">Insira o valor e selecione a ação</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 bg-fantasy-slate-700 rounded-full hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* HP Display Previews */}
          <div className="p-5 bg-fantasy-slate-900 border-b border-fantasy-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-fantasy-slate-800/40 rounded-xl border border-fantasy-slate-750">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Atual</span>
              <span className="text-lg font-bold text-gray-200">
                {currentHp} <span className="text-xs text-gray-400">/ {maxHp}</span>
              </span>
            </div>
            <div className="p-2 bg-fantasy-slate-805/40 rounded-xl border border-fantasy-slate-750">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Temporário</span>
              <span className="text-lg font-bold text-blue-400">+{tempHp}</span>
            </div>
            <div className="p-2 bg-fantasy-slate-800 rounded-xl border border-fantasy-gold/20 flex flex-col items-center justify-center">
              <span className="text-[10px] text-fantasy-gold uppercase tracking-wider block font-mono">Entrada</span>
              <span className="text-2xl font-black text-fantasy-gold font-mono">{valueStr || "0"}</span>
            </div>
          </div>

          {/* Simulated Previews on Value Change */}
          {value > 0 && (
            <div className="px-5 py-2.5 bg-fantasy-slate-900/60 border-b border-fantasy-slate-800/80 flex flex-wrap justify-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span>Dano:</span>
                <span className="text-fantasy-crimson-light font-bold">
                  {simDmg.c} HP {simDmg.t > 0 || tempHp > 0 ? `(+${simDmg.t} Temp)` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span>Cura:</span>
                <span className="text-green-400 font-bold">{simHeal} HP</span>
              </div>
            </div>
          )}

          {/* Numeric Keypad for fast input with single hand */}
          <div className="p-5 grid grid-cols-3 gap-3 bg-fantasy-slate-800">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num)}
                className="py-3 px-6 bg-fantasy-slate-700/60 active:bg-fantasy-slate-600 rounded-2xl text-xl font-bold font-mono text-gray-150 border border-fantasy-slate-600/30 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="py-3 px-6 bg-fantasy-slate-900/40 border border-fantasy-crimson/20 active:bg-fantasy-crimson/10 rounded-2xl text-base font-bold text-fantasy-crimson-light font-mono flex items-center justify-center active:scale-95 transition-all"
            >
              C
            </button>
            <button
              onClick={() => handleNumClick("0")}
              className="py-3 px-6 bg-fantasy-slate-700/60 active:bg-fantasy-slate-600 rounded-2xl text-xl font-bold font-mono text-gray-150 border border-fantasy-slate-600/30 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="py-3 px-6 bg-fantasy-slate-900/40 border border-fantasy-slate-705 active:bg-fantasy-slate-700 rounded-2xl font-mono flex items-center justify-center active:scale-95 transition-all text-gray-300"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="p-5 pt-0 bg-fantasy-slate-805 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDamage}
                disabled={value <= 0}
                className="py-3.5 px-4 bg-fantasy-crimson hover:bg-fantasy-crimson-light active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Flame className="w-5 h-5 text-red-100" />
                Dano
              </button>
              <button
                onClick={handleHeal}
                disabled={value <= 0}
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5 text-emerald-100" />
                Cura
              </button>
            </div>
            <button
              onClick={handleTempHp}
              disabled={value < 0 || valueStr === ""}
              className="py-3.5 w-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Shield className="w-5 h-5 text-blue-100" />
              Pontos de Vida Temporários
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
