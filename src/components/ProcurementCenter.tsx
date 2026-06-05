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
          <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{po.po_number}</h3>
                <p className="text-orange-400 text-sm mt-1">Supplier: {po.supplier}</p>
              </div>
              <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-widest">
                Draft PO
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Product</p>
                <p className="font-semibold text-slate-200">{po.product_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Order Qty</p>
                <p className="font-semibold text-slate-200">{po.order_quantity} {po.unit}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Lead Time</p>
                <p className="font-semibold text-slate-200">{po.lead_delivery_days} days</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Cost</p>
                <p className="font-bold text-emerald-400">{po.total_cost_pkr} PKR</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Draft to Supplier</p>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                {po.supplier_email_draft}
              </pre>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors border border-slate-700 text-sm">
                Edit PO
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-lg shadow-md transition-all text-sm flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>Approve & Send Email</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
