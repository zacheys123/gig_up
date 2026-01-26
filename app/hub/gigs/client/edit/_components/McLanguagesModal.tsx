// app/components/talent/MCLanguagesModal.tsx
import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Mic, Globe, Star, User, X } from "lucide-react";
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
      // Show error or handle validation
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
          <Label className={cn("text-sm font-medium mb-3 block", colors.text)}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              MC Type (Optional)
            </div>
          </Label>
          <Select value={selectedType} onValueChange={handleTypeSelect}>
            <SelectTrigger className={cn(colors.border)}>
              <SelectValue placeholder="Select MC type" />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              {talentCategories.mc.types.map((type) => (
                <SelectItem key={type} value={type}>
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
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              />
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label
              className={cn(
                "text-sm font-medium flex items-center gap-2",
                colors.text,
              )}
            >
              <Globe className="w-4 h-4" />
              Languages Spoken *
            </Label>
            <span className="text-xs text-gray-500">
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
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200",
              )}
            />
          </div>

          {/* Language Selection */}
          <ScrollArea className="h-48 border rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2">
              {filteredLanguages.map((language) => {
                const isSelected = selectedLanguages.includes(language);
                const isOther = language === "Other Language";

                return (
                  <div key={language} className="relative">
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full cursor-pointer transition-all text-center",
                        isSelected &&
                          !isOther &&
                          "bg-gradient-to-r from-blue-500 to-cyan-500",
                        isOther &&
                          isSelected &&
                          "bg-gradient-to-r from-purple-500 to-pink-500",
                      )}
                      onClick={() => toggleLanguage(language)}
                    >
                      {language}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Custom Language Input */}
          <div className="mt-4">
            <Label
              className={cn("text-sm font-medium mb-2 block", colors.text)}
            >
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
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              />
              <Button
                onClick={addCustomLanguage}
                disabled={!customLanguage.trim()}
                variant="outline"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Selected Languages Preview */}
          {selectedLanguages.length > 0 && (
            <div className="mt-4">
              <Label
                className={cn("text-sm font-medium mb-2 block", colors.text)}
              >
                Selected Languages
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant="default"
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    {language}
                    <button
                      onClick={() => toggleLanguage(language)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <Label className={cn("text-sm font-medium mb-3 block", colors.text)}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Experience Level (Optional)
            </div>
          </Label>
          <Select
            value={selectedExperience}
            onValueChange={setSelectedExperience}
          >
            <SelectTrigger className={cn(colors.border)}>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* MC Style */}
        <div>
          <Label className={cn("text-sm font-medium mb-3 block", colors.text)}>
            MC Style (Optional)
          </Label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className={cn(colors.border)}>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              {talentCategories.mc.styles.map((style: any) => (
                <SelectItem key={style} value={style}>
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
