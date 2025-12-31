"use client";

import { useState } from "react";
import { Modal } from "@/components/modals/Modal";
import { Badge } from "@/components/ui/badge";
import { ModalActions, TextInput } from "@/components/profile";
import { FieldValue, GigField, GigInputs, TalentModalProps } from "@/types/gig";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Mic, Music, Headphones, Star } from "lucide-react";

const TalentModal = ({
  isOpen,
  onClose,
  talentType,
  onSubmit,
  initialData,
  validateField,
}: TalentModalProps) => {
  const { colors } = useThemeColors();
  const [localData, setLocalData] = useState<Partial<GigInputs>>(
    initialData || {}
  );
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleFieldChange = <K extends GigField>(
    field: K,
    value: FieldValue<K>
  ) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleVocalistGenreChange = (genre: string) => {
    const updatedGenres = localData.vocalistGenre?.includes(genre)
      ? localData.vocalistGenre.filter((g) => g !== genre)
      : [...(localData.vocalistGenre || []), genre];

    setLocalData((prev) => ({
      ...prev,
      vocalistGenre: updatedGenres,
    }));

    const error = validateField("vocalistGenre", updatedGenres);
    setLocalErrors((prev) => ({
      ...prev,
      vocalistGenre: error,
    }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (talentType === "mc") {
      newErrors.mcType = validateField("mcType", localData.mcType as string);
      newErrors.mcLanguages = validateField(
        "mcLanguages",
        localData.mcLanguages as string
      );
    } else if (talentType === "dj") {
      newErrors.djGenre = validateField("djGenre", localData.djGenre as string);
      newErrors.djEquipment = validateField(
        "djEquipment",
        localData.djEquipment as string
      );
    } else if (talentType === "vocalist") {
      newErrors.vocalistGenre = validateField(
        "vocalistGenre",
        localData.vocalistGenre as [string]
      );
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value)
    );

    setLocalErrors(filteredErrors);

    if (Object.keys(filteredErrors).length === 0) {
      onSubmit(localData);
    }
  };

  const getTalentIcon = () => {
    switch (talentType) {
      case "mc":
        return <Mic className="w-6 h-6" />;
      case "dj":
        return <Headphones className="w-6 h-6" />;
      case "vocalist":
        return <Music className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getTalentColor = () => {
    switch (talentType) {
      case "mc":
        return "from-red-500 to-orange-500";
      case "dj":
        return "from-pink-500 to-purple-500";
      case "vocalist":
        return "from-green-500 to-emerald-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={talentType.toUpperCase() + " " + "Details"}
      description={`Provide specific detail +s for your ${talentType.toUpperCase()} talent.`}
    >
      <div className="space-y-6 py-4">
        {talentType === "mc" && (
          <>
            <div className="space-y-2">
              <label className={cn("block text-sm font-medium", colors.text)}>
                MC Type
              </label>
              <TextInput
                value={localData.mcType || ""}
                onChange={(value) => handleFieldChange("mcType", value)}
                className={cn(
                  "rounded-xl py-3",
                  localErrors.mcType && "border-red-500 focus:border-red-500"
                )}
                placeholder="e.g., Wedding, Corporate, Birthday, Events"
              />
              {localErrors.mcType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.mcType}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className={cn("block text-sm font-medium", colors.text)}>
                Languages
              </label>
              <TextInput
                value={localData.mcLanguages || ""}
                onChange={(value) => handleFieldChange("mcLanguages", value)}
                className={cn(
                  "rounded-xl py-3",
                  localErrors.mcLanguages &&
                    "border-red-500 focus:border-red-500"
                )}
                placeholder="e.g., English, Swahili, French (comma separated)"
              />
              {localErrors.mcLanguages && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.mcLanguages}
                </p>
              )}
            </div>
          </>
        )}

        {talentType === "dj" && (
          <>
            <div className="space-y-2">
              <label className={cn("block text-sm font-medium", colors.text)}>
                DJ Genre
              </label>
              <TextInput
                value={localData.djGenre || ""}
                onChange={(value) => handleFieldChange("djGenre", value)}
                className={cn(
                  "rounded-xl py-3",
                  localErrors.djGenre && "border-red-500 focus:border-red-500"
                )}
                placeholder="e.g., House, Hip Hop, Afrobeat, EDM"
              />
              {localErrors.djGenre && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.djGenre}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className={cn("block text-sm font-medium", colors.text)}>
                DJ Equipment
              </label>
              <TextInput
                value={localData.djEquipment || ""}
                onChange={(value) => handleFieldChange("djEquipment", value)}
                className={cn(
                  "rounded-xl py-3",
                  localErrors.djEquipment &&
                    "border-red-500 focus:border-red-500"
                )}
                placeholder="e.g., Pioneer CDJs, Mixer, Speakers"
              />
              {localErrors.djEquipment && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.djEquipment}
                </p>
              )}
            </div>
          </>
        )}

        {talentType === "vocalist" && (
          <div className="space-y-4">
            <div>
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                Vocalist Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Pop",
                  "R&B",
                  "Gospel",
                  "Jazz",
                  "Afrobeat",
                  "Soul",
                  "Rock",
                  "Reggae",
                  "Country",
                ].map((genre) => (
                  <Badge
                    key={genre}
                    variant={
                      localData.vocalistGenre?.includes(genre)
                        ? "secondary"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer px-4 py-2 rounded-lg transition-all hover:scale-105",
                      localData.vocalistGenre?.includes(genre)
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent"
                        : ""
                    )}
                    onClick={() => handleVocalistGenreChange(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              {localErrors.vocalistGenre && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  ⚠️ {localErrors.vocalistGenre}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={cn("block text-sm font-medium", colors.text)}>
                Additional Notes
              </label>
              <textarea
                className={cn(
                  "w-full px-4 py-3 rounded-xl border resize-none",
                  colors.border,
                  colors.background,
                  colors.text
                )}
                placeholder="Any specific requirements or notes..."
                rows={3}
                onChange={(e) =>
                  setLocalData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
        )}
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmText="Save Details"
        cancelText="Cancel"
        className="mt-6"
      />
    </Modal>
  );
};

export default TalentModal;
