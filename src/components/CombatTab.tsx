import React, { useState } from "react";
import { Shield, Flame, Swords, Compass, Activity, Bolt, Eye, Heart, HelpCircle } from "lucide-react";
import { CharacterData } from "../types";

interface CombatTabProps {
  char: CharacterData;
  onUpdateHp: (current: number, temp: number) => void;
  onUpdateResource: (key: "layOnHands" | "divineSense", amount: number) => void;
  onOpenHpModal: () => void;
  onUseSpellSlot: (level: 1 | 2) => boolean;
}

export default function CombatTab({
  char,
  onUpdateHp,
  onUpdateResource,
  onOpenHpModal,
  onUseSpellSlot
}: CombatTabProps) {
  const [smiteSlot, setSmiteSlot] = useState<1 | 2>(1);
  const [layOnHandsAmountStr, setLayOnHandsAmountStr] = useState("");
  const [smiteSuccessMsg, setSmiteSuccessMsg] = useState("");
  const [senseSuccessMsg, setSenseSuccessMsg] = useState("");
  const [blessingActive, setBlessingActive] = useState(false);
  const [showMount, setShowMount] = useState(false);

  const strMod = Math.floor((char.attributes.str.value - 10) / 2);
  const chaMod = Math.floor((char.attributes.cha.value - 10) / 2);
  const profBonus = Math.floor((char.level - 1) / 4) + 2;

  const handleDivineSmite = () => {
    // Divine Smite: slot level 1 gives 2d8, level 2 gives 3d8
    const numDice = smiteSlot === 1 ? 2 : 3;
    const canUse = onUseSpellSlot(smiteSlot);
    if (!canUse) return;

    // Show physical casting guidance message
    setSmiteSuccessMsg(`Destruição Divina ativada! Role +${numDice}d8 radiante físicos junto ao seu dano.`);
    setTimeout(() => setSmiteSuccessMsg(""), 7000);
  };

  const handleLayOnHands = () => {
    const amount = parseInt(layOnHandsAmountStr) || 0;
    if (amount <= 0 || amount > char.layOnHands.current) return;

    // Deduct from Lay on Hands pool and heal Percival or output a message
    onUpdateResource("layOnHands", char.layOnHands.current - amount);
    // Heal Percival
    const newCurrentHp = Math.min(char.hp.max, char.hp.current + amount);
    onUpdateHp(newCurrentHp, char.hp.temp);
    setLayOnHandsAmountStr("");
  };

  const handleDivineSense = () => {
    if (char.divineSense.current <= 0) return;
    onUpdateResource("divineSense", char.divineSense.current - 1);
    
    // Show physical intuition guidance message
    setSenseSuccessMsg("Sentido Divino ativo! Concentre-se por 1 rodada para detectar seres celestiais, corruptores ou mortos-vivos.");
    setTimeout(() => setSenseSuccessMsg(""), 7000);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-28 pt-4 space-y-6">
      {/* HP & AC Main Cards Dashboard */}
      <div className="grid grid-cols-2 gap-3">
        {/* HP Controls (Click/Hold) */}
        <div
          onClick={onOpenHpModal}
          className={`relative bg-fantasy-slate-800 border transition-all duration-350 rounded-2xl p-4 flex flex-col justify-between active:scale-[0.97] cursor-pointer overflow-hidden ${
            char.hp.current <= char.hp.max * 0.4
              ? "border-red-550/80 bg-gradient-to-b from-[#1a0505] to-[#0d0f12] shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse"
              : "border-fantasy-slate-700/80 hover:border-fantasy-crimson-light/40"
          }`}
        >
          {/* Subtle Heart Background */}
          <div className="absolute right-2 bottom-1 opacity-[0.06] pointer-events-none">
            <Heart className={`w-20 h-20 text-fantasy-crimson ${char.hp.current <= char.hp.max * 0.4 ? "animate-pulse" : ""}`} />
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono flex items-center gap-1.5 leading-none">
              <span className={`w-2 h-2 rounded-full ${char.hp.current <= char.hp.max * 0.4 ? "bg-red-500 animate-ping" : "bg-fantasy-crimson"}`} />
              PONTOS DE VIDA
            </span>
            <span className="text-[9px] text-fantasy-gold-light bg-fantasy-slate-900 border border-white/5 px-2 py-0.5 rounded font-mono leading-none">
              TOQUE
            </span>
          </div>

          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black font-mono tracking-tight ${char.hp.current <= char.hp.max * 0.4 ? "text-red-400 blood-glow-text" : "text-white"}`}>
                {char.hp.current}
              </span>
              <span className="text-xs font-semibold text-gray-500 font-mono">
                / {char.hp.max}
              </span>
              {char.hp.temp > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/40 border border-blue-500/20 text-blue-400 rounded-md font-mono ml-2 font-bold">
                  +{char.hp.temp} Temp
                </span>
              )}
            </div>

            {/* HP Progress Bar */}
            <div className={`w-full bg-fantasy-slate-900 rounded-full h-2 mt-2 overflow-hidden border ${char.hp.current <= char.hp.max * 0.4 ? "border-red-900/60" : "border-fantasy-slate-950/50"}`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  char.hp.current <= char.hp.max * 0.4
                    ? "bg-gradient-to-r from-red-950 to-red-500 blood-pulse-btn"
                    : "bg-gradient-to-r from-fantasy-crimson to-rose-500"
                }`}
                style={{ width: `${(char.hp.current / char.hp.max) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Armor Class Header Card */}
        <div className="relative bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden hover:border-fantasy-gold/20 transition-all duration-300">
          {/* Subtle Shield Background */}
          <div className="absolute right-2 bottom-1 opacity-[0.06] pointer-events-none">
            <Shield className="w-20 h-20 text-fantasy-gold" />
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 rounded-full bg-fantasy-gold" />
              CLASSE ARMADURA
            </span>
            <span className="text-[9px] text-fantasy-gold bg-black/60 border border-white/5 px-2 py-0.5 rounded font-mono leading-none">
              CA
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-fantasy-gold font-mono tracking-tight">
              {char.ac}
            </span>
            <span className="text-[10px] text-gray-450 font-medium">
              {char.inventory.some((i) => i.equipped && i.name.toLowerCase().includes("placa-1")) ? "Armadura de placa-1" : "Armadura de placa"}
              {char.inventory.some((i) => i.equipped && i.name.toLowerCase().includes("escudo")) ? " + Escudo" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Mini quick-stats bar: iniciativa, velocidade, bonus proficiencia */}
      <div className="grid grid-cols-3 gap-2 bg-fantasy-slate-850/65 p-3 rounded-2xl border border-white/5 text-center shadow-lg">
        <div className="p-1 space-y-0.5 border-r border-white/5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">Iniciativa</span>
          <span className="text-base font-bold font-mono text-fantasy-crimson-light">
            {char.initiativeBonus >= 0 ? "+" : ""}
            {char.initiativeBonus}
          </span>
        </div>
        <div className="p-1 space-y-0.5 border-r border-white/5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">Velocidade</span>
          <span className="text-xs font-bold font-mono text-gray-200 block truncate">
            {char.speed}
          </span>
        </div>
        <div className="p-1 space-y-0.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">Proficiência</span>
          <span className="text-base font-bold font-mono text-fantasy-gold">
            +{profBonus}
          </span>
        </div>
      </div>

      {/* Main Attack Actions */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fantasy-slate-700/60 pb-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
            <Swords className="w-4 h-4 text-fantasy-crimson-light animate-pulse" />
            Ataques de Combate (2x Ataques/Turno)
          </h4>
          <span className="text-[9px] font-mono bg-red-950/40 border border-red-900/35 text-red-300 px-2.5 py-0.5 rounded uppercase self-start sm:self-auto font-bold">
            Ataque Extra Ativo ⚔️
          </span>
        </div>

        {/* Bênção de Sangue Toggle */}
        <div className="flex items-center justify-between p-3 bg-red-950/20 border border-red-900/35 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${blessingActive ? "bg-red-400 opacity-75" : "bg-transparent"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${blessingActive ? "bg-red-500" : "bg-red-950 border border-red-905"}`}></span>
            </span>
            <div>
              <span className="text-xs font-bold text-red-300 font-mono block">Bênção de Sangue</span>
              <span className="text-[10px] text-gray-400 block leading-tight">Adiciona +4 temporário de acerto na Alabarda Principal</span>
            </div>
          </div>
          <button
            onClick={() => setBlessingActive(!blessingActive)}
            className={`px-3 py-1.5 text-[9px] font-bold font-mono rounded-lg transition-all border ${
              blessingActive
                ? "bg-red-600 hover:bg-red-500 text-white border-red-400 shadow shadow-red-950"
                : "bg-fantasy-slate-750 text-gray-400 border-transparent hover:text-gray-300"
            }`}
          >
            {blessingActive ? "ATIVA" : "ATIVAR"}
          </button>
        </div>

        {/* Weapons List */}
        <div className="space-y-3.5 pt-1">
          {[
            {
              name: "Alabarda (Ataque Principal)",
              type: "Arma de Haste • Alcance 3m",
              tag: "PRINCIPAL",
              tagStyle: "bg-fantasy-crimson/15 text-fantasy-crimson-light border-fantasy-crimson/35",
              attackBonus: strMod + profBonus + (blessingActive ? 4 : 0),
              damageRoll: "1d10 + 3",
              damageType: "Cortante",
              notes: blessingActive ? "✨ Bênção de Sangue Ativa! (+10 para acertar)" : "Seu ataque padrão de haste de duas mãos."
            },
            {
              name: "Alabarda (Cabo - Ação Bônus)",
              type: "Golpe com Cabo • Ação Bônus",
              tag: "BÔNUS",
              tagStyle: "bg-fantasy-gold/15 text-fantasy-gold border-fantasy-gold/30",
              attackBonus: strMod + profBonus,
              damageRoll: "1d4 + 3",
              damageType: "Concussão",
              notes: "Ataque rápido com a ponta oposta da haste."
            }
          ].map((wpn, idx) => (
            <div
              key={idx}
              className={`p-3.5 bg-fantasy-slate-900/60 border rounded-2xl space-y-2.5 transition-all hover:bg-fantasy-slate-900/80 ${
                wpn.name.includes("Principal") && blessingActive
                  ? "border-red-900 bg-red-950/10 drop-shadow-[0_0_2px_rgba(239,68,68,0.1)]"
                  : "border-fantasy-slate-755"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h5 className="font-bold text-gray-100 font-display text-xs sm:text-sm flex items-center gap-1.5">
                    {wpn.name}
                  </h5>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{wpn.type}</p>
                </div>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded border leading-none font-extrabold ${wpn.tagStyle}`}>
                  {wpn.tag}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="py-2 px-1.5 bg-fantasy-slate-750 border border-fantasy-slate-800 rounded-xl font-semibold flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[8px] text-gray-400 uppercase tracking-wider font-mono">Para Acertar</span>
                  <span className="font-mono text-fantasy-gold text-sm font-extrabold mt-0.5">
                    1d20 +{wpn.attackBonus}
                  </span>
                </div>
                <div className="py-2 px-1.5 bg-fantasy-slate-750 border border-fantasy-slate-800 rounded-xl font-semibold flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[8px] text-gray-400 uppercase tracking-wider font-mono">Dano ({wpn.damageType})</span>
                  <span className="font-mono text-red-400 text-sm font-extrabold mt-0.5">
                    {wpn.damageRoll}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic font-mono pl-1">
                * {wpn.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Class Spells & Resources (Divine Smite, Lay on Hands, Divine Sense) */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 space-y-5 shadow-xl">
        <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
          <Bolt className="w-4 h-4 animate-pulse text-fantasy-crimson-light" />
          Habilidades de Paladino
        </h4>

        {/* Divine Smite */}
        <div className="p-4 bg-fantasy-slate-900/60 border border-red-950/40 rounded-2xl space-y-3.5 shadow-inner">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h5 className="font-semibold text-gray-100 font-display text-sm">
                Destruição Divina (Divine Smite)
              </h5>
              <p className="text-xs text-gray-400">Consome um slot de magia de sua escolha</p>
            </div>
            {/* Level selector for slot */}
            <div className="flex bg-fantasy-slate-800 border border-red-950/40 p-0.5 rounded-xl self-end sm:self-auto">
              <button
                onClick={() => setSmiteSlot(1)}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  smiteSlot === 1
                    ? "bg-fantasy-crimson text-white shadow shadow-red-950/50"
                    : "text-gray-400"
                }`}
              >
                1º Nív
              </button>
              <button
                onClick={() => setSmiteSlot(2)}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  smiteSlot === 2
                    ? "bg-fantasy-crimson text-white shadow shadow-red-950/50"
                    : "text-gray-400"
                }`}
              >
                2º Nív
              </button>
            </div>
          </div>

          <button
            onClick={handleDivineSmite}
            className="w-full py-4 bg-gradient-to-r from-red-800 via-fantasy-crimson to-rose-950 hover:opacity-95 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all font-display text-xs sm:text-sm blood-pulse-btn border border-red-500/25"
          >
            <Flame className="w-4 h-4 text-red-200" />
            Lançar Destruição (+{smiteSlot === 1 ? "2d8" : "3d8"} Radiante)
          </button>

          {smiteSuccessMsg && (
            <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold text-center animate-pulse">
              {smiteSuccessMsg}
            </div>
          )}
        </div>

        {/* Lay on Hands */}
        <div className="p-4 bg-fantasy-slate-900/60 border border-fantasy-slate-700/40 rounded-2xl space-y-3.5">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="font-semibold text-gray-100 font-display text-sm">
                Cura pelas Mãos (Lay on Hands)
              </h5>
              <p className="text-xs text-gray-400">Reserva total de cura: {char.layOnHands.max} HP</p>
            </div>
            <span className="text-sm font-semibold font-mono text-green-400 bg-green-950/30 border border-green-500/20 px-2.5 py-0.5 rounded-full">
              {char.layOnHands.current} / {char.layOnHands.max} HP
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Valor a curar"
              value={layOnHandsAmountStr}
              onChange={(e) => setLayOnHandsAmountStr(e.target.value)}
              min="1"
              max={char.layOnHands.current}
              className="flex-1 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-2xl py-2 px-3 text-center text-sm font-mono text-white focus:outline-none focus:border-fantasy-gold"
            />
            <button
              onClick={handleLayOnHands}
              disabled={
                !layOnHandsAmountStr ||
                parseInt(layOnHandsAmountStr) <= 0 ||
                parseInt(layOnHandsAmountStr) > char.layOnHands.current
              }
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-2xl text-white font-bold text-sm shadow transition-all"
            >
              Curar
            </button>
          </div>
        </div>

        {/* Divine Sense */}
        <div className="p-4 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-gray-100 font-display text-sm flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-400" />
                Sentido Divino
              </h5>
              <p className="text-xs text-gray-400">Detecta sagrado/profano a 18m</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-orange-400">
                {char.divineSense.current} / {char.divineSense.max}
              </span>
              <button
                onClick={handleDivineSense}
                disabled={char.divineSense.current <= 0}
                className="py-2.5 px-4 bg-orange-600/20 border border-orange-500/40 hover:bg-orange-500/20 text-orange-300 font-semibold text-xs rounded-xl active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                Usar
              </button>
            </div>
          </div>

          {senseSuccessMsg && (
            <div className="mt-2 p-3 bg-orange-950/25 border border-orange-500/30 text-orange-300 rounded-xl text-xs font-medium text-center">
              {senseSuccessMsg}
            </div>
          )}
        </div>
      </div>

      {/* 4. PESADELO SANGUINÁRIO (Infernal Mount) */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
            <span className="text-base">🐎</span>
            Pesadelo Sanguinário
          </h4>
          <button
            onClick={() => setShowMount(!showMount)}
            className="text-[10px] font-bold text-fantasy-gold hover:text-fantasy-gold-light font-mono bg-fantasy-slate-900 border border-fantasy-slate-755 px-2.5 py-1 rounded-lg transition-all"
          >
            {showMount ? "REDUZIR ▲" : "MOSTRAR FICHA ▼"}
          </button>
        </div>

        {showMount && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* Header / Subtitle */}
            <div className="p-3.5 bg-[#1a0505] border border-red-950/60 rounded-2xl flex justify-between items-center">
              <div>
                <h5 className="font-bold text-red-400 text-sm font-display">Pesadelo Sanguinário (Montaria Infernal)</h5>
                <span className="text-[10px] text-gray-400 font-mono">Besta Infernal, Neutro e Mau • Inteligência 6</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-red-950 text-red-300 border border-red-900/35 rounded uppercase font-mono font-bold">
                Círculo 2 (Find Steed)
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Armadura (CA)</span>
                <span className="text-base font-bold font-mono text-fantasy-gold-light">11</span>
              </div>
              <div className="p-2.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Pontos de Vida (PV)</span>
                <span className="text-base font-bold font-mono text-red-400">19 <span className="text-xs text-gray-500">/ 19</span></span>
              </div>
              <div className="p-2.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Deslocamento</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-gray-200">18 metros</span>
              </div>
            </div>

            {/* Attributes Block */}
            <div className="grid grid-cols-6 gap-1 bg-fantasy-slate-900/40 p-2 rounded-2xl border border-fantasy-slate-755 text-center font-mono text-xs">
              <div>
                <span className="text-[9px] text-gray-500 font-bold block">FOR</span>
                <span className="text-gray-100 block font-semibold">18</span>
                <span className="text-[9px] text-fantasy-gold font-bold">(+4)</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 font-bold block">DES</span>
                <span className="text-gray-100 block font-semibold">12</span>
                <span className="text-[9px] text-fantasy-gold font-bold">(+1)</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 font-bold block">CON</span>
                <span className="text-gray-100 block font-semibold">13</span>
                <span className="text-[9px] text-fantasy-gold font-bold">(+1)</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 font-bold block">INT</span>
                <span className="text-gray-100 block font-semibold">6</span>
                <span className="text-[9px] text-red-400 font-bold">(-2)</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 font-bold block">SAB</span>
                <span className="text-gray-100 block font-semibold">12</span>
                <span className="text-[9px] text-fantasy-gold font-bold">(+1)</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 font-bold block">CAR</span>
                <span className="text-gray-100 block font-semibold">7</span>
                <span className="text-[9px] text-red-400 font-bold">(-2)</span>
              </div>
            </div>

            {/* Attack block */}
            <div className="p-3.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest block">Ataque de Montaria</span>
                  <h6 className="font-bold text-gray-100 text-sm font-display">Ataque de Cascos</h6>
                </div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-fantasy-slate-800 rounded border border-fantasy-slate-700/60 text-center">
                    <span className="text-[8px] font-mono text-gray-400 block uppercase">Acerto</span>
                    <span className="text-xs font-bold font-mono text-fantasy-gold-light">+6</span>
                  </div>
                  <div className="px-2 py-1 bg-fantasy-slate-800 rounded border border-fantasy-slate-700/60 text-center">
                    <span className="text-[8px] font-mono text-gray-400 block uppercase">Dano</span>
                    <span className="text-xs font-bold font-mono text-red-400">2d6+4</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                Ataque Corpo-a-Corpo com Arma: +6 para acertar, alcance 1,5m. Dano: 2d6 + 4 de dano de concussão.
              </p>
            </div>

            {/* Abilities */}
            <div className="p-3.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-2xl space-y-3">
              <span className="text-[9px] font-mono font-bold text-fantasy-gold uppercase tracking-widest block">Habilidades Especiais</span>
              
              <div className="space-y-2 text-xs">
                <div className="border-b border-fantasy-slate-800 pb-2">
                  <strong className="text-red-400 font-display block mb-0.5">Vínculo de Sangue (Telepatia)</strong>
                  <p className="text-gray-400 leading-relaxed font-mono text-[11px]">
                    Vocês se comunicam telepaticamente a até 1,5 km. Enquanto você estiver montado nele, qualquer magia que você conjurar com o alcance &quot;Você&quot; (como Passo Nebuloso) também se aplica a ele.
                  </p>
                </div>
                <div>
                  <strong className="text-red-400 font-display block mb-0.5">Investida Atropeladora</strong>
                  <p className="text-gray-400 leading-relaxed font-mono text-[11px]">
                    Se o cavalo se mover pelo menos 6 metros em linha reta em direção a uma criatura e a atingir com um ataque de cascos no mesmo turno, o alvo deve passar em um teste de resistência de <strong>Força (CD 14)</strong> ou cairá <strong>Caído (Prone)</strong>. Se cair, o cavalo pode realizar um ataque de cascos contra ele como uma ação bônus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple embedded vector SVG D20 die icon (no external image assets needed)
function DiceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2050/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      className="w-4 h-4 stroke-current"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
