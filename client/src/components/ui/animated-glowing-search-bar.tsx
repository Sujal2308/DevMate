import React, { forwardRef, useId } from 'react';

interface SearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  clearSearch: () => void;
}

const SearchComponent = forwardRef<HTMLInputElement, SearchProps>(({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  onKeyDown, 
  placeholder = "Search developers...",
  clearSearch
}, ref) => {
  const uniqueId = useId();
  const searchGradientId = `search-${uniqueId.replace(/:/g, '')}`;
  const searchlGradientId = `searchl-${uniqueId.replace(/:/g, '')}`;
  return (
    <div className="relative flex items-center justify-center w-full">
      <div id="poda" className="relative flex items-center justify-center group w-full">
        {/* Glow Effects */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[52px] rounded-full blur-[3px] glow-layer-1">
        </div>
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[48px] rounded-full blur-[3px] glow-layer-2">
        </div>
        
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[46px] rounded-full blur-[2px] glow-layer-3">
        </div>
 
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[42px] rounded-full blur-[0.5px] glow-layer-4">
        </div>

        <div id="main" className="relative group w-full">
          <input 
            ref={ref}
            placeholder={placeholder} 
            type="text" 
            name="text" 
            className="bg-[#010201] border-none w-full h-[44px] rounded-full text-white pl-[48px] pr-[44px] text-sm focus:outline-none placeholder-gray-400" 
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoComplete="off"
          />
          
          <div id="input-mask" className="pointer-events-none w-[60px] h-[20px] absolute bg-gradient-to-r from-transparent to-black top-[12px] left-[52px] group-focus-within:hidden"></div>
          <div id="pink-mask" className="pointer-events-none w-[30px] h-[20px] absolute bg-[#cf30aa] top-[12px] left-[5px] blur-2xl opacity-80 transition-all duration-2000 group-hover:opacity-0"></div>
          
          <div className="absolute h-[32px] w-[32px] overflow-hidden top-[6px] right-[6px] rounded-full
                          before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90
                          before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)]
                          before:brightness-135 before:animate-spin-slow">
          </div>

          {/* Clear Button Container - Re-inserted in the filter icon's original position */}
          {value && (
            <div id="filter-icon" className="absolute top-[6px] right-[6px] flex items-center justify-center z-[2] h-[32px] w-[32px] [isolation:isolate] overflow-hidden rounded-full bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-transparent">
              <button
                type="button"
                onClick={clearSearch}
                className="text-white hover:text-red-400 transition-colors text-xl p-0.5"
                aria-label="Clear search"
              >
                ×
              </button>
            </div>
          )}

          {/* Search Icon */}
          <div id="search-icon" className="absolute left-4 top-[12px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="20" fill="none" className="feather feather-search">
              <circle stroke={`url(#${searchGradientId})`} r="8" cy="11" cx="11"></circle>
              <line stroke={`url(#${searchlGradientId})`} y2="16.65" y1="22" x2="16.65" x1="22"></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id={searchGradientId}>
                  <stop stopColor="#f8e7f8" offset="0%"></stop>
                  <stop stopColor="#b6a9b7" offset="50%"></stop>
                </linearGradient>
                <linearGradient id={searchlGradientId}>
                  <stop stopColor="#b6a9b7" offset="0%"></stop>
                  <stop stopColor="#837484" offset="50%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes custom-glow-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .glow-layer-1::before, .glow-layer-2::before, .glow-layer-3::before, .glow-layer-4::before {
          content: '';
          position: absolute;
          z-index: -2;
          top: 50%;
          left: 50%;
          background-repeat: no-repeat;
          animation: custom-glow-rotate linear infinite;
        }

        .glow-layer-1::before {
          width: 999px; height: 999px;
          background: conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%);
          animation-duration: 8s;
        }

        .glow-layer-2::before {
          width: 600px; height: 600px;
          background: conic-gradient(transparent, #18116a, transparent 10%, transparent 50%, #6e1b60, transparent 60%);
          animation-duration: 12s;
          animation-direction: reverse;
        }

        .glow-layer-3::before {
          width: 600px; height: 600px;
          background: conic-gradient(transparent 0%, #a099d8 8%, transparent 50%, #dfa2da, transparent 58%);
          filter: brightness(1.4);
          animation-duration: 10s;
        }

        .glow-layer-4::before {
          width: 600px; height: 600px;
          background: conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #cf30aa 60%, #1c191c 64%);
          filter: brightness(1.3);
          animation-duration: 6s;
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
});

SearchComponent.displayName = 'SearchComponent';

export default SearchComponent;
