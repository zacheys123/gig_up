"use client";

import { ParticleLoader } from "./sharedLoaderComponents/ParticleLoader";
import { GeometricLoader } from "./sharedLoaderComponents/GeometricLoader";
import { FinalLoader } from "./sharedLoaderComponents/FinalLoader";
import { InitialWaveLoader } from "./sharedLoaderComponents/InitialWave";
import { TextReveal } from "./sharedLoaderComponents/TextRevealLoader";

export const WelcomeLoader = ({ progress }: { progress: number }) => {
  const hasSession =
    typeof window !== "undefined" ? localStorage.getItem("hasSession") : null;

  if (hasSession) {
    return (
      <>
        <TextReveal />
        <ParticleLoader />
        <GeometricLoader />
        <FinalLoader />
      </>
    );
  }

  return (
    <>
      <InitialWaveLoader progress={progress} />
      <TextReveal />
      <ParticleLoader />
      <GeometricLoader />
      <FinalLoader />
    </>
  );
};
