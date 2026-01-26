// app/components/talent/TalentModal.tsx
import React from "react";
import { TalentModalData } from "../types";
import MCLanguagesModal from "./McLanguagesModal";
import DJGenreModal from "./DjGenre";
import VocalistGenreModal from "./VocalistGenreModal";

interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TalentModalData) => void;
  talentType: "mc" | "dj" | "vocalist" | null;
  initialData?: TalentModalData;
}

export default function TalentModal({
  isOpen,
  onClose,
  onSubmit,
  talentType,
  initialData = {},
}: TalentModalProps) {
  if (!talentType || !isOpen) return null;

  const handleMCSave = (data: any) => {
    onSubmit({
      mcType: data.mcType,
      mcLanguages: data.mcLanguages,
      mcExperience: data.mcExperience,
      mcStyle: data.mcStyle,
    });
  };

  const handleDJSave = (data: any) => {
    onSubmit({
      djGenre: data.djGenre,
      djEquipment: data.djEquipment,
      djExperience: data.djExperience,
      djSetup: data.djSetup,
    });
  };

  const handleVocalistSave = (data: any) => {
    onSubmit({
      vocalistGenre: data.vocalistGenre,
      vocalistRange: data.vocalistRange,
      vocalistType: data.vocalistType,
      vocalistExperience: data.vocalistExperience,
      vocalistStyle: data.vocalistStyle,
    });
  };

  switch (talentType) {
    case "mc":
      return (
        <MCLanguagesModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleMCSave}
          initialData={{
            mcType: initialData.mcType,
            mcLanguages: initialData.mcLanguages,
            mcExperience: initialData.mcExperience,
            mcStyle: initialData.mcStyle,
          }}
        />
      );

    case "dj":
      return (
        <DJGenreModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleDJSave}
          initialData={{
            djGenre: initialData.djGenre,
            djEquipment: initialData.djEquipment,
            djExperience: initialData.djExperience,
            djSetup: initialData.djSetup,
          }}
        />
      );

    case "vocalist":
      return (
        <VocalistGenreModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleVocalistSave}
          initialData={{
            vocalistGenre: initialData.vocalistGenre,
          }}
        />
      );

    default:
      return null;
  }
}
