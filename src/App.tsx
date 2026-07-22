import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./lib/firebase";

// Icons
import {
  Swords,
  Award,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Zap,
  Flame,
  User,
  Activity,
  Heart
} from "lucide-react";

// Components
import CombatTab from "./components/CombatTab";
import FeaturesTab from "./components/FeaturesTab";
import SpellsTab from "./components/SpellsTab";
import InventoryTab from "./components/InventoryTab";
import HpModal from "./components/HpModal";

// Data & Utilities
import { defaultCharacterData } from "./lib/defaultData";
import { CharacterData, Skill, Feature, Spell, SpellSlots, InventoryItem } from "./types";

// Normalize character data to include new features and resources if missing
function ensureNewDataFields(data: CharacterData): CharacterData {
  const updated = { ...data };
  if (!updated.channelDivinity) {
    updated.channelDivinity = { max: 1, current: 1 };
  }
  if (!updated.bloodBlessing) {
    updated.bloodBlessing = { max: 1, current: 1 };
  }
  const cdIndex = updated.features.findIndex((f) => f.name.toLowerCase().includes("canalizar divindade"));
  const cdFeat = defaultCharacterData.features.find((f) => f.id === "f8");
  if (cdIndex >= 0 && cdFeat) {
    updated.features[cdIndex] = {
      ...updated.features[cdIndex],
      description: cdFeat.description,
      source: cdFeat.source
    };
  } else if (cdFeat) {
    updated.features = [...updated.features, cdFeat];
  }
  const hasBB = updated.features.some((f) => f.name.toLowerCase().includes("bênção de sangue"));
  if (!hasBB) {
    const bbFeat = defaultCharacterData.features.find((f) => f.id === "f9");
    if (bbFeat) updated.features = [...updated.features, bbFeat];
  }
  return updated;
}

