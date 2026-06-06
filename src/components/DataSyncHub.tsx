import React, { useState } from 'react';

interface DataSyncHubProps {
  userEmail: string;
  onUploadSuccess: (type: string) => void;
}

const TEMPLATES = {
  inventory: "ItemName,Category,Stock,Unit,CostPrice,RetailPrice,ExpiryDate,LowThreshold,SalesVelocityDaily,Supplier,SupplierLeadDays\nDalda Cooking Oil 5L,Pantry,45,tins,1850,2250,2027-02-15,15,8,Dalda Foods Ltd,3\nSurf Excel 1kg,Household,35,packs,340,460,2028-05-10,10,5,Unilever Pakistan,4",
  pos: "TransactionId,Timestamp,ItemName,Quantity,PricePaid,PaymentMethod,CustomerLoyaltyId\nT1001,14:02,Dalda Cooking Oil 5L,2,4500,Card,L9281\nT1002,14:15,Surf Excel 1kg,1,460,Cash,None"
};

export default function DataSyncHub({ userEmail, onUploadSuccess }: DataSyncHubProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [policies, setPolicies] = useState<any[]>([]);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`/api/policies?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setPolicies(data);
      if (data.length > 0) {
        setUploadedFiles(prev => ({ ...prev, 'Policy': true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchPolicies();
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
          setUploadedFiles(prev => ({ ...prev, [type]: true }));
          onUploadSuccess(type);
          // Optional: Add a subtle toast instead of annoying alert if desired, but alert works for now.
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
        setUploadedFiles(prev => ({ ...prev, 'Policy': true }));
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

  return (
    <div className="bg-[#121216]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Data Sync Hub</h2>
      <p className="text-sm text-slate-400 mb-8">
        Upload your store's CSV files to power the AI Diagnostic Engine. The AI uses this exact data to make real-world decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Card */}
        <div className="bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
          {uploadedFiles['Inventory'] && (
            <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center shadow-lg backdrop-blur-sm border-b border-l border-emerald-500/30">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              UPLOADED
            </div>
          )}
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
             <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          </div>
          <h3 className="text-md font-bold text-slate-200">1. Current Inventory</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">Required for AI to verify stock availability & Expiry Optimization.</p>
          
          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('inventory')} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors">Download Template</button>
             <label className={`flex-1 py-2.5 ${uploadedFiles['Inventory'] ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white border border-transparent'} text-xs rounded-lg font-medium transition-colors cursor-pointer text-center`}>
               {uploading === 'Inventory' ? 'Uploading...' : (uploadedFiles['Inventory'] ? 'Replace CSV' : 'Upload CSV')}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'inventory', 'Inventory')} />
             </label>
          </div>
        </div>

        {/* Business Policy Card */}
        <div className="bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
             <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 className="text-md font-bold text-slate-200">2. Business Policy (PDF)</h3>
          <p className="text-xs text-slate-500 mt-2 mb-4">Upload multiple PDFs for the AI to use as context.</p>
          
          <div className="w-full text-left mb-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar" style={{ maxHeight: '120px' }}>
              {policies.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4 bg-[#121216]/50 rounded-lg border border-dashed border-slate-700/50">
                  No policies uploaded yet.
                </div>
              ) : (
                policies.map(p => (
                  <div key={p.doc_id} className="flex items-center justify-between bg-[#121216] px-3 py-2.5 rounded-lg border border-slate-700/50 group/item transition-colors hover:border-purple-500/30">
                    <span className="text-xs text-slate-300 truncate pr-2 flex-1" title={p.filename || 'Business Policy Document'}>
                      📄 {p.filename || 'Business Policy Document'}
                    </span>
                    <button 
                      onClick={() => deletePolicy(p.doc_id)} 
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                      title="Delete document"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex w-full mt-auto">
             <label className={`w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white border border-transparent text-xs rounded-lg font-medium transition-colors cursor-pointer text-center relative overflow-hidden group`}>
               {uploading === 'Policy' ? 'Extracting Text...' : 'Upload New PDF'}
               <input type="file" accept=".pdf" className="hidden" onChange={uploadPdfFile} />
             </label>
          </div>
        </div>

        {/* POS Logs Card */}
        <div className="bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
          {uploadedFiles['POS'] && (
            <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center shadow-lg backdrop-blur-sm border-b border-l border-emerald-500/30">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              UPLOADED
            </div>
          )}
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
             <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-md font-bold text-slate-200">3. Daily POS Sales</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">Upload everyday. Required for AI to verify historical purchases and orders.</p>
          
          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('pos')} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors">Download Template</button>
             <label className={`flex-1 py-2.5 ${uploadedFiles['POS'] ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-transparent'} text-xs rounded-lg font-medium transition-colors cursor-pointer text-center`}>
               {uploading === 'POS' ? 'Uploading...' : (uploadedFiles['POS'] ? 'Replace CSV' : 'Upload CSV')}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'pos', 'POS')} />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}
