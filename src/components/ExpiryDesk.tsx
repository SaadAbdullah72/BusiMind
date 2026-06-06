export default function ExpiryDesk({ expiryData }: any) {
  if (!expiryData || !expiryData.items_at_risk) {
    return <div className="p-8 text-center text-slate-500">Run Diagnostic Scan to load Expiry Data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Expiry & Waste Optimizer
          </h2>
          <p className="text-slate-400 text-sm mt-1">Identify items nearing expiry and deploy promotions.</p>
        </div>
      </div>

      <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6 shadow-lg">
        <h3 className="text-md font-bold text-white mb-4">Suggested Promotion Campaign</h3>
        <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/10 rounded-xl p-4 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-200 text-xs font-medium leading-relaxed italic">
              "{expiryData.suggested_promotional_ad}"
            </p>
            <button className="mt-3 px-4 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border border-orange-500/10">
              Deploy to SMS & Display Boards
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#121216]/50 text-[11px] uppercase text-slate-400 border-b border-[#1a1a24]/80">
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Expiry Date</th>
              <th className="p-4 font-semibold">Days Left</th>
              <th className="p-4 font-semibold">Risk units</th>
              <th className="p-4 font-semibold">Potential Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a24]/50 text-xs">
            {expiryData.items_at_risk.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-[#121216]/30 transition-colors">
                <td className="p-4 font-semibold text-slate-200">{item.name}</td>
                <td className="p-4 text-slate-400">{item.expiry_date}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${item.days_left <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/10' : 'bg-orange-500/20 text-orange-400 border border-orange-500/10'}`}>
                    {item.days_left} days
                  </span>
                </td>
                <td className="p-4 text-slate-350">{item.waste_units} units</td>
                <td className="p-4 text-red-400 font-bold">{item.potential_loss} PKR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
