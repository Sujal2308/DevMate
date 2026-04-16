import React, { useEffect, useState } from 'react';

interface CosmicParallaxBgProps {
  /**
   * Main heading text (displayed large in the center)
   */
  head: string;
  
  /**
   * Subtitle text (displayed below the heading)
   * Comma-separated string that will be split into animated parts
   */
  text: string;
  
  /**
   * Whether the text animations should loop
   * @default true
   */
  loop?: boolean;
  
  /**
   * Custom class name for additional styling
   */
  className?: string;
}

/**
 * A cosmic parallax background component with animated stars and text
 */
const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  head,
  text,
  loop = true,
  className = '',
}) => {
  const [smallStars, setSmallStars] = useState<string>('');
  const [mediumStars, setMediumStars] = useState<string>('');
  const [bigStars, setBigStars] = useState<string>('');
  
  // Split the text by commas and trim whitespace
  const textParts = text.split(',').map(part => part.trim());
  
  // Generate random star positions
  const generateStarBoxShadow = (count: number): string => {
    let shadows = [];
    
    for (let i = 0; i < count; i++) {
        // Reduced to typical viewport dimensions for better visibility instead of absolute 2000px
      const x = Math.floor(Math.random() * 3000);
      const y = Math.floor(Math.random() * 3000);
      shadows.push(`${x}px ${y}px #FFF`);
    }
    
    return shadows.join(', ');
  };
  
  useEffect(() => {
    // Generate star shadows when component mounts
    setSmallStars(generateStarBoxShadow(700));
    setMediumStars(generateStarBoxShadow(200));
    setBigStars(generateStarBoxShadow(100));
    
    // Set animation iteration based on loop prop
    document.documentElement.style.setProperty(
      '--animation-iteration', 
      loop ? 'infinite' : '1'
    );
  }, [loop]);
  
  return (
    <div className={`relative w-full h-[400px] md:h-[500px] overflow-hidden bg-[#020617] text-white ${className}`}>
      {/* Stars layers */}
      <div 
        style={{ boxShadow: smallStars, width: '1px', height: '1px', animation: 'animStar 50s linear var(--animation-iteration)' }}
        className="absolute top-0 left-0 bg-transparent"
      ></div>
      <div 
        style={{ boxShadow: mediumStars, width: '2px', height: '2px', animation: 'animStar 100s linear var(--animation-iteration)' }}
        className="absolute top-0 left-0 bg-transparent"
      ></div>
      <div 
        style={{ boxShadow: bigStars, width: '3px', height: '3px', animation: 'animStar 150s linear var(--animation-iteration)' }}
        className="absolute top-0 left-0 bg-transparent"
      ></div>
      
      {/* Container for glowing elements / Horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-blue-900/30 z-0"></div>
      
      {/* Glow / Atmosphere */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-cyan-500/20 to-transparent blur-xl z-0"></div>
      
      {/* Earth Curve */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 z-0 rounded-[50%] bg-[#030712]"
        style={{ 
          width: '200vw', 
          height: '150vw', 
          bottom: 'calc(-150vw + 225px)', // Raised slightly
          boxShadow: '0 -15px 50px 10px rgba(6, 182, 212, 0.4), inset 0 10px 30px rgba(6, 182, 212, 0.2)',
          borderTop: '2px solid rgba(6, 182, 212, 0.6)'
        }}
      ></div>
      
      {/* Title and subtitle */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center pt-16">
        <div className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-widest text-[#fff] animate-[animGravity_5s_ease-out_var(--animation-iteration)] uppercase mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '8px' }}>
            {head}
        </div>
        <div className="flex flex-wrap gap-4 text-xl md:text-2xl text-[#cbd5e1] uppercase justify-center mt-4">
          {textParts.map((part, index) => (
            <React.Fragment key={index}>
              <span 
                style={{ animation: `animDont ${6 + index}s ease-out var(--animation-iteration)` }}
                className="font-light tracking-widest inline-block"
              >
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export { CosmicParallaxBg };
