export default function ExpiryDesk({ expiryData }: any) {
  if (!expiryData || !expiryData.items_at_risk) {
    return <div className="p-8 text-center text-slate-500">Run Diagnostic Scan to load Expiry Data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            Expiry & Waste Optimizer
          </h2>
          <p className="text-slate-400 text-sm mt-1">Identify items nearing expiry and deploy promotions.</p>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Suggested Promotion Campaign</h3>
        <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 rounded-xl p-4 flex items-start space-x-4">
          <div className="text-3xl">🎉</div>
          <div>
            <p className="text-slate-200 font-medium leading-relaxed italic">
              "{expiryData.suggested_promotional_ad}"
            </p>
            <button className="mt-3 px-4 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-semibold rounded-lg transition-colors">
              Deploy to SMS & Display Boards
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Expiry Date</th>
              <th className="p-4 font-semibold">Days Left</th>
              <th className="p-4 font-semibold">Risk units</th>
              <th className="p-4 font-semibold">Potential Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {expiryData.items_at_risk.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-medium text-slate-200">{item.name}</td>
                <td className="p-4 text-slate-400">{item.expiry_date}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.days_left <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {item.days_left} days
                  </span>
                </td>
                <td className="p-4 text-slate-300">{item.waste_units} units</td>
                <td className="p-4 text-red-400 font-semibold">{item.potential_loss} PKR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
