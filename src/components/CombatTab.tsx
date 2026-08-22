import React, { useState } from "react";
import {
  Shield,
  Flame,
  Swords,
  Bolt,
  Eye,
  Heart,
  Droplets,
  Zap,
  Crosshair,
  Footprints,
  Compass
} from "lucide-react";
import { CharacterData } from "../types";

interface CombatTabProps {
  char: CharacterData;
  onUpdateHp: (current: number, temp: number) => void;
  onUpdateResource: (key: "layOnHands" | "divineSense" | "channelDivinity" | "bloodBlessing", amount: number) => void;
  onOpenHpModal: () => void;
  onUseSpellSlot: (level: 1 | 2) => boolean;
  onToggleHuntersMark?: (active?: boolean) => void;
  onToggleDevoutAmulet?: (used?: boolean) => void;
  onToggleBloodVeil?: (used?: boolean) => void;
}

export default function CombatTab({
  char,
  onUpdateHp,
  onUpdateResource,
  onOpenHpModal,
  onUseSpellSlot,
  onToggleHuntersMark,
  onToggleDevoutAmulet,
  onToggleBloodVeil
}: CombatTabProps) {
  // Navigation between Combat Sub-Tabs
  const [combatSubTab, setCombatSubTab] = useState<"actions" | "bonus" | "reactions_steed">("actions");

  // Smite & Resource States
  const [layOnHandsAmountStr, setLayOnHandsAmountStr] = useState("");
  const [layOnHandsMsg, setLayOnHandsMsg] = useState("");
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState("");
  const [blessingActive, setBlessingActive] = useState(false);
  const [bloodVeilActive, setBloodVeilActive] = useState(false);

  // Steed (Mount) States
  const [mountHp, setMountHp] = useState(19);
  const [mountHpValStr, setMountHpValStr] = useState("");
  const [showMountHpControls, setShowMountHpControls] = useState(false);

  // Ability modifiers & Spell DC
  const strMod = Math.floor((char.attributes.str.value - 10) / 2); // +3
  const chaMod = Math.floor((char.attributes.cha.value - 10) / 2); // +4
  const profBonus = Math.floor((char.level - 1) / 4) + 2; // +3

  const hasDevoutAmulet = char.inventory.some(
    (i) => i.equipped && i.name.toLowerCase().includes("amuleto do devoto")
  );
  const devoutBonus = hasDevoutAmulet ? 1 : 0;
  const spellSaveDc = 8 + profBonus + chaMod + devoutBonus; // CD 15/16

  const channelDivinity = char.channelDivinity || { max: 1, current: 1 };
  const slot1 = char.spellSlots.level1;
  const slot2 = char.spellSlots.level2;

  // Mount HP Handlers
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

  // Feedback display helper
  const triggerFeedback = (msg: string, duration = 6000) => {
    setActionFeedbackMsg(msg);
    setTimeout(() => setActionFeedbackMsg(""), duration);
  };

  // Channel Divinity Handler
  const handleToggleBlessing = (forceAmulet = false) => {
    if (blessingActive) {
      setBlessingActive(false);
      triggerFeedback("Bênção de Sangue desativada.");
      return;
    }

    const useAmulet = forceAmulet || (channelDivinity.current <= 0 && hasDevoutAmulet && !char.devoutAmuletUsed);

    if (useAmulet) {
      if (!hasDevoutAmulet) {
        triggerFeedback("⚠️ Você não possui o Amuleto do Devoto equipado!");
        return;
      }
      if (char.devoutAmuletUsed) {
        triggerFeedback("⚠️ O Amuleto do Devoto já foi utilizado hoje! (Recarrega no amanhecer)");
        return;
      }
      onToggleDevoutAmulet?.(true);
      setBlessingActive(true);
      triggerFeedback("🔮 Bênção de Sangue ativada via Amuleto do Devoto! (+4 para acertar na Alabarda, dano Radiante e Marca de Sangue).");
      return;
    }

    if (channelDivinity.current > 0) {
      onUpdateResource("channelDivinity", channelDivinity.current - 1);
      setBlessingActive(true);
      triggerFeedback("🩸 Bênção de Sangue ativada! (+4 para acertar com Alabarda por 1 min, 1º acerto causa dano Radiante e aplica Marca de Sangue).");
    } else if (hasDevoutAmulet && !char.devoutAmuletUsed) {
      onToggleDevoutAmulet?.(true);
      setBlessingActive(true);
      triggerFeedback("🔮 Bênção de Sangue ativada via Amuleto do Devoto! (+4 no acerto).");
    } else {
      triggerFeedback("⚠️ Sem usos de Canalizar Divindade ou Amuleto do Devoto! (Necessita descanso)");
    }
  };

  const handleChannelDivinityAbsorb = (forceAmulet = false) => {
    const useAmulet = forceAmulet || (channelDivinity.current <= 0 && hasDevoutAmulet && !char.devoutAmuletUsed);

    if (useAmulet) {
      if (!hasDevoutAmulet) {
        triggerFeedback("⚠️ Você não possui o Amuleto do Devoto equipado!");
        return;
      }
      if (char.devoutAmuletUsed) {
        triggerFeedback("⚠️ O Amuleto do Devoto já foi utilizado hoje!");
        return;
      }
      onToggleDevoutAmulet?.(true);
      triggerFeedback(`🔮 Absorver Vitalidade via Amuleto! Alvo deve passar em Salvaguarda de CON (CD ${spellSaveDc}) ou ficará IMPEDIDO.`);
      return;
    }

    if (channelDivinity.current <= 0) {
      triggerFeedback("⚠️ Sem usos restantes de Canalizar Divindade! (Necessita descanso curto ou longo)");
      return;
    }

    onUpdateResource("channelDivinity", channelDivinity.current - 1);
    triggerFeedback(`🩸 Absorver Vitalidade ativado! Alvo tocado deve passar em Salvaguarda de CON (CD ${spellSaveDc}) ou ficará IMPEDIDO.`);
  };

  // Divine Smite Handler
  const handleDivineSmite = (level: 1 | 2) => {
    const canUse = onUseSpellSlot(level);
    if (!canUse) return;
    const numDice = level === 1 ? 2 : 3;
    triggerFeedback(`⚡ Destruição Divina ativada com espaço de ${level}º nível! Role +${numDice}d8 de dano Radiante físico (+1d8 extra se for morto-vivo/corruptor).`);
  };

  // Lay on Hands Handler
  const handleLayOnHands = (healSelf: boolean) => {
    const amount = parseInt(layOnHandsAmountStr, 10);
    if (isNaN(amount) || amount <= 0 || amount > char.layOnHands.current) return;

    const newPool = Math.max(0, char.layOnHands.current - amount);
    onUpdateResource("layOnHands", newPool);

    if (healSelf) {
      const newHp = Math.min(char.hp.max, char.hp.current + amount);
      onUpdateHp(newHp, char.hp.temp);
      setLayOnHandsMsg(`✨ ${amount} HP curados em Percival! Vida: ${newHp}/${char.hp.max}. Reserva: ${newPool}/${char.layOnHands.max} HP.`);
    } else {
      setLayOnHandsMsg(`✨ ${amount} HP gastos da reserva (Cura realizada em aliado/outro). Reserva: ${newPool}/${char.layOnHands.max} HP.`);
    }

    setLayOnHandsAmountStr("");
    setTimeout(() => setLayOnHandsMsg(""), 7000);
  };

  const handleCureCondition = () => {
    if (char.layOnHands.current < 5) {
      triggerFeedback("⚠️ São necessários pelo menos 5 pontos da reserva de Cura pelas Mãos para curar uma doença ou veneno!");
      return;
    }
    const newPool = char.layOnHands.current - 5;
    onUpdateResource("layOnHands", newPool);
    triggerFeedback(`🧪 5 HP da reserva gastos para neutralizar 1 veneno ou curar 1 doença! Reserva restante: ${newPool}/${char.layOnHands.max} HP.`);
  };

  // Divine Sense Handler
  const handleDivineSense = () => {
    if (char.divineSense.current <= 0) return;
    onUpdateResource("divineSense", char.divineSense.current - 1);
    triggerFeedback("👁️ Sentido Divino ativo! Concentre-se por 1 rodada para detectar seres celestiais, corruptores ou mortos-vivos a até 18m.");
  };

  // Blood Veil Handler
  const handleToggleBloodVeil = () => {
    if (bloodVeilActive) {
      setBloodVeilActive(false);
      triggerFeedback("Névoa de sangue dissipada.");
      return;
    }

    if (char.bloodVeilUsed) {
      triggerFeedback("⚠️ O Véu de Sangue já foi utilizado hoje! (Recarrega após um Descanso Longo).");
      return;
    }

    onToggleBloodVeil?.(true);
    setBloodVeilActive(true);
    triggerFeedback("🩸 Véu de Sangue ativado por 1 minuto! Névoa de sangue concede Meia Cobertura (+2 CA e +2 salvaguardas de DES) para você e aliados a até 1,5m.");
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 pb-28 pt-2.5 space-y-3.5 sm:space-y-4">
      {/* 1. TOP DASHBOARD: HP, AC, STATS & SPELL SLOTS */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-3">
          {/* HP Card */}
          <div
            onClick={onOpenHpModal}
            className={`relative bg-gradient-to-br from-red-950/40 via-slate-900 to-fantasy-slate-900 border transition-all duration-300 rounded-2xl p-3.5 flex flex-col justify-between active:scale-[0.97] cursor-pointer overflow-hidden shadow-lg shadow-red-950/20 ${
              char.hp.current <= char.hp.max * 0.4
                ? "border-red-500/80 bg-gradient-to-b from-[#2a0505] to-[#0d0f12] shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse"
                : "border-red-900/40 hover:border-red-600/60"
            }`}
          >
            <div className="absolute right-2 bottom-1 opacity-[0.08] pointer-events-none">
              <Heart className={`w-16 h-16 text-red-500 ${char.hp.current <= char.hp.max * 0.4 ? "animate-pulse" : ""}`} />
            </div>

            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-200/90 font-mono flex items-center gap-1.5 leading-none">
                <span className={`w-2 h-2 rounded-full ${char.hp.current <= char.hp.max * 0.4 ? "bg-red-500 animate-ping" : "bg-red-500"}`} />
                PONTOS DE VIDA
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black font-mono tracking-tight ${char.hp.current <= char.hp.max * 0.4 ? "text-red-400 blood-glow-text" : "text-white"}`}>
                  {char.hp.current}
                </span>
                <span className="text-xs font-semibold text-gray-400 font-mono">
                  / {char.hp.max}
                </span>
                {char.hp.temp > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 border border-blue-500/30 text-blue-300 rounded-md font-mono ml-1 font-extrabold">
                    +{char.hp.temp} Temp
                  </span>
                )}
              </div>

              {/* HP Bar */}
              <div className={`w-full bg-fantasy-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border ${char.hp.current <= char.hp.max * 0.4 ? "border-red-800/80" : "border-red-900/30"}`}>
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

          {/* Armor Class Card */}
          <div className="relative bg-gradient-to-br from-amber-950/30 via-slate-900 to-fantasy-slate-900 border border-amber-900/40 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-amber-950/15">
            <div className="absolute right-2 bottom-1 opacity-[0.08] pointer-events-none">
              <Shield className="w-16 h-16 text-amber-500" />
            </div>

            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-200/90 font-mono flex items-center gap-1.5 leading-none">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                ARMADURA (CA)
              </span>
              <span className="text-[9px] text-amber-300 bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded font-mono font-bold leading-none">
                PLACA
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                {char.ac + (bloodVeilActive ? 2 : 0)}
              </span>
              <span className="text-[10px] text-gray-300 font-medium leading-tight">
                {bloodVeilActive ? "CA 20 (Placa + Véu de Sangue)" : "CA 18 Fixa (Desv. Furtividade)"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Resources Pill Bar */}
        <div className="grid grid-cols-4 gap-1.5 bg-fantasy-slate-900/80 p-2 rounded-2xl border border-red-900/30 text-center shadow-md">
          <div className="p-1 border-r border-red-900/30">
            <span className="text-[9px] uppercase font-mono text-gray-400 font-bold block">Iniciativa</span>
            <span className="text-xs font-bold font-mono text-red-300">
              {char.initiativeBonus >= 0 ? "+" : ""}{char.initiativeBonus}
            </span>
          </div>
          <div className="p-1 border-r border-red-900/30">
            <span className="text-[9px] uppercase font-mono text-gray-400 font-bold block">Deslocamento</span>
            <span className="text-xs font-bold font-mono text-gray-200 truncate">{char.speed}</span>
          </div>
          <div className="p-1 border-r border-red-900/30">
            <span className="text-[9px] uppercase font-mono text-gray-400 font-bold block">Proficiência</span>
            <span className="text-xs font-bold font-mono text-amber-400">+{profBonus}</span>
          </div>
          <div className="p-1">
            <span className="text-[9px] uppercase font-mono text-gray-400 font-bold block">CD Magia</span>
            <span className="text-xs font-bold font-mono text-purple-300">CD {spellSaveDc}</span>
          </div>
        </div>

        {/* Live Active Buffs & Spell Slot Fast Counters */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-fantasy-slate-900/50 p-2 rounded-xl border border-fantasy-slate-755 text-[10px] font-mono">
          {/* Slots 1 & 2 Quick Visual Tracker */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 uppercase font-bold">Espaços:</span>
            <span className={`px-2 py-0.5 rounded-full border ${slot1.current > 0 ? "bg-purple-950/70 border-purple-500/50 text-purple-200" : "bg-gray-900 border-gray-800 text-gray-500"}`}>
              1º: {slot1.current}/{slot1.max}
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${slot2.current > 0 ? "bg-purple-950/70 border-purple-500/50 text-purple-200" : "bg-gray-900 border-gray-800 text-gray-500"}`}>
              2º: {slot2.current}/{slot2.max}
            </span>
          </div>

          {/* Buffs Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {blessingActive && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold border border-red-400 animate-pulse flex items-center gap-1 shadow-sm">
                <Droplets className="w-3 h-3" /> +4 Bênção Sangue
              </span>
            )}
            {char.huntersMarkActive && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 animate-pulse flex items-center gap-1 shadow-sm">
                <Crosshair className="w-3 h-3" /> +1d6 Marca Caçador
              </span>
            )}
            {bloodVeilActive && (
              <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-500/60 animate-pulse flex items-center gap-1 shadow-sm">
                <Shield className="w-3 h-3 text-rose-400" /> +2 CA/DES Véu de Sangue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. FEEDBACK ALERT MESSAGE BAR */}
      {actionFeedbackMsg && (
        <div className="p-3 bg-gradient-to-r from-red-950/80 via-purple-950/80 to-red-950/80 border border-red-500/50 text-red-100 rounded-2xl text-xs font-medium text-center animate-fadeIn shadow-lg shadow-red-950/40">
          {actionFeedbackMsg}
        </div>
      )}

      {/* 3. SUB-TAB SELECTOR (AÇÕES / AÇÕES BÔNUS / REAÇÕES & MONTARIA) */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-fantasy-slate-950/90 rounded-2xl border border-red-900/40 backdrop-blur-md shadow-xl sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setCombatSubTab("actions")}
          className={`py-2 px-1 rounded-xl font-mono text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-center select-none active:scale-[0.97] ${
            combatSubTab === "actions"
              ? "bg-gradient-to-r from-red-700 via-rose-600 to-red-800 text-white shadow-lg shadow-red-950/80 border border-red-400/50 ring-1 ring-red-400/30"
              : "text-gray-400 hover:text-gray-200 hover:bg-fantasy-slate-800/80 border border-transparent"
          }`}
        >
          <Swords className={`w-4 h-4 shrink-0 ${combatSubTab === "actions" ? "text-white animate-pulse" : "text-red-400/80"}`} />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1 leading-tight">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-tight">Ações</span>
            <span className={`text-[8px] sm:text-[9px] font-mono ${combatSubTab === "actions" ? "text-red-100/90" : "text-gray-500"}`}>2 Golpes</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCombatSubTab("bonus")}
          className={`py-2 px-1 rounded-xl font-mono text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-center select-none active:scale-[0.97] ${
            combatSubTab === "bonus"
              ? "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-950/80 border border-amber-300/60 ring-1 ring-amber-300/40"
              : "text-gray-400 hover:text-gray-200 hover:bg-fantasy-slate-800/80 border border-transparent"
          }`}
        >
          <Zap className={`w-4 h-4 shrink-0 ${combatSubTab === "bonus" ? "text-slate-950 fill-slate-950" : "text-amber-400"}`} />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1 leading-tight">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-tight">Bônus</span>
            <span className={`text-[8px] sm:text-[9px] font-mono ${combatSubTab === "bonus" ? "text-amber-950/80 font-bold" : "text-gray-500"}`}>Haste/Véu</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCombatSubTab("reactions_steed")}
          className={`py-2 px-1 rounded-xl font-mono text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-center select-none active:scale-[0.97] ${
            combatSubTab === "reactions_steed"
              ? "bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 text-white shadow-lg shadow-purple-950/80 border border-purple-400/50 ring-1 ring-purple-400/30"
              : "text-gray-400 hover:text-gray-200 hover:bg-fantasy-slate-800/80 border border-transparent"
          }`}
        >
          <Shield className={`w-4 h-4 shrink-0 ${combatSubTab === "reactions_steed" ? "text-purple-200" : "text-purple-400/80"}`} />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1 leading-tight">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-tight">Reações</span>
            <span className={`text-[8px] sm:text-[9px] font-mono ${combatSubTab === "reactions_steed" ? "text-purple-200/90" : "text-gray-500"}`}>🐎 Montaria</span>
          </div>
        </button>
      </div>

      {/* 4. SUB-TAB CONTENT: ⚔️ AÇÕES (ACTIONS) */}
      {combatSubTab === "actions" && (
        <div className="space-y-4 animate-fadeIn">
          {/* SECTION HEADER: ATTACK ACTION WITH EXTRA ATTACK */}
          <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 space-y-3.5 shadow-lg shadow-red-950/20">
            <div className="flex justify-between items-center border-b border-red-900/40 pb-2.5">
              <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-400 animate-pulse" />
                Ação de Ataque (Ataque Extra Ativo)
              </h4>
              <span className="text-[9px] font-mono bg-red-950 border border-red-800/60 text-red-300 px-2 py-0.5 rounded-full font-bold">
                2 Golpes por Ação ⚔️⚔️
              </span>
            </div>

            {/* ALABARDA - MAIN ATTACK CARD */}
            <div className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
              blessingActive
                ? "bg-red-950/30 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : "bg-fantasy-slate-900/80 border-fantasy-slate-755"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-gray-100 font-display text-sm">Alabarda (Lâmina Principal)</h5>
                    <span className="text-[8px] font-mono font-extrabold px-2 py-0.5 bg-red-950 text-red-300 border border-red-800/60 rounded">
                      ALCANCE 3 METROS (10ft)
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    Arma de Haste • Duas Mãos • Executa 2 ataques por turno com esta ação
                  </p>
                </div>
              </div>

              {/* Rolls display grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="py-2.5 px-2 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] text-gray-400 uppercase tracking-wider font-mono">Jogada de Ataque</span>
                  <span className={`font-mono text-base font-black mt-0.5 ${blessingActive ? "text-red-400 animate-pulse" : "text-fantasy-gold"}`}>
                    1d20 +{strMod + profBonus + (blessingActive ? 4 : 0)}
                  </span>
                  <span className="text-[8px] text-gray-400 font-mono">
                    {blessingActive ? "FOR(+3) + PROF(+3) + BÊNÇÃO(+4)" : "FOR(+3) + PROF(+3)"}
                  </span>
                </div>

                <div className="py-2.5 px-2 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] text-gray-400 uppercase tracking-wider font-mono">Dano (Cortante)</span>
                  <span className="font-mono text-base font-black text-red-400 mt-0.5">
                    1d10 + {strMod} {char.huntersMarkActive ? "+ 1d6" : ""}
                  </span>
                  <span className="text-[8px] text-gray-400 font-mono">
                    {char.huntersMarkActive ? "Dano Base + Marca do Caçador" : "Dano Base de Haste"}
                  </span>
                </div>
              </div>

              {/* Inline Divine Smite Trigger on Hit */}
              <div className="pt-2 border-t border-red-900/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Acertou o golpe? Adicione Destruição Divina:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDivineSmite(1)}
                    disabled={slot1.current <= 0}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-1"
                    title="Gasta 1º Nível para +2d8 Radiante"
                  >
                    ⚡ +2d8 (1º Nív)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDivineSmite(2)}
                    disabled={slot2.current <= 0}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-1"
                    title="Gasta 2º Nível para +3d8 Radiante"
                  >
                    ⚡ +3d8 (2º Nív)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PALADIN & OATH ACTIONS: CANALIZAR DIVINDADE, LAY ON HANDS, DIVINE SENSE */}
          <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 space-y-3.5 shadow-lg shadow-red-950/20">
            <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
              <Bolt className="w-4 h-4 text-red-400" />
              Recursos de Ação do Paladino (Juramento de Sangue)
            </h4>

            {/* Canalizar Divindade Options */}
            <div className="p-3.5 bg-fantasy-slate-900/80 border border-red-900/40 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-red-900/30 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-red-400 fill-red-500/20 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-red-300">Canalizar Divindade</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-red-950 text-red-300 border border-red-800/60 rounded">
                    Usos: {channelDivinity.current}/{channelDivinity.max}
                  </span>
                </div>

                {hasDevoutAmulet && (
                  <button
                    type="button"
                    onClick={() => onToggleDevoutAmulet?.(!char.devoutAmuletUsed)}
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                      char.devoutAmuletUsed
                        ? "bg-gray-800/80 text-gray-400 border-gray-700"
                        : "bg-fantasy-gold/20 text-fantasy-gold border-fantasy-gold/40 shadow-[0_0_8px_rgba(245,158,11,0.2)] animate-pulse"
                    }`}
                  >
                    🔮 Amuleto: {char.devoutAmuletUsed ? "Usado ✖" : "Disponível (1/1) ✓"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Absorver Vitalidade */}
                <div className="p-3 bg-fantasy-slate-800/70 border border-red-900/40 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold font-mono text-red-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-red-400" />
                      Absorver Vitalidade (Ação)
                    </span>
                    <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                      Toque um oponente. Salvaguarda de <strong>CON (CD {spellSaveDc})</strong> ou fica <strong className="text-red-300">IMPEDIDO</strong> pela falta de vitalidade.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChannelDivinityAbsorb()}
                    className="w-full py-1.5 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-100 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 shadow"
                  >
                    🩸 Usar Absorção
                  </button>
                </div>

                {/* 2. Bênção de Sangue */}
                <div className={`p-3 rounded-xl border space-y-2 flex flex-col justify-between transition-all ${
                  blessingActive ? "bg-red-950/40 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-fantasy-slate-800/70 border-red-900/40"
                }`}>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold font-mono text-red-300 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-red-400" />
                        Bênção de Sangue (Ação)
                      </span>
                      {blessingActive && (
                        <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                          ATIVO (+4)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                      Imbui sua arma por 1 min. <strong className="text-red-300">+4 para acertar (CAR)</strong>, 1º acerto causa dano Radiante e aplica Marca de Sangue (+4 dano).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleBlessing()}
                    className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 shadow border ${
                      blessingActive
                        ? "bg-red-600 hover:bg-red-500 text-white border-red-400"
                        : "bg-red-950 hover:bg-red-900 border-red-700/60 text-red-100"
                    }`}
                  >
                    {blessingActive ? "✕ DESATIVAR (+4)" : "🩸 ATIVAR BÊNÇÃO (+4)"}
                  </button>
                </div>
              </div>
            </div>

            {/* Cura pelas Mãos (Lay on Hands) */}
            <div className="p-3.5 bg-fantasy-slate-900/80 border border-emerald-900/40 rounded-2xl space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  Cura pelas Mãos (Ação de Toque)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  {char.layOnHands.current} / {char.layOnHands.max} HP
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  placeholder="Qtd. HP a gastar"
                  value={layOnHandsAmountStr}
                  onChange={(e) => setLayOnHandsAmountStr(e.target.value)}
                  min="1"
                  max={char.layOnHands.current}
                  className="w-full sm:w-32 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-2 px-3 text-center text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => handleLayOnHands(true)}
                    disabled={!layOnHandsAmountStr || parseInt(layOnHandsAmountStr, 10) <= 0 || parseInt(layOnHandsAmountStr, 10) > char.layOnHands.current}
                    className="flex-1 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40"
                  >
                    + Curar Percival
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLayOnHands(false)}
                    disabled={!layOnHandsAmountStr || parseInt(layOnHandsAmountStr, 10) <= 0 || parseInt(layOnHandsAmountStr, 10) > char.layOnHands.current}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40"
                  >
                    Gastar (Aliado)
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-emerald-900/30">
                <span className="text-[10px] text-gray-400 font-mono">Gastar 5 HP da reserva cura 1 doença ou veneno:</span>
                <button
                  type="button"
                  onClick={handleCureCondition}
                  disabled={char.layOnHands.current < 5}
                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 text-[10px] font-mono font-bold rounded-lg transition-all active:scale-95 disabled:opacity-30"
                >
                  🧪 Curar Doença/Veneno (5 HP)
                </button>
              </div>

              {layOnHandsMsg && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs font-medium text-center">
                  {layOnHandsMsg}
                </div>
              )}
            </div>

            {/* Sentido Divino (Divine Sense) */}
            <div className="p-3 bg-fantasy-slate-900/80 border border-orange-900/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold font-mono text-orange-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-orange-400" />
                  Sentido Divino (Ação)
                </span>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  Detecta celestiais, corruptores e mortos-vivos a até 18m
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-300">
                  {char.divineSense.current} / {char.divineSense.max}
                </span>
                <button
                  type="button"
                  onClick={handleDivineSense}
                  disabled={char.divineSense.current <= 0}
                  className="py-1.5 px-3 bg-orange-600/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 text-xs font-mono font-bold rounded-xl transition-all active:scale-95 disabled:opacity-30"
                >
                  Usar
                </button>
              </div>
            </div>
          </div>

          {/* TACTICAL UNIVERSAL ACTIONS */}
          <div className="bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-gray-300 font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-gray-400" />
              Ações Táticas Universais
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-fantasy-slate-800/60 border border-fantasy-slate-700 rounded-xl">
                <span className="text-xs font-bold font-mono text-gray-200 block">🏃 Disparar (Dash)</span>
                <span className="text-[9px] text-gray-400 font-mono block mt-0.5">Dobra movimento (+9m)</span>
              </div>

              <div className="p-2.5 bg-fantasy-slate-800/60 border border-fantasy-slate-700 rounded-xl">
                <span className="text-xs font-bold font-mono text-gray-200 block">🛡️ Esquivar (Dodge)</span>
                <span className="text-[9px] text-gray-400 font-mono block mt-0.5">Ataques contra têm desv.</span>
              </div>

              <div className="p-2.5 bg-fantasy-slate-800/60 border border-fantasy-slate-700 rounded-xl">
                <span className="text-xs font-bold font-mono text-gray-200 block">💨 Desengajar</span>
                <span className="text-[9px] text-gray-400 font-mono block mt-0.5">Sem ataques oportunidade</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB CONTENT: ⚡ AÇÕES BÔNUS (BONUS ACTIONS) */}
      {combatSubTab === "bonus" && (
        <div className="space-y-4 animate-fadeIn">
          {/* 1. GOLPE COM O CABO DA ALABARDA (POLEARM MASTER) */}
          <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-fantasy-slate-900 border border-amber-900/50 rounded-2xl p-4 space-y-3 shadow-lg shadow-amber-950/20">
            <div className="flex justify-between items-start border-b border-amber-900/40 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-gray-100 font-display text-sm">Golpe com o Cabo da Alabarda</h5>
                  <span className="text-[8px] font-mono font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                    MESTRE DE ARMAS DE HASTE
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  Ação Bônus ao atacar com a Alabarda • Golpe rápido com a ponta oposta
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="py-2.5 px-2 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider font-mono">Jogada de Ataque</span>
                <span className={`font-mono text-base font-black mt-0.5 ${blessingActive ? "text-red-400 animate-pulse" : "text-fantasy-gold"}`}>
                  1d20 +{strMod + profBonus + (blessingActive ? 4 : 0)}
                </span>
                <span className="text-[8px] text-gray-400 font-mono">
                  {blessingActive ? "+4 Bênção de Sangue ativa" : "FOR(+3) + PROF(+3)"}
                </span>
              </div>

              <div className="py-2.5 px-2 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider font-mono">Dano (Concussão)</span>
                <span className="font-mono text-base font-black text-amber-400 mt-0.5">
                  1d4 + {strMod} {char.huntersMarkActive ? "+ 1d6" : ""}
                </span>
                <span className="text-[8px] text-gray-400 font-mono">
                  {char.huntersMarkActive ? "+1d6 Marca do Caçador" : "Dano com o Cabo"}
                </span>
              </div>
            </div>

            {/* Inline Smite Trigger */}
            <div className="pt-2 border-t border-amber-900/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Acoplou Smite no golpe de cabo?
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDivineSmite(1)}
                  disabled={slot1.current <= 0}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-200 rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                  ⚡ +2d8 (1º Nív)
                </button>
                <button
                  type="button"
                  onClick={() => handleDivineSmite(2)}
                  disabled={slot2.current <= 0}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-200 rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                  ⚡ +3d8 (2º Nív)
                </button>
              </div>
            </div>
          </div>

          {/* 2. MARCA DO CAÇADOR (HUNTER'S MARK) - CONJURAÇÃO E MOVER MARCA */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            char.huntersMarkActive
              ? "bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              : "bg-fantasy-slate-900/80 border-fantasy-slate-755"
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <h5 className="font-bold text-gray-100 font-display text-sm">Marca do Caçador (Hunter's Mark)</h5>
                  <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                    char.huntersMarkActive
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                      : "bg-fantasy-slate-800 text-gray-400 border-fantasy-slate-700"
                  }`}>
                    {char.huntersMarkActive ? "🎯 ATIVA (CONCENTRAÇÃO)" : "1º CÍRCULO • 27 METROS"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 font-mono mt-1 leading-relaxed">
                  Causa <strong className="text-amber-300">+1d6 de dano de arma extra</strong> em cada acerto. Vantagem em testes para rastrear a criatura marcada.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between gap-2">
              {char.huntersMarkActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerFeedback("🏹 Marca do Caçador movida para uma nova criatura! (Ação Bônus consumida, sem gastar slot).")}
                    className="flex-1 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-mono font-bold rounded-xl transition-all active:scale-95 shadow flex items-center justify-center gap-1.5"
                  >
                    🏹 Mover Marca para Novo Alvo (Ação Bônus)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleHuntersMark?.(false);
                      triggerFeedback("Marca do Caçador encerrada.");
                    }}
                    className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700/60 text-xs font-mono font-bold rounded-xl transition-all active:scale-95"
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
                      triggerFeedback("🎯 Marca do Caçador ativada! (+1d6 em todos os acertos com arma).");
                    }
                  }}
                  disabled={slot1.current <= 0}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-extrabold rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4" />
                  CONJURAR MARCA DO CAÇADOR (Gasta 1º Nível)
                </button>
              )}
            </div>
          </div>

          {/* 3. VÉU DE SANGUE (MANTO MÁGICO) */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            bloodVeilActive
              ? "bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
              : "bg-fantasy-slate-900/80 border-fantasy-slate-755"
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <h5 className="font-bold text-gray-100 font-display text-sm">Véu de Sangue (Manto Mágico)</h5>
                  <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                    bloodVeilActive
                      ? "bg-rose-600/30 text-rose-200 border-rose-500/60 animate-pulse"
                      : char.bloodVeilUsed
                      ? "bg-gray-800 text-gray-400 border-gray-700"
                      : "bg-rose-950 text-rose-300 border-rose-800/60"
                  }`}>
                    {bloodVeilActive
                      ? "🩸 NÉVOA ATIVA (1 MIN)"
                      : char.bloodVeilUsed
                      ? "USADO HOJE ✖"
                      : "1x POR DESCANSO LONGO"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 font-mono mt-1 leading-relaxed">
                  Exala uma densa névoa escarlate por 1 minuto. Concede a <strong className="text-rose-300">você e aliados a até 1,5m Meia Cobertura (+2 na CA e +2 em testes de resistência de Destreza)</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-900/30 flex items-center justify-between gap-2">
              {bloodVeilActive ? (
                <button
                  type="button"
                  onClick={handleToggleBloodVeil}
                  className="w-full py-2 bg-red-950 hover:bg-red-900 text-rose-200 border border-red-700/60 text-xs font-mono font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  ✕ Dissipar Névoa de Sangue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleBloodVeil}
                  disabled={char.bloodVeilUsed}
                  className="w-full py-2 bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-white text-xs font-mono font-extrabold rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none border border-rose-500/50 shadow flex items-center justify-center gap-1.5"
                >
                  <Droplets className="w-4 h-4 text-rose-300" />
                  {char.bloodVeilUsed
                    ? "VÉU JÁ UTILIZADO (Recarrega no Descanso Longo)"
                    : "EXALAR VÉU DE SANGUE (Ação Bônus)"}
                </button>
              )}
            </div>
          </div>

          {/* 4. MONTARIA INVESTIDA - AÇÃO BÔNUS DO CAVALO */}
          <div className="p-3.5 bg-fantasy-slate-900/80 border border-fantasy-slate-755 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold font-mono text-red-300 flex items-center gap-1.5">
                <span className="text-base">🐎</span>
                Investida do Pesadelo Sanguinário (Ação Bônus da Montaria)
              </span>
              <p className="text-[10px] text-gray-300 mt-0.5">
                Se a montaria investiu pelo menos 6m em linha reta e derrubou o inimigo (CD 14 FOR), ela ganha um <strong>Ataque de Cascos (+6, 2d6+4)</strong> como Ação Bônus!
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerFeedback("🐎 Pesadelo desferiu o Ataque de Cascos como Ação Bônus! (+6 para acertar, dano 2d6 + 4 concussão).")}
              className="px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-mono font-bold rounded-xl active:scale-95 shrink-0"
            >
              🐎 Cascos Bônus
            </button>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB CONTENT: 🛡️ REAÇÕES & MONTARIA */}
      {combatSubTab === "reactions_steed" && (
        <div className="space-y-4 animate-fadeIn">
          {/* REAÇÕES DO COMBATENTE */}
          <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 space-y-3.5 shadow-lg">
            <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              Reações de Combate (1x por Rodada)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Polearm Master Reaction */}
              <div className="p-3.5 bg-fantasy-slate-900/80 border border-red-900/40 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold font-mono text-red-300 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-red-400" />
                    Guarda de Haste (Inimigo Entra no Alcance)
                  </span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-800/60 rounded font-bold">
                    FEAT
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  Pelo feat <strong>Mestre de Armas de Haste</strong>, quando uma criatura <strong>ENTRA</strong> no seu alcance de 3 metros da Alabarda, você pode desferir um <strong>Ataque de Oportunidade</strong> imediato!
                </p>
                <div className="pt-1 flex items-center justify-between text-xs font-mono text-fantasy-gold font-bold">
                  <span>Ataque: 1d20 +{strMod + profBonus + (blessingActive ? 4 : 0)}</span>
                  <span>Dano: 1d10 + {strMod}</span>
                </div>
              </div>

              {/* Standard Opportunity Attack */}
              <div className="p-3.5 bg-fantasy-slate-900/80 border border-fantasy-slate-755 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold font-mono text-gray-200 flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-gray-400" />
                    Ataque de Oportunidade Padrão (Inimigo Sai)
                  </span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 bg-fantasy-slate-800 text-gray-300 border border-fantasy-slate-700 rounded font-bold">
                    UNIVERSAL
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  Quando um inimigo sai do seu alcance de 3 metros sem desengajar, você pode usar sua reação para realizar um ataque corpo a corpo contra ele.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs font-mono text-fantasy-gold font-bold">
                  <span>Ataque: 1d20 +{strMod + profBonus + (blessingActive ? 4 : 0)}</span>
                  <span>Dano: 1d10 + {strMod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FICHA COMPLETA DO PESADELO SANGUINÁRIO */}
          <div className="bg-gradient-to-br from-red-950/40 via-purple-950/20 to-fantasy-slate-900 border border-red-900/50 rounded-2xl p-4 space-y-4 shadow-lg shadow-red-950/20">
            <div className="flex justify-between items-center border-b border-red-900/40 pb-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-red-300 font-mono flex items-center gap-2">
                <span className="text-base">🐎</span>
                Pesadelo Sanguinário (Montaria Infernal)
              </h4>
              <span className="text-[9px] px-2 py-0.5 bg-red-950 text-red-300 border border-red-900/50 rounded font-mono font-bold">
                Find Steed (2º Círculo)
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-fantasy-slate-900/80 border border-fantasy-slate-755 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Armadura (CA)</span>
                <span className="text-base font-bold font-mono text-fantasy-gold-light">17</span>
              </div>

              <div
                onClick={() => setShowMountHpControls(!showMountHpControls)}
                className="p-2.5 bg-fantasy-slate-900/80 hover:bg-red-950/30 border border-fantasy-slate-755 hover:border-red-600/60 rounded-xl cursor-pointer transition-all select-none group relative"
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

              <div className="p-2.5 bg-fantasy-slate-900/80 border border-fantasy-slate-755 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Deslocamento</span>
                <span className="text-sm font-bold font-mono text-gray-200">18 metros</span>
              </div>
            </div>

            {/* Mount HP Edit Box */}
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

            {/* Attributes Grid */}
            <div className="grid grid-cols-6 gap-1 bg-fantasy-slate-900/60 p-2 rounded-2xl border border-fantasy-slate-755 text-center font-mono text-xs">
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

            {/* Mount Attack */}
            <div className="p-3.5 bg-fantasy-slate-900/80 border border-fantasy-slate-755 rounded-2xl space-y-2">
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
              <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                Alcance 1,5m. Dano: 2d6 + 4 de dano de concussão.
              </p>
            </div>

            {/* Special Abilities */}
            <div className="p-3.5 bg-fantasy-slate-900/80 border border-fantasy-slate-755 rounded-2xl space-y-2.5">
              <span className="text-[9px] font-mono font-bold text-fantasy-gold uppercase tracking-widest block">Habilidades Especiais</span>
              <div className="space-y-2 text-xs">
                <div className="border-b border-fantasy-slate-800 pb-2">
                  <strong className="text-red-400 font-display block mb-0.5">Vínculo de Sangue (Telepatia)</strong>
                  <p className="text-gray-300 leading-relaxed font-mono text-[11px]">
                    Vocês se comunicam telepaticamente a até 1,5 km. Enquanto você estiver montado nele, qualquer magia que você conjurar com o alcance &quot;Você&quot; (como <em>Passo Nebuloso</em>) também se aplica a ele.
                  </p>
                </div>
                <div>
                  <strong className="text-red-400 font-display block mb-0.5">Investida Atropeladora</strong>
                  <p className="text-gray-300 leading-relaxed font-mono text-[11px]">
                    Se o cavalo se mover pelo menos 6 metros em linha reta em direção a uma criatura e a atingir com um ataque de cascos no mesmo turno, o alvo deve passar em um teste de resistência de <strong>Força (CD 14)</strong> ou cairá <strong>Caído (Prone)</strong>. Se cair, o cavalo pode realizar um ataque de cascos contra ele como uma ação bônus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
