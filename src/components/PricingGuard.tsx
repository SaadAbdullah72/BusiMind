export default function PricingGuard({ pricingData }: any) {
  if (!pricingData || !pricingData.deviations) {
    return <div className="p-8 text-center text-slate-500">Run Diagnostic Scan to load Pricing Data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            Competitor Pricing Guard
          </h2>
          <p className="text-slate-400 text-sm mt-1">Audit and match prices to maintain lowest price promise.</p>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Pricing Strategy Summary</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          {pricingData.pricing_strategy_summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {pricingData.deviations.map((item: any, idx: number) => (
          <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-200">{item.name}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                  item.status.includes('Profitable') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Our Price</p>
                  <p className="text-xl font-bold text-slate-200">{item.our_price} PKR</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-sky-900/50">
                  <p className="text-xs text-sky-500 mb-1">{item.competitor_name}</p>
                  <p className="text-xl font-bold text-sky-400">{item.competitor_price} PKR</p>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-400 mb-6">
                <span>Cost Price: {item.cost_price} PKR</span>
                <span>Margin Reduction: {item.margin_reducton} PKR</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors border border-slate-700 flex justify-center items-center space-x-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Auto-Match to {item.new_recommended_price} PKR</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
