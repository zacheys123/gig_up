// app/components/talent/MCLanguagesModal.tsx
import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Mic, Globe, Star, User, X, Plus, Check } from "lucide-react";
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
import { experienceLevels, talentCategories } from "../types";
import { Button } from "@/components/ui/button";

interface MCLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    mcType?: string;
    mcLanguages: string[];
    mcExperience?: string;
    mcStyle?: string;
  }) => void;
  initialData?: {
    mcType?: string;
    mcLanguages?: string[];
    mcExperience?: string;
    mcStyle?: string;
  };
}

export default function MCLanguagesModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}: MCLanguagesModalProps) {
  const { colors, isDarkMode } = useThemeColors();
  const [selectedType, setSelectedType] = useState<string>(
    initialData.mcType || "",
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialData.mcLanguages || [],
  );
  const [selectedExperience, setSelectedExperience] = useState<string>(
    initialData.mcExperience || "",
  );
  const [selectedStyle, setSelectedStyle] = useState<string>(
    initialData.mcStyle || "",
  );
  const [languageSearch, setLanguageSearch] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [customType, setCustomType] = useState("");

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    const baseLanguages = talentCategories.mc.languages;
    if (!languageSearch.trim()) return baseLanguages;

    return baseLanguages.filter((lang) =>
      lang.toLowerCase().includes(languageSearch.toLowerCase()),
    );
  }, [languageSearch]);

  // Toggle language selection
  const toggleLanguage = useCallback((language: string) => {
    setSelectedLanguages((prev) => {
      if (language === "Other Language") {
        return prev;
      }

      return prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language];
    });
  }, []);

  // Add custom language
  const addCustomLanguage = useCallback(() => {
    if (
      customLanguage.trim() &&
      !selectedLanguages.includes(customLanguage.trim())
    ) {
      setSelectedLanguages((prev) => [...prev, customLanguage.trim()]);
      setCustomLanguage("");
    }
  }, [customLanguage, selectedLanguages]);

  // Handle custom type
  const handleTypeSelect = useCallback(
    (value: string) => {
      if (value === "Custom MC Type") {
        setCustomType(
          selectedType && !talentCategories.mc.types.includes(selectedType)
            ? selectedType
            : "",
        );
        setSelectedType("Custom MC Type");
      } else {
        setSelectedType(value);
        setCustomType("");
      }
    },
    [selectedType],
  );

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (selectedLanguages.length === 0) {
      return;
    }

    const finalType =
      selectedType === "Custom MC Type" && customType
        ? customType
        : selectedType === "Custom MC Type"
          ? ""
          : selectedType;

    onSubmit({
      mcType: finalType || undefined,
      mcLanguages: selectedLanguages,
      mcExperience: selectedExperience || undefined,
      mcStyle: selectedStyle || undefined,
    });
  }, [
    selectedLanguages,
    selectedType,
    selectedExperience,
    selectedStyle,
    customType,
    onSubmit,
  ]);

  // Remove selected language
  const removeLanguage = useCallback((language: string) => {
    setSelectedLanguages((prev) => prev.filter((l) => l !== language));
  }, []);

  return (
    <BaseTalentModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="MC Details"
      icon={<Mic className="w-5 h-5" />}
      disableSubmit={selectedLanguages.length === 0}
    >
      <div className="space-y-6">
        {/* MC Type */}
        <div>
          <Label className={cn(
            "text-sm font-medium mb-3 block",
            isDarkMode ? "text-gray-200" : "text-gray-900",
          )}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              MC Type (Optional)
            </div>
          </Label>
          <Select value={selectedType} onValueChange={handleTypeSelect}>
            <SelectTrigger className={cn(
              "w-full",
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-200",
            )}>
              <SelectValue placeholder="Select MC type" />
            </SelectTrigger>
            <SelectContent className={cn(
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white",
            )}>
              {talentCategories.mc.types.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className={cn(
                    isDarkMode
                      ? "text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                      : "hover:bg-gray-100",
                  )}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedType === "Custom MC Type" && (
            <div className="mt-3">
              <Input
                placeholder="Enter custom MC type..."
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className={cn(
                  "w-full",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                    : "bg-white border-gray-200",
                )}
              />
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className={cn(
              "text-sm font-medium flex items-center gap-2",
              isDarkMode ? "text-gray-200" : "text-gray-900",
            )}>
              <Globe className="w-4 h-4" />
              Languages Spoken *
            </Label>
            <span className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-500",
            )}>
              {selectedLanguages.length} selected
            </span>
          </div>

          {/* Language Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className={cn(
                "pl-10",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900",
              )}
            />
          </div>

          {/* Language Selection */}
          <ScrollArea className={cn(
            "h-48 rounded-lg p-3 mb-4",
            isDarkMode
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-gray-50 border border-gray-200",
          )}>
            <div className="grid grid-cols-2 gap-2">
              {filteredLanguages.map((language) => {
                const isSelected = selectedLanguages.includes(language);
                const isOther = language === "Other Language";

                return (
                  <Badge
                    key={language}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent"
                        : isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    )}
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </Badge>
                );
              })}
            </div>
          </ScrollArea>

          {/* Selected Languages Preview */}
          {selectedLanguages.length > 0 && (
            <div className="mb-4">
              <Label className={cn(
                "text-sm font-medium mb-2 block",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}>
                Selected Languages
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant="default"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  >
                    {language}
                    <button
                      onClick={() => removeLanguage(language)}
                      className="ml-2 hover:text-white/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Language Input */}
          <div className="mt-4">
            <Label className={cn(
              "text-sm font-medium mb-2 block",
              isDarkMode ? "text-gray-200" : "text-gray-900",
            )}>
              Add Custom Language
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom language..."
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customLanguage.trim()) {
                    addCustomLanguage();
                  }
                }}
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900",
                )}
              />
              <Button
                onClick={addCustomLanguage}
                disabled={!customLanguage.trim()}
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

        {/* Experience Level */}
        <div>
          <Label className={cn(
            "text-sm font-medium mb-3 block",
            isDarkMode ? "text-gray-200" : "text-gray-900",
          )}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Experience Level (Optional)
            </div>
          </Label>
          <Select
            value={selectedExperience}
            onValueChange={setSelectedExperience}
          >
            <SelectTrigger className={cn(
              "w-full",
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-200",
            )}>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className={cn(
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white",
            )}>
              {experienceLevels.map((level) => (
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

        {/* MC Style */}
        <div>
          <Label className={cn(
            "text-sm font-medium mb-3 block",
            isDarkMode ? "text-gray-200" : "text-gray-900",
          )}>
            MC Style (Optional)
          </Label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className={cn(
              "w-full",
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-200",
            )}>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent className={cn(
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white",
            )}>
              {talentCategories.mc.styles.map((style: any) => (
                <SelectItem
                  key={style}
                  value={style}
                  className={cn(
                    isDarkMode
                      ? "text-gray-200 hover:bg-gray-700 focus:bg-gray-700"
                      : "hover:bg-gray-100",
                  )}
                >
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseTalentModal>
  );
}