import React from "react";

const MessagesComingSoon = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-x-dark rounded-2xl shadow-xl border border-x-border/40 px-6 py-8 w-full max-w-xs mx-auto flex flex-col items-center">
        <svg
          className="w-10 h-10 mb-4 text-x-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="14" rx="4" />
          <path d="M2 7l10 7 10-7" />
        </svg>
        <h2 className="text-lg font-bold text-x-white mb-2 text-center typewriter">
          Messages Coming Soon!
        </h2>
        <p className="text-x-gray text-sm mb-2 text-center">
          Real-time chat and messaging is on the way.
        </p>
      </div>
    </div>
  );
};

export default MessagesComingSoon;

/* Add this to your CSS (e.g., index.css or MessagesComingSoon.module.css):
.typewriter {
  overflow: hidden;
  border-right: .15em solid #22d3ee;
  white-space: nowrap;
  animation: typing 2.5s steps(22, end) 1s 1 normal both, blink-caret .75s step-end infinite;
}
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: #22d3ee; }
}
*/
