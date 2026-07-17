import React, { useState } from "react";
import { Coins, Plus, Trash2, Shield, Gem, ShoppingBag, Weight, HelpCircle } from "lucide-react";
import { CharacterData, InventoryItem } from "../types";

interface InventoryTabProps {
  char: CharacterData;
  onUpdateInventory: (items: InventoryItem[]) => void;
  onUpdateCoins: (coins: CharacterData["coins"]) => void;
}

export default function InventoryTab({ char, onUpdateInventory, onUpdateCoins }: InventoryTabProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemWeight, setNewItemWeight] = useState(1);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemMagical, setNewItemMagical] = useState(false);
  const [newItemEquipped, setNewItemEquipped] = useState(false);

  const [activeFilter, setActiveFilter] = useState<"all" | "equipped" | "magic">("all");

  const totalWeight = char.inventory.reduce(
    (acc, curr) => acc + (curr.weight || 0) * curr.quantity,
    0
  );

  // D&D 5E Max Weight limit = Strength Score * 15 lbs.
  const strengthValue = char.attributes.str.value;
  const carryCapacity = strengthValue * 15; // 18 * 15 = 270 lbs (approx. 122 kg)

  const handleUpdateQty = (itemId: string, delta: number) => {
    const updated = char.inventory
      .map((item) => {
        if (item.id === itemId) {
          const qty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: qty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0); // remove item if quantities hits 0
    onUpdateInventory(updated);
  };

  const handleToggleEquip = (itemId: string) => {
    const updated = char.inventory.map((item) => {
      if (item.id === itemId) {
        return { ...item, equipped: !item.equipped };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdateInventory(char.inventory.filter((item) => item.id !== itemId));
  };

  const handleAddCoin = (key: keyof CharacterData["coins"], amount: number) => {
    const updated = { ...char.coins };
    updated[key] = Math.max(0, updated[key] + amount);
    onUpdateCoins(updated);
  };

  const handleCoinInputChange = (key: keyof CharacterData["coins"], valStr: string) => {
    const updated = { ...char.coins };
    updated[key] = Math.max(0, parseInt(valStr) || 0);
    onUpdateCoins(updated);
  };

  const handleAddItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      quantity: newItemQty,
      description: newItemDesc || undefined,
      weight: newItemWeight || undefined,
      isMagical: newItemMagical,
      equipped: newItemEquipped
    };

    onUpdateInventory([...char.inventory, newItem]);

    // reset
    setNewItemName("");
    setNewItemQty(1);
    setNewItemWeight(1);
    setNewItemDesc("");
    setNewItemMagical(false);
    setNewItemEquipped(false);
    setShowAddItem(false);
  };

  const filteredItems = char.inventory.filter((item) => {
    if (activeFilter === "equipped") return item.equipped;
    if (activeFilter === "magic") return item.isMagical;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-28 pt-4 space-y-6">
      {/* COINS SECTION (Ruler buttons) */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-5 shadow-xl space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
          <Coins className="w-4 h-4 text-fantasy-crimson-light animate-pulse" />
          Moedas & Recursos
        </h4>

        <div className="grid grid-cols-3 gap-2.5">
          {/* GP */}
          <div className="p-3 bg-fantasy-slate-900 border border-[#b8860b]/20 rounded-2xl text-center space-y-2">
            <span className="text-[10px] font-bold text-fantasy-gold-light uppercase tracking-wider block font-mono">
              Peças de Ouro (GP)
            </span>
            <input
              type="number"
              value={char.coins.gp}
              onChange={(e) => handleCoinInputChange("gp", e.target.value)}
              className="w-full text-center bg-transparent text-xl font-black font-mono text-white focus:outline-none"
            />
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleAddCoin("gp", -5)}
                className="w-7 h-7 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 text-gray-300 rounded-lg font-bold text-xs"
              >
                -5
              </button>
              <button
                onClick={() => handleAddCoin("gp", 5)}
                className="w-7 h-7 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 text-gray-300 rounded-lg font-bold text-xs"
              >
                +5
              </button>
            </div>
          </div>

          {/* SP */}
          <div className="p-3 bg-fantasy-slate-900 border border-gray-400/10 rounded-2xl text-center space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
              Peças de Prata (SP)
            </span>
            <input
              type="number"
              value={char.coins.sp}
              onChange={(e) => handleCoinInputChange("sp", e.target.value)}
              className="w-full text-center bg-transparent text-xl font-black font-mono text-white focus:outline-none"
            />
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleAddCoin("sp", -10)}
                className="w-7 h-7 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 text-gray-300 rounded-lg font-bold text-xs"
              >
                -10
              </button>
              <button
                onClick={() => handleAddCoin("sp", 10)}
                className="w-7 h-7 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 text-gray-300 rounded-lg font-bold text-xs"
              >
                +10
              </button>
            </div>
          </div>

          {/* CP */}
          <div className="p-3 bg-fantasy-slate-900 border border-orange-700/20 rounded-2xl text-center space-y-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block font-mono">
              Peças de Cobre (CP)
            </span>
            <input
              type="number"
              value={char.coins.cp}
              onChange={(e) => handleCoinInputChange("cp", e.target.value)}
              className="w-full text-center bg-transparent text-xl font-black font-mono text-white focus:outline-none"
            />
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleAddCoin("cp", -10)}
                className="w-7 h-7 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 text-gray-300 rounded-lg font-bold text-xs"
              >
                -10
              </button>
              <button
                onClick={() => handleAddCoin("cp", 10)}
                className="w-7 h-7 bg-fantasy-slate-800 hover:bg-fantasy-slate-750 text-gray-300 rounded-lg font-bold text-xs"
              >
                +10
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WEIGHT & CARRY CAPACITY CAPACITY CARDS */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-gray-400 flex items-center gap-1.5 font-mono uppercase">
            <Weight className="w-4 h-4 text-red-400" />
            Peso Carregado
          </span>
          <span className="font-mono text-gray-200">
            {totalWeight.toFixed(1)} / {carryCapacity} lbs ({ (totalWeight * 0.453).toFixed(1) } / {(carryCapacity * 0.453).toFixed(0)} kg)
          </span>
        </div>

        {/* Load ratio bar */}
        <div className="w-full bg-fantasy-slate-900 rounded-full h-2.5 overflow-hidden border border-fantasy-slate-950">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalWeight >= carryCapacity
                ? "bg-fantasy-crimson"
                : totalWeight >= carryCapacity * 0.75
                ? "bg-orange-500"
                : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
            }`}
            style={{ width: `${Math.min(100, (totalWeight / carryCapacity) * 100)}%` }}
          />
        </div>
        {totalWeight >= carryCapacity && (
          <p className="text-[10px] text-fantasy-crimson-light italic text-center font-bold">
            ⚠️ SOBRECARREGADO: Movimento reduzido em 10ft!
          </p>
        )}
      </div>

      {/* INVENTORY ITEMS SECTION */}
      <div className="bg-fantasy-slate-800 border border-fantasy-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs uppercase tracking-wider font-bold text-red-400 font-mono flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-fantasy-crimson-light" />
            Mochila de Aventura
          </h4>
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="text-xs py-1.5 px-3 bg-gradient-to-r from-red-850 via-fantasy-crimson to-red-950 text-white font-extrabold hover:opacity-95 rounded-xl font-mono flex items-center gap-1 transition-all shadow hover:bg-red-700 border border-red-500/10 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item
          </button>
        </div>

        {/* Add Item form */}
        {showAddItem && (
          <form
            onSubmit={handleAddItemForm}
            className="p-4 bg-fantasy-slate-900 border border-fantasy-slate-700 rounded-2xl space-y-3 text-xs"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nome do Item"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-gold"
              />
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Qtd"
                  min="1"
                  required
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                  className="w-1/2 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-2 text-center text-white focus:outline-none focus:border-fantasy-gold"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Peso"
                  value={newItemWeight}
                  onChange={(e) => setNewItemWeight(parseFloat(e.target.value) || 0)}
                  className="w-1/2 bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-2 text-center text-white focus:outline-none focus:border-fantasy-gold"
                />
              </div>
            </div>

            <textarea
              placeholder="Descrição do item (efeitos, raridade, lore...)"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              rows={2}
              className="w-full bg-fantasy-slate-800 border border-fantasy-slate-700/80 rounded-xl py-1.5 px-3 text-white placeholder-gray-500 focus:outline-none"
            />

            <div className="flex gap-4 p-1">
              <label className="flex items-center gap-2 text-gray-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItemMagical}
                  onChange={(e) => setNewItemMagical(e.target.checked)}
                  className="rounded bg-fantasy-slate-850 accent-red-650 border-fantasy-slate-700 w-4 h-4"
                />
                <span>Habilidade Mágica?</span>
              </label>

              <label className="flex items-center gap-2 text-gray-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItemEquipped}
                  onChange={(e) => setNewItemEquipped(e.target.checked)}
                  className="rounded bg-fantasy-slate-850 accent-red-650 border-fantasy-slate-700 w-4 h-4"
                />
                <span>Equipar?</span>
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="flex-1 py-1.5 bg-fantasy-slate-700 text-gray-300 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-gradient-to-r from-red-800 to-red-650 active:scale-95 text-white rounded-xl font-bold transition-all border border-red-500/10"
              >
                Salvar Mochila
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex gap-1 bg-fantasy-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              activeFilter === "all" ? "bg-red-950/40 border border-red-900/30 text-red-200 font-bold" : "text-gray-400"
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveFilter("equipped")}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              activeFilter === "equipped" ? "bg-red-950/40 border border-red-900/30 text-red-200 font-bold" : "text-gray-400"
            }`}
          >
            Equipados
          </button>
          <button
            onClick={() => setActiveFilter("magic")}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              activeFilter === "magic" ? "bg-red-950/40 border border-red-900/30 text-red-200 font-bold" : "text-gray-400"
            }`}
          >
            Mágicos ✨
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-gray-500 font-mono text-xs">
              Mochila vazia para este filtro
            </div>
          ) : (
            filteredItems.map((item) => (
              <InventoryListItem
                key={item.id}
                item={item}
                onUpdateQty={handleUpdateQty}
                onToggleEquip={handleToggleEquip}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Inner list item helper
interface InventoryListItemProps {
  key?: string;
  item: InventoryItem;
  onUpdateQty: (id: string, delta: number) => void;
  onToggleEquip: (id: string) => void;
  onDelete: (id: string) => void;
}

function InventoryListItem({ item, onUpdateQty, onToggleEquip, onDelete }: InventoryListItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        item.isMagical
          ? "bg-gradient-to-r from-fantasy-slate-900/80 to-red-950/15 border-red-900/40 drop-shadow-[0_0_4px_rgba(239,68,68,0.15)]"
          : item.equipped
          ? "bg-fantasy-slate-900/60 border-red-950/30"
          : "bg-fantasy-slate-905 border-fantasy-slate-800 opacity-80"
      }`}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Equip shield icon or visual emblem */}
          <button
            onClick={() => onToggleEquip(item.id)}
            className={`p-1.5 rounded-lg border transition-all ${
              item.equipped
                ? "bg-fantasy-crimson/15 text-fantasy-crimson-light border-fantasy-crimson/40"
                : "bg-fantasy-slate-800 text-gray-500 border-transparent hover:text-gray-300"
            }`}
            title={item.equipped ? "Desequipar" : "Equipar"}
          >
            {item.isMagical && !item.equipped ? (
              <Gem className="w-3.5 h-3.5 text-fantasy-crimson-light" />
            ) : (
              <Shield className="w-3.5 h-3.5" />
            )}
          </button>

          <div onClick={() => setExpanded(!expanded)} className="cursor-pointer min-w-0 flex-1">
            <h5 className="font-semibold text-gray-100 font-display text-sm tracking-wide flex items-center gap-1.5 truncate">
              {item.name}
              {item.isMagical && (
                <span className="text-[9px] font-mono font-bold text-red-300 bg-red-950/35 border border-red-900/35 px-1.5 py-0.2 rounded uppercase animate-pulse">
                  Mágico ✨
                </span>
              )}
            </h5>
            <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
              {item.weight ? `${(item.weight * item.quantity).toFixed(1)} lbs (${(item.weight * item.quantity * 0.453).toFixed(1)} kg)` : "Sem peso"}
            </span>
          </div>
        </div>

        {/* Quantity and Actions controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-fantasy-slate-800 border border-fantasy-slate-700 rounded-xl p-0.5 font-mono">
            <button
              onClick={() => onUpdateQty(item.id, -1)}
              className="px-2 py-0.5 text-gray-400 hover:text-white font-bold"
            >
              -
            </button>
            <span className="px-2 text-xs font-bold text-white min-w-4 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, 1)}
              className="px-2 py-0.5 text-gray-400 hover:text-white font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-500 hover:text-fantasy-crimson-light rounded-lg hover:bg-fantasy-crimson/10 transition-all"
            title="Deletar Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description toggle */}
      {expanded && item.description && (
        <div className="mt-3.5 pt-3.5 border-t border-fantasy-slate-800/80 text-xs text-gray-300 leading-relaxed italic p-3 bg-fantasy-slate-950/40 rounded-xl">
          {item.description}
        </div>
      )}
    </div>
  );
}
