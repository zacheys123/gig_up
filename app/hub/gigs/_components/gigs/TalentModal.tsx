"use client";

import { useState } from "react";

import { Modal } from "@/components/modals/Modal";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ModalActions, TextInput } from "@/components/profile";
import { FieldValue, GigField, GigInputs, TalentModalProps } from "@/types/gig";
const TalentModal = ({
  isOpen,
  onClose,
  talentType,
  onSubmit,
  initialData,
  validateField, // Now only expects field and value
}: TalentModalProps) => {
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
      Object.entries(newErrors).filter(([x, value]) => {
        console.log(x);
        return value;
      })
    );

    setLocalErrors(filteredErrors);

    if (Object.keys(filteredErrors).length === 0) {
      onSubmit(localData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${talentType.toUpperCase()} Details`}
    >
      <div className="space-y-4">
        {talentType === "mc" && (
          <>
            <div className="flex flex-col gap-1">
              <TextInput
                label="MC Type"
                value={localData.mcType || ""}
                onChange={(value) => handleFieldChange("mcType", value)}
                className={localErrors.mcType ? "border-red-500" : ""}
                placeholder="Wedding/Co-orporate/Birthdays/Eventss"
              />
              {localErrors.mcType && (
                <p className="text-red-500 text-xs">{localErrors.mcType}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <TextInput
                label="Languages (comma separated)"
                value={localData.mcLanguages || ""}
                onChange={(value) => handleFieldChange("mcLanguages", value)}
                className={localErrors.mcLanguages ? "border-red-500" : ""}
              />
              {localErrors.mcLanguages && (
                <p className="text-red-500 text-xs">
                  {localErrors.mcLanguages}
                </p>
              )}
            </div>
          </>
        )}

        {talentType === "dj" && (
          <>
            <div className="flex flex-col gap-1">
              <TextInput
                label="DJ Genre"
                value={localData.djGenre || ""}
                onChange={(value) => handleFieldChange("djGenre", value)}
                className={localErrors.djGenre ? "border-red-500" : ""}
              />
              {localErrors.djGenre && (
                <p className="text-red-500 text-xs">{localErrors.djGenre}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <TextInput
                label="DJ Equipment"
                value={localData.djEquipment || ""}
                onChange={(value) => handleFieldChange("djEquipment", value)}
                className={localErrors.djEquipment ? "border-red-500" : ""}
              />
              {localErrors.djEquipment && (
                <p className="text-red-500 text-xs">
                  {localErrors.djEquipment}
                </p>
              )}
            </div>
          </>
        )}

        {talentType === "vocalist" && (
          <div className="space-y-2">
            <Label className="text-neutral-400">Vocalist Genres</Label>
            <div className="flex flex-wrap gap-2">
              {["Pop", "R&B", "Gospel", "Jazz", "Afrobeat"].map((genre) => (
                <Badge
                  key={genre}
                  variant={
                    localData.vocalistGenre?.includes(genre)
                      ? "secondary"
                      : "outline"
                  }
                  className="cursor-pointer text-red-500"
                  onClick={() => handleVocalistGenreChange(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
            {localErrors.vocalistGenre && (
              <p className="text-red-500 text-xs">
                {localErrors.vocalistGenre}
              </p>
            )}
          </div>
        )}
      </div>
      <ModalActions onCancel={onClose} onConfirm={handleSubmit} />
    </Modal>
  );
};
export default TalentModal;
