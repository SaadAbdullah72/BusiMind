import React, { useState } from 'react';

interface DataSyncHubProps {
  userEmail: string;
  onUploadSuccess: (type: string) => void;
}

const TEMPLATES = {
  inventory: "ItemName,Category,Stock,Unit,CostPrice,RetailPrice,ExpiryDate,LowThreshold,SalesVelocityDaily,Supplier,SupplierLeadDays\nDalda Cooking Oil 5L,Pantry,45,tins,1850,2250,2027-02-15,15,8,Dalda Foods Ltd,3\nSurf Excel 1kg,Household,35,packs,340,460,2028-05-10,10,5,Unilever Pakistan,4",
  competitors: "ItemName,OurPrice,CompetitorName,CompetitorPrice\nDalda Cooking Oil 5L,2250,Metro Cash & Carry,2130\nSurf Excel 1kg,460,Carrefour Supermarket,425",
  pos: "TransactionId,Timestamp,ItemName,Quantity,PricePaid,PaymentMethod,CustomerLoyaltyId\nT1001,14:02,Dalda Cooking Oil 5L,2,4500,Card,L9281\nT1002,14:15,Surf Excel 1kg,1,460,Cash,None"
};

export default function DataSyncHub({ userEmail, onUploadSuccess }: DataSyncHubProps) {
  const [uploading, setUploading] = useState<string | null>(null);

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
          onUploadSuccess(type);
          alert(`${type} uploaded successfully!`);
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

  return (
    <div className="bg-[#121216]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Data Sync Hub</h2>
      <p className="text-sm text-slate-400 mb-8">
        Upload your store's CSV files to power the AI Diagnostic Engine. The AI uses this exact data to make real-world decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Card */}
        <div className="bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
             <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          </div>
          <h3 className="text-md font-bold text-slate-200">1. Current Inventory</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">Required for Expiry Optimization & Low Stock Alerts.</p>
          
          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('inventory')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors">Download Template</button>
             <label className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-medium transition-colors cursor-pointer text-center">
               {uploading === 'Inventory' ? 'Uploading...' : 'Upload CSV'}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'inventory', 'Inventory')} />
             </label>
          </div>
        </div>

        {/* Competitor Card */}
        <div className="bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
             <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
          </div>
          <h3 className="text-md font-bold text-slate-200">2. Competitor Pricing</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">Required for the Pricing Guard & Margin Analysis.</p>
          
          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('competitors')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors">Download Template</button>
             <label className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded-lg font-medium transition-colors cursor-pointer text-center">
               {uploading === 'Competitors' ? 'Uploading...' : 'Upload CSV'}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'competitors', 'Competitors')} />
             </label>
          </div>
        </div>

        {/* POS Logs Card */}
        <div className="bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
             <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-md font-bold text-slate-200">3. Daily POS Sales</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">Required for Revenue calculations & Re-ordering.</p>
          
          <div className="flex w-full space-x-2 mt-auto">
             <button onClick={() => handleDownload('pos')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors">Download Template</button>
             <label className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-medium transition-colors cursor-pointer text-center">
               {uploading === 'POS' ? 'Uploading...' : 'Upload CSV'}
               <input type="file" accept=".csv" className="hidden" onChange={(e) => uploadFile(e, 'pos', 'POS')} />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}
