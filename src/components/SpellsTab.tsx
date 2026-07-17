import React, { useState } from "react";
import { Sparkles, ShieldCheck, CircleDot, Circle, Plus, Trash2, CheckCircle, Info, BookOpen, Flame, HelpCircle } from "lucide-react";
import { CharacterData, Spell, SpellSlots } from "../types";
import { allPaladinSpells, oathSpells } from "../lib/allPaladinSpells";

interface SpellsTabProps {
  char: CharacterData;
  onUpdateSpellSlots: (slots: SpellSlots) => void;
  onUpdateSpells: (spells: Spell[]) => void;
  onUseSpellSlot: (level: 1 | 2) => boolean;
}

export default function SpellsTab({
  char,
  onUpdateSpellSlots,
  onUpdateSpells,
  onUseSpellSlot
}: SpellsTabProps) {
  const [activeTab, setActiveTab] = useState<"prepared" | "all">("prepared");
  const [showAddSpell, setShowAddSpell] = useState(false);
  
  // Custom Spell Form States
  const [newSpellName, setNewSpellName] = useState("");
  const [newSpellLevel, setNewSpellLevel] = useState<1 | 2>(1);
  const [newSpellSchool, setNewSpellSchool] = useState("Evocação");
  const [newSpellCasting, setNewSpellCasting] = useState("1 ação");
  const [newSpellRange, setNewSpellRange] = useState("Toque");
  const [newSpellDuration, setNewSpellDuration] = useState("Instantânea");
  const [newSpellDesc, setNewSpellDesc] = useState("");
  const [castSuccessMsg, setCastSuccessMsg] = useState("");

  const profBonus = Math.floor((char.level - 1) / 4) + 2;
  const chaMod = Math.floor((char.attributes.cha.value - 10) / 2);

  // Magic formula calculations
  const spellSaveDc = 8 + profBonus + chaMod; // 8 + 3 + 4 = 15
  const spellAttackBonus = profBonus + chaMod; // 3 + 4 = +7

  // Limit of prepared spells: Carisma mod (+4) + Metade do nível Paladino (5 / 2 = 2) = 6
  const maxPrepared = chaMod + Math.floor(char.level / 2); // 4 + 2 = 6

  // Check if a spell from master list is prepared and if it is an oath spell
  const getSpellStatus = (spellName: string) => {
    // Oath spells are always prepared
    const isOath = oathSpells.some((o) => o.name.toLowerCase() === spellName.toLowerCase());
    if (isOath) return { isOath: true, isPrepared: true };

    const isPrepared = char.spells.some((s) => 
      s.prepared && (
        s.name.toLowerCase() === spellName.toLowerCase() ||
        s.name.toLowerCase().includes(spellName.toLowerCase()) ||
        spellName.toLowerCase().includes(s.name.toLowerCase())
      )
    );

    return { isOath: false, isPrepared };
  };

  // Toggle prepared status
  const handleToggleSpellByName = (spellName: string) => {
    // If it's an Oath spell, it is always prepared (cannot toggle)
    const isOath = oathSpells.some((o) => o.name.toLowerCase() === spellName.toLowerCase());
    if (isOath) return;

    const existingIndex = char.spells.findIndex((s) => 
      s.name.toLowerCase() === spellName.toLowerCase() ||
      s.name.toLowerCase().startsWith(spellName.toLowerCase()) ||
      spellName.toLowerCase().startsWith(s.name.toLowerCase())
    );

    let updatedSpells = [...char.spells];

    if (existingIndex >= 0) {
      // Toggle preparation
      const currentPrepared = updatedSpells[existingIndex].prepared;
      updatedSpells[existingIndex] = {
        ...updatedSpells[existingIndex],
        prepared: !currentPrepared
      };
    } else {
      // Find full spell template in our class spells master list
      const template = allPaladinSpells.find((s) => s.name.toLowerCase() === spellName.toLowerCase());
      if (template) {
        updatedSpells.push({
          ...template,
          id: `sp_${template.id}_${Math.random().toString(36).substr(2, 5)}`,
          prepared: true
        });
      }
    }
    onUpdateSpells(updatedSpells);
  };

  const handleCastSpell = (spell: Spell) => {
    if (spell.level > 0 && spell.level <= 2) {
      const success = onUseSpellSlot(spell.level as 1 | 2);
      if (success) {
        let msg = `Magia "${spell.name}" conjurada! Espaço de magia consumido na ficha.`;
        if (spell.name.toLowerCase().includes("curar")) {
          msg += ` Role 1d8 + ${chaMod} (+4) de cura divina.`;
        } else if (spell.name.toLowerCase().includes("destruição")) {
          msg += ` Adicione o dano extra ao seu próximo ataque físico!`;
        } else if (spell.name.toLowerCase().includes("bênção") || spell.name.toLowerCase().includes("bless")) {
          msg += ` Os alvos recebem +1d4 em jogadas de ataque e salvamentos.`;
        } else {
          msg += ` Use bônus de +${spellAttackBonus} no ataque ou CD ${spellSaveDc} para salvamento.`;
        }
        setCastSuccessMsg(msg);
        setTimeout(() => setCastSuccessMsg(""), 10000);
      }
    }
  };

  const handleToggleSlotBubble = (level: "level1" | "level2", index: number) => {
    const updatedSpellSlots = { ...char.spellSlots };
    const currentActiveSlots = updatedSpellSlots[level].current;
    
    if (index < currentActiveSlots) {
      updatedSpellSlots[level].current = index;
    } else {
      updatedSpellSlots[level].current = index + 1;
    }
    
    onUpdateSpellSlots(updatedSpellSlots);
  };

  const handleAddSpellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpellName) return;

    const newSp: Spell = {
      id: `custom_${Math.random().toString(36).substr(2, 9)}`,
      name: newSpellName,
      level: newSpellLevel,
      school: newSpellSchool,
      castingTime: newSpellCasting,
      range: newSpellRange,
      components: "V, S",
      duration: newSpellDuration,
      description: newSpellDesc,
      prepared: true
    };

    onUpdateSpells([...char.spells, newSp]);

    // reset Form
    setNewSpellName("");
    setNewSpellDesc("");
    setShowAddSpell(false);
  };

  const handleDeleteSpell = (spellId: string) => {
    onUpdateSpells(char.spells.filter((s) => s.id !== spellId));
  };

  // Get count of prepared class spells (excluding the always-prepared oath spells)
  const preparedClassCount = char.spells.filter((s) => {
    const isOath = oathSpells.some((o) => s.name.toLowerCase().includes(o.name.toLowerCase()) || o.name.toLowerCase().includes(s.name.toLowerCase()));
    return s.prepared && !isOath;
  }).length;

  // Let's filter prepared spells for the "Prepared" tab
  // Oath spells should always be shown here, plus any other spell in char.spells that is marked prepared
  const preparedSpellsList: Spell[] = [];
  
  // Add Oath Spells first to make sure they are always accessible
  oathSpells.forEach((o) => {
    const alreadyInChar = char.spells.find((s) => s.name.toLowerCase().includes(o.name.toLowerCase()) || o.name.toLowerCase().includes(s.name.toLowerCase()));
    preparedSpellsList.push({
      id: alreadyInChar?.id || `oath_instance_${o.id}`,
      name: `${o.name} [Juramento]`,
      level: o.level,
      school: o.school,
      castingTime: o.castingTime,
      range: o.range,
      components: o.components,
      duration: o.duration,
      description: o.description,
      prepared: true
    });
  });

  // Add other prepared spells from char.spells
  char.spells.forEach((s) => {
    const isOath = oathSpells.some((o) => s.name.toLowerCase().includes(o.name.toLowerCase()) || o.name.toLowerCase().includes(s.name.toLowerCase()));
    if (s.prepared && !isOath) {
      preparedSpellsList.push(s);
    }
  });

  // Sort prepared list by Circle, then Name
  const sortedPreparedSpells = {
    level1: preparedSpellsList.filter((s) => s.level === 1).sort((a, b) => a.name.localeCompare(b.name)),
    level2: preparedSpellsList.filter((s) => s.level === 2).sort((a, b) => a.name.localeCompare(b.name))
  };

  // Group master lists for "Todas as Magias" tab
  // We want to combine allPaladinSpells and oathSpells into a complete dictionary of Paladin options
  const completeClassList1st = [
    ...allPaladinSpells.filter((s) => s.level === 1),
    ...oathSpells.filter((s) => s.level === 1)
  ].sort((a, b) => a.name.localeCompare(b.name));

  const completeClassList2nd = [
    ...allPaladinSpells.filter((s) => s.level === 2),
    ...oathSpells.filter((s) => s.level === 2)
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-28 pt-4 space-y-6">
      {castSuccessMsg && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold text-center animate-pulse shadow-md">
          {castSuccessMsg}
        </div>
      )}

      {/* Spell Stats Panel (DC & Attack Mod) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Spell Save DC */}
        <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-2xl p-4 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute right-1 bottom-1 opacity-[0.04]">
            <ShieldCheck className="w-20 h-20 text-fantasy-crimson" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">
            CD SALVAMENTO DE MAGIA
          </span>
          <span className="text-3xl font-black text-fantasy-crimson-light font-mono my-2.5">
            {spellSaveDc}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            8 + {profBonus} (prof) + {chaMod} (car)
          </span>
        </div>

        {/* Spell Attack Mod */}
        <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-2xl p-4 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute right-1 bottom-1 opacity-[0.04]">
            <Sparkles className="w-20 h-20 text-fantasy-crimson" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">
            BÔNUS ATAQUE MÁGICO
          </span>
          <span className="text-3xl font-black text-white font-mono my-2.5">
            +{spellAttackBonus}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {profBonus} (prof) + {chaMod} (car)
          </span>
        </div>
      </div>

      {/* SPELL SLOTS TRACKURE (Tactile bubbles) */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fantasy-crimson-light animate-pulse" />
          Espaços de Magia (Spell Slots)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1st Level Slots */}
          <div className="p-3.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-100">1º Círculo</span>
              <span className="text-[10px] text-gray-400 font-mono">
                {char.spellSlots.level1.current} / {char.spellSlots.level1.max} slots restantes
              </span>
            </div>
            <div className="flex gap-2.5">
              {Array.from({ length: char.spellSlots.level1.max }).map((_, idx) => {
                const isActive = idx < char.spellSlots.level1.current;
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleSlotBubble("level1", idx)}
                    className="p-1 active:scale-90 transition-transform focus:outline-none"
                    title={`Slot 1º Nível ${idx + 1}`}
                  >
                    {isActive ? (
                      <CircleDot className="w-6 h-6 text-fantasy-crimson fill-fantasy-crimson/25 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-600 hover:text-gray-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2nd Level Slots */}
          <div className="p-3.5 bg-fantasy-slate-900/60 border border-fantasy-slate-755 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-100">2º Círculo</span>
              <span className="text-[10px] text-gray-400 font-mono">
                {char.spellSlots.level2.current} / {char.spellSlots.level2.max} slots restantes
              </span>
            </div>
            <div className="flex gap-2.5">
              {Array.from({ length: char.spellSlots.level2.max }).map((_, idx) => {
                const isActive = idx < char.spellSlots.level2.current;
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleSlotBubble("level2", idx)}
                    className="p-1 active:scale-90 transition-transform focus:outline-none"
                    title={`Slot 2º Nível ${idx + 1}`}
                  >
                    {isActive ? (
                      <CircleDot className="w-6 h-6 text-fantasy-crimson fill-fantasy-crimson/25 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-600 hover:text-gray-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className="text-[9px] text-gray-500 italic text-center">
          *Toque em uma bolha para gastar ou recarregar slots vazios em tempo real.
        </p>
      </div>

      {/* TABS SELECTOR & CONTROL BAR */}
      <div className="space-y-4">
        {/* Outer Tabs container */}
        <div className="bg-fantasy-slate-900/80 p-1.5 rounded-2xl border border-fantasy-slate-700/60 flex gap-2">
          <button
            onClick={() => setActiveTab("prepared")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono tracking-wide transition-all flex items-center justify-center gap-2 ${
              activeTab === "prepared"
                ? "bg-gradient-to-r from-red-900/60 to-fantasy-crimson text-white border border-red-500/20 shadow-md"
                : "text-gray-400 hover:text-gray-300 hover:bg-fantasy-slate-800/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Magias Preparadas ({preparedClassCount} / {maxPrepared})
          </button>
          
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono tracking-wide transition-all flex items-center justify-center gap-2 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-red-900/60 to-fantasy-crimson text-white border border-red-500/20 shadow-md"
                : "text-gray-400 hover:text-gray-300 hover:bg-fantasy-slate-800/40"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Todas as Magias ({completeClassList1st.length + completeClassList2nd.length})
          </button>
        </div>

        {/* Tab Header Info & Quick Actions */}
        {activeTab === "prepared" ? (
          <div className="p-3.5 bg-fantasy-slate-800/45 border border-fantasy-slate-755 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-gray-300 block font-bold font-display">Descanso Longo Concluído?</span>
              <p className="text-[11px] text-gray-400 leading-normal font-sans">
                Paladinos preparam magias após um descanso longo. Escolha até <strong className="text-fantasy-gold">{maxPrepared} magias de paladino</strong> (as de Juramento são sempre gratuitas).
              </p>
            </div>
            
            {/* Custom spell trigger button */}
            <button
              onClick={() => setShowAddSpell(!showAddSpell)}
              className="py-2 px-3.5 bg-fantasy-slate-900 border border-fantasy-slate-755 text-fantasy-gold font-bold hover:text-fantasy-gold-light rounded-xl transition-all flex items-center gap-1.5 shadow active:scale-95 text-[11px] font-mono self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Customizar Magia
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-red-950/10 border border-red-950/40 rounded-2xl text-xs space-y-1">
            <span className="text-red-400 block font-bold font-display flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-fantasy-gold" />
              Lista Geral de Paladin (D&D 5e 2014)
            </span>
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              Toque no escudo/círculo para preparar ou desmarcar a magia na sua ficha de personagem. Magias de Juramento estão indicadas com <strong className="text-fantasy-gold font-mono">SEMPRE PREPARADA</strong> e não consomem o limite de {maxPrepared}.
            </p>
          </div>
        )}

        {/* Custom spell form rendering */}
        {activeTab === "prepared" && showAddSpell && (
          <form
            onSubmit={handleAddSpellSubmit}
            className="p-4 bg-fantasy-slate-900 border border-fantasy-slate-700/80 rounded-2xl space-y-3.5 text-xs animate-fadeIn"
          >
            <div className="border-b border-fantasy-slate-800 pb-2">
              <h5 className="font-bold text-gray-100 font-display">Criar Magia Customizada</h5>
              <p className="text-[10px] text-gray-400 font-sans">Configure uma magia customizada ou pergaminho especial para sua ficha.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Nome da Magia</label>
                <input
                  type="text"
                  placeholder="Ex: Destruição Sangrenta"
                  required
                  value={newSpellName}
                  onChange={(e) => setNewSpellName(e.target.value)}
                  className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Círculo / Nível</label>
                <select
                  value={newSpellLevel}
                  onChange={(e) => setNewSpellLevel(parseInt(e.target.value) as 1 | 2)}
                  className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-fantasy-gold"
                >
                  <option value={1}>1º Círculo</option>
                  <option value={2}>2º Círculo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Escola de Magia</label>
                <input
                  type="text"
                  placeholder="Ex: Evocação"
                  value={newSpellSchool}
                  onChange={(e) => setNewSpellSchool(e.target.value)}
                  className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Alcance</label>
                <input
                  type="text"
                  placeholder="Ex: 9 metros"
                  value={newSpellRange}
                  onChange={(e) => setNewSpellRange(e.target.value)}
                  className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Tempo de Conjuração</label>
                <input
                  type="text"
                  placeholder="Ex: 1 ação bônus"
                  value={newSpellCasting}
                  onChange={(e) => setNewSpellCasting(e.target.value)}
                  className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Duração</label>
                <input
                  type="text"
                  placeholder="Ex: Concentração"
                  value={newSpellDuration}
                  onChange={(e) => setNewSpellDuration(e.target.value)}
                  className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Descrição</label>
              <textarea
                placeholder="Descrição completa dos efeitos sob regras D&D 5e..."
                rows={3}
                value={newSpellDesc}
                onChange={(e) => setNewSpellDesc(e.target.value)}
                className="w-full bg-fantasy-slate-800 border border-fantasy-slate-755 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
              />
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSpell(false)}
                className="flex-1 py-2.5 bg-fantasy-slate-700 hover:bg-fantasy-slate-650 text-gray-300 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all border border-red-500/15"
              >
                Gravar na Ficha
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB 1: MAGIAS PREPARADAS ==================== */}
        {activeTab === "prepared" && (
          <div className="space-y-6">
            {/* 1st Level Prepared Section */}
            <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="border-b border-fantasy-slate-700 pb-2.5 flex justify-between items-center">
                <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
                  <span className="text-sm">Ⅰ</span>
                  Magias de 1º Círculo
                </h4>
                <span className="text-[10px] font-mono text-gray-400">
                  {sortedPreparedSpells.level1.length} preparadas
                </span>
              </div>

              {sortedPreparedSpells.level1.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-6">Nenhuma magia de 1º círculo preparada.</p>
              ) : (
                <div className="space-y-3.5">
                  {sortedPreparedSpells.level1.map((spell) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      onCast={handleCastSpell}
                      isPrepared={true}
                      onTogglePrepared={() => handleToggleSpellByName(spell.name.replace(" [Juramento]", ""))}
                      onDelete={spell.id.startsWith("custom_") ? () => handleDeleteSpell(spell.id) : undefined}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 2nd Level Prepared Section */}
            <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="border-b border-fantasy-slate-700 pb-2.5 flex justify-between items-center">
                <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
                  <span className="text-sm">Ⅱ</span>
                  Magias de 2º Círculo
                </h4>
                <span className="text-[10px] font-mono text-gray-400">
                  {sortedPreparedSpells.level2.length} preparadas
                </span>
              </div>

              {sortedPreparedSpells.level2.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-6">Nenhuma magia de 2º círculo preparada.</p>
              ) : (
                <div className="space-y-3.5">
                  {sortedPreparedSpells.level2.map((spell) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      onCast={handleCastSpell}
                      isPrepared={true}
                      onTogglePrepared={() => handleToggleSpellByName(spell.name.replace(" [Juramento]", ""))}
                      onDelete={spell.id.startsWith("custom_") ? () => handleDeleteSpell(spell.id) : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: TODAS AS MAGIAS ==================== */}
        {activeTab === "all" && (
          <div className="space-y-6">
            {/* Limit Warning Badge */}
            {preparedClassCount > maxPrepared && (
              <div className="p-3 bg-amber-950/40 border border-amber-600/30 text-amber-300 rounded-2xl text-[11px] font-semibold text-center">
                ⚠️ Alerta: Você possui {preparedClassCount} magias de paladino preparadas, excedendo seu limite atual de {maxPrepared}! Considere desmarcar algumas.
              </div>
            )}

            {/* 1st Level Master Section */}
            <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="border-b border-fantasy-slate-700 pb-2.5 flex justify-between items-center">
                <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
                  <span className="text-sm">Ⅰ</span>
                  Opções de 1º Círculo
                </h4>
                <span className="text-[10px] font-mono text-gray-400">
                  {completeClassList1st.length} magias disponíveis
                </span>
              </div>

              <div className="space-y-3.5">
                {completeClassList1st.map((spell) => {
                  const status = getSpellStatus(spell.name);
                  // Map raw structure to full Spell interface for SpellCard component
                  const fullSpellItem: Spell = {
                    ...spell,
                    id: spell.id,
                    prepared: status.isPrepared
                  };

                  return (
                    <SpellCard
                      key={spell.id}
                      spell={fullSpellItem}
                      onCast={handleCastSpell}
                      isPrepared={status.isPrepared}
                      isOath={status.isOath}
                      onTogglePrepared={() => handleToggleSpellByName(spell.name)}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2nd Level Master Section */}
            <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="border-b border-fantasy-slate-700 pb-2.5 flex justify-between items-center">
                <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
                  <span className="text-sm">Ⅱ</span>
                  Opções de 2º Círculo
                </h4>
                <span className="text-[10px] font-mono text-gray-400">
                  {completeClassList2nd.length} magias disponíveis
                </span>
              </div>

              <div className="space-y-3.5">
                {completeClassList2nd.map((spell) => {
                  const status = getSpellStatus(spell.name);
                  // Map raw structure to full Spell interface for SpellCard component
                  const fullSpellItem: Spell = {
                    ...spell,
                    id: spell.id,
                    prepared: status.isPrepared
                  };

                  return (
                    <SpellCard
                      key={spell.id}
                      spell={fullSpellItem}
                      onCast={handleCastSpell}
                      isPrepared={status.isPrepared}
                      isOath={status.isOath}
                      onTogglePrepared={() => handleToggleSpellByName(spell.name)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Highly stylized individual spell card
interface SpellCardProps {
  key?: string;
  spell: Spell;
  onCast: (spell: Spell) => void;
  isPrepared: boolean;
  isOath?: boolean;
  onTogglePrepared: () => void;
  onDelete?: () => void;
}

function SpellCard({
  spell,
  onCast,
  isPrepared,
  isOath = false,
  onTogglePrepared,
  onDelete
}: SpellCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Check if spell is an Oath Spell by name tags or passed prop
  const actualIsOath = isOath || spell.name.includes("[Juramento]");

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        isPrepared
          ? "bg-fantasy-slate-900/65 border-red-955/30 shadow-[inset_0_0_8px_rgba(239,68,68,0.06)]"
          : "bg-fantasy-slate-900/30 border-fantasy-slate-800 opacity-60 hover:opacity-100 hover:border-fantasy-slate-700"
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Visual preparation toggle button */}
          {actualIsOath ? (
            <div className="p-1 mt-0.5" title="Magia de Juramento: Sempre Preparada">
              <CheckCircle className="w-4 h-4 text-fantasy-gold fill-fantasy-gold/10" />
            </div>
          ) : (
            <button
              onClick={onTogglePrepared}
              className={`p-1 mt-0.5 rounded transition-transform hover:scale-110 focus:outline-none ${
                isPrepared ? "text-green-400" : "text-gray-600 hover:text-gray-400"
              }`}
              title={isPrepared ? "Despreparar Magia" : "Preparar Magia"}
            >
              {isPrepared ? (
                <CheckCircle className="w-4 h-4 fill-green-500/10" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Interactive core text info */}
          <div onClick={() => setExpanded(!expanded)} className="cursor-pointer min-w-0 flex-1 select-none">
            <h5 className="font-bold text-gray-100 font-display text-sm leading-tight flex items-center gap-1.5 flex-wrap">
              <span className="truncate">{spell.name}</span>
              <span className="text-[9px] font-mono font-normal text-gray-400 bg-fantasy-slate-800/80 px-1.5 py-0.2 rounded">
                {spell.school}
              </span>
              {actualIsOath && (
                <span className="text-[8px] font-mono text-fantasy-gold bg-fantasy-gold/10 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide border border-fantasy-gold/25">
                  Juramento
                </span>
              )}
            </h5>
            <span className="text-[10px] text-gray-400 font-mono mt-1 block">
              {spell.castingTime} • Alcance: {spell.range}
            </span>
          </div>
        </div>

        {/* Interactive right controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onCast(spell)}
            disabled={!isPrepared}
            className="py-1 px-3 bg-gradient-to-r from-red-800 to-red-650 hover:from-red-750 hover:to-red-600 disabled:bg-fantasy-slate-800 disabled:text-gray-650 disabled:pointer-events-none text-white font-bold font-mono text-[11px] rounded-lg active:scale-95 transition-all shadow border border-red-500/10"
          >
            Conjurar
          </button>
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-500 hover:text-fantasy-crimson rounded-md hover:bg-fantasy-slate-800 transition-colors"
              title="Deletar Magia"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded block showing full official 5e rules & descriptions */}
      {expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-fantasy-slate-800/80 text-xs text-gray-400 leading-relaxed space-y-2.5 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400 bg-fantasy-slate-950/25 p-2 rounded-xl">
            <div>
              <strong className="text-gray-300">Duração:</strong> {spell.duration}
            </div>
            <div>
              <strong className="text-gray-300">Componentes:</strong> {spell.components}
            </div>
          </div>
          <div className="p-3 bg-fantasy-slate-950/50 border border-fantasy-slate-800 rounded-xl text-gray-300 italic font-sans leading-relaxed text-[11px]">
            {spell.description}
          </div>
        </div>
      )}
    </div>
  );
}
