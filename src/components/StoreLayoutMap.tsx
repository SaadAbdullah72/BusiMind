import { useState, useEffect, useRef } from 'react';

interface Aisle {
  id: string;
  name: string;
  slots: string[];
}

interface StoreLayoutMapProps {
  layoutConfig: Aisle[];
  recommendations: any[];
  hoveredRec: any;
  overflowCategories?: string[];
  extraLinesNeeded?: number;
  onHoverRecChange?: (rec: any) => void;
}

export default function StoreLayoutMap({ 
  layoutConfig, 
  recommendations = [], 
  hoveredRec, 
  overflowCategories = [], 
  extraLinesNeeded = 0,
  onHoverRecChange
}: StoreLayoutMapProps) {
  const [aisleCenters, setAisleCenters] = useState<{ [id: string]: { x: number; y: number } }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Default layout if none configured
  const activeLayout = (layoutConfig && layoutConfig.length > 0) ? layoutConfig : [
    { id: '1', name: 'Line 1', slots: ['Cooking Oil', 'Tea', 'Flour', 'Sugar'] },
    { id: '2', name: 'Line 2', slots: ['Milk', 'Yogurt', 'Soap', 'Detergent'] }
  ];

  // Calculate coordinates of all aisle centers for drawing paths
  useEffect(() => {
    const updateCenters = () => {
      const parent = containerRef.current;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const centers: { [id: string]: { x: number; y: number } } = {};
      activeLayout.forEach(aisle => {
        const el = document.getElementById(`aisle-${aisle.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          centers[aisle.id] = {
            x: rect.left - parentRect.left + rect.width / 2,
            y: rect.top - parentRect.top + rect.height / 2
          };
        }
      });
      setAisleCenters(centers);
    };

    updateCenters();
    // Use a small timeout to let the DOM settle before measuring
    const timer = setTimeout(updateCenters, 300);

    window.addEventListener('resize', updateCenters);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCenters);
    };
  }, [activeLayout, layoutConfig]);

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
          <p className="text-[10px] text-slate-400 mt-0.5">Supermarket floor affinity visualization (Dotted paths show co-occurring items).</p>
        </div>
      </div>

      {/* Overflow Warning Banner */}
      {overflowCategories && overflowCategories.length > 0 && (
        <div className="mb-6 p-4 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-xl flex items-start gap-3.5 transition-all text-amber-300">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-xs text-amber-200">Space Constraint Warning ({overflowCategories.length} Categories Overflowing)</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              The following categories cannot fit in your configured layout: <span className="text-amber-400 font-semibold">{overflowCategories.join(', ')}</span>. 
              We recommend creating at least <span className="text-indigo-400 font-bold">{extraLinesNeeded} more Line(s)</span> in your <span className="font-semibold text-slate-350">Business Settings</span> to accommodate all items.
            </p>
          </div>
        </div>
      )}

      {/* Grid Floorplan container */}
      <div 
        ref={containerRef}
        className="flex-1 relative border border-[#1e1e24] bg-[#070709] rounded-xl p-6 min-h-[360px] flex items-center justify-center"
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

                {/* Slots Visual Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {aisle.slots.map((slot, index) => {
                    const isAisleSourceSlot = isSource && slot && hoveredRec.item_b && slot.toLowerCase().includes(hoveredRec.item_b.toLowerCase().split(' ')[0]);
                    const isAisleTargetSlot = isTarget && slot && hoveredRec.item_a && slot.toLowerCase().includes(hoveredRec.item_a.toLowerCase().split(' ')[0]);

                    return (
                      <div 
                        key={index}
                        className={`p-2 border rounded-lg text-center flex flex-col justify-center min-h-[55px] transition-all ${
                          getCategoryColor(slot)
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

        {/* Animated Connector Curve SVG Layer for all recommendations */}
        <svg className="absolute inset-0 pointer-events-none z-20 w-full h-full">
          <defs>
            <linearGradient id="gradient-line-active" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {recommendations.map((rec, idx) => {
            const { source_aisle_id, target_aisle_id } = rec;
            if (!source_aisle_id || !target_aisle_id) return null;
            
            const pt1 = aisleCenters[source_aisle_id];
            const pt2 = aisleCenters[target_aisle_id];
            if (!pt1 || !pt2) return null;

            const isHovered = hoveredRec && 
              hoveredRec.source_aisle_id === source_aisle_id && 
              hoveredRec.target_aisle_id === target_aisle_id;

            return (
              <path 
                key={idx}
                d={`M ${pt1.x} ${pt1.y} Q ${(pt1.x + pt2.x) / 2} ${Math.min(pt1.y, pt2.y) - 45} ${pt2.x} ${pt2.y}`} 
                fill="none" 
                stroke={isHovered ? "url(#gradient-line-active)" : "#475569"} 
                strokeWidth={isHovered ? "3.5" : "1.5"} 
                strokeDasharray={isHovered ? "6 4" : "4 4"} 
                className={isHovered ? "animate-[dash_1s_linear_infinite]" : "opacity-40"}
                style={{
                  filter: isHovered ? 'drop-shadow(0px 0px 4px rgba(249, 115, 22, 0.4))' : 'none',
                  transition: 'stroke 0.3s, stroke-width 0.3s, opacity 0.3s'
                }}
              />
            );
          })}
        </svg>

        {/* Floating Midpoint Labels for all recommendations */}
        {recommendations.map((rec, idx) => {
          const { source_aisle_id, target_aisle_id } = rec;
          if (!source_aisle_id || !target_aisle_id) return null;
          
          const pt1 = aisleCenters[source_aisle_id];
          const pt2 = aisleCenters[target_aisle_id];
          if (!pt1 || !pt2) return null;

          // Compute midpoint with control point adjustment (Q curve midpoint)
          const ctrlX = (pt1.x + pt2.x) / 2;
          const ctrlY = Math.min(pt1.y, pt2.y) - 45;
          const midX = (pt1.x + 2 * ctrlX + pt2.x) / 4;
          const midY = (pt1.y + 2 * ctrlY + pt2.y) / 4;

          const isHovered = hoveredRec && 
            hoveredRec.source_aisle_id === source_aisle_id && 
            hoveredRec.target_aisle_id === target_aisle_id;

          const shortA = rec.item_a ? rec.item_a.split(' ')[0] : 'Item A';
          const shortB = rec.item_b ? rec.item_b.split(' ')[0] : 'Item B';

          return (
            <div 
              key={idx}
              style={{ left: midX, top: midY - 10 }}
              onMouseEnter={() => onHoverRecChange && onHoverRecChange(rec)}
              onMouseLeave={() => onHoverRecChange && onHoverRecChange(null)}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[9.5px] font-bold border transition-all duration-300 pointer-events-auto shadow-md flex items-center gap-1 cursor-pointer select-none ${
                isHovered 
                  ? 'bg-gradient-to-r from-orange-600 to-emerald-600 border-indigo-400 text-white scale-105 opacity-100 shadow-indigo-500/30' 
                  : 'bg-[#121216]/95 border-slate-700/50 text-slate-400 opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <span className="text-orange-400">{shortB}</span>
              <span className="text-[8px] opacity-40">➕</span>
              <span className="text-emerald-400">{shortA}</span>
            </div>
          );
        })}
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
