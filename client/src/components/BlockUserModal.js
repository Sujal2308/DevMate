import React, { useState } from "react";

const BlockUserModal = ({ isOpen, onClose, onConfirm, username }) => {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("7");
  const [isPermanent, setIsPermanent] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/20 w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#111] flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Restrict Identity: {username}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl">×</button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Reason</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Harassment, TOS Violation, Spam..."
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-slate-800 resize-none h-24"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (Days)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="perm" 
                  checked={isPermanent}
                  onChange={(e) => setIsPermanent(e.target.checked)}
                  className="accent-red-600"
                />
                <label htmlFor="perm" className="text-[10px] font-black text-red-500 uppercase tracking-widest cursor-pointer">Permanent</label>
              </div>
            </div>
            {!isPermanent && (
              <input 
                type="number" 
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#111] flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors"
          >
            Abort
          </button>
          <button 
            onClick={() => onConfirm(reason, isPermanent ? 0 : days)}
            className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-lg"
          >
            Execute Restriction
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BlockUserModal;
