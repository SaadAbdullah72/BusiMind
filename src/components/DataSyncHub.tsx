import React, { useState } from 'react';

interface DataSyncHubProps {
  userEmail: string;
  onUploadSuccess: (type: string) => void;
}

const TEMPLATES = {
  inventory: "ItemName,Category,Stock,Unit,CostPrice,RetailPrice,ExpiryDate,LowThreshold,SalesVelocityDaily,Supplier,SupplierLeadDays\nDalda Cooking Oil 5L,Pantry,45,tins,1850,2250,2027-02-15,15,8,Dalda Foods Ltd,3\nSurf Excel 1kg,Household,35,packs,340,460,2028-05-10,10,5,Unilever Pakistan,4",
  pos: "TransactionId,Timestamp,ItemName,Quantity,PricePaid,PaymentMethod,CustomerLoyaltyId\nT1001,14:02,Dalda Cooking Oil 5L,2,4500,Card,L9281\nT1002,14:15,Surf Excel 1kg,1,460,Cash,None"
};

/**
 * DataSyncHub Component
 * 
 * Centralized portal for store managers to upload crucial operational datasets 
 * including Inventory (CSV), Point of Sale logs (CSV), and Business Policies (PDFs).
 * Handles file reading, parsing, API submission, and state synchronization.
 * 
 * @param userEmail - The currently authenticated user's email address.
 * @param onUploadSuccess - Callback triggered when a file is successfully uploaded.
 */
