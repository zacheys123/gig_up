// app/components/talent/DJGenreModal.tsx
import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Search,
  Volume2,
  Music,
  Settings,
  Star,
  X,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeColors } from "@/hooks/useTheme";
import { BaseTalentModal } from "./BaseTalentModal";
import { Button } from "@/components/ui/button";
import { experienceLevels, talentCategories } from "../types";

interface DJGenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    djGenre: string[];
    djEquipment?: string[];
    djExperience?: string;
    djSetup?: string;
  }) => void;
  initialData?: {
    djGenre?: string[];
    djEquipment?: string[];
    djExperience?: string;
    djSetup?: string;
  };
}

export default function DJGenreModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}: DJGenreModalProps) {
  const { colors, isDarkMode } = useThemeColors();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialData.djGenre || [],
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    initialData.djEquipment || [],
  );
  const [selectedExperience, setSelectedExperience] = useState<string>(
    initialData.djExperience || "",
  );
  const [selectedSetup, setSelectedSetup] = useState<string>(
    initialData.djSetup || "",
  );
  const [genreSearch, setGenreSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");

  // Filter based on search
  const filteredGenres = useMemo(() => {
    const baseGenres = talentCategories.dj.genres;
    if (!genreSearch.trim()) return baseGenres;

    return baseGenres.filter((genre) =>
      genre.toLowerCase().includes(genreSearch.toLowerCase()),
    );
  }, [genreSearch]);

  const filteredEquipment = useMemo(() => {
    const baseEquipment = talentCategories.dj.equipment;
    if (!equipmentSearch.trim()) return baseEquipment;

    return baseEquipment.filter((eq) =>
      eq.toLowerCase().includes(equipmentSearch.toLowerCase()),
    );
  }, [equipmentSearch]);

  // Toggle selections
  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) => {
      if (genre === "Other Genre") {
        return prev;
      }

      return prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
    });
  }, []);

  const toggleEquipment = useCallback((equipment: string) => {
    setSelectedEquipment((prev) => {
      if (equipment === "Other Equipment") {
        return prev;
      }

      return prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment];
    });
  }, []);

  // Add custom items
  const addCustomGenre = useCallback(() => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim())) {
      setSelectedGenres((prev) => [...prev, customGenre.trim()]);
      setCustomGenre("");
    }
  }, [customGenre, selectedGenres]);

  const addCustomEquipment = useCallback(() => {
    if (
      customEquipment.trim() &&
      !selectedEquipment.includes(customEquipment.trim())
    ) {
      setSelectedEquipment((prev) => [...prev, customEquipment.trim()]);
      setCustomEquipment("");
    }
  }, [customEquipment, selectedEquipment]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (selectedGenres.length === 0) {
      return;
    }

    onSubmit({
      djGenre: selectedGenres,
      djEquipment: selectedEquipment.length > 0 ? selectedEquipment : undefined,
      djExperience: selectedExperience || undefined,
      djSetup: selectedSetup || undefined,
    });
  }, [
    selectedGenres,
    selectedEquipment,
    selectedExperience,
    selectedSetup,
    onSubmit,
  ]);

  // Remove selected genre
  const removeGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genre));
  }, []);

  // Remove selected equipment
  const removeEquipment = useCallback((equipment: string) => {
    setSelectedEquipment((prev) => prev.filter((e) => e !== equipment));
  }, []);

  return (
    <BaseTalentModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="DJ Details"
      icon={<Volume2 className="w-5 h-5" />}
      disableSubmit={selectedGenres.length === 0}
    >
      <div className="space-y-6">
        {/* Genres Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label
              className={cn(
                "text-sm font-medium flex items-center gap-2",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              <Music className="w-4 h-4" />
              Music Genres *
            </Label>
            <span
              className={cn(
                "text-xs",
                isDarkMode ? "text-gray-400" : "text-gray-500",
              )}
            >
              {selectedGenres.length} selected
            </span>
          </div>

          {/* Genre Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search genres..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className={cn(
                "pl-10",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900",
              )}
            />
          </div>

          {/* Genre Selection */}
          <ScrollArea
            className={cn(
              "h-48 rounded-lg p-3 mb-4",
              isDarkMode
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-gray-50 border border-gray-200",
            )}
          >
            <div className="grid grid-cols-2 gap-2">
              {filteredGenres.map((genre: string) => {
                const isSelected = selectedGenres.includes(genre);
                const isOther = genre === "Other Genre";

                return (
                  <Badge
                    key={genre}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      isSelected
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                        : isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    )}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </Badge>
                );
              })}
            </div>
          </ScrollArea>

          {/* Selected Genres Preview */}
          {selectedGenres.length > 0 && (
            <div className="mb-4">
              <Label
                className={cn(
                  "text-sm font-medium mb-2 block",
                  isDarkMode ? "text-gray-200" : "text-gray-900",
                )}
              >
                Selected Genres
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="default"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    {genre}
                    <button
                      onClick={() => removeGenre(genre)}
                      className="ml-2 hover:text-white/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Genre Input */}
          <div className="mb-6">
            <Label
              className={cn(
                "text-sm font-medium mb-2 block",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              Add Custom Genre
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom genre..."
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customGenre.trim()) {
                    addCustomGenre();
                  }
                }}
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900",
                )}
              />
              <Button
                onClick={addCustomGenre}
                disabled={!customGenre.trim()}
                variant="outline"
                className={cn(
                  isDarkMode
                    ? "border-gray-600 hover:bg-gray-700 text-gray-200"
                    : "border-gray-300 hover:bg-gray-100",
                )}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label
              className={cn(
                "text-sm font-medium flex items-center gap-2",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              <Settings className="w-4 h-4" />
              Equipment (Optional)
            </Label>
            <span
              className={cn(
                "text-xs",
                isDarkMode ? "text-gray-400" : "text-gray-500",
              )}
            >
              {selectedEquipment.length} selected
            </span>
          </div>

          {/* Equipment Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search equipment..."
              value={equipmentSearch}
              onChange={(e) => setEquipmentSearch(e.target.value)}
              className={cn(
                "pl-10",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900",
              )}
            />
          </div>

          {/* Equipment Selection */}
          <ScrollArea
            className={cn(
              "h-48 rounded-lg p-3 mb-4",
              isDarkMode
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-gray-50 border border-gray-200",
            )}
          >
            <div className="grid grid-cols-2 gap-2">
              {filteredEquipment.map((equipment: string) => {
                const isSelected = selectedEquipment.includes(equipment);
                const isOther = equipment === "Other Equipment";

                return (
                  <Badge
                    key={equipment}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      isSelected
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent"
                        : isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    )}
                    onClick={() => toggleEquipment(equipment)}
                  >
                    {equipment}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </Badge>
                );
              })}
            </div>
          </ScrollArea>

          {/* Selected Equipment Preview */}
          {selectedEquipment.length > 0 && (
            <div className="mb-4">
              <Label
                className={cn(
                  "text-sm font-medium mb-2 block",
                  isDarkMode ? "text-gray-200" : "text-gray-900",
                )}
              >
                Selected Equipment
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedEquipment.map((equipment) => (
                  <Badge
                    key={equipment}
                    variant="default"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                  >
                    {equipment}
                    <button
                      onClick={() => removeEquipment(equipment)}
                      className="ml-2 hover:text-white/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Equipment Input */}
          <div className="mt-4">
            <Label
              className={cn(
                "text-sm font-medium mb-2 block",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              Add Custom Equipment
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom equipment..."
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customEquipment.trim()) {
                    addCustomEquipment();
                  }
                }}
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900",
                )}
              />
              <Button
                onClick={addCustomEquipment}
                disabled={!customEquipment.trim()}
                variant="outline"
                className={cn(
                  isDarkMode
                    ? "border-gray-600 hover:bg-gray-700 text-gray-200"
                    : "border-gray-300 hover:bg-gray-100",
                )}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* DJ Setup */}
        <div>
          <Label
            className={cn(
              "text-sm font-medium mb-3 block",
              isDarkMode ? "text-gray-200" : "text-gray-900",
            )}
          >
            DJ Setup (Optional)
          </Label>
          <Select value={selectedSetup} onValueChange={setSelectedSetup}>
            <SelectTrigger
              className={cn(
                "w-full",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200",
              )}
            >
              <SelectValue placeholder="Select setup type" />
            </SelectTrigger>
            <SelectContent
              className={cn(
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white",
              )}
            >
              {talentCategories.dj.setups.map((setup) => (
                <SelectItem
                  key={setup}
                  value={setup}
                  className={cn(
                    isDarkMode
                      ? "text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                      : "hover:bg-gray-100",
                  )}
                >
                  {setup}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div>
          <Label
            className={cn(
              "text-sm font-medium mb-3 block",
              isDarkMode ? "text-gray-200" : "text-gray-900",
            )}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Experience Level (Optional)
            </div>
          </Label>
          <Select
            value={selectedExperience}
            onValueChange={setSelectedExperience}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200",
              )}
            >
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent
              className={cn(
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white",
              )}
            >
              {experienceLevels.map((level: any) => (
                <SelectItem
                  key={level}
                  value={level}
                  className={cn(
                    isDarkMode
                      ? "text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                      : "hover:bg-gray-100",
                  )}
                >
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseTalentModal>
  );
}
