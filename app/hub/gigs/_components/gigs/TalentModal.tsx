"use client";

import { useState, useMemo, useCallback, useEffect } from "react"; // Added useEffect
import { Modal } from "@/components/modals/Modal";
import { Badge } from "@/components/ui/badge";
import { ModalActions, TextInput } from "@/components/profile";

import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import {
  Mic,
  Music,
  Headphones,
  Star,
  Search,
  X,
  Globe,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TalentType } from "@/types/gig";
import { LocalGigInputs } from "@/drafts";

// Type definitions for TalentModal
interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentType: TalentType;
  onSubmit: (data: Partial<LocalGigInputs>) => void;
  initialData?: Partial<LocalGigInputs>;
  validateField?: (field: string, value: any) => string;
}

// Talent data constants
const mcTypes = [
  "Event MC",
  "Wedding MC",
  "Corporate MC",
  "Club MC",
  "Concert MC",
  "Radio MC",
  "TV Host",
  "Sports MC",
  "Award Ceremony MC",
  "Conference Moderator",
  "Other",
];

const mcLanguages = [
  "English",
  "Swahili",
  "French",
  "Spanish",
  "Arabic",
  "German",
  "Portuguese",
  "Chinese",
  "Hindi",
  "Japanese",
  "Korean",
  "Italian",
  "Russian",
  "Local Dialects",
  "Other",
];

const djGenres = [
  "Hip Hop",
  "R&B",
  "Reggae",
  "Afrobeats",
  "Dancehall",
  "Amapiano",
  "House",
  "Techno",
  "Trance",
  "EDM",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "Gospel",
  "Country",
  "Latin",
  "Electronic",
  "Disco",
  "Funk",
  "Other",
];

const djEquipment = [
  "DJ Controller",
  "Turntables",
  "CDJs",
  "Mixer",
  "PA System",
  "Laptop",
  "Speakers",
  "Lights",
  "Fog Machine",
  "Microphone",
  "Subwoofers",
  "Other",
];

const vocalistGenres = [
  "Pop",
  "Rock",
  "Jazz",
  "R&B",
  "Soul",
  "Gospel",
  "Blues",
  "Country",
  "Classical",
  "Musical Theater",
  "Hip Hop",
  "Reggae",
  "Afrobeats",
  "Dancehall",
  "Latin",
  "Folk",
  "Metal",
  "Alternative",
  "Indie",
  "Acoustic",
  "Other",
];

const experienceLevels = [
  "Beginner (< 1 year)",
  "Intermediate (1-3 years)",
  "Advanced (3-5 years)",
  "Expert (5+ years)",
  "Professional",
];

