import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
// @ts-ignore
import { ArrowDown } from "lucide-react";

const sections = [
  {
    id: 1,
    title: "Share Code Snippets",
    description:
      "Effortlessly share your most useful code snippets with the community. Syntax highlighting, easy copying, and categorized tags make your code discoverable and reusable.",
    imageUrl: "/sharecode.jpg",
    reverse: false,
  },
  {
    id: 2,
    title: "Discover Projects",
    description:
      "Explore a vast repository of brilliant projects built by developers around the world. Find inspiration, study architectural designs, and learn from real-world applications.",
    imageUrl: "/projects.jpg",
    reverse: true,
  },
  {
    id: 3,
    title: "Connect Globally",
    description:
      "Connect with peers, find mentors, or team up for your next big idea. DevMate creates a dynamic environment where collaboration happens organically.",
    imageUrl: "/connection.jpg",
    reverse: false,
  },
];

const FeatureSection = ({ section }: { section: typeof sections[0] }) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);
  const clipPath = useTransform(scrollYProgress, [0.2, 0.6], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);

  return (
    <div
      ref={ref}
      className={`min-h-[70vh] py-16 flex flex-col items-center justify-center gap-12 md:gap-20 ${
        section.reverse ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <motion.div
        style={{ y, opacity }}
        className="flex-1 px-4 text-left"
      >
        <div
          className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {section.title}
        </div>
        <p className="text-x-gray text-lg md:text-xl mt-6 lg:mt-8 leading-relaxed max-w-xl mx-auto md:mx-0">
          {section.description}
        </p>
      </motion.div>

      <motion.div
        style={{
          opacity,
          clipPath,
        }}
        className="relative flex-1 flex justify-center items-center w-full"
      >
        <div className="relative w-full max-w-[450px] aspect-[4/3] md:aspect-square rounded-[32px] overflow-hidden shadow-[0_0_40px_rgba(29,155,240,0.15)] border border-x-border/80 group">
          <img
            src={section.imageUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={section.title}
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
      <div className="min-h-[30vh] md:min-h-[40vh] w-full flex flex-col items-start md:items-center justify-center p-8">
        <h2
          className="text-4xl md:text-6xl font-bold max-w-2xl text-left md:text-center"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          COMMUNITY FEATURES
        </h2>
        <p className="mt-8 md:mt-16 flex items-center gap-2 text-sm uppercase tracking-widest text-x-gray">
          Scroll to explore{" "}
          <ArrowDown size={16} className="animate-bounce text-x-blue" />
        </p>
      </div>

      <div className="flex flex-col px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
        {sections.map((section) => (
          <FeatureSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};