export default function App() {
  const [characterData, setCharacterData] = useState<CharacterData>(ensureNewDataFields(defaultCharacterData));
  const [activeTab, setActiveTab] = useState<"combat" | "features" | "spells" | "inventory">("combat");

  // Modals States
  const [isHpModalOpen, setIsHpModalOpen] = useState(false);
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false);

  // Firestore & LocalStorage Sync
  useEffect(() => {
    // 1. Initial Load from LocalStorage
    const cached = localStorage.getItem("percival_character_sheet_v5");
    let localData = defaultCharacterData;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.level && parsed.level >= 5) {
          localData = ensureNewDataFields(parsed);
          setCharacterData(localData);
        } else {
          localStorage.setItem("percival_character_sheet_v5", JSON.stringify(defaultCharacterData));
          setCharacterData(defaultCharacterData);
        }
      } catch (err) {
        console.error("Failed to parse cached character sheet. Using default.", err);
      }
    } else {
      localStorage.setItem("percival_character_sheet_v5", JSON.stringify(defaultCharacterData));
      setCharacterData(defaultCharacterData);
    }

    // 2. Real-time Firestore synchronizer if configured
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, "characters", "percival");
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const remoteData = snap.data() as CharacterData;
            if (!remoteData.level || remoteData.level < 5) {
              // Force upgrade remote DB to level 5 paladin
              setDoc(docRef, defaultCharacterData);
              setCharacterData(defaultCharacterData);
            } else {
              setCharacterData(ensureNewDataFields(remoteData));
            }
          } else {
            // First boot: populate database with current data
            const currentData = cached ? JSON.parse(cached) : defaultCharacterData;
            const uploadData = (currentData.level && currentData.level >= 5) ? ensureNewDataFields(currentData) : defaultCharacterData;
            setDoc(docRef, uploadData);
          }
        },
        (error) => {
          console.error("Firestore synchronizer error:", error);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  // Central state update function (Persisting locally & backing up to database)
  const saveCharacterData = (updater: CharacterData | ((prev: CharacterData) => CharacterData)) => {
    setCharacterData((prev) => {
      const newData = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("percival_character_sheet_v5", JSON.stringify(newData));

      if (isFirebaseConfigured && db) {
        setDoc(doc(db, "characters", "percival"), newData).catch((err) => {
          console.error("Firestore push error:", err);
        });
      }
      return newData;
    });
  };

  // Resources Modifiers
  const handleUpdateHp = (current: number, temp: number) => {
    saveCharacterData((prev) => ({
      ...prev,
      hp: {
        ...prev.hp,
        current,
        temp
      }
    }));
  };

  const handleUpdateResource = (
    key: "layOnHands" | "divineSense" | "channelDivinity" | "bloodBlessing",
    amount: number
  ) => {
    saveCharacterData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { max: 1, current: 1 }),
        current: Math.max(0, amount)
      }
    }));
  };

  const handleUpdateAttributes = (attributes: CharacterData["attributes"]) => {
    const updated = { ...characterData, attributes };
    saveCharacterData(updated);
  };

  const handleUpdateSkills = (skills: Skill[]) => {
    const updated = { ...characterData, skills };
    saveCharacterData(updated);
  };

  const handleUpdateSpellSlots = (spellSlots: SpellSlots) => {
    const updated = { ...characterData, spellSlots };
    saveCharacterData(updated);
  };

  const handleUpdateSpells = (spells: Spell[]) => {
    const updated = { ...characterData, spells };
    saveCharacterData(updated);
  };

  const handleToggleHuntersMark = (active?: boolean) => {
    saveCharacterData((prev) => ({
      ...prev,
      huntersMarkActive: active !== undefined ? active : !prev.huntersMarkActive
    }));
  };

  const handleUpdateInventory = (inventory: InventoryItem[]) => {
    // If equipment changes, let's optionally recalculate armor class (CA)!
    // Example: Placa adds 18. Escudo adds 2.
    const hasPlateMinusOne = inventory.some((i) => i.equipped && i.name.toLowerCase().includes("placa-1"));
    const hasPlate = inventory.some((i) => i.equipped && i.name.toLowerCase().includes("placa") && !i.name.toLowerCase().includes("placa-1"));
    const hasShield = inventory.some((i) => i.equipped && i.name.toLowerCase().includes("escudo"));
    
    let baseAc = 10;
    const dexScore = characterData.attributes.dex.value;
    const dexMod = Math.floor((dexScore - 10) / 2);

    if (hasPlateMinusOne) {
      baseAc = 17; // Plate-1 grants 17 AC
    } else if (hasPlate) {
      baseAc = 18; // Heavy plate ignores Dex
    } else {
      // Light or medium model approximation
      baseAc = 11 + Math.max(0, dexMod);
    }

    if (hasShield) {
      baseAc += 2;
    }

    const updated = {
      ...characterData,
      inventory,
      ac: baseAc
    };

    saveCharacterData(updated);
  };

  const handleUpdateCoins = (coins: CharacterData["coins"]) => {
    const updated = { ...characterData, coins };
    saveCharacterData(updated);
  };

  const handleUpdateFeatures = (features: Feature[]) => {
    const updated = { ...characterData, features };
    saveCharacterData(updated);
  };

  const handleUpdateNotes = (notes: string) => {
    const updated = { ...characterData, notes };
    saveCharacterData(updated);
  };

  // Spend spell slots logic
  const handleUseSpellSlot = (level: 1 | 2): boolean => {
    const updated = { ...characterData };
    const field = level === 1 ? "level1" : "level2";
    
    if (updated.spellSlots[field].current > 0) {
      updated.spellSlots[field].current -= 1;
      saveCharacterData(updated);
      return true;
    } else {
      // Prompt quick notice or failed
      alert(`Sem espaços de magia de ${level}º círculo disponíveis!`);
      return false;
    }
  };

  // Descanso Longo (Long Rest Button) - Rebuild all stats
  const handleLongRestExec = () => {
    const updated = { ...characterData };
    
    // 1. Recover HP to max
    updated.hp.current = updated.hp.max;
    updated.hp.temp = 0;

    // 2. Recharge Lay on Hands pool
    updated.layOnHands.current = updated.layOnHands.max;

    // 3. Recharge Divine Sense charges
    updated.divineSense.current = updated.divineSense.max;

    // 4. Recharge Channel Divinity
    if (updated.channelDivinity) {
      updated.channelDivinity.current = updated.channelDivinity.max;
    } else {
      updated.channelDivinity = { max: 1, current: 1 };
    }

    // 5. Recharge Blood Blessing
    if (updated.bloodBlessing) {
      updated.bloodBlessing.current = updated.bloodBlessing.max;
    } else {
      updated.bloodBlessing = { max: 1, current: 1 };
    }

    // 6. Recharge all Spell slots
    updated.spellSlots.level1.current = updated.spellSlots.level1.max;
    updated.spellSlots.level2.current = updated.spellSlots.level2.max;

    saveCharacterData(updated);
    setShowLongRestConfirm(false);
  };

  return (
    <div className="h-full flex flex-col bg-fantasy-slate-900 text-gray-100 antialiased overflow-hidden select-none relative">
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[40%] bg-red-950 rounded-full blur-[140px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[45%] bg-amber-950/60 rounded-full blur-[130px]" />
      </div>

      {/* 1. STICKY HEADER FIXED ON TOP */}
      <header className="sticky top-0 z-45 bg-gradient-to-r from-red-950/70 via-slate-900/90 to-purple-950/50 backdrop-blur-2xl border-b border-red-900/40 p-3.5 shadow-xl shadow-red-950/20 flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          {/* Character Badge ID */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fantasy-gold via-red-600 to-fantasy-crimson p-[1.5px] shadow-lg shadow-red-950/50 flex items-center justify-center font-display text-lg text-white">
              <span className="blood-glow-text filter drop-shadow">⚔️</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold font-display leading-tight tracking-wider text-fantasy-gold flex items-center gap-1.5 break-words">
                {characterData.name}
              </h1>
              <span className="text-[9px] uppercase font-mono tracking-wider text-red-200/80 block mt-0.5">
                {characterData.class} • Nível {characterData.level}
              </span>
            </div>
          </div>

          {/* Long Rest & Database Status Indicators */}
          <div className="flex items-center gap-2">
            {/* Sync Cloud Indicator */}
            {isFirebaseConfigured && (
              <span className="flex h-2 w-2 relative mr-0.5" title="Sincronizado com Nuvem (Firebase)">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            
            <button
              onClick={() => setShowLongRestConfirm(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-red-900 via-red-800 to-purple-950 active:scale-95 text-white text-[10px] font-bold font-mono tracking-widest rounded-xl border border-red-500/30 hover:border-red-400/60 shadow-md shadow-red-950/50 flex items-center gap-1.5 transition-all uppercase"
              title="Descanso Longo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-300" />
              REST
            </button>
          </div>
        </div>
      </header>

      {/* 2. TAB COMPONENT VIEWER AREA (Dynamic with motion) */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-fantasy-slate-900/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeTab === "combat" && (
              <CombatTab
                char={characterData}
                onUpdateHp={handleUpdateHp}
                onUpdateResource={handleUpdateResource}
                onOpenHpModal={() => setIsHpModalOpen(true)}
                onUseSpellSlot={handleUseSpellSlot}
                onToggleHuntersMark={handleToggleHuntersMark}
              />
            )}
            {activeTab === "features" && (
              <FeaturesTab
                char={characterData}
                onUpdateAttributes={handleUpdateAttributes}
                onUpdateSkills={handleUpdateSkills}
                onUpdateFeatures={handleUpdateFeatures}
                onUpdateNotes={handleUpdateNotes}
              />
            )}
            {activeTab === "spells" && (
              <SpellsTab
                char={characterData}
                onUpdateSpellSlots={handleUpdateSpellSlots}
                onUpdateSpells={handleUpdateSpells}
                onUseSpellSlot={handleUseSpellSlot}
                onToggleHuntersMark={handleToggleHuntersMark}
              />
            )}
            {activeTab === "inventory" && (
              <InventoryTab
                char={characterData}
                onUpdateInventory={handleUpdateInventory}
                onUpdateCoins={handleUpdateCoins}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. FIXED BOTTOM NAVIGATION MENU BAR */}
      <nav className="sticky bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-t border-red-900/40 p-2 shadow-2xl shadow-red-950/30 flex justify-around items-center h-16">
        <button
          onClick={() => setActiveTab("combat")}
          className={`relative p-2 flex flex-col items-center justify-center flex-1 transition-all active:scale-95 ${
            activeTab === "combat" ? "text-red-400 font-extrabold" : "text-gray-400 hover:text-gray-200"
          }`}
          id="tab-combat"
        >
          <Swords className={`w-5 h-5 ${activeTab === "combat" ? "animate-pulse text-red-400" : ""}`} />
          <span className="text-[10px] font-mono tracking-wide mt-1">Combate</span>
          {activeTab === "combat" && (
            <motion.div
              layoutId="active-tab-glow"
              className="absolute -top-2 w-10 h-0.5 bg-gradient-to-r from-red-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.9)]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`relative p-2 flex flex-col items-center justify-center flex-1 transition-all active:scale-95 ${
            activeTab === "features" ? "text-amber-400 font-extrabold" : "text-gray-400 hover:text-gray-200"
          }`}
          id="tab-traits"
        >
          <Award className={`w-5 h-5 ${activeTab === "features" ? "text-amber-400" : ""}`} />
          <span className="text-[10px] font-mono tracking-wide mt-1">Traços</span>
          {activeTab === "features" && (
            <motion.div
              layoutId="active-tab-glow"
              className="absolute -top-2 w-10 h-0.5 bg-gradient-to-r from-amber-400 to-red-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.9)]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("spells")}
          className={`relative p-2 flex flex-col items-center justify-center flex-1 transition-all active:scale-95 ${
            activeTab === "spells" ? "text-purple-400 font-extrabold" : "text-gray-400 hover:text-gray-200"
          }`}
          id="tab-spells"
        >
          <Sparkles className={`w-5 h-5 ${activeTab === "spells" ? "text-purple-400" : ""}`} />
          <span className="text-[10px] font-mono tracking-wide mt-1">Magias</span>
          {activeTab === "spells" && (
            <motion.div
              layoutId="active-tab-glow"
              className="absolute -top-2 w-10 h-0.5 bg-gradient-to-r from-purple-500 to-red-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.9)]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`relative p-2 flex flex-col items-center justify-center flex-1 transition-all active:scale-95 ${
            activeTab === "inventory" ? "text-amber-300 font-extrabold" : "text-gray-400 hover:text-gray-200"
          }`}
          id="tab-inventory"
        >
          <ShoppingBag className={`w-5 h-5 ${activeTab === "inventory" ? "text-amber-300" : ""}`} />
          <span className="text-[10px] font-mono tracking-wide mt-1">Mochila</span>
          {activeTab === "inventory" && (
            <motion.div
              layoutId="active-tab-glow"
              className="absolute -top-2 w-10 h-0.5 bg-gradient-to-r from-amber-300 to-red-500 rounded-full shadow-[0_0_10px_rgba(252,211,77,0.9)]"
            />
          )}
        </button>
      </nav>

      {/* --- OVERLAYS & DIALOGS --- */}

      {/* B. HP Editor modal */}
      {isHpModalOpen && (
        <HpModal
          currentHp={characterData.hp.current}
          maxHp={characterData.hp.max}
          tempHp={characterData.hp.temp}
          onUpdateHp={handleUpdateHp}
          onClose={() => setIsHpModalOpen(false)}
        />
      )}

      {/* C. Long Rest Confirmation overlay */}
      <AnimatePresence>
        {showLongRestConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-fantasy-slate-800 border border-fantasy-slate-700/85 p-6 rounded-3xl text-center shadow-2xl space-y-4"
            >
              <div className="w-14 h-14 bg-fantasy-crimson/10 border border-fantasy-crimson/30 rounded-full flex items-center justify-center mx-auto text-fantasy-crimson-light mb-1">
                <RotateCcw className="w-6 h-6 animate-spin text-fantasy-gold" style={{ animationDuration: "5s" }} />
              </div>
              <h3 className="text-base font-bold font-display text-white">Declarar Descanso Longo?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Isso recuperará todos os seus espaços de magia, a reserva de Cura pelas Mãos, usabilidade do Sentido Divino e recuperará totalmente seus pontos de vida!
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLongRestConfirm(false)}
                  className="flex-1 py-3 bg-fantasy-slate-700 hover:bg-fantasy-slate-650 text-xs font-semibold text-gray-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLongRestExec}
                  className="flex-1 py-3 bg-fantasy-gold text-fantasy-slate-900 font-bold text-xs rounded-xl hover:bg-fantasy-gold-light transition-all shadow-md gold-pulse-btn"
                >
                  Confirmar Descanso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
