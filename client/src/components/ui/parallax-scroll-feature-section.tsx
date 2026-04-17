import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
// @ts-ignore
import { ArrowDown } from "lucide-react";

const sections = [
  {
    id: 1,
    title: "Share Code Snippets",
    description:
      "Effortlessly share your most useful code snippets with the community. Syntax highlighting, easy copying, and categorized tags make your code discoverable and reusable.",
    imageUrl: "/sharecode.webp",
    reverse: false,
    color: "text-x-blue"
  },
  {
    id: 2,
    title: "Discover Projects",
    description:
      "Explore a vast repository of brilliant projects built by developers around the world. Find inspiration, study architectural designs, and learn from real-world applications.",
    imageUrl: "/projects.webp",
    reverse: true,
    color: "text-[#22c55e]" // Vibrant Green
  },
  {
    id: 3,
    title: "Connect Globally",
    description:
      "Connect with peers, find mentors, or team up for your next big idea. DevMate creates a dynamic environment where collaboration happens organically.",
    imageUrl: "/connection.webp",
    reverse: false,
    color: "text-[#a855f7]" // Vibrant Purple
  },
];

const FeatureSection = ({ section }: { section: typeof sections[0] }) => {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "center center"],
  });

  // Apply a spring to smooth out the jittery mouse-wheel inputs!
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  const opacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const y = useTransform(smoothProgress, [0, 1], [80, 0]);
  
  // Image slides out to the edge it's closest to. 
  // If reverse is true, image is on the left -> slides out to the left (-150). Otherwise right (150).
  const startX = section.reverse ? -150 : 150;
  const imageX = useTransform(smoothProgress, [0, 1], [startX, 0]);

  return (
    <div
      ref={ref}
      className={`py-20 md:py-16 md:min-h-[70vh] flex flex-col items-center justify-center gap-12 md:gap-20 ${
        section.reverse ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <motion.div
        style={{ y: isMobile ? 0 : y, opacity: isMobile ? 1 : opacity }}
        className="flex-1 px-4 text-left"
      >
        <div
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter uppercase"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {section.title}
        </div>
        <p 
          className="text-x-gray text-lg md:text-xl mt-6 lg:mt-8 leading-[1.8] max-w-xl mx-auto md:mx-0"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {section.description}
        </p>
      </motion.div>

      <motion.div
        style={{ x: isMobile ? 0 : imageX }}
        className="relative flex-1 flex justify-center items-center w-full"
      >
        <div className="relative w-full max-w-[360px] aspect-[4/3] md:aspect-square rounded-[32px] overflow-hidden group">
          <img
            src={section.imageUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={section.title}
            loading={section.id === 1 ? "eager" : "lazy"}
            fetchPriority={section.id === 1 ? "high" : "auto"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
        </div>
      </motion.div>
    </div>
  );
};

export const ParallaxScrollFeatureSection = () => {
  return (
    <div className="bg-x-black text-x-white py-10 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
        <div className="min-h-[30vh] md:min-h-[40vh] w-full flex flex-col items-start justify-center py-8 pl-2 md:pl-0">
          <h2
            className="text-3xl md:text-4xl font-bold text-left bungee-regular"
          >
            COMMUNITY FEATURES
          </h2>
          <p className="mt-8 md:mt-16 flex items-center gap-2 text-sm uppercase tracking-widest text-x-gray">
            Scroll to explore{" "}
            <ArrowDown size={16} className="animate-bounce text-x-blue" />
          </p>
        </div>

        <div className="flex flex-col">
          {sections.map((section) => (
            <FeatureSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};
