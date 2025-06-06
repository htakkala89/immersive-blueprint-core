import type { InventoryItem } from "@shared/schema";

interface InventoryProps {
  items: InventoryItem[];
  isVisible: boolean;
  onClose: () => void;
}

export function Inventory({ items, isVisible, onClose }: InventoryProps) {
  if (!isVisible) return null;

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const typeIcons = {
    weapon: "⚔️",
    armor: "🛡️", 
    consumable: "🧪",
    key: "🗝️",
    treasure: "💎",
    misc: "📦"
  };

  const typeNames = {
    weapon: "Weapons",
    armor: "Armor",
    consumable: "Consumables", 
    key: "Keys",
    treasure: "Treasures",
    misc: "Miscellaneous"
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-black bg-opacity-80 border border-blue-500 border-opacity-30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold drop-shadow-lg">🎒 Inventory</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-400 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">Your inventory is empty</p>
            <p className="text-gray-500 text-sm mt-2">Explore the dungeon to find items</p>
          </div>
        )}

        {/* Items by Category */}
        {Object.entries(groupedItems).map(([type, typeItems]) => (
          <div key={type} className="mb-6">
            <h3 className="text-blue-300 text-lg font-semibold mb-3 flex items-center gap-2">
              <span>{typeIcons[type as keyof typeof typeIcons]}</span>
              {typeNames[type as keyof typeof typeNames]} ({typeItems.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {typeItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4 hover:bg-opacity-10 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        {item.quantity > 1 && (
                          <span className="text-blue-300 text-sm bg-blue-500 bg-opacity-20 px-2 py-1 rounded">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}