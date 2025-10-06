"use client";

import { BrandReveal } from "../BrandReveal";
import { CompletionAnimation } from "../CompletionAnimation";

export function ReturningExperience({ phase }: { phase: number }) {
  const components = [
    <BrandReveal key="brand" welcomeBack />,
    <CompletionAnimation key="complete" />,
  ];

  return components[phase] || <CompletionAnimation />;
}