const TalentModal = ({
  isOpen,
  onClose,
  talentType,
  onSubmit,
  initialData,
  validateField = () => "",
}: TalentModalProps) => {
  const { colors, isDarkMode } = useThemeColors();
  const [localData, setLocalData] = useState<Partial<LocalGigInputs>>({});
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // State for search and custom inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [customInput, setCustomInput] = useState("");

  // Parse initial data (handle strings or arrays)
  const parseInitialData = useCallback((data: Partial<LocalGigInputs>) => {
    if (!data) return {};

    const parsed: any = { ...data };

    // Parse MC languages from string to array
    if (parsed.mcLanguages) {
      if (typeof parsed.mcLanguages === "string") {
        parsed.mcLanguages = parsed.mcLanguages
          .split(",")
          .map((lang: string) => lang.trim())
          .filter(Boolean);
      }
    } else {
      parsed.mcLanguages = [];
    }

    // Parse DJ genres from string to array
    if (parsed.djGenre) {
      if (typeof parsed.djGenre === "string") {
        parsed.djGenre = parsed.djGenre
          .split(",")
          .map((genre: string) => genre.trim())
          .filter(Boolean);
      }
    } else {
      parsed.djGenre = [];
    }

    // Parse DJ equipment from string to array
    if (parsed.djEquipment) {
      if (typeof parsed.djEquipment === "string") {
        parsed.djEquipment = parsed.djEquipment
          .split(",")
          .map((eq: string) => eq.trim())
          .filter(Boolean);
      }
    } else {
      parsed.djEquipment = [];
    }

    // Ensure vocalistGenre is an array
    if (parsed.vocalistGenre) {
      if (typeof parsed.vocalistGenre === "string") {
        parsed.vocalistGenre = parsed.vocalistGenre
          .split(",")
          .map((genre: string) => genre.trim())
          .filter(Boolean);
      }
    } else {
      parsed.vocalistGenre = [];
    }

    return parsed;
  }, []);

  // Initialize with parsed data
  useEffect(() => {
    if (isOpen && talentType) {
      const parsedData = parseInitialData(initialData || {});
      setLocalData(parsedData);
      setSearchQuery("");
      setCustomInput("");
    }
  }, [isOpen, talentType, initialData, parseInitialData]);

  // Filtered lists based on search
  const filteredLanguages = useMemo(() => {
    return mcLanguages.filter((lang) =>
      lang.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredDjGenres = useMemo(() => {
    return djGenres.filter((genre) =>
      genre.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredDjEquipment = useMemo(() => {
    return djEquipment.filter((eq) =>
      eq.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredVocalistGenres = useMemo(() => {
    return vocalistGenres.filter((genre) =>
      genre.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  // Fix 1: Update handleFieldChange to be more type-safe
  const handleFieldChange = (field: keyof LocalGigInputs, value: any) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Fix 2: Create helper functions for type-safe array operations
  const getStringArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const updateStringArray = (
    currentValue: any,
    item: string,
    action: "add" | "remove",
  ): string[] => {
    const currentArray = getStringArray(currentValue);

    if (action === "add") {
      return currentArray.includes(item)
        ? currentArray
        : [...currentArray, item];
    } else {
      return currentArray.filter((i) => i !== item);
    }
  };

  // Fix 3: Update all the handler functions
  const handleVocalistGenreChange = (genre: string) => {
    if (genre === "Other") return;

    const currentGenres = getStringArray(localData.vocalistGenre);
    const updatedGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g: string) => g !== genre)
      : [...currentGenres, genre];

    handleFieldChange("vocalistGenre", updatedGenres);
  };

  const handleMcLanguageChange = (language: string) => {
    if (language === "Other") return;

    const currentLanguages = getStringArray(localData.mcLanguages);
    const updatedLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter((l: string) => l !== language)
      : [...currentLanguages, language];

    handleFieldChange("mcLanguages", updatedLanguages);
  };

  const handleDjGenreChange = (genre: string) => {
    if (genre === "Other") return;

    const currentGenres = getStringArray(localData.djGenre);
    const updatedGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g: string) => g !== genre)
      : [...currentGenres, genre];

    handleFieldChange("djGenre", updatedGenres);
  };

  const handleDjEquipmentChange = (equipment: string) => {
    if (equipment === "Other") return;

    const currentEquipment = getStringArray(localData.djEquipment);
    const updatedEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter((e: string) => e !== equipment)
      : [...currentEquipment, equipment];

    handleFieldChange("djEquipment", updatedEquipment);
  };

  // Fix 4: Update addCustomItem function
  const addCustomItem = (field: keyof LocalGigInputs) => {
    if (!customInput.trim()) return;

    const currentItems = getStringArray(localData[field]);

    if (!currentItems.includes(customInput.trim())) {
      const updatedItems = [...currentItems, customInput.trim()];
      handleFieldChange(field, updatedItems);
      setCustomInput("");
    }
  };

  // Fix 5: Update removeItem function
  const removeItem = (field: keyof LocalGigInputs, item: string) => {
    const currentItems = getStringArray(localData[field]);
    const updatedItems = currentItems.filter((i) => i !== item);
    handleFieldChange(field, updatedItems);
  };

  // Fix 6: Update renderSelectedItems function
  const renderSelectedItems = (field: keyof LocalGigInputs) => {
    const items = getStringArray(localData[field]);

    if (items.length === 0) return null;

    return (
      <div className="mt-3">
        <p className={cn("text-sm font-medium mb-2", colors.text)}>Selected:</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge
              key={item}
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {item}
              <button
                onClick={() => removeItem(field, item)}
                className="ml-2 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    // Check if talentType is valid
    if (!talentType) {
      console.error("Talent type is required");
      return;
    }

    const newErrors: Record<string, string> = {};

    if (talentType === "mc") {
      newErrors.mcType = validateField("mcType", localData.mcType || "");
      newErrors.mcLanguages = validateField(
        "mcLanguages",
        localData.mcLanguages || [],
      );
    } else if (talentType === "dj") {
      newErrors.djGenre = validateField("djGenre", localData.djGenre || []);
      newErrors.djEquipment = validateField(
        "djEquipment",
        localData.djEquipment || [],
      );
    } else if (talentType === "vocalist") {
      newErrors.vocalistGenre = validateField(
        "vocalistGenre",
        localData.vocalistGenre || [],
      );
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value),
    );

    setLocalErrors(filteredErrors);

    if (Object.keys(filteredErrors).length === 0) {
      // Convert arrays back to comma-separated strings for submission
      const submissionData: any = { ...localData };

      if (Array.isArray(submissionData.mcLanguages)) {
        submissionData.mcLanguages = submissionData.mcLanguages.join(", ");
      }

      if (Array.isArray(submissionData.djGenre)) {
        submissionData.djGenre = submissionData.djGenre.join(", ");
      }

      if (Array.isArray(submissionData.djEquipment)) {
        submissionData.djEquipment = submissionData.djEquipment.join(", ");
      }

      if (Array.isArray(submissionData.vocalistGenre)) {
        submissionData.vocalistGenre = submissionData.vocalistGenre.join(", ");
      }

      onSubmit(submissionData);
    }
  };

  const getTalentIcon = () => {
    if (!talentType) return <Star className="w-6 h-6" />;

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
    if (!talentType) return "from-blue-500 to-cyan-500";

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

  // Early return if talentType is null
  if (!talentType) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Error"
        description="Talent type is required"
        className="max-w-md"
      >
        <div className="p-4 text-center">
          <p className="text-red-500">Please select a valid talent type.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${talentType.toUpperCase()} Details`}
      description={`Provide specific details for your ${talentType.toUpperCase()} talent.`}
      className="max-w-2xl"
    >
      <div className="space-y-6 py-4">
        {talentType === "mc" && (
          <>
            {/* MC Type */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  MC Type
                </div>
              </label>
              <Select
                value={localData.mcType || ""}
                onValueChange={(value) => handleFieldChange("mcType", value)}
              >
                <SelectTrigger className={cn("rounded-xl py-3", colors.border)}>
                  <SelectValue placeholder="Select MC type" />
                </SelectTrigger>
                <SelectContent
                  className={isDarkMode ? "bg-gray-800" : "bg-white"}
                >
                  {mcTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {localData.mcType === "Other" && (
                <div className="mt-2">
                  <Input
                    value={localData.customMcType || ""}
                    onChange={(e) =>
                      handleFieldChange("customMcType", e.target.value)
                    }
                    placeholder="Enter custom MC type..."
                    className={cn(
                      "rounded-xl py-3",
                      colors.border,
                      colors.background,
                    )}
                  />
                </div>
              )}

              {localErrors.mcType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.mcType}
                </p>
              )}
            </div>

            {/* MC Languages */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Languages Spoken
                </div>
              </label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-10 rounded-xl py-3", colors.border)}
                />
              </div>

              {/* Language Selection Grid */}
              <ScrollArea className="h-48 border rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredLanguages.map((language) => (
                    <Badge
                      key={language}
                      variant={
                        Array.isArray(localData.mcLanguages) &&
                        localData.mcLanguages?.includes(language)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer transition-all text-center",
                        Array.isArray(localData.mcLanguages) &&
                          localData.mcLanguages?.includes(language) &&
                          "bg-gradient-to-r from-blue-500 to-cyan-500",
                      )}
                      onClick={() => handleMcLanguageChange(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>

              {/* Custom Language Input */}
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Enter custom language..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customInput.trim()) {
                      addCustomItem("mcLanguages");
                    }
                  }}
                  className={cn("flex-1 rounded-xl py-3", colors.border)}
                />
                <Button
                  onClick={() => addCustomItem("mcLanguages")}
                  disabled={!customInput.trim()}
                  variant="outline"
                  className="rounded-xl"
                >
                  Add
                </Button>
              </div>

              {renderSelectedItems("mcLanguages")}

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
            {/* DJ Genres */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Music Genres
                </div>
              </label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-10 rounded-xl py-3", colors.border)}
                />
              </div>

              {/* Genre Selection Grid */}
              <ScrollArea className="h-48 border rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredDjGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={
                        Array.isArray(localData.djGenre) &&
                        localData.djGenre?.includes(genre)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer transition-all text-center",
                        Array.isArray(localData.djGenre) &&
                          localData.djGenre?.includes(genre) &&
                          "bg-gradient-to-r from-purple-500 to-pink-500",
                      )}
                      onClick={() => handleDjGenreChange(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>

              {/* Custom Genre Input */}
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Enter custom genre..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customInput.trim()) {
                      addCustomItem("djGenre");
                    }
                  }}
                  className={cn("flex-1 rounded-xl py-3", colors.border)}
                />
                <Button
                  onClick={() => addCustomItem("djGenre")}
                  disabled={!customInput.trim()}
                  variant="outline"
                  className="rounded-xl"
                >
                  Add
                </Button>
              </div>
              {renderSelectedItems("djGenre")}

              {localErrors.djGenre && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.djGenre}
                </p>
              )}
            </div>

            {/* DJ Equipment */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Equipment (Optional)
                </div>
              </label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-10 rounded-xl py-3", colors.border)}
                />
              </div>

              {/* Equipment Selection Grid */}
              <ScrollArea className="h-48 border rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredDjEquipment.map((equipment) => (
                    <Badge
                      key={equipment}
                      variant={
                        Array.isArray(localData.djEquipment) &&
                        localData.djEquipment?.includes(equipment)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer transition-all text-center",
                        Array.isArray(localData.djEquipment) &&
                          localData.djEquipment?.includes(equipment) &&
                          "bg-gradient-to-r from-green-500 to-emerald-500",
                      )}
                      onClick={() => handleDjEquipmentChange(equipment)}
                    >
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>

              {/* Custom Equipment Input */}
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Enter custom equipment..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customInput.trim()) {
                      addCustomItem("djEquipment");
                    }
                  }}
                  className={cn("flex-1 rounded-xl py-3", colors.border)}
                />
                <Button
                  onClick={() => addCustomItem("djEquipment")}
                  disabled={!customInput.trim()}
                  variant="outline"
                  className="rounded-xl"
                >
                  Add
                </Button>
              </div>
              {renderSelectedItems("djEquipment")}

              {localErrors.djEquipment && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.djEquipment}
                </p>
              )}
            </div>
          </>
        )}

        {talentType === "vocalist" && (
          <div className="space-y-6">
            {/* Vocalist Genres */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Music Genres
                </div>
              </label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-10 rounded-xl py-3", colors.border)}
                />
              </div>

              {/* Genre Selection Grid */}
              <ScrollArea className="h-48 border rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredVocalistGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={
                        Array.isArray(localData.vocalistGenre) &&
                        localData.vocalistGenre?.includes(genre)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer transition-all text-center",
                        Array.isArray(localData.vocalistGenre) &&
                          localData.vocalistGenre?.includes(genre) &&
                          "bg-gradient-to-r from-green-500 to-emerald-500",
                      )}
                      onClick={() => handleVocalistGenreChange(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>

              {/* Custom Genre Input */}
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Enter custom genre..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customInput.trim()) {
                      addCustomItem("vocalistGenre");
                    }
                  }}
                  className={cn("flex-1 rounded-xl py-3", colors.border)}
                />
                <Button
                  onClick={() => addCustomItem("vocalistGenre")}
                  disabled={!customInput.trim()}
                  variant="outline"
                  className="rounded-xl"
                >
                  Add
                </Button>
              </div>
              {renderSelectedItems("vocalistGenre")}

              {localErrors.vocalistGenre && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {localErrors.vocalistGenre}
                </p>
              )}
            </div>

            {/* Vocalist Range (Optional) */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                Vocal Range (Optional)
              </label>
              <Select
                value={localData.vocalistRange || ""}
                onValueChange={(value) =>
                  handleFieldChange("vocalistRange", value)
                }
              >
                <SelectTrigger className={cn("rounded-xl py-3", colors.border)}>
                  <SelectValue placeholder="Select vocal range" />
                </SelectTrigger>
                <SelectContent
                  className={isDarkMode ? "bg-gray-800" : "bg-white"}
                >
                  <SelectItem value="Soprano">Soprano</SelectItem>
                  <SelectItem value="Mezzo-Soprano">Mezzo-Soprano</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Tenor">Tenor</SelectItem>
                  <SelectItem value="Baritone">Baritone</SelectItem>
                  <SelectItem value="Bass">Bass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-3">
              <label className={cn("block text-sm font-medium", colors.text)}>
                Additional Notes (Optional)
              </label>
              <textarea
                className={cn(
                  "w-full px-4 py-3 rounded-xl border resize-none",
                  colors.border,
                  colors.background,
                  colors.text,
                )}
                placeholder="Any specific requirements or notes..."
                rows={3}
                value={localData.notes || ""}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
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
