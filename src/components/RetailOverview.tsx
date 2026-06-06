import { useState } from 'react';
import StoreLayoutMap from './StoreLayoutMap';

/**
 * RetailOverview Component
 * 
 * The main dashboard view presenting live KPIs, AI-generated SWOT analysis, 
 * priority action steps, critical stock depletion risks, and physical store layout recommendations.
 * Acts as the visualization layer for the underlying Operations Diagnostic Scan results.
 */
export default function RetailOverview({ kpis, swot, onScanComplete, scanning, depletionRisks, layoutRecommendations, layoutConfig, overflowCategories, extraLinesNeeded }: any) {
  const [hoveredRec, setHoveredRec] = useState<any>(null);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight uppercase">
            Supermarket Operations
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Live KPI and strategic analysis</p>
        </div>
        <button
          onClick={onScanComplete}
          disabled={scanning}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {scanning ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Scanning Operations...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Run Diagnostic Scan</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-orange-500/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-slate-500/8 flex items-center justify-center">
            
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5 tracking-widest uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-200 tracking-tight">{kpis.total_revenue}</p>
          <p className="text-[10px] text-slate-600 mt-2 font-medium">{kpis.total_transactions} transactions today</p>
        </div>

        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-red-500/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-slate-500/8 flex items-center justify-center">
            
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5 tracking-widest uppercase">Waste Risk Cost</p>
          <p className="text-2xl font-bold text-slate-200 tracking-tight">{kpis.waste_risk_cost}</p>
          <p className="text-[10px] text-slate-600 mt-2 font-medium">Due to approaching expiries</p>
        </div>

        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-slate-500/8 flex items-center justify-center">
            
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5 tracking-widest uppercase">Bestseller</p>
          <p className="text-lg font-bold text-slate-200 truncate">{kpis.bestseller}</p>
          <p className="text-[10px] text-slate-600 mt-2 font-medium">Avg Basket: {kpis.average_basket_value}</p>
        </div>
      </div>

      {/* SWOT Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-slate-500/10 rounded-2xl p-5">
          <h3 className="text-slate-200 font-bold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Strengths
          </h3>
          <ul className="space-y-2">
            {swot.strengths.map((s: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-emerald-500/60 mt-[7px] shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-slate-500/10 rounded-2xl p-5">
          <h3 className="text-slate-200 font-bold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {swot.weaknesses.map((w: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-red-500/60 mt-[7px] shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-slate-500/10 rounded-2xl p-5">
          <h3 className="text-slate-200 font-bold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Opportunities
          </h3>
          <ul className="space-y-2">
            {swot.opportunities.map((o: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-amber-500/60 mt-[7px] shrink-0" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-slate-500/10 rounded-2xl p-5">
          <h3 className="text-slate-200 font-bold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Threats
          </h3>
          <ul className="space-y-2">
            {swot.threats.map((t: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-orange-500/60 mt-[7px] shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Priority Action Steps */}
      <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-slate-500/10 rounded-2xl p-5">
        <h3 className="text-slate-200 font-bold text-[13px] mb-3.5 flex items-center gap-2 uppercase tracking-wider">
          Priority Action Steps
        </h3>
        <ul className="space-y-2.5">
          {swot.action_steps.map((a: string, i: number) => (
            <li key={i} className="bg-[#0a0a0e]/60 p-3 rounded-xl text-[12px] text-slate-200 border border-[#1a1a22] flex items-center gap-3 leading-relaxed">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-indigo-500/15">{i+1}</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Depletion Risks */}
      {depletionRisks && depletionRisks.length > 0 && (
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-rose-500/10 rounded-2xl p-5">
          <h3 className="text-rose-400 font-bold text-[13px] mb-3.5 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
            Critical Stock Depletion Risks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {depletionRisks.map((risk: any, i: number) => (
              <div key={i} className="bg-[#0a0a0e]/60 p-4 rounded-xl border border-[#1a1a22]">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-slate-200 text-[12.5px]">{risk.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${risk.status === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {risk.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <p className="text-[9px] text-slate-600 font-medium mb-0.5">Current Stock</p>
                    <p className="font-semibold text-slate-300 text-[11px]">{risk.stock} units</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 font-medium mb-0.5">Sales Velocity</p>
                    <p className="font-semibold text-slate-300 text-[11px]">{risk.sales_velocity_daily}/day</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 font-medium mb-0.5">Supplier SLA</p>
                    <p className="font-semibold text-slate-300 text-[11px]">{risk.supplier_lead_days}d lead</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1a1a22] flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Estimated Stockout:</span>
                  <span className={`font-bold ${risk.status === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{risk.days_left} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-full overflow-x-auto w-full">
          <StoreLayoutMap 
            layoutConfig={layoutConfig} 
            recommendations={layoutRecommendations}
            hoveredRec={hoveredRec} 
            overflowCategories={overflowCategories}
            extraLinesNeeded={extraLinesNeeded}
            onHoverRecChange={setHoveredRec}
          />
        </div>

        {/* AI Recommendations */}
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-amber-500/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-amber-400 font-bold text-[13px] mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              AI Shelf Optimization
            </h3>
            <p className="text-[10px] text-slate-500 mb-4 font-medium">Hover over any card to visualize placement paths on the map.</p>
            
            <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
              {layoutRecommendations && layoutRecommendations.length > 0 ? (
                layoutRecommendations.map((rec: any, i: number) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredRec(rec)}
                    onMouseLeave={() => setHoveredRec(null)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      hoveredRec === rec 
                        ? 'bg-amber-500/5 border-amber-500/20' 
                        : 'bg-[#0a0a0e]/60 border-[#1a1a22] hover:border-[#2a2a35]'
                    }`}
                  >
                    <h4 className="font-bold text-slate-200 text-[11px] mb-1.5">{rec.title}</h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      <span className="text-amber-400 font-semibold">Insight: </span>{rec.reason}
                    </p>
                    <div className="bg-[#080810]/60 p-2.5 rounded-lg border border-[#1a1a22] mt-2.5 text-[10px] text-slate-400 leading-relaxed">
                      <span className="font-bold text-orange-400/80 uppercase tracking-wider block text-[8px] mb-1">Placement Strategy</span>
                      {rec.placement_tip}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-600 py-10 text-center">
                  No layout recommendations available. Run a diagnostic scan.
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-[#1a1a22] pt-3 mt-4 text-[9px] text-slate-600 text-center font-medium">
            Hover over cards to preview placement paths.
          </div>
        </div>
      </div>
    </div>
  );
}
