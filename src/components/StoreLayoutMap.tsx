import { useState, useEffect, useRef } from 'react';

interface Aisle {
  id: string;
  name: string;
  slots: string[];
}

interface StoreLayoutMapProps {
  layoutConfig: Aisle[];
  hoveredRec: any;
}

export default function StoreLayoutMap({ layoutConfig, hoveredRec }: StoreLayoutMapProps) {
  const [viewMode, setViewMode] = useState<'placement' | 'heatmap'>('placement');
  const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default layout if none configured
  const activeLayout = (layoutConfig && layoutConfig.length > 0) ? layoutConfig : [
    { id: '1', name: 'Line 1', slots: ['Cooking Oil', 'Tea', 'Flour', 'Sugar'] },
    { id: '2', name: 'Line 2', slots: ['Milk', 'Yogurt', 'Soap', 'Detergent'] }
  ];

  // Calculate coordinates of line connecting source and target aisles on recommendation hover
  useEffect(() => {
    if (!hoveredRec) {
      setLineCoords(null);
      return;
    }

    const { source_aisle_id, target_aisle_id } = hoveredRec;
    if (!source_aisle_id || !target_aisle_id) {
      setLineCoords(null);
      return;
    }

    const timer = setTimeout(() => {
      const parent = containerRef.current;
      const srcEl = document.getElementById(`aisle-${source_aisle_id}`);
      const targetEl = document.getElementById(`aisle-${target_aisle_id}`);

      if (parent && srcEl && targetEl) {
        const parentRect = parent.getBoundingClientRect();
        const srcRect = srcEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        setLineCoords({
          x1: srcRect.left - parentRect.left + srcRect.width / 2,
          y1: srcRect.top - parentRect.top + srcRect.height / 2,
          x2: targetRect.left - parentRect.left + targetRect.width / 2,
          y2: targetRect.top - parentRect.top + targetRect.height / 2
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hoveredRec, activeLayout]);

  const getCategoryColor = (cat: string) => {
    if (!cat) return 'bg-[#18181c]/60 border-slate-800 text-slate-500';
    const c = cat.toLowerCase();
    if (c.includes('oil')) return 'bg-amber-950/30 border-amber-500/40 text-amber-300';
    if (c.includes('tea')) return 'bg-orange-950/30 border-orange-500/40 text-orange-300';
    if (c.includes('sugar') || c.includes('flour')) return 'bg-teal-950/30 border-teal-500/40 text-teal-300';
    if (c.includes('milk') || c.includes('yogurt')) return 'bg-blue-950/30 border-blue-500/40 text-blue-300';
    if (c.includes('soap') || c.includes('detergent')) return 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300';
    if (c.includes('drink') || c.includes('snack') || c.includes('confectionery')) return 'bg-purple-950/30 border-purple-500/40 text-purple-300';
    return 'bg-slate-900/60 border-slate-700/40 text-slate-300';
  };

  const getSalesHeatClass = (cat: string) => {
    if (!cat) return 'bg-slate-950/80 border-slate-900 opacity-20 text-slate-600';
    const c = cat.toLowerCase();
    // Cooking Oil and Tea have extremely high sales velocity in POS datasets
    if (c.includes('oil') || c.includes('tea')) {
      return 'bg-red-500/20 border-red-500/60 shadow-lg shadow-red-500/10 text-red-200';
    }
    if (c.includes('milk') || c.includes('detergent') || c.includes('sugar')) {
      return 'bg-orange-500/20 border-orange-500/60 shadow-lg shadow-orange-500/10 text-orange-200';
    }
    return 'bg-yellow-500/10 border-yellow-500/35 text-yellow-300';
  };

  const isAisleHighlighted = (aisleId: string) => {
    if (!hoveredRec) return false;
    return hoveredRec.source_aisle_id === aisleId || hoveredRec.target_aisle_id === aisleId;
  };

  return (
    <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1e1e24] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      
      {/* Map Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Interactive 2D Layout Map
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Top-down view of shelf allocations & AI placements.</p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex bg-[#121216]/80 p-0.5 rounded-lg border border-[#1e1e24] text-[10px] font-bold">
          <button
            onClick={() => setViewMode('placement')}
            className={`px-3 py-1 rounded transition-all cursor-pointer ${
              viewMode === 'placement' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Placement Map
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1 rounded transition-all cursor-pointer ${
              viewMode === 'heatmap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sales Heatmap
          </button>
        </div>
      </div>

      {/* Grid Floorplan container */}
      <div 
        ref={containerRef}
        className="flex-1 relative border border-[#1e1e24] bg-[#070709] rounded-xl p-6 min-h-[340px] flex items-center justify-center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-2xl relative z-10">
          {activeLayout.map((aisle) => {
            const isHighlighted = isAisleHighlighted(aisle.id);
            const isSource = hoveredRec?.source_aisle_id === aisle.id;
            const isTarget = hoveredRec?.target_aisle_id === aisle.id;

            return (
              <div 
                key={aisle.id} 
                id={`aisle-${aisle.id}`}
                className={`p-4 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                  isHighlighted 
                    ? isSource 
                      ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/20 scale-[1.03]'
                      : 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/20 scale-[1.03]'
                    : 'border-[#1e1e24] bg-[#0c0c0e]/80'
                }`}
              >
                {/* Aisle ID/Name Badge */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isHighlighted ? 'text-white' : 'text-slate-400'}`}>
                    {aisle.name}
                  </span>
                  
                  {isHighlighted && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isSource ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isSource ? "Source" : "Target"}
                    </span>
                  )}
                </div>

                {/* 2x2 Slots Visual Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {aisle.slots.map((slot, index) => {
                    const isAisleSourceSlot = isSource && slot && hoveredRec.item_b && slot.toLowerCase().includes(hoveredRec.item_b.toLowerCase().split(' ')[0]);
                    const isAisleTargetSlot = isTarget && slot && hoveredRec.item_a && slot.toLowerCase().includes(hoveredRec.item_a.toLowerCase().split(' ')[0]);

                    return (
                      <div 
                        key={index}
                        className={`p-2 border rounded-lg text-center flex flex-col justify-center min-h-[55px] transition-all ${
                          viewMode === 'heatmap' 
                            ? getSalesHeatClass(slot)
                            : getCategoryColor(slot)
                        } ${isAisleSourceSlot ? 'ring-2 ring-orange-500 shadow-md animate-pulse' : ''} ${
                          isAisleTargetSlot ? 'ring-2 ring-emerald-500 shadow-md animate-pulse' : ''
                        }`}
                      >
                        <span className="text-[7.5px] opacity-40 font-bold block mb-0.5 uppercase tracking-wide">
                          Slot {index + 1}
                        </span>
                        <span className="text-[10px] font-bold truncate leading-tight">
                          {slot || "Empty"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated Connector Curve SVG Layer */}
        {lineCoords && (
          <svg className="absolute inset-0 pointer-events-none z-20 w-full h-full">
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path 
              d={`M ${lineCoords.x1} ${lineCoords.y1} Q ${(lineCoords.x1 + lineCoords.x2) / 2} ${Math.min(lineCoords.y1, lineCoords.y2) - 50} ${lineCoords.x2} ${lineCoords.y2}`} 
              fill="none" 
              stroke="url(#gradient-line)" 
              strokeWidth="3.5" 
              strokeDasharray="6 4" 
              className="animate-[dash_1s_linear_infinite]"
              style={{
                filter: 'drop-shadow(0px 0px 4px rgba(249, 115, 22, 0.4))'
              }}
            />
          </svg>
        )}
      </div>

      {/* Embedded CSS styling for line path animation */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
}
