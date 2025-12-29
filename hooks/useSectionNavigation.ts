// hooks/useSectionNavigation.ts
import { useEffect, useRef } from "react";

export const useSectionNavigation = () => {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Register a section element
  const registerSection = (id: string, element: HTMLElement | null) => {
    if (element) {
      sectionRefs.current.set(id, element);
    } else {
      sectionRefs.current.delete(id);
    }
  };

  // Scroll to a section
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current.get(sectionId);
    if (element) {
      const headerHeight = 80; // Adjust based on your header
      const elementTop = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementTop,
        behavior: "smooth",
      });
    }
  };

  return { registerSection, scrollToSection };
};
