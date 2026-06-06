import { useState } from 'react';
import StoreLayoutMap from './StoreLayoutMap';

export default function RetailOverview({ kpis, swot, onScanComplete, scanning, depletionRisks, layoutRecommendations, layoutConfig, overflowCategories, extraLinesNeeded }: any) {
  const [hoveredRec, setHoveredRec] = useState<any>(null);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Supermarket Operations
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Live KPI and strategic analysis
          </p>
        </div>
        <button
          onClick={onScanComplete}
          disabled={scanning}
          style={{
            padding: '10px 24px',
            background: scanning ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #ea580c, #f59e0b)',
            color: 'white',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: '14px',
            border: 'none',
            boxShadow: scanning ? 'none' : '0 8px 24px rgba(249,115,22,0.3), 0 2px 4px rgba(0,0,0,0.2)',
            cursor: scanning ? 'not-allowed' : 'pointer',
            opacity: scanning ? 0.6 : 1,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '-0.01em'
          }}
        >
          {scanning ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path opacity="0.85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Scanning Operations...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Run Diagnostic Scan</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5">
        {[
          {
            label: 'Total Revenue',
            value: kpis.total_revenue,
            sub: `${kpis.total_transactions} transactions today`,
            color: '#f97316',
            gradient: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.03))',
            borderColor: 'rgba(249,115,22,0.15)',
            icon: (
              <svg width="40" height="40" viewBox="0 0 20 20" fill="currentColor" opacity="0.06">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            )
          },
          {
            label: 'Waste Risk Cost',
            value: kpis.waste_risk_cost,
            sub: 'Due to approaching expiries',
            color: '#f87171',
            gradient: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(239,68,68,0.03))',
            borderColor: 'rgba(248,113,113,0.15)',
            icon: (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.06">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )
          },
          {
            label: 'Bestseller',
            value: kpis.bestseller,
            sub: `Avg Basket: ${kpis.average_basket_value}`,
            color: '#34d399',
            gradient: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(16,185,129,0.03))',
            borderColor: 'rgba(52,211,153,0.15)',
            isText: true,
            icon: (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.06">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )
          }
        ].map((card, i) => (
          <div key={i} style={{
            background: card.gradient,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${card.borderColor}`,
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '12px', right: '14px' }}>{card.icon}</div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.02em' }}>
              {card.label}
            </p>
            <p style={{
              fontSize: card.isText ? '20px' : '28px',
              fontWeight: 800,
              color: card.color,
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {card.value}
            </p>
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px', fontWeight: 500 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* SWOT Board */}
      <div className="grid grid-cols-2 gap-5 mt-6">
        {[
          { title: 'Strengths', items: swot.strengths, color: '#34d399', borderColor: 'rgba(52,211,153,0.15)', bg: 'rgba(52,211,153,0.04)', icon: '📈' },
          { title: 'Weaknesses', items: swot.weaknesses, color: '#f87171', borderColor: 'rgba(248,113,113,0.15)', bg: 'rgba(248,113,113,0.04)', icon: '⚠️' },
          { title: 'Opportunities', items: swot.opportunities, color: '#fbbf24', borderColor: 'rgba(251,191,36,0.15)', bg: 'rgba(251,191,36,0.04)', icon: '💡' },
          { title: 'Threats', items: swot.threats, color: '#fb923c', borderColor: 'rgba(251,146,60,0.15)', bg: 'rgba(251,146,60,0.04)', icon: '🛡️' }
        ].map((section, i) => (
          <div key={i} style={{
            background: `linear-gradient(145deg, ${section.bg}, rgba(15,23,42,0.4))`,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${section.borderColor}`,
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              color: section.color,
              fontWeight: 800,
              fontSize: '14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em'
            }}>
              <span style={{ fontSize: '16px' }}>{section.icon}</span>
              {section.title}
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((item: string, j: number) => (
                <li key={j} style={{
                  fontSize: '12.5px',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  lineHeight: 1.5
                }}>
                  <span style={{ color: section.color, marginTop: '2px', fontSize: '6px' }}>●</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Priority Action Steps */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(99,102,241,0.04), rgba(15,23,42,0.4))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: '18px',
        padding: '22px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        marginTop: '4px'
      }}>
        <h3 style={{
          color: '#818cf8',
          fontWeight: 800,
          fontSize: '14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          Priority Action Steps
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {swot.action_steps.map((a: string, i: number) => (
            <li key={i} style={{
              background: 'rgba(99,102,241,0.04)',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12.5px',
              color: '#e2e8f0',
              border: '1px solid rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              lineHeight: 1.4
            }}>
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '11px',
                flexShrink: 0,
                border: '1px solid rgba(99,102,241,0.2)'
              }}>{i+1}</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Depletion Risks */}
      {depletionRisks && depletionRisks.length > 0 && (
        <div style={{
          background: 'linear-gradient(145deg, rgba(244,63,94,0.04), rgba(15,23,42,0.4))',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(244,63,94,0.12)',
          borderRadius: '18px',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          marginTop: '4px'
        }}>
          <h3 style={{
            color: '#fb7185',
            fontWeight: 800,
            fontSize: '14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🚨</span>
            Critical Stock Depletion Risks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {depletionRisks.map((risk: any, i: number) => (
              <div key={i} style={{
                background: 'rgba(244,63,94,0.03)',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid rgba(244,63,94,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '13px' }}>{risk.name}</span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: risk.status === 'Critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                      color: risk.status === 'Critical' ? '#f87171' : '#fbbf24',
                      border: risk.status === 'Critical' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)'
                    }}>
                      {risk.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3" style={{ marginTop: '14px' }}>
                    {[
                      { label: 'Current Stock', value: `${risk.stock} units` },
                      { label: 'Sales Velocity', value: `${risk.sales_velocity_daily}/day` },
                      { label: 'Supplier SLA', value: `${risk.supplier_lead_days}d lead` }
                    ].map((stat, j) => (
                      <div key={j}>
                        <p style={{ fontSize: '10px', color: '#475569', fontWeight: 500, marginBottom: '3px' }}>{stat.label}</p>
                        <p style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '12px' }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#64748b' }}>Estimated Stockout In:</span>
                  <span style={{
                    fontWeight: 800,
                    color: risk.status === 'Critical' ? '#f87171' : '#fbbf24'
                  }}>{risk.days_left} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map + Recommendations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Map Column */}
        <div className="lg:col-span-2 h-full">
          <StoreLayoutMap 
            layoutConfig={layoutConfig} 
            recommendations={layoutRecommendations}
            hoveredRec={hoveredRec} 
            overflowCategories={overflowCategories}
            extraLinesNeeded={extraLinesNeeded}
            onHoverRecChange={setHoveredRec}
          />
        </div>

        {/* AI Recommendations Column */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(251,191,36,0.03), rgba(15,23,42,0.5))',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(251,191,36,0.1)',
          borderRadius: '18px',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '14px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>🧠</span>
              AI Shelf Optimization
            </h3>
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              marginBottom: '18px',
              fontWeight: 500,
              lineHeight: 1.5
            }}>
              Hover over any card to visualize placement paths on the map.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              maxHeight: '380px',
              paddingRight: '4px'
            }} className="scrollbar-thin">
              {layoutRecommendations && layoutRecommendations.length > 0 ? (
                layoutRecommendations.map((rec: any, i: number) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredRec(rec)}
                    onMouseLeave={() => setHoveredRec(null)}
                    style={{
                      background: hoveredRec === rec 
                        ? 'rgba(251,191,36,0.06)' 
                        : 'rgba(15,15,22,0.5)',
                      padding: '14px',
                      borderRadius: '14px',
                      border: hoveredRec === rec 
                        ? '1px solid rgba(251,191,36,0.25)' 
                        : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: hoveredRec === rec 
                        ? '0 4px 16px rgba(251,191,36,0.08)' 
                        : 'none'
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '12px', marginBottom: '6px' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>Insight: </span>{rec.reason}
                      </p>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.04)'
                    }}>
                      <span style={{
                        fontWeight: 800,
                        color: '#f97316',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        display: 'block',
                        fontSize: '8.5px',
                        marginBottom: '4px'
                      }}>Placement Strategy</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                        {rec.placement_tip}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '40px 0',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#475569'
                }}>
                  No layout recommendations available. Run a diagnostic scan to generate recommendations.
                </div>
              )}
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            paddingTop: '12px',
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#374151',
            fontWeight: 500
          }}>
            💡 Hover over cards to preview placement paths.
          </div>
        </div>
      </div>
    </div>
  );
}
