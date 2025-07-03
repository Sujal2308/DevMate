import { useState, useEffect } from "react";

const useFooterVisibility = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Footer is considered visible when more than 20% is in view
        setIsFooterVisible(entry.intersectionRatio > 0.2);
      },
      {
        threshold: [0, 0.2, 0.5, 1], // Multiple thresholds for smoother detection
        rootMargin: "0px 0px -100px 0px", // Start hiding sidebar a bit before footer fully appears
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return isFooterVisible;
};

export default useFooterVisibility;
