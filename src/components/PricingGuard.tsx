export default function PricingGuard({ pricingData }: any) {
  if (!pricingData || !pricingData.deviations) {
    return <div className="p-8 text-center text-slate-500">Run Diagnostic Scan to load Pricing Data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Competitor Pricing Guard
          </h2>
          <p className="text-slate-400 text-sm mt-1">Audit and match prices to maintain lowest price promise.</p>
        </div>
      </div>

      <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6 shadow-lg">
        <h3 className="text-md font-bold text-white mb-4">Pricing Strategy Summary</h3>
        <p className="text-slate-350 text-xs leading-relaxed">
          {pricingData.pricing_strategy_summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {pricingData.deviations.map((item: any, idx: number) => (
          <div key={idx} className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-slate-200">{item.name}</h3>
                <span className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-md border ${
                  item.status.includes('Profitable') 
                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-[#121216]/50 rounded-xl border border-[#1a1a24]/80">
                  <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">Our Price</p>
                  <p className="text-lg font-bold text-slate-200">{item.our_price} PKR</p>
                </div>
                <div className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  <p className="text-[10px] text-orange-400/80 mb-1 font-semibold uppercase tracking-wider truncate" title={item.competitor_name}>{item.competitor_name}</p>
                  <p className="text-lg font-bold text-orange-400">{item.competitor_price} PKR</p>
                </div>
              </div>
              
              <div className="flex justify-between text-[10.5px] text-slate-400 mb-6 font-medium">
                <span>Cost Price: {item.cost_price} PKR</span>
                <span>Margin Reduction: {item.margin_reducton} PKR</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-slate-800/20 hover:bg-slate-800/40 text-slate-200 text-xs font-bold rounded-xl transition-all border border-[#1a1a24]/85 flex justify-center items-center space-x-2 cursor-pointer">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              <span>Auto-Match to {item.new_recommended_price} PKR</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
