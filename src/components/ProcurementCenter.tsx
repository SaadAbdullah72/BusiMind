export default function ProcurementCenter({ procurementData }: any) {
  if (!procurementData || procurementData.length === 0) {
    return <div className="p-8 text-center text-slate-500">Run Diagnostic Scan to load Purchase Orders</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Procurement Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">Auto-generated Purchase Orders based on safety stock thresholds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {procurementData.map((po: any, idx: number) => (
          <div key={idx} className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">{po.po_number}</h3>
                <p className="text-orange-400 text-xs font-semibold mt-1">Supplier: {po.supplier}</p>
              </div>
              <span className="bg-[#121216]/50 border border-[#1a1a24]/80 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                Draft PO
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Product</p>
                <p className="text-xs font-bold text-slate-200">{po.product_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Order Qty</p>
                <p className="text-xs font-bold text-slate-200">{po.order_quantity} {po.unit}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Lead Time</p>
                <p className="text-xs font-bold text-slate-200">{po.lead_delivery_days} days</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Total Cost</p>
                <p className="text-xs font-bold text-emerald-400">{po.total_cost_pkr} PKR</p>
              </div>
            </div>

            <div className="bg-[#070709]/80 rounded-xl p-4 border border-[#1a1a24]/80 mb-6">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Draft to Supplier</p>
              <pre className="text-xs text-slate-350 whitespace-pre-wrap font-sans leading-relaxed">
                {po.supplier_email_draft}
              </pre>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 bg-slate-800/20 hover:bg-slate-800/40 text-slate-300 font-bold rounded-lg transition-all border border-[#1a1a24]/80 text-xs cursor-pointer">
                Edit PO
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-md transition-all text-xs flex items-center space-x-2 cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"></path></svg>
                <span>Approve & Send Email</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
