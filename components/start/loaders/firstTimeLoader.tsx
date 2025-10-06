"use client";

import { BrandReveal } from "../BrandReveal";
import { CompletionAnimation } from "../CompletionAnimation";
import { GeometricLoader } from "../sharedLoaderComponents/GeometricLoader";
import { InitialWaveLoader } from "../sharedLoaderComponents/InitialWave";
import { ParticleLoader } from "../sharedLoaderComponents/ParticleLoader";

export function FirstTimLoader({
  phase,
  progress,
}: {
  phase: number;
  progress: number;
}) {
  const components = [
    <InitialWaveLoader key="wave" progress={progress} />,
    <BrandReveal key="brand" />,
    <ParticleLoader key="particles" />,
    <GeometricLoader key="geometric" />,
    <CompletionAnimation key="complete" />,
  ];

  return components[phase] || <CompletionAnimation />;
}
