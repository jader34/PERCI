import React, { useState } from "react";
import { Shield, Flame, Swords, Compass, Activity, Bolt, Eye, Heart, HelpCircle, Sparkles, Droplets, Zap, Info, Crosshair } from "lucide-react";
import { CharacterData } from "../types";

interface CombatTabProps {
  char: CharacterData;
  onUpdateHp: (current: number, temp: number) => void;
  onUpdateResource: (key: "layOnHands" | "divineSense" | "channelDivinity" | "bloodBlessing", amount: number) => void;
  onOpenHpModal: () => void;
  onUseSpellSlot: (level: 1 | 2) => boolean;
  onToggleHuntersMark?: (active?: boolean) => void;
}

export default function CombatTab({
  char,
  onUpdateHp,
  onUpdateResource,
  onOpenHpModal,
  onUseSpellSlot,
  onToggleHuntersMark
}: CombatTabProps) {
  const [smiteSlot, setSmiteSlot] = useState<1 | 2>(1);
  const [layOnHandsAmountStr, setLayOnHandsAmountStr] = useState("");
  const [layOnHandsMsg, setLayOnHandsMsg] = useState("");
  const [smiteSuccessMsg, setSmiteSuccessMsg] = useState("");
  const [senseSuccessMsg, setSenseSuccessMsg] = useState("");
  const [cdSuccessMsg, setCdSuccessMsg] = useState("");
  const [hmFeedbackMsg, setHmFeedbackMsg] = useState("");
  const [blessingActive, setBlessingActive] = useState(false);
  const [bloodMarked, setBloodMarked] = useState(false);
  const [expandedCd, setExpandedCd] = useState<"absorb" | "bless" | null>(null);
  const [showMount, setShowMount] = useState(false);
  const [mountHp, setMountHp] = useState(19);
  const [mountHpValStr, setMountHpValStr] = useState("");
  const [showMountHpControls, setShowMountHpControls] = useState(false);

  const handleMountDamage = () => {
    const val = parseInt(mountHpValStr, 10);
    if (isNaN(val) || val <= 0) return;
    setMountHp((prev) => Math.max(0, prev - val));
    setMountHpValStr("");
  };

  const handleMountHeal = () => {
    const val = parseInt(mountHpValStr, 10);
    if (isNaN(val) || val <= 0) return;
    setMountHp((prev) => Math.min(19, prev + val));
    setMountHpValStr("");
  };

  const strMod = Math.floor((char.attributes.str.value - 10) / 2);
  const chaMod = Math.floor((char.attributes.cha.value - 10) / 2);
  const profBonus = Math.floor((char.level - 1) / 4) + 2;

  const bloodBlessing = char.bloodBlessing || { max: 1, current: 1 };
  const channelDivinity = char.channelDivinity || { max: 1, current: 1 };

  const handleToggleBlessing = () => {
    if (blessingActive) {
      setBlessingActive(false);
      setCdSuccessMsg("Bênção de Sangue desativada.");
      setTimeout(() => setCdSuccessMsg(""), 4000);
    } else {
      if (channelDivinity.current > 0) {
        onUpdateResource("channelDivinity", channelDivinity.current - 1);
      }
      setBlessingActive(true);
      setCdSuccessMsg("🩸 Bênção de Sangue Ativada por Canalizar Divindade! (+4 nas jogadas de ataque na Alabarda, 1º acerto causa dano Radiante e aplica Marca de Sangue).");
      setTimeout(() => setCdSuccessMsg(""), 8000);
    }
  };

  const handleChannelDivinity = (option: "absorb" | "bless") => {
    if (option === "absorb") {
      if (channelDivinity.current <= 0) {
        setCdSuccessMsg("⚠️ Sem usos restantes de Canalizar Divindade! (Necessita descanso curto ou longo)");
        setTimeout(() => setCdSuccessMsg(""), 6000);
        return;
      }
      onUpdateResource("channelDivinity", channelDivinity.current - 1);
      setCdSuccessMsg("🩸 Absorver Vitalidade Ativado! Alvo tocado deve passar em Salvaguarda de Constituição (CD 15) ou ficará IMPEDIDO. Repete o salvamento no final de cada turno dele.");
      setTimeout(() => setCdSuccessMsg(""), 8000);
    } else if (option === "bless") {
      handleToggleBlessing();
    }
  };

  const handleDivineSmite = () => {
    // Divine Smite: slot level 1 gives 2d8, level 2 gives 3d8
    const numDice = smiteSlot === 1 ? 2 : 3;
    const canUse = onUseSpellSlot(smiteSlot);
    if (!canUse) return;

    // Show physical casting guidance message
    setSmiteSuccessMsg(`Destruição Divina ativada! Role +${numDice}d8 radiante físicos junto ao seu dano.`);
    setTimeout(() => setSmiteSuccessMsg(""), 7000);
  };

  const handleLayOnHands = (healSelf: boolean = false) => {
    const amount = parseInt(layOnHandsAmountStr) || 0;
    if (amount <= 0 || amount > char.layOnHands.current) return;

    const newPool = Math.max(0, char.layOnHands.current - amount);
    onUpdateResource("layOnHands", newPool);

    if (healSelf) {
      const newHp = Math.min(char.hp.max, char.hp.current + amount);
      onUpdateHp(newHp, char.hp.temp);
      setLayOnHandsMsg(`✨ ${amount} HP curados em Percival! Vida atual: ${newHp}/${char.hp.max}. Reserva: ${newPool}/${char.layOnHands.max} HP.`);
    } else {
      setLayOnHandsMsg(`✨ ${amount} HP gastos da reserva (Cura realizada em aliado/outro). Reserva restante: ${newPool}/${char.layOnHands.max} HP.`);
    }

    setLayOnHandsAmountStr("");
    setTimeout(() => setLayOnHandsMsg(""), 7000);
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
          className={`relative bg-gradient-to-br from-red-950/40 via-slate-900 to-fantasy-slate-900 border transition-all duration-300 rounded-2xl p-4 flex flex-col justify-between active:scale-[0.97] cursor-pointer overflow-hidden shadow-lg shadow-red-950/20 ${
            char.hp.current <= char.hp.max * 0.4
              ? "border-red-550/80 bg-gradient-to-b from-[#2a0505] to-[#0d0f12] shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse"
              : "border-red-900/40 hover:border-red-600/60"
          }`}
        >
          {/* Subtle Heart Background */}
          <div className="absolute right-2 bottom-1 opacity-[0.08] pointer-events-none">
            <Heart className={`w-20 h-20 text-red-500 ${char.hp.current <= char.hp.max * 0.4 ? "animate-pulse" : ""}`} />
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-200/90 font-mono flex items-center gap-1.5 leading-none">
              <span className={`w-2 h-2 rounded-full ${char.hp.current <= char.hp.max * 0.4 ? "bg-red-500 animate-ping" : "bg-red-500"}`} />
              PONTOS DE VIDA
            </span>
          </div>

          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black font-mono tracking-tight ${char.hp.current <= char.hp.max * 0.4 ? "text-red-400 blood-glow-text" : "text-white"}`}>
                {char.hp.current}
              </span>
              <span className="text-xs font-semibold text-gray-400 font-mono">
                / {char.hp.max}
              </span>
              {char.hp.temp > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 border border-blue-500/30 text-blue-300 rounded-md font-mono ml-1.5 font-extrabold">
                  +{char.hp.temp} Temp
                </span>
              )}
            </div>

            {/* HP Progress Bar */}
            <div className={`w-full bg-fantasy-slate-950 rounded-full h-2 mt-2 overflow-hidden border ${char.hp.current <= char.hp.max * 0.4 ? "border-red-800/80" : "border-red-900/30"}`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  char.hp.current <= char.hp.max * 0.4
                    ? "bg-gradient-to-r from-red-950 to-red-500 blood-pulse-btn"
                    : "bg-gradient-to-r from-red-700 via-rose-500 to-red-400"
                }`}
                style={{ width: `${(char.hp.current / char.hp.max) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Armor Class Header Card */}
        <div className="relative bg-gradient-to-br from-amber-950/30 via-slate-900 to-fantasy-slate-900 border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-amber-950/15">
          {/* Subtle Shield Background */}
          <div className="absolute right-2 bottom-1 opacity-[0.08] pointer-events-none">
            <Shield className="w-20 h-20 text-amber-500" />
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-200/90 font-mono flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              ARMADURA (CA)
            </span>
            <span className="text-[9px] text-amber-300 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded font-mono font-bold leading-none">
              CA
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {char.ac}
            </span>
            <span className="text-[10px] text-gray-300 font-medium leading-tight">
              {char.inventory.some((i) => i.equipped && i.name.toLowerCase().includes("placa-1")) ? "Armadura Placa-1" : "Armadura Placa"}
              {char.inventory.some((i) => i.equipped && i.name.toLowerCase().includes("escudo")) ? " + Escudo" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Mini quick-stats bar: iniciativa, velocidade, bonus proficiencia */}
      <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-red-950/30 via-slate-900 to-purple-950/30 p-3 rounded-2xl border border-red-900/30 text-center shadow-md">
        <div className="p-1 space-y-0.5 border-r border-red-900/30">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-300 font-bold block">Iniciativa</span>
          <span className="text-base font-bold font-mono text-red-400">
            {char.initiativeBonus >= 0 ? "+" : ""}
            {char.initiativeBonus}
          </span>
        </div>
        <div className="p-1 space-y-0.5 border-r border-red-900/30">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-300 font-bold block">Velocidade</span>
          <span className="text-xs font-bold font-mono text-gray-200 block truncate">
            {char.speed}
          </span>
        </div>
        <div className="p-1 space-y-0.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-300 font-bold block">Proficiência</span>
          <span className="text-base font-bold font-mono text-amber-400">
            +{profBonus}
          </span>
        </div>
      </div>

      {/* Main Attack Actions */}
      <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-red-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/40 pb-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-400 animate-pulse" />
            Ataques de Combate (2x Ataques/Turno)
          </h4>
          <span className="text-[9px] font-mono bg-red-950/80 border border-red-800/60 text-red-300 px-2.5 py-0.5 rounded-full uppercase self-start sm:self-auto font-bold">
            Ataque Extra Ativo ⚔️
          </span>
        </div>

        {/* Bênção de Sangue Toggle Banner */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 border rounded-2xl gap-2.5 transition-all ${
          blessingActive
            ? "bg-red-950/40 border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.2)]"
            : "bg-red-950/20 border-red-900/40"
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${blessingActive ? "bg-red-400 opacity-75" : "bg-transparent"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${blessingActive ? "bg-red-500" : "bg-red-950 border border-red-800"}`}></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-300 font-mono">Bênção de Sangue (Canalizar Divindade)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-red-950 text-red-400 border border-red-900/40 rounded font-semibold">
                  {blessingActive ? "EFEITO ATIVO (1 MIN)" : `Usos: ${channelDivinity.current}/${channelDivinity.max}`}
                </span>
              </div>
              <span className="text-[10px] text-gray-300 block leading-tight mt-0.5">
                Adiciona +4 (Mod. Carisma) às jogadas de ataque com a Alabarda • 1º acerto causa dano Radiante e aplica Marca de Sangue
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleToggleBlessing}
              className={`px-3.5 py-1.5 text-[10px] font-extrabold font-mono rounded-xl transition-all border shadow ${
                blessingActive
                  ? "bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-red-950"
                  : "bg-fantasy-slate-750 text-gray-300 border-fantasy-slate-700 hover:text-white hover:bg-fantasy-slate-700"
              }`}
            >
              {blessingActive ? "DESATIVAR (+4)" : "ATIVAR BÊNÇÃO"}
            </button>
          </div>
        </div>

        {/* Marca do Caçador Active Indicator Banner */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 border rounded-2xl gap-2.5 transition-all ${
          char.huntersMarkActive
            ? "bg-amber-950/35 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            : "bg-fantasy-slate-900/40 border-fantasy-slate-800/80"
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${char.huntersMarkActive ? "bg-amber-400 opacity-75" : "bg-transparent"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${char.huntersMarkActive ? "bg-amber-500" : "bg-fantasy-slate-700"}`}></span>
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  Marca do Caçador (Hunter's Mark)
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase border ${
                  char.huntersMarkActive
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                    : "bg-fantasy-slate-800 text-gray-400 border-fantasy-slate-700"
                }`}>
                  {char.huntersMarkActive ? "🎯 ATIVA (CONCENTRAÇÃO)" : "INATIVA"}
                </span>
              </div>
              <span className="text-[10px] text-gray-300 block leading-tight mt-0.5">
                Concentração (1 hora) • Causa <strong className="text-amber-300">+1d6 de dano de arma extra</strong> em cada acerto ao alvo marcado.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {char.huntersMarkActive ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setHmFeedbackMsg("🎯 Marca do Caçador direcionada ao novo alvo! (Ação Bônus consumida)");
                    setTimeout(() => setHmFeedbackMsg(""), 5000);
                  }}
                  className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-600/50 text-amber-200 text-[10px] font-bold font-mono rounded-xl transition-all active:scale-95 shadow"
                  title="Mover marca para uma nova vítima usando Ação Bônus"
                >
                  🏹 Mover Marca
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleHuntersMark?.(false);
                    setHmFeedbackMsg("Marca do Caçador encerrada.");
                    setTimeout(() => setHmFeedbackMsg(""), 4000);
                  }}
                  className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 text-[10px] font-bold font-mono rounded-xl transition-all active:scale-95 shadow"
                >
                  ✕ Encerrar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const success = onUseSpellSlot(1);
                  if (success) {
                    onToggleHuntersMark?.(true);
                    setHmFeedbackMsg("🎯 Marca do Caçador ativada! (Espaço de 1º nível consumido).");
                    setTimeout(() => setHmFeedbackMsg(""), 5000);
                  } else {
                    setHmFeedbackMsg("⚠️ Sem slots de 1º nível restantes!");
                    setTimeout(() => setHmFeedbackMsg(""), 4000);
                  }
                }}
                className="px-3 py-1.5 bg-fantasy-slate-750 hover:bg-fantasy-slate-700 text-gray-200 border border-fantasy-slate-700 text-[10px] font-extrabold font-mono rounded-xl transition-all active:scale-95 shadow flex items-center gap-1"
              >
                <Crosshair className="w-3 h-3 text-amber-400" />
                ATIVAR MARCA
              </button>
            )}
          </div>
        </div>

        {hmFeedbackMsg && (
          <div className="p-2.5 bg-amber-950/40 border border-amber-500/50 text-amber-200 rounded-xl text-xs font-medium text-center animate-fadeIn shadow">
            {hmFeedbackMsg}
          </div>
        )}

        {/* Weapons List */}
        <div className="space-y-3.5 pt-1">
          {[
            {
              name: "Alabarda (Ataque Principal)",
              type: "Arma de Haste • Alcance 3m",
              tag: "PRINCIPAL",
              tagStyle: "bg-fantasy-crimson/15 text-fantasy-crimson-light border-fantasy-crimson/35",
              attackBonus: strMod + profBonus + (blessingActive ? 4 : 0),
              damageRoll: char.huntersMarkActive ? "1d10 + 3 (+1d6 Marca)" : "1d10 + 3",
              damageType: "Cortante",
              notes: blessingActive
                ? `✨ Bênção de Sangue Ativa! (+4 para acertar)${char.huntersMarkActive ? " • 🎯 +1d6 Marca do Caçador" : ""}`
                : char.huntersMarkActive
                ? "🎯 +1d6 de dano extra da Marca do Caçador no acerto."
                : "Seu ataque padrão de haste de duas mãos."
            },
            {
              name: "Alabarda (Cabo - Ação Bônus)",
              type: "Golpe com Cabo • Ação Bônus",
              tag: "BÔNUS",
              tagStyle: "bg-fantasy-gold/15 text-fantasy-gold border-fantasy-gold/30",
              attackBonus: strMod + profBonus + (blessingActive ? 4 : 0),
              damageRoll: char.huntersMarkActive ? "1d4 + 3 (+1d6 Marca)" : "1d4 + 3",
              damageType: "Concussão",
              notes: blessingActive
                ? `✨ Bênção de Sangue Ativa! (+4 no acerto)${char.huntersMarkActive ? " • 🎯 +1d6 Marca do Caçador" : ""}`
                : char.huntersMarkActive
                ? "🎯 +1d6 de dano extra da Marca do Caçador no acerto."
                : "Ataque rápido com a ponta oposta da haste."
            }
          ].map((wpn, idx) => (
            <div
              key={idx}
              className={`p-3.5 bg-fantasy-slate-900/60 border rounded-2xl space-y-2.5 transition-all hover:bg-fantasy-slate-900/80 ${
                blessingActive
                  ? "border-red-900/80 bg-red-950/15 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
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
                  <span className={`font-mono text-sm font-extrabold mt-0.5 ${blessingActive ? "text-red-400 font-black" : "text-fantasy-gold"}`}>
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
      <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 sm:p-5 space-y-5 shadow-lg shadow-red-950/20">
        <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
          <Bolt className="w-4 h-4 animate-pulse text-red-400" />
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
        <div className="p-4 bg-fantasy-slate-900/60 border border-emerald-900/40 rounded-2xl space-y-3.5 shadow-inner">
          <div className="flex justify-between items-center gap-2">
            <div>
              <h5 className="font-semibold text-gray-100 font-display text-sm flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                Cura pelas Mãos (Lay on Hands)
              </h5>
              <p className="text-xs text-gray-400">Reserva de toque divino: {char.layOnHands.max} HP por descanso</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {char.layOnHands.current} / {char.layOnHands.max} HP
              </span>
              {char.layOnHands.current < char.layOnHands.max && (
                <button
                  onClick={() => onUpdateResource("layOnHands", char.layOnHands.max)}
                  className="px-2 py-0.5 text-[9px] font-mono text-gray-400 hover:text-white bg-fantasy-slate-800 border border-fantasy-slate-700 rounded-lg transition-all"
                  title="Recarregar Reserva de Cura pelas Mãos"
                >
                  Recarregar
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Qtd. de HP a gastar"
              value={layOnHandsAmountStr}
              onChange={(e) => setLayOnHandsAmountStr(e.target.value)}
              min="1"
              max={char.layOnHands.current}
              className="flex-1 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-2.5 px-3 text-center text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLayOnHands(false)}
                disabled={
                  !layOnHandsAmountStr ||
                  parseInt(layOnHandsAmountStr) <= 0 ||
                  parseInt(layOnHandsAmountStr) > char.layOnHands.current
                }
                className="flex-1 sm:flex-none py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1"
                title="Apenas reduz o valor da reserva de cura (para curar aliado ou outra criatura)"
              >
                Gastar (Aliado)
              </button>
              <button
                type="button"
                onClick={() => handleLayOnHands(true)}
                disabled={
                  !layOnHandsAmountStr ||
                  parseInt(layOnHandsAmountStr) <= 0 ||
                  parseInt(layOnHandsAmountStr) > char.layOnHands.current
                }
                className="flex-1 sm:flex-none py-2.5 px-3.5 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/40 active:scale-95 text-emerald-200 disabled:opacity-40 disabled:pointer-events-none rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                title="Reduz da reserva E cura os pontos de vida de Percival"
              >
                + Curar Percival
              </button>
            </div>
          </div>

          {layOnHandsMsg && (
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-medium text-center animate-fadeIn">
              {layOnHandsMsg}
            </div>
          )}
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

        {/* Canalizar Divindade (Channel Divinity - Blood Oath Homebrew) */}
        <div className="p-4 bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl space-y-4 shadow-lg shadow-red-950/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-red-900/30 pb-3">
            <div>
              <h5 className="font-semibold text-red-200 font-display text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-red-400 fill-red-500/20 animate-pulse" />
                Canalizar Divindade (Juramento de Sangue)
              </h5>
              <p className="text-[11px] text-gray-300 mt-0.5">
                CD de Salvaguarda de Magia: <span className="font-mono font-bold text-red-300">CD 15 (CON)</span> • 1 uso por descanso curto/longo
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono font-bold text-red-300 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full shadow-inner">
                Usos: {channelDivinity.current} / {channelDivinity.max}
              </span>
              {channelDivinity.current < channelDivinity.max && (
                <button
                  type="button"
                  onClick={() => onUpdateResource("channelDivinity", channelDivinity.max)}
                  className="px-2 py-1 text-[9px] font-mono text-gray-300 hover:text-white bg-fantasy-slate-800 border border-fantasy-slate-700 rounded-lg transition-all"
                  title="Recarregar Canalizar Divindade"
                >
                  Recarregar
                </button>
              )}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Option 1: Absorver Vitalidade */}
            <div className="p-3.5 bg-fantasy-slate-900/80 border border-red-900/40 rounded-xl space-y-2.5 flex flex-col justify-between hover:border-red-800/60 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-red-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-red-400" />
                    Absorver Vitalidade
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-red-950 text-red-400 border border-red-900/50 rounded font-semibold uppercase">
                    Ação • Toque
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Invoque magia de sangue ao tocar uma criatura. Alvo deve passar em <strong className="text-red-300">CD 15 Constituição</strong> ou ficará <strong className="text-red-300">IMPEDIDO</strong>. Repete o salvamento a cada turno.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-red-900/20">
                <button
                  type="button"
                  onClick={() => setExpandedCd(expandedCd === "absorb" ? null : "absorb")}
                  className="text-[10px] font-mono text-gray-400 hover:text-red-300 flex items-center gap-1 transition-all"
                >
                  <Info className="w-3 h-3" />
                  {expandedCd === "absorb" ? "Ocultar Regra ▲" : "Regra Completa ▼"}
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelDivinity("absorb")}
                  className="px-3 py-1.5 bg-red-950/70 hover:bg-red-900/80 border border-red-700/60 text-red-100 font-mono font-bold text-xs rounded-lg active:scale-95 transition-all shadow"
                >
                  ⚡ Usar
                </button>
              </div>
            </div>

            {/* Option 2: Bênção de Sangue */}
            <div className={`p-3.5 bg-fantasy-slate-900/80 border rounded-xl space-y-2.5 flex flex-col justify-between transition-all ${
              blessingActive ? "border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.25)] bg-red-950/20" : "border-red-900/40 hover:border-red-800/60"
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-red-300 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-red-500 fill-red-500/30" />
                    Bênção de Sangue
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold uppercase border ${
                    blessingActive
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-red-950 text-red-400 border-red-900/50"
                  }`}>
                    {blessingActive ? "🔥 ATIVO (+4)" : "Ação • 1 min"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Imbua sua arma por 1 min. Ganha <strong className="text-red-300">+4 nas jogadas de ataque</strong> (Mod. CAR). 1º acerto causa dano Necrótico e aplica <strong className="text-red-300">Marca de Sangue</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-red-900/20">
                <button
                  type="button"
                  onClick={() => setExpandedCd(expandedCd === "bless" ? null : "bless")}
                  className="text-[10px] font-mono text-gray-400 hover:text-red-300 flex items-center gap-1 transition-all"
                >
                  <Info className="w-3 h-3" />
                  {expandedCd === "bless" ? "Ocultar Regra ▲" : "Regra Completa ▼"}
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelDivinity("bless")}
                  className={`px-3 py-1.5 font-mono font-bold text-xs rounded-lg active:scale-95 transition-all shadow border ${
                    blessingActive
                      ? "bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-red-950"
                      : "bg-red-950/70 hover:bg-red-900/80 border border-red-700/60 text-red-100"
                  }`}
                >
                  {blessingActive ? "DESATIVAR" : "🩸 Ativar"}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Rules Box */}
          {expandedCd === "absorb" && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-gray-300 space-y-1.5 animate-fadeIn">
              <div className="font-bold text-red-300 font-mono flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-red-400" />
                Absorver Vitalidade — Texto da Regra
              </div>
              <p className="leading-relaxed text-[11px] text-gray-300">
                Você pode usar seu Canalizar Divindade para invocar magia de sangue para absorver parte da vitalidade de um oponente. Com uma ação, você pode tocar uma criatura, que deve ser bem sucedida num teste de salvaguarda de Constituição contra o seu CD de salvaguarda de magia (CD 15) ou ficará <strong>impedida</strong>.
              </p>
              <p className="leading-relaxed text-[11px] text-gray-300">
                Enquanto estiver impedida pela falta de vitalidade, a criatura repete o teste de resistência no final de cada turno dela. Se obtiver sucesso, ela se liberta.
              </p>
            </div>
          )}

          {expandedCd === "bless" && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-gray-300 space-y-1.5 animate-fadeIn">
              <div className="font-bold text-red-300 font-mono flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-red-400" />
                Bênção de Sangue — Texto da Regra
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300 leading-relaxed">
                <li><strong>Ação & Duração:</strong> Imbua uma arma com sangue arcano por 1 minuto usando seu Canalizar Divindade.</li>
                <li><strong>Bônus de Ataque:</strong> Adiciona seu modificador de Carisma (+4) às jogadas de ataque com essa arma.</li>
                <li><strong>Dano e Marca de Sangue:</strong> No primeiro ataque bem-sucedido, o dano será Radiante e o oponente recebe uma marca de sangue por 1 turno.</li>
                <li><strong>Dano Extra:</strong> Oponentes marcados sofrem dano Radiante extra (+4 CAR) nas suas jogadas de ataque empunhando a arma de sangue, removendo a marca em seguida.</li>
                <li><strong>Contágio ao Morrer:</strong> Se um oponente marcado morrer, o seu próximo ataque bem-sucedido terá dano Radiante e aplicará a marca no novo oponente.</li>
                <li><strong>Luz & Propriedades:</strong> Arma emite luz escarlate (6m penumbra) e conta como arma mágica durante a duração.</li>
              </ul>
            </div>
          )}

          {/* Status Message */}
          {cdSuccessMsg && (
            <div className="p-3 bg-red-950/40 border border-red-700/60 text-red-200 rounded-xl text-xs font-medium text-center animate-fadeIn shadow">
              {cdSuccessMsg}
            </div>
          )}
        </div>
      </div>

      {/* 4. PESADELO SANGUINÁRIO (Infernal Mount) */}
      <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-red-950/20">
        <div className="flex justify-between items-center">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
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
              <div
                onClick={() => setShowMountHpControls(!showMountHpControls)}
                className="p-2.5 bg-fantasy-slate-900/60 hover:bg-red-950/30 border border-fantasy-slate-755 hover:border-red-600/60 rounded-xl cursor-pointer transition-all select-none group relative"
                title="Clique para alterar os Pontos de Vida (Dano / Cura)"
              >
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                  Pontos de Vida (PV)
                  <span className="text-[9px] text-red-400 opacity-80 group-hover:opacity-100">✏️</span>
                </span>
                <span className="text-base font-bold font-mono text-red-400">
                  {mountHp} <span className="text-xs text-gray-500">/ 19</span>
                </span>
              </div>
              <div className="p-2.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Deslocamento</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-gray-200">18 metros</span>
              </div>
            </div>

            {/* Mount HP Damage / Heal Controls */}
            {showMountHpControls && (
              <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-red-300">
                  <span>Modificar PV da Montaria ({mountHp} / 19 HP)</span>
                  <button
                    type="button"
                    onClick={() => setShowMountHpControls(false)}
                    className="text-gray-400 hover:text-white text-xs px-1"
                  >
                    ✕ Fechar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={mountHpValStr}
                    onChange={(e) => setMountHpValStr(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleMountDamage();
                    }}
                    placeholder="Qtd (ex: 5)"
                    className="w-28 bg-fantasy-slate-950 border border-fantasy-slate-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleMountDamage}
                    disabled={!mountHpValStr || parseInt(mountHpValStr, 10) <= 0}
                    className="flex-1 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700/80 text-red-200 text-xs font-mono font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40 shadow"
                  >
                    💥 Dano
                  </button>
                  <button
                    type="button"
                    onClick={handleMountHeal}
                    disabled={!mountHpValStr || parseInt(mountHpValStr, 10) <= 0}
                    className="flex-1 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-200 text-xs font-mono font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40 shadow"
                  >
                    💚 Cura
                  </button>
                </div>
              </div>
            )}

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