export default function DataSyncHub({ userEmail, onUploadSuccess }: DataSyncHubProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [inventoryFiles, setInventoryFiles] = useState<any[]>([]);
  const [posFiles, setPosFiles] = useState<any[]>([]);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`/api/policies?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setInventoryFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPos = async () => {
    try {
      const res = await fetch(`/api/pos?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setPosFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (userEmail) {
      fetchPolicies();
      fetchInventory();
      fetchPos();
    }
  }, [userEmail]);

  const handleDownload = (type: keyof typeof TEMPLATES) => {
    const element = document.createElement("a");
    const file = new Blob([TEMPLATES[type]], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = `${type}_template.csv`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, endpoint: string, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const res = await fetch(`/api/upload/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, filename: file.name, content: text })
        });
        const data = await res.json();
        if (data.status === 'success') {
          if (type === 'Inventory') fetchInventory();
          if (type === 'POS') fetchPos();
          onUploadSuccess(type);
        } else {
          alert('Upload failed: ' + data.message);
        }
      } catch (err) {
        alert('Error uploading file to API.');
      } finally {
        setUploading(null);
        e.target.value = ''; // reset
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
      setUploading(null);
    };
    reader.readAsText(file);
  };

  const uploadPdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('Policy');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', userEmail);

    try {
      const res = await fetch(`/api/upload/policy`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        fetchPolicies();
        onUploadSuccess('Policy');
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (err) {
      alert('Error uploading PDF to API.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const deletePolicy = async (doc_id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/policies/${doc_id}?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPolicies();
      }
    } catch (err) {
      alert('Error deleting document');
    }
  };

  const deleteInventory = async (doc_id: string) => {
    if (!confirm('Are you sure you want to delete this inventory file?')) return;
    try {
      const res = await fetch(`/api/inventory/${doc_id}?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
      if (res.ok) fetchInventory();
    } catch (err) {
      alert('Error deleting inventory file');
    }
  };

  const deletePos = async (doc_id: string) => {
    if (!confirm('Are you sure you want to delete this POS file?')) return;
    try {
      const res = await fetch(`/api/pos/${doc_id}?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
      if (res.ok) fetchPos();
    } catch (err) {
      alert('Error deleting POS file');
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0e0e12]/90 to-[#0c0c0f]/95 border border-[#1e1e26] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2 uppercase tracking-wide">Data Sync Hub</h2>
      <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest font-semibold">
        Upload your store's CSV files to power the AI Diagnostic Engine. The AI uses this exact data to make real-world decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Card */}
        <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#171512]/50 border border-orange-500/10 hover:border-orange-500/30 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-500/2">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full flex items-center justify-center mb-4 font-black text-sm shadow-[0_0_10px_rgba(249,115,22,0.15)]">
             1
          </div>
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest">1. Current Inventory</h3>
          <p className="text-[11px] text-slate-500 mt-2 mb-4 leading-relaxed">Upload multiple CSVs for AI to verify stock & Expiry Optimization.</p>
          
          <div className="w-full text-left mb-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar" style={{ maxHeight: '120px' }}>
              {inventoryFiles.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-4 bg-[#121216]/30 rounded-lg border border-dashed border-slate-800/40">
                  No inventory uploaded.
                </div>
              ) : (
                inventoryFiles.map(f => (
                  <div key={f.doc_id} className="flex items-center justify-between bg-[#121216]/50 px-3 py-2 rounded-lg border border-slate-800/50 group/item transition-colors hover:border-slate-500/30">
                    <span className="text-[10px] text-slate-350 truncate pr-2 flex-1 flex items-center gap-2" title={f.filename || 'Inventory CSV'}>
                      {f.filename || 'Inventory CSV'}
                    </span>
                    <button 
                      onClick={() => deleteInventory(f.doc_id)} 
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors text-[9px] uppercase font-bold"
                      title="Delete document"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('inventory')} className="w-1/3 py-2.5 bg-[#121216]/60 hover:bg-[#1c1c24] text-slate-350 text-[10px] rounded-lg font-bold transition-colors flex items-center justify-center gap-1 border border-slate-700/40 uppercase tracking-wider" title="Download Template">
               Template
             </button>
             <label className={`flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 border border-transparent text-[10px] rounded-lg font-extrabold transition-all cursor-pointer text-center relative overflow-hidden group flex items-center justify-center gap-1 shadow-md hover:shadow-orange-500/20 uppercase tracking-wider`}>
               {uploading === 'Inventory' ? 'Uploading...' : 'Upload CSV'}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'inventory', 'Inventory')} />
             </label>
          </div>
        </div>

        {/* Business Policy Card */}
        <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#121217]/50 border border-indigo-500/10 hover:border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/2">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center mb-4 font-black text-sm shadow-[0_0_10px_rgba(99,102,241,0.15)]">
             2
          </div>
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest">2. Business Policy (PDF)</h3>
          <p className="text-[11px] text-slate-500 mt-2 mb-4 leading-relaxed">Upload multiple PDFs for the AI to use as context.</p>
          
          <div className="w-full text-left mb-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar" style={{ maxHeight: '120px' }}>
              {policies.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-4 bg-[#121216]/30 rounded-lg border border-dashed border-slate-800/40">
                  No policies uploaded yet.
                </div>
              ) : (
                policies.map(p => (
                  <div key={p.doc_id} className="flex items-center justify-between bg-[#121216]/50 px-3 py-2 rounded-lg border border-slate-800/50 group/item transition-colors hover:border-slate-500/30">
                    <span className="text-[10px] text-slate-350 truncate pr-2 flex-1 flex items-center gap-2" title={p.filename || 'Business Policy Document'}>
                      {p.filename || 'Business Policy Document'}
                    </span>
                    <button 
                      onClick={() => deletePolicy(p.doc_id)} 
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors text-[9px] uppercase font-bold"
                      title="Delete document"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex w-full mt-auto">
             <label className={`w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-transparent text-[10px] font-extrabold rounded-lg transition-all cursor-pointer text-center relative overflow-hidden group flex items-center justify-center gap-1 shadow-md hover:shadow-indigo-500/20 uppercase tracking-wider`}>
               {uploading === 'Policy' ? 'Extracting Text...' : 'Upload PDF'}
               <input type="file" accept=".pdf" className="hidden" onChange={uploadPdfFile} />
             </label>
          </div>
        </div>

        {/* POS Logs Card */}
        <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#121714]/50 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/2">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4 font-black text-sm shadow-[0_0_10px_rgba(16,185,129,0.15)]">
             3
          </div>
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest">3. Daily POS Sales</h3>
          <p className="text-[11px] text-slate-500 mt-2 mb-4 leading-relaxed">Upload multiple CSVs. Required for AI to verify historical purchases.</p>
          
          <div className="w-full text-left mb-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar" style={{ maxHeight: '120px' }}>
              {posFiles.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-4 bg-[#121216]/30 rounded-lg border border-dashed border-slate-800/40">
                  No POS logs uploaded.
                </div>
              ) : (
                posFiles.map(f => (
                  <div key={f.doc_id} className="flex items-center justify-between bg-[#121216]/50 px-3 py-2 rounded-lg border border-slate-800/50 group/item transition-colors hover:border-slate-500/30">
                    <span className="text-[10px] text-slate-350 truncate pr-2 flex-1 flex items-center gap-2" title={f.filename || 'POS Sales CSV'}>
                      {f.filename || 'POS Sales CSV'}
                    </span>
                    <button 
                      onClick={() => deletePos(f.doc_id)} 
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors text-[9px] uppercase font-bold"
                      title="Delete document"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('pos')} className="w-1/3 py-2.5 bg-[#121216]/60 hover:bg-[#1c1c24] text-slate-350 text-[10px] rounded-lg font-bold transition-colors flex items-center justify-center gap-1 border border-slate-700/40 uppercase tracking-wider" title="Download Template">
               Template
             </button>
             <label className={`flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 border border-transparent text-[10px] rounded-lg font-extrabold transition-all cursor-pointer text-center relative overflow-hidden group flex items-center justify-center gap-1 shadow-md hover:shadow-emerald-500/20 uppercase tracking-wider`}>
               {uploading === 'POS' ? 'Uploading...' : 'Upload CSV'}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'pos', 'POS')} />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}
