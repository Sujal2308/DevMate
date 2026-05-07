import React, { useState, useEffect } from "react";

const ReportModal = ({ isOpen, onClose, postId }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    "Spam",
    "Harassment or bullying",
    "Hate speech or symbols",
    "Violence or dangerous organizations",
    "Intellectual property violation",
    "Inappropriate content",
    "Something else"
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSubmitted(false);
      setSelectedReason("");
      setDetails("");
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    try {
      setLoading(true);
      // In a real app, you'd send this to an admin endpoint
      // await axios.post(`/api/posts/${postId}/report`, { reason: selectedReason, details });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#080808] border border-red-500/20 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-scale-in overflow-hidden">
        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />

        <div className="p-6">
          {submitted ? (
            <div className="py-12 text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank you for reporting</h3>
              <p className="text-x-gray text-sm">We'll review this post and take appropriate action. Your feedback helps keep DevMate safe.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">Report Post</h2>
                </div>
                <button onClick={onClose} className="text-x-gray hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-x-gray text-sm mb-4 font-medium uppercase tracking-tight opacity-70">Why are you reporting this?</p>

              {/* Reasons List */}
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-none border transition-all duration-200 flex items-center justify-between group ${
                      selectedReason === reason
                        ? "bg-red-500/10 border-red-500/50 text-white"
                        : "bg-white/5 border-white/5 text-x-gray hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <span className="text-sm font-medium">{reason}</span>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                      selectedReason === reason 
                        ? "border-red-500 bg-red-500 scale-110 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                        : "border-white/20 group-hover:border-white/40"
                    }`} />
                  </button>
                ))}
              </div>

              {selectedReason === "Something else" && (
                <div className="mb-6 animate-fade-in">
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    className="w-full bg-white/5 border border-white/10 rounded-none p-3 text-sm text-white placeholder-x-gray focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    rows={3}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-transparent border border-white/10 text-x-gray hover:text-white hover:border-white/20 transition-all font-bold text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-sm uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </>
          )}
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
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ReportModal;
