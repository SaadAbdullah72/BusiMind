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

  const activeLayout = (layoutConfig && layoutConfig.length > 0) ? layoutConfig : [
    { id: '1', name: 'Line 1', slots: ['Cooking Oil', 'Tea', 'Flour', 'Sugar'] },
    { id: '2', name: 'Line 2', slots: ['Milk', 'Yogurt', 'Soap', 'Detergent'] }
  ];

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
    const timer = setTimeout(updateCenters, 300);

    window.addEventListener('resize', updateCenters);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCenters);
    };
  }, [activeLayout, layoutConfig]);

  const getCategoryIcon = (cat: string) => {
    if (!cat) return '📦';
    const c = cat.toLowerCase();
    if (c.includes('oil') || c.includes('cooking')) return '🫒';
    if (c.includes('tea') || c.includes('coffee')) return '🍵';
    if (c.includes('sugar')) return '🍬';
    if (c.includes('flour') || c.includes('grain') || c.includes('wheat')) return '🌾';
    if (c.includes('milk') || c.includes('dairy')) return '🥛';
    if (c.includes('yogurt') || c.includes('cheese')) return '🧀';
    if (c.includes('soap') || c.includes('shampoo')) return '🧴';
    if (c.includes('detergent') || c.includes('clean')) return '🧹';
    if (c.includes('drink') || c.includes('juice') || c.includes('water')) return '🥤';
    if (c.includes('snack') || c.includes('chips') || c.includes('biscuit')) return '🍪';
    if (c.includes('confectionery') || c.includes('candy') || c.includes('chocolate')) return '🍫';
    if (c.includes('rice') || c.includes('dal') || c.includes('lentil')) return '🍚';
    if (c.includes('spice') || c.includes('masala')) return '🌶️';
    if (c.includes('bread') || c.includes('bakery')) return '🍞';
    if (c.includes('fruit') || c.includes('vegetable')) return '🥬';
    if (c.includes('meat') || c.includes('chicken')) return '🍗';
    if (c.includes('frozen')) return '🧊';
    return '📦';
  };

  const getCategoryGradient = (cat: string) => {
    if (!cat) return { bg: 'rgba(30,30,40,0.4)', border: 'rgba(100,100,120,0.2)', text: '#6b7280', glow: 'transparent' };
    const c = cat.toLowerCase();
    if (c.includes('oil') || c.includes('cooking'))
      return { bg: 'rgba(180,120,30,0.08)', border: 'rgba(217,160,50,0.3)', text: '#f0b847', glow: 'rgba(240,184,71,0.06)' };
    if (c.includes('tea') || c.includes('coffee'))
      return { bg: 'rgba(200,100,30,0.08)', border: 'rgba(234,130,55,0.3)', text: '#ea8237', glow: 'rgba(234,130,55,0.06)' };
    if (c.includes('sugar') || c.includes('flour') || c.includes('grain'))
      return { bg: 'rgba(45,180,140,0.08)', border: 'rgba(52,211,153,0.3)', text: '#34d399', glow: 'rgba(52,211,153,0.06)' };
    if (c.includes('milk') || c.includes('yogurt') || c.includes('dairy'))
      return { bg: 'rgba(60,130,230,0.08)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa', glow: 'rgba(96,165,250,0.06)' };
    if (c.includes('soap') || c.includes('detergent') || c.includes('clean'))
      return { bg: 'rgba(16,185,129,0.08)', border: 'rgba(52,211,153,0.3)', text: '#34d399', glow: 'rgba(52,211,153,0.06)' };
    if (c.includes('drink') || c.includes('snack') || c.includes('confectionery') || c.includes('chocolate'))
      return { bg: 'rgba(139,92,246,0.08)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa', glow: 'rgba(167,139,250,0.06)' };
    if (c.includes('rice') || c.includes('dal'))
      return { bg: 'rgba(245,158,11,0.08)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', glow: 'rgba(251,191,36,0.06)' };
    if (c.includes('spice') || c.includes('masala'))
      return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(248,113,113,0.3)', text: '#f87171', glow: 'rgba(248,113,113,0.06)' };
    return { bg: 'rgba(100,116,139,0.08)', border: 'rgba(148,163,184,0.25)', text: '#94a3b8', glow: 'rgba(148,163,184,0.04)' };
  };

  const isAisleHighlighted = (aisleId: string) => {
    if (!hoveredRec) return false;
    return hoveredRec.source_aisle_id === aisleId || hoveredRec.target_aisle_id === aisleId;
  };

  return (
    <div className="relative overflow-hidden flex flex-col h-full bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/5 rounded-[20px] p-7 shadow-2xl">
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[size:40px_40px]" />

      {/* Ambient glow effects */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(99,102,241,0.06)_0%,_transparent_70%)]" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(249,115,22,0.04)_0%,_transparent_70%)]" />

      {/* Header */}
      <div className="flex justify-between items-center mb-7 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(129,140,248,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-200 tracking-tight leading-none">
              Store Floor Map
            </h3>
            <p className="text-[10.5px] text-slate-500 mt-1.5 font-semibold">
              Product co-occurrence & shelf affinity
            </p>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.4)] animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-300">
              {recommendations.length} Pair{recommendations.length !== 1 ? 's' : ''} Detected
            </span>
          </div>
        )}
      </div>

      {/* Overflow Warning */}
      {overflowCategories && overflowCategories.length > 0 && (
        <div className="relative z-10 mb-6 p-3.5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-400 mb-1">
              Space Constraint — {overflowCategories.length} Categories Overflowing
            </h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              <span className="text-amber-500 font-semibold">{overflowCategories.join(', ')}</span> don't fit. 
              Add <span className="text-indigo-400 font-bold">{extraLinesNeeded} more Line(s)</span> in Business Settings.
            </p>
          </div>
        </div>
      )}

      {/* Floor Map Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative border border-white/5 bg-gradient-to-b from-[#06060a]/80 to-[#0a0a10]/60 rounded-2xl p-8 min-h-[400px] flex items-center justify-center"
      >
        {/* Subtle floor grid */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden opacity-[0.03]">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.5)_1px,_transparent_0)] bg-[size:32px_32px]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 w-full max-w-3xl relative z-10">
          {activeLayout.map((aisle) => {
            const isHighlighted = isAisleHighlighted(aisle.id);
            const isSource = hoveredRec?.source_aisle_id === aisle.id;
            const isTarget = hoveredRec?.target_aisle_id === aisle.id;

            return (
              <div 
                key={aisle.id} 
                id={`aisle-${aisle.id}`}
                className={`p-4.5 rounded-2xl transition-all duration-300 flex flex-col gap-3.5 border ${
                  isHighlighted 
                    ? isSource 
                      ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-orange-600/0 shadow-lg shadow-orange-500/5 scale-[1.02]' 
                      : 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-emerald-600/0 shadow-lg shadow-emerald-500/5 scale-[1.02]'
                    : 'border-white/5 bg-[#0c0c12]/60 hover:border-white/10'
                }`}
              >
                {/* Aisle Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                      isHighlighted 
                        ? isSource 
                          ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' 
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}>
                      {aisle.id}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      isHighlighted ? 'text-slate-100' : 'text-slate-400'
                    }`}>
                      {aisle.name}
                    </span>
                  </div>
                  
                  {isHighlighted && (
                    <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                      isSource 
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isSource ? "Source" : "Target"}
                    </span>
                  )}
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {aisle.slots.map((slot, index) => {
                    const isAisleSourceSlot = isSource && slot && hoveredRec?.item_b && slot.toLowerCase().includes(hoveredRec.item_b.toLowerCase().split(' ')[0]);
                    const isAisleTargetSlot = isTarget && slot && hoveredRec?.item_a && slot.toLowerCase().includes(hoveredRec.item_a.toLowerCase().split(' ')[0]);
                    const colors = getCategoryGradient(slot);
                    const isSlotHighlighted = isAisleSourceSlot || isAisleTargetSlot;

                    return (
                      <div 
                        key={index}
                        style={{
                          border: isSlotHighlighted 
                            ? isAisleSourceSlot 
                              ? '1.5px solid rgba(249,115,22,0.5)' 
                              : '1.5px solid rgba(16,185,129,0.5)'
                            : `1px solid ${colors.border}`,
                          background: isSlotHighlighted
                            ? isAisleSourceSlot
                              ? 'rgba(249,115,22,0.08)'
                              : 'rgba(16,185,129,0.08)'
                            : colors.bg,
                        }}
                        className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-center min-h-[62px] transition-all duration-300 relative ${
                          isSlotHighlighted
                            ? isAisleSourceSlot
                              ? 'shadow-[0_0_16px_rgba(249,115,22,0.15),_inset_0_0_12px_rgba(249,115,22,0.05)]'
                              : 'shadow-[0_0_16px_rgba(16,185,129,0.15),_inset_0_0_12px_rgba(16,185,129,0.05)]'
                            : ''
                        }`}
                      >
                        <span className="text-[15px] mb-1.5 leading-none">
                          {getCategoryIcon(slot)}
                        </span>
                        <span 
                          style={{ color: isSlotHighlighted ? (isAisleSourceSlot ? '#fb923c' : '#34d399') : colors.text }}
                          className="text-[10px] font-bold leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {slot || "Empty"}
                        </span>
                        <span className="text-[7.5px] font-bold text-slate-600 mt-1 uppercase tracking-wider">
                          Slot {index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* SVG Connector Curves */}
        <svg className="absolute inset-0 pointer-events-none z-20 w-full h-full">
          <defs>
            <linearGradient id="curve-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="curve-gradient-idle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-soft">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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

            const dx = pt2.x - pt1.x;
            const dy = pt2.y - pt1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const curveOffset = Math.max(40, dist * 0.25);
            const midX = (pt1.x + pt2.x) / 2;
            const midY = (pt1.y + pt2.y) / 2;
            const nx = -dy / dist;
            const ny = dx / dist;
            const ctrlX = midX + nx * curveOffset;
            const ctrlY = midY + ny * curveOffset;

            return (
              <g key={idx}>
                {isHovered && (
                  <path 
                    d={`M ${pt1.x} ${pt1.y} Q ${ctrlX} ${ctrlY} ${pt2.x} ${pt2.y}`} 
                    fill="none" 
                    stroke="url(#curve-gradient-active)" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.15"
                    filter="url(#glow-strong)"
                  />
                )}
                <path 
                  d={`M ${pt1.x} ${pt1.y} Q ${ctrlX} ${ctrlY} ${pt2.x} ${pt2.y}`} 
                  fill="none" 
                  stroke={isHovered ? "url(#curve-gradient-active)" : "url(#curve-gradient-idle)"} 
                  strokeWidth={isHovered ? "2.5" : "1.2"} 
                  strokeDasharray={isHovered ? "8 5" : "4 6"} 
                  strokeLinecap="round"
                  filter={isHovered ? "url(#glow-soft)" : "none"}
                  style={{
                    transition: 'stroke-width 0.3s ease, opacity 0.3s ease',
                    opacity: isHovered ? 1 : 0.5,
                    animation: isHovered ? 'dashFlow 1.2s linear infinite' : 'none'
                  }}
                />
                {isHovered && (
                  <>
                    <circle cx={pt1.x} cy={pt1.y} r="4" fill="#f97316" opacity="0.7" filter="url(#glow-soft)">
                      <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pt2.x} cy={pt2.y} r="4" fill="#10b981" opacity="0.7" filter="url(#glow-soft)">
                      <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Midpoint Badges */}
        {recommendations.map((rec, idx) => {
          const { source_aisle_id, target_aisle_id } = rec;
          if (!source_aisle_id || !target_aisle_id) return null;
          
          const pt1 = aisleCenters[source_aisle_id];
          const pt2 = aisleCenters[target_aisle_id];
          if (!pt1 || !pt2) return null;

          const dx = pt2.x - pt1.x;
          const dy = pt2.y - pt1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const curveOffset = Math.max(40, dist * 0.25);
          const midXBase = (pt1.x + pt2.x) / 2;
          const midYBase = (pt1.y + pt2.y) / 2;
          const nx = -dy / dist;
          const ny = dx / dist;
          const ctrlX = midXBase + nx * curveOffset;
          const ctrlY = midYBase + ny * curveOffset;
          const midX = 0.25 * pt1.x + 0.5 * ctrlX + 0.25 * pt2.x;
          const midY = 0.25 * pt1.y + 0.5 * ctrlY + 0.25 * pt2.y;

          const isHovered = hoveredRec && 
            hoveredRec.source_aisle_id === source_aisle_id && 
            hoveredRec.target_aisle_id === target_aisle_id;

          const shortA = rec.item_a ? rec.item_a.split(' ')[0] : 'A';
          const shortB = rec.item_b ? rec.item_b.split(' ')[0] : 'B';

          return (
            <div 
              key={idx}
              style={{ 
                position: 'absolute',
                left: midX, 
                top: midY,
                transform: 'translate(-50%, -50%)',
              }}
              className={`z-30 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-300 pointer-events-auto select-none whitespace-nowrap backdrop-blur-md ${
                isHovered 
                  ? 'px-3.5 py-1.5 text-[11px] border border-purple-500/40 bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-emerald-500/10 shadow-lg shadow-purple-500/10 opacity-100 scale-105'
                  : 'px-2.5 py-1 text-[10px] border border-slate-500/10 bg-[#0c0c12]/90 shadow-md opacity-70'
              }`}
              onMouseEnter={() => onHoverRecChange && onHoverRecChange(rec)}
              onMouseLeave={() => onHoverRecChange && onHoverRecChange(null)}
            >
              <span className="text-orange-400">{shortB}</span>
              <span className={`text-[8px] font-bold ${isHovered ? 'text-purple-400' : 'text-slate-600'}`}>⟷</span>
              <span className="text-emerald-400">{shortA}</span>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="relative z-10 mt-4 pt-3.5 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-medium">
        <div className="flex gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-indigo-400 to-indigo-600" />
            <span>{activeLayout.length} Lines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-orange-400 to-orange-600" />
            <span>
              {activeLayout.reduce((s, a) => s + a.slots.filter(Boolean).length, 0)} Products
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-600" />
            <span>
              {recommendations.length} Co-occurrence{recommendations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <span className="text-slate-600">
          Hover badges to trace paths
        </span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes dashFlow {
          to { stroke-dashoffset: -26; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
