// app/components/talent/VocalistGenreModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Music, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface VocalistGenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { vocalistGenre: string[] }) => void;
  initialData?: {
    vocalistGenre?: string[] | string;
  };
}

export default function VocalistGenreModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}: VocalistGenreModalProps) {
  const { isDarkMode } = useThemeColors();

  // Vocalist genres array
  const vocalistGenres = useMemo(
    () => [
      "Pop",
      "R&B",
      "Jazz",
      "Soul",
      "Gospel",
      "Rock",
      "Classical",
      "Opera",
      "Afrobeats",
      "Reggae",
      "mix",
    ],
    [],
  );

  // Initialize state from initialData
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    if (Array.isArray(initialData.vocalistGenre)) {
      return initialData.vocalistGenre;
    } else if (typeof initialData.vocalistGenre === "string") {
      return [initialData.vocalistGenre];
    }
    return [];
  });

  const [selectedSingleGenre, setSelectedSingleGenre] = useState<string>(
    initialData.vocalistGenre && typeof initialData.vocalistGenre === "string"
      ? initialData.vocalistGenre
      : "",
  );

  // Handle single genre selection
  const handleGenreSelect = (genre: string) => {
    setSelectedSingleGenre(genre);
    if (genre && !selectedGenres.includes(genre)) {
      setSelectedGenres([genre]);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedGenres.length === 0 && !selectedSingleGenre) {
      return;
    }

    const genresToSubmit =
      selectedGenres.length > 0
        ? selectedGenres
        : selectedSingleGenre
          ? [selectedSingleGenre]
          : [];

    onSubmit({ vocalistGenre: genresToSubmit });
    onClose();
  };

  // Remove a genre from multi-select
  const removeGenre = (genre: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genre));
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (Array.isArray(initialData.vocalistGenre)) {
        setSelectedGenres(initialData.vocalistGenre);
      } else if (typeof initialData.vocalistGenre === "string") {
        setSelectedGenres([initialData.vocalistGenre]);
        setSelectedSingleGenre(initialData.vocalistGenre);
      } else {
        setSelectedGenres([]);
        setSelectedSingleGenre("");
      }
    }
  }, [isOpen, initialData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-md",
          isDarkMode
            ? "bg-gray-900 border-gray-700 text-gray-200"
            : "bg-white text-gray-900",
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl font-bold flex items-center gap-2",
              isDarkMode ? "text-white" : "text-gray-900",
            )}
          >
            <Music className="w-5 h-5 text-pink-500" />
            Select Vocalist Genre
          </DialogTitle>
          <DialogDescription
            className={cn(isDarkMode ? "text-gray-400" : "text-gray-600")}
          >
            Choose the genre for your vocalist (select one or multiple)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Simple Select Dropdown */}
          <div className="space-y-2">
            <label
              className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              Select Genre
            </label>
            <select
              value={selectedSingleGenre}
              onChange={(e) => handleGenreSelect(e.target.value)}
              className={cn(
                "w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900",
              )}
            >
              <option value="" className={isDarkMode ? "bg-gray-800" : ""}>
                Select a genre
              </option>
              {vocalistGenres.map((genre) => (
                <option
                  key={genre}
                  value={genre.toLowerCase()}
                  className={isDarkMode ? "bg-gray-800" : ""}
                >
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* OR Multi-select option */}
          <div className="space-y-2">
            <label
              className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              Or select multiple genres:
            </label>
            <div
              className={cn(
                "flex flex-wrap gap-2 p-3 rounded-lg min-h-[60px]",
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-gray-50 border border-gray-200",
              )}
            >
              {selectedGenres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className={cn(
                    isDarkMode
                      ? "bg-pink-900/30 text-pink-300 border-pink-800 hover:bg-pink-800/40"
                      : "bg-pink-100 text-pink-700 hover:bg-pink-200",
                  )}
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="ml-1 hover:text-pink-900 dark:hover:text-pink-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedGenres.length === 0 && (
                <span
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  No genres selected yet
                </span>
              )}
            </div>
          </div>

          {/* Genre buttons for quick selection */}
          <div className="space-y-2">
            <label
              className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-gray-200" : "text-gray-900",
              )}
            >
              Quick Select:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {vocalistGenres.slice(0, 8).map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    if (selectedGenres.includes(genre)) {
                      removeGenre(genre);
                    } else {
                      setSelectedGenres((prev) => [...prev, genre]);
                      setSelectedSingleGenre(genre);
                    }
                  }}
                  className={cn(
                    "p-2 rounded border text-sm transition-all text-left",
                    selectedGenres.includes(genre) ||
                      selectedSingleGenre === genre
                      ? cn(
                          "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-300",
                          "transform scale-105",
                        )
                      : cn(
                          isDarkMode
                            ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50",
                        ),
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{genre}</span>
                    {(selectedGenres.includes(genre) ||
                      selectedSingleGenre === genre) && (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className={cn(
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800 text-gray-200"
                : "",
            )}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedGenres.length === 0 && !selectedSingleGenre}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            Save Genres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
