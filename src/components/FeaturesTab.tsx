import React, { useState } from "react";
import { Award, Compass, Heart, ScrollText, CheckCircle2, Circle, Edit3, Plus, Trash2 } from "lucide-react";
import { CharacterData, Attribute, Skill, Feature } from "../types";

interface FeaturesTabProps {
  char: CharacterData;
  onUpdateAttributes: (attributes: CharacterData["attributes"]) => void;
  onUpdateSkills: (skills: Skill[]) => void;
  onUpdateFeatures: (features: Feature[]) => void;
  onUpdateNotes: (notes: string) => void;
}

export default function FeaturesTab({
  char,
  onUpdateAttributes,
  onUpdateSkills,
  onUpdateFeatures,
  onUpdateNotes
}: FeaturesTabProps) {
  const [editingAttributes, setEditingAttributes] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");
  const [newFeatureSource, setNewFeatureSource] = useState("");
  const [showAddFeature, setShowAddFeature] = useState(false);

  const profBonus = Math.floor((char.level - 1) / 4) + 2;

  // Calculators
  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  // Attribute modifier mapping
  const mods: Record<string, number> = {
    str: getMod(char.attributes.str.value),
    dex: getMod(char.attributes.dex.value),
    con: getMod(char.attributes.con.value),
    int: getMod(char.attributes.int.value),
    wis: getMod(char.attributes.wis.value),
    cha: getMod(char.attributes.cha.value)
  };

  const handleAttributeChange = (key: keyof CharacterData["attributes"], amount: number) => {
    const attrs = { ...char.attributes };
    const val = attrs[key].value + amount;
    if (val >= 1 && val <= 30) {
      attrs[key].value = val;
      onUpdateAttributes(attrs);
    }
  };

  const handleToggleAttributeProf = (key: keyof CharacterData["attributes"]) => {
    const attrs = { ...char.attributes };
    attrs[key].proficient = !attrs[key].proficient;
    onUpdateAttributes(attrs);
  };

  const handleToggleSkillProf = (skillName: string) => {
    const updatedSkills = char.skills.map((s) => {
      if (s.name === skillName) {
        return { ...s, proficient: !s.proficient };
      }
      return s;
    });
    onUpdateSkills(updatedSkills);
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName) return;
    const newFeat: Feature = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFeatureName,
      source: newFeatureSource || "Personalizado",
      description: newFeatureDesc
    };
    onUpdateFeatures([...char.features, newFeat]);
    setNewFeatureName("");
    setNewFeatureDesc("");
    setNewFeatureSource("");
    setShowAddFeature(false);
  };

  const handleDeleteFeature = (id: string) => {
    onUpdateFeatures(char.features.filter((f) => f.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-28 pt-4 space-y-6">
      {/* SECTION 1: ATTRIBUTES GRID */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-fantasy-crimson-light" />
            Atributos & Salvaguardas
          </h4>
          <button
            onClick={() => setEditingAttributes(!editingAttributes)}
            className="text-xs py-1 px-3 bg-fantasy-slate-750 hover:bg-fantasy-slate-700 border border-fantasy-slate-700/60 transition-colors text-white font-semibold rounded-xl font-mono flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editingAttributes ? "Pronto" : "Editar"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(char.attributes) as Array<keyof CharacterData["attributes"]>).map((key) => {
            const attr = char.attributes[key];
            const modVal = mods[key];
            return (
              <div
                key={key}
                className="relative bg-fantasy-slate-900/60 border border-fantasy-slate-700/40 rounded-2xl p-2.5 flex flex-col items-center justify-between shadow-inner text-center hover:border-fantasy-crimson-light/30 transition-all duration-300"
              >
                {/* Save Prof Shield icon on Top-Right */}
                <button
                  onClick={() => handleToggleAttributeProf(key)}
                  disabled={!editingAttributes}
                  className={`absolute top-1.5 right-1.5 p-1 rounded-md transition-all ${
                    attr.proficient
                      ? "text-fantasy-gold-light"
                      : "text-gray-600 hover:text-gray-400"
                  } disabled:pointer-events-none`}
                  title="Proficiência em Salvatagem"
                >
                  <svg
                    xmlns="http://www.w3.org/2050/svg"
                    fill={attr.proficient ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="w-3.5 h-3.5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                </button>

                {/* Attribute short tag */}
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold font-mono">
                  {attr.name}
                </span>

                {/* Static reference display for the Attribute Modifier (Salvaguarda) */}
                <div
                  className={`my-1 py-1.5 px-2.5 border rounded-xl flex flex-col justify-center items-center w-full shadow-inner select-none transition-all ${
                    attr.proficient
                      ? "bg-red-950/20 border-red-900/60"
                      : "bg-fantasy-slate-800 border-fantasy-slate-700/60"
                  }`}
                >
                  <span className={`text-xl font-mono font-black ${attr.proficient ? "text-fantasy-crimson-light" : "text-white"}`}>
                    {formatMod(modVal + (attr.proficient ? profBonus : 0))}
                  </span>
                  <span className={`text-[9px] uppercase tracking-wider font-bold mt-0.5 ${attr.proficient ? "text-red-400" : "text-gray-400"}`}>
                    Salvaguarda
                  </span>
                </div>

                {/* Score value +/- controls or display */}
                {editingAttributes ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button
                      onClick={() => handleAttributeChange(key, -1)}
                      className="w-5 h-5 bg-fantasy-slate-700 active:bg-fantasy-slate-600 text-gray-200 text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold font-mono text-white">
                      {attr.value}
                    </span>
                    <button
                      onClick={() => handleAttributeChange(key, 1)}
                      className="w-5 h-5 bg-fantasy-slate-700 active:bg-fantasy-slate-600 text-gray-200 text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 font-mono">
                    Valor: {attr.value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-500 italic text-center">
          *Os modificadores em destaque já somam o bônus de proficiência correspondente em cada salvaguarda.
        </p>
      </div>

      {/* SECTION 2: SKILLS LIST */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
          <Compass className="w-4 h-4 text-fantasy-crimson-light" />
          Perícias (Skills)
        </h4>

        {/* Dense skill table */}
        <div className="bg-fantasy-slate-900/40 border border-fantasy-slate-750 rounded-2xl overflow-hidden divide-y divide-fantasy-slate-800/80">
          {char.skills.map((skill) => {
            const attrMod = mods[skill.attributeShortName] || 0;
            const hasProf = skill.proficient;
            const skillBonus = attrMod + (hasProf ? profBonus : 0);

            return (
              <div
                key={skill.name}
                className="px-3.5 py-2.5 flex items-center justify-between hover:bg-fantasy-slate-850/40 transition-colors"
                id={`skill-${skill.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-3">
                  {/* Skill proficiency check indicator */}
                  <button
                    onClick={() => handleToggleSkillProf(skill.name)}
                    className={`p-1 rounded transition-colors ${
                      hasProf ? "text-fantasy-crimson-light" : "text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {hasProf ? (
                      <CheckCircle2 className="w-4 h-4 fill-fantasy-crimson/20" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-200">
                      {skill.name}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-gray-400">
                      {skill.attributeShortName}
                    </span>
                  </div>
                </div>

                {/* Static skill mod badge */}
                <div
                  className={`py-1 px-3 border rounded-xl font-mono text-xs font-bold ${
                    hasProf 
                      ? "bg-red-950/25 border-red-900/40 text-fantasy-crimson-light shadow-[inset_0_0_8px_rgba(239,68,68,0.1)]" 
                      : "bg-fantasy-slate-800 border-fantasy-slate-700/50 text-gray-300"
                  }`}
                >
                  {formatMod(skillBonus)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: CLASS FEATURES & CHARACTER TRAITS */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-fantasy-crimson-light" />
            Características & Talentos
          </h4>
          <button
            onClick={() => setShowAddFeature(!showAddFeature)}
            className="text-xs py-1.5 px-3 bg-gradient-to-r from-red-850 via-fantasy-crimson to-red-950 text-white font-extrabold hover:opacity-95 rounded-xl transition-all flex items-center gap-1 shadow-md shadow-red-950/30 border border-red-500/10 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {/* Render inline form to add custom features */}
        {showAddFeature && (
          <form
            onSubmit={handleAddFeature}
            className="p-4 bg-fantasy-slate-900 border border-fantasy-slate-700 rounded-2xl space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Título da Característica"
                required
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                className="w-full bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
              />
              <input
                type="text"
                placeholder="Fonte (Ex: Classe Nív 3)"
                value={newFeatureSource}
                onChange={(e) => setNewFeatureSource(e.target.value)}
                className="w-full bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
              />
            </div>
            <textarea
              placeholder="Descrição detalhada do recurso..."
              rows={3}
              value={newFeatureDesc}
              onChange={(e) => setNewFeatureDesc(e.target.value)}
              className="w-full bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddFeature(false)}
                className="flex-1 py-2 bg-fantasy-slate-700 hover:bg-fantasy-slate-650 text-xs text-gray-300 font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-red-800 to-red-600 hover:opacity-95 text-xs text-white font-bold rounded-xl active:scale-95 transition-all"
              >
                Salvar Recurso
              </button>
            </div>
          </form>
        )}

        {/* Feature blocks */}
        <div className="space-y-3">
          {char.features.map((feature) => (
            <div
              key={feature.id}
              className="p-3.5 bg-fantasy-slate-900/50 border border-red-950/45 hover:border-red-900/35 rounded-2xl relative group transition-all duration-300"
            >
              <button
                onClick={() => handleDeleteFeature(feature.id)}
                className="absolute top-3.5 right-3.5 p-1 bg-fantasy-slate-800 hover:bg-fantasy-crimson/25 border border-fantasy-slate-700 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                title="Deletar Recurso"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="pr-8">
                <h5 className="font-semibold text-gray-100 font-display text-sm tracking-wide">
                  {feature.name}
                </h5>
                <span className="text-[10px] text-red-450 font-mono font-bold block mt-0.5">
                  {feature.source}
                </span>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: BACKSTORY & NOTES */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-fantasy-crimson-light" />
          Biografia & Notas de Aventura
        </h4>
        <textarea
          value={char.notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          rows={6}
          placeholder="Escreva sobre suas glórias, tendências ou anotações..."
          className="w-full bg-fantasy-slate-900/60 border border-red-950/40 focus:border-red-800/60 rounded-2xl text-xs text-gray-200 py-3.5 px-4 focus:outline-none leading-relaxed custom-scrollbar placeholder-gray-500 transition-all shadow-inner"
        />
      </div>
    </div>
  );
}
