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
  // Vocalist genres array (same as in ActionPage)
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

  // Handle single genre selection (like ActionPage)
  const handleGenreSelect = (genre: string) => {
    setSelectedSingleGenre(genre);
    if (genre && !selectedGenres.includes(genre)) {
      setSelectedGenres([genre]);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedGenres.length === 0 && !selectedSingleGenre) {
      return; // Don't submit if no genres selected
    }

    // Use the selected genres or the single selected genre
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-500" />
            Select Vocalist Genre
          </DialogTitle>
          <DialogDescription>
            Choose the genre for your vocalist (select one or multiple)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Simple Select Dropdown (like ActionPage) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Genre</label>
            <select
              value={selectedSingleGenre}
              onChange={(e) => handleGenreSelect(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Select a genre</option>
              {vocalistGenres.map((genre) => (
                <option key={genre} value={genre.toLowerCase()}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* OR Multi-select option */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Or select multiple genres:
            </label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
              {selectedGenres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-pink-100 text-pink-700 hover:bg-pink-200"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="ml-1 hover:text-pink-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedGenres.length === 0 && (
                <span className="text-gray-500 text-sm">
                  No genres selected yet
                </span>
              )}
            </div>
          </div>

          {/* Genre buttons for quick selection (like ActionPage) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Select:</label>
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
                    "p-2 rounded border text-sm transition-colors text-left",
                    selectedGenres.includes(genre) ||
                      selectedSingleGenre === genre
                      ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:border-pink-700"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedGenres.length === 0 && !selectedSingleGenre}
            className="bg-pink-500 hover:bg-pink-600"
          >
            Save Genres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
