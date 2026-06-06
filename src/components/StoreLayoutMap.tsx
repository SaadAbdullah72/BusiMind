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
    <div className="relative overflow-hidden flex flex-col h-full" style={{
      background: 'linear-gradient(145deg, rgba(8,8,12,0.95) 0%, rgba(12,12,18,0.9) 50%, rgba(8,10,15,0.95) 100%)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)'
    }}>
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Ambient glow effects */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)'
      }} />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)'
      }} />

      {/* Header */}
      <div className="flex justify-between items-center mb-7 relative z-10">
        <div className="flex items-center gap-3">
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(129,140,248,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#e2e8f0',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              Store Floor Map
            </h3>
            <p style={{
              fontSize: '11.5px',
              color: '#64748b',
              marginTop: '2px',
              fontWeight: 500
            }}>
              Product co-occurrence & shelf affinity
            </p>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#818cf8',
              boxShadow: '0 0 8px rgba(129,140,248,0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#818cf8' }}>
              {recommendations.length} Pair{recommendations.length !== 1 ? 's' : ''} Detected
            </span>
          </div>
        )}
      </div>

      {/* Overflow Warning */}
      {overflowCategories && overflowCategories.length > 0 && (
        <div className="relative z-10" style={{
          marginBottom: '24px',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(217,119,6,0.03))',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>
              Space Constraint — {overflowCategories.length} Categories Overflowing
            </h4>
            <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{overflowCategories.join(', ')}</span> don't fit. 
              Add <span style={{ color: '#818cf8', fontWeight: 700 }}>{extraLinesNeeded} more Line(s)</span> in Business Settings.
            </p>
          </div>
        </div>
      )}

      {/* Floor Map Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative"
        style={{
          border: '1px solid rgba(255,255,255,0.04)',
          background: 'linear-gradient(180deg, rgba(6,6,10,0.8) 0%, rgba(10,10,16,0.6) 100%)',
          borderRadius: '16px',
          padding: '32px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Subtle floor grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          borderRadius: '16px',
          overflow: 'hidden',
          opacity: 0.03
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
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
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: isHighlighted 
                    ? isSource 
                      ? '1px solid rgba(249,115,22,0.5)' 
                      : '1px solid rgba(16,185,129,0.5)'
                    : '1px solid rgba(255,255,255,0.05)',
                  background: isHighlighted
                    ? isSource
                      ? 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(234,88,12,0.02))'
                      : 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.02))'
                    : 'rgba(12,12,18,0.6)',
                  boxShadow: isHighlighted 
                    ? isSource 
                      ? '0 8px 32px rgba(249,115,22,0.12), inset 0 1px 0 rgba(249,115,22,0.08)'
                      : '0 8px 32px rgba(16,185,129,0.12), inset 0 1px 0 rgba(16,185,129,0.08)'
                    : '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '14px'
                }}
              >
                {/* Aisle Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '7px',
                      background: isHighlighted 
                        ? isSource ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.15)'
                        : 'rgba(100,116,139,0.1)',
                      border: isHighlighted
                        ? isSource ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(16,185,129,0.3)'
                        : '1px solid rgba(100,116,139,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: isHighlighted
                        ? isSource ? '#fb923c' : '#34d399'
                        : '#64748b'
                    }}>
                      {aisle.id}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isHighlighted ? '#f1f5f9' : '#94a3b8',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase' as const
                    }}>
                      {aisle.name}
                    </span>
                  </div>
                  
                  {isHighlighted && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      background: isSource ? 'rgba(249,115,22,0.12)' : 'rgba(16,185,129,0.12)',
                      color: isSource ? '#fb923c' : '#34d399',
                      border: isSource ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(16,185,129,0.25)'
                    }}>
                      {isSource ? "Source" : "Target"}
                    </span>
                  )}
                </div>

                {/* Slots Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {aisle.slots.map((slot, index) => {
                    const isAisleSourceSlot = isSource && slot && hoveredRec?.item_b && slot.toLowerCase().includes(hoveredRec.item_b.toLowerCase().split(' ')[0]);
                    const isAisleTargetSlot = isTarget && slot && hoveredRec?.item_a && slot.toLowerCase().includes(hoveredRec.item_a.toLowerCase().split(' ')[0]);
                    const colors = getCategoryGradient(slot);
                    const isSlotHighlighted = isAisleSourceSlot || isAisleTargetSlot;

                    return (
                      <div 
                        key={index}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
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
                          boxShadow: isSlotHighlighted
                            ? isAisleSourceSlot
                              ? '0 0 16px rgba(249,115,22,0.15), inset 0 0 12px rgba(249,115,22,0.05)'
                              : '0 0 16px rgba(16,185,129,0.15), inset 0 0 12px rgba(16,185,129,0.05)'
                            : `0 0 12px ${colors.glow}`,
                          textAlign: 'center' as const,
                          display: 'flex',
                          flexDirection: 'column' as const,
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '62px',
                          transition: 'all 0.3s ease',
                          position: 'relative' as const
                        }}
                      >
                        <span style={{ fontSize: '16px', marginBottom: '3px', lineHeight: 1 }}>
                          {getCategoryIcon(slot)}
                        </span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: isSlotHighlighted
                            ? isAisleSourceSlot ? '#fb923c' : '#34d399'
                            : colors.text,
                          lineHeight: 1.2,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const
                        }}>
                          {slot || "Empty"}
                        </span>
                        <span style={{
                          fontSize: '8px',
                          fontWeight: 600,
                          color: '#475569',
                          marginTop: '2px',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em'
                        }}>
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
            // Perpendicular offset for the control point
            const nx = -dy / dist;
            const ny = dx / dist;
            const ctrlX = midX + nx * curveOffset;
            const ctrlY = midY + ny * curveOffset;

            return (
              <g key={idx}>
                {/* Glow layer */}
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
                {/* Main curve */}
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
                {/* Endpoint dots */}
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
          // Quadratic bezier midpoint at t=0.5
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
                zIndex: 30,
                padding: isHovered ? '6px 14px' : '5px 10px',
                borderRadius: '10px',
                fontSize: isHovered ? '11px' : '10px',
                fontWeight: 700,
                border: isHovered 
                  ? '1px solid rgba(139,92,246,0.4)'
                  : '1px solid rgba(100,116,139,0.2)',
                background: isHovered 
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(139,92,246,0.15), rgba(16,185,129,0.2))'
                  : 'rgba(15,15,22,0.9)',
                backdropFilter: 'blur(12px)',
                boxShadow: isHovered 
                  ? '0 8px 24px rgba(139,92,246,0.2), 0 0 1px rgba(255,255,255,0.1)'
                  : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isHovered ? 1 : 0.65,
                pointerEvents: 'auto' as const,
                userSelect: 'none' as const,
                whiteSpace: 'nowrap' as const
              }}
              onMouseEnter={() => onHoverRecChange && onHoverRecChange(rec)}
              onMouseLeave={() => onHoverRecChange && onHoverRecChange(null)}
            >
              <span style={{ color: '#fb923c' }}>{shortB}</span>
              <span style={{ 
                fontSize: '8px', 
                color: isHovered ? '#a78bfa' : '#475569',
                fontWeight: 800
              }}>⟷</span>
              <span style={{ color: '#34d399' }}>{shortA}</span>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="relative z-10" style={{
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'linear-gradient(135deg, #818cf8, #6366f1)' }} />
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>{activeLayout.length} Lines</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'linear-gradient(135deg, #f97316, #ea580c)' }} />
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>
              {activeLayout.reduce((s, a) => s + a.slots.filter(Boolean).length, 0)} Products
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'linear-gradient(135deg, #10b981, #059669)' }} />
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>
              {recommendations.length} Co-occurrence{recommendations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '10px', color: '#374151', fontWeight: 500 }}>
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
