"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Box, CircularProgress, Divider } from "@mui/material";
import {
  BsCameraFill,
  BsPaletteFill,
  BsFonts,
  BsFillBrushFill,
} from "react-icons/bs";
import { TbColorFilter, TbPaletteOff } from "react-icons/tb";
import { MdColorLens, MdFormatColorText, MdPalette } from "react-icons/md";

import altlogo from "../../../../../public/assets/png/logo-no-background.png";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { CustomProps } from "@/types/gig";
import {
  colors,
  fonts,
  colorPalettes,
  fontCategories,
  getContrastColor,
} from "@/lib/gigColors";

interface GigCustomizationProps {
  customization: CustomProps;
  setCustomization: React.Dispatch<React.SetStateAction<CustomProps>>;
  closeModal: () => void;
  logo: string;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const GigCustomization: React.FC<GigCustomizationProps> = ({
  customization,
  setCustomization,
  closeModal,
  logo,
  handleFileChange,
  isUploading,
}) => {
  const { colors: themeColors } = useThemeColors();
  const [activeTab, setActiveTab] = useState<"colors" | "fonts" | "preview">(
    "colors",
  );
  const [activePalette, setActivePalette] = useState<
    "vibrant" | "professional" | "pastel" | "dark" | "earthy" | "monochrome"
  >("vibrant");

  const handleReset = () => {
    setCustomization({
      font: "",
      fontColor: "",
      backgroundColor: "",
    });
  };

  const getFontPreviewStyle = (fontName: string) => {
    return {
      fontFamily: fontName,
      fontSize: "14px",
    };
  };

  return (
    <div className="fixed inset-0 flex items-center z-50 justify-center bg-black/70 backdrop-blur-lg animate-fadeIn">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Modal */}
      <div
        className={cn(
          "relative p-0 rounded-3xl shadow-2xl w-[95vw] max-w-4xl max-h-[95vh] border transition-all animate-slideUp overflow-hidden",
          themeColors.background,
          themeColors.border,
        )}
      >
        {/* Header with Tabs */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={cn("text-2xl font-bold", themeColors.text)}>
                Gig Card Designer
              </h2>
              <p className={cn("text-sm mt-1", themeColors.textMuted)}>
                Customize your gig card appearance
              </p>
            </div>
            <button
              onClick={closeModal}
              className={cn(
                "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110",
                themeColors.textMuted,
              )}
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("colors")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                activeTab === "colors"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : cn(
                      "hover:bg-gray-200 dark:hover:bg-gray-700",
                      themeColors.text,
                    ),
              )}
            >
              <MdColorLens className="w-4 h-4" />
              <span>Colors</span>
            </button>
            <button
              onClick={() => setActiveTab("fonts")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                activeTab === "fonts"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : cn(
                      "hover:bg-gray-200 dark:hover:bg-gray-700",
                      themeColors.text,
                    ),
              )}
            >
              <BsFonts className="w-4 h-4" />
              <span>Fonts</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                activeTab === "preview"
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                  : cn(
                      "hover:bg-gray-200 dark:hover:bg-gray-700",
                      themeColors.text,
                    ),
              )}
            >
              <BsFillBrushFill className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          {activeTab === "colors" && (
            <div className="space-y-6">
              {/* Color Palette Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label
                    className={cn(
                      "block text-sm font-semibold",
                      themeColors.text,
                    )}
                  >
                    Color Palettes
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <TbPaletteOff className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {Object.entries(colorPalettes).map(([key, palette]) => (
                    <button
                      key={key}
                      onClick={() => setActivePalette(key as any)}
                      className={cn(
                        "p-3 rounded-xl border transition-all hover:scale-[1.02]",
                        activePalette === key
                          ? "ring-2 ring-orange-500 ring-offset-2"
                          : cn("hover:shadow-lg", themeColors.border),
                      )}
                    >
                      <div className="flex gap-1 mb-2">
                        {palette.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium capitalize",
                          themeColors.text,
                        )}
                      >
                        {key}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Palette Colors */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-semibold mb-3",
                      themeColors.text,
                    )}
                  >
                    Font Color
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
                    {colorPalettes[activePalette].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            fontColor: color,
                          }))
                        }
                        className="group relative"
                        title={color}
                      >
                        <div
                          className={`w-10 h-10 rounded-full transition-all border-2 shadow-lg hover:scale-110 group-hover:ring-2 group-hover:ring-white/50 ${
                            customization.fontColor === color
                              ? "border-white dark:border-gray-900 ring-4 ring-orange-500"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                        <div
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
                          style={{ backgroundColor: getContrastColor(color) }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    className={cn(
                      "block text-sm font-semibold mb-3",
                      themeColors.text,
                    )}
                  >
                    Background Color
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
                    {colorPalettes[activePalette].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            backgroundColor: color,
                          }))
                        }
                        className="group relative"
                        title={color}
                      >
                        <div
                          className={`w-10 h-10 rounded-full transition-all border-2 shadow-lg hover:scale-110 group-hover:ring-2 group-hover:ring-white/50 ${
                            customization.backgroundColor === color
                              ? "border-white dark:border-gray-900 ring-4 ring-green-500"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                        <div
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
                          style={{ backgroundColor: getContrastColor(color) }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Selection Preview */}
              {(customization.fontColor || customization.backgroundColor) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border">
                  <h4
                    className={cn(
                      "text-sm font-semibold mb-2",
                      themeColors.text,
                    )}
                  >
                    Current Selection
                  </h4>
                  <div className="flex items-center gap-4">
                    {customization.fontColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: customization.fontColor }}
                        />
                        <span className={cn("text-xs", themeColors.text)}>
                          Font: {customization.fontColor}
                        </span>
                      </div>
                    )}
                    {customization.backgroundColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: customization.backgroundColor,
                          }}
                        />
                        <span className={cn("text-xs", themeColors.text)}>
                          Background: {customization.backgroundColor}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "fonts" && (
            <div className="space-y-6">
              {/* Font Category Selection */}
              <div>
                <label
                  className={cn(
                    "block text-sm font-semibold mb-4",
                    themeColors.text,
                  )}
                >
                  Font Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {Object.entries(fontCategories).map(
                    ([category, fontList]) => (
                      <button
                        key={category}
                        onClick={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            font: fontList[0],
                          }))
                        }
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all hover:scale-[1.02]",
                          themeColors.border,
                          themeColors.hoverBg,
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-xs font-medium uppercase tracking-wider",
                              themeColors.textMuted,
                            )}
                          >
                            {category}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                            {fontList.length}
                          </span>
                        </div>
                        <p
                          className="text-lg font-semibold truncate"
                          style={getFontPreviewStyle(fontList[0])}
                        >
                          {fontList[0]}
                        </p>
                      </button>
                    ),
                  )}
                </div>

                {/* Font Selection */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-semibold mb-3",
                      themeColors.text,
                    )}
                  >
                    Select Font
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        onClick={() =>
                          setCustomization((prev) => ({ ...prev, font }))
                        }
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all hover:shadow-md",
                          customization.font === font
                            ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : cn(
                                "hover:bg-gray-50 dark:hover:bg-gray-800",
                                themeColors.border,
                              ),
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-medium"
                            style={getFontPreviewStyle(font)}
                          >
                            {font}
                          </span>
                          {customization.font === font && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p
                          className={cn("text-sm mt-1", themeColors.textMuted)}
                          style={getFontPreviewStyle(font)}
                        >
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label
                  className={cn(
                    "block text-sm font-semibold mb-3",
                    themeColors.text,
                  )}
                >
                  Upload Logo
                </label>
                <div className="space-y-4">
                  <label
                    htmlFor="logo"
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-900/10",
                      themeColors.border,
                      themeColors.hoverBg,
                    )}
                  >
                    {isUploading ? (
                      <>
                        <CircularProgress
                          size={32}
                          style={{ color: themeColors.primary }}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            themeColors.text,
                          )}
                        >
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                          <BsCameraFill className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-center">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              themeColors.text,
                            )}
                          >
                            Click to upload logo
                          </span>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              themeColors.textMuted,
                            )}
                          >
                            PNG, JPG, SVG up to 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="logo"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isUploading}
                  />

                  {logo && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                          <img
                            src={logo}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              themeColors.text,
                            )}
                          >
                            Logo uploaded successfully
                          </span>
                          <p className={cn("text-xs", themeColors.textMuted)}>
                            Click the image to change
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleFileChange({ target: { files: null } } as any)
                        }
                        className="px-3 py-1 text-sm rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn("text-lg font-bold", themeColors.text)}>
                    Live Preview
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        themeColors.textMuted,
                        themeColors.border,
                      )}
                    >
                      Real-time
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Preview Card */}
                  <div
                    className="p-8 rounded-2xl border-2 shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-3xl"
                    style={{
                      backgroundColor:
                        customization.backgroundColor || themeColors.background,
                      borderColor: customization.fontColor
                        ? `${customization.fontColor}30`
                        : themeColors.border,
                    }}
                  >
                    <Box className="space-y-6">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <h4
                            className="text-2xl font-bold leading-tight"
                            style={{
                              color:
                                customization.fontColor || themeColors.text,
                              fontFamily: customization.font,
                            }}
                          >
                            Summer Music Festival
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className="text-sm px-3 py-1.5 rounded-full font-medium"
                              style={{
                                backgroundColor: customization.fontColor
                                  ? `${customization.fontColor}15`
                                  : themeColors.backgroundMuted,
                                color:
                                  customization.fontColor || themeColors.text,
                                fontFamily: customization.font,
                              }}
                            >
                              🎵 Live Band
                            </span>
                            <span
                              className="text-sm px-3 py-1.5 rounded-full font-medium"
                              style={{
                                backgroundColor: customization.fontColor
                                  ? `${customization.fontColor}15`
                                  : themeColors.backgroundMuted,
                                color:
                                  customization.fontColor || themeColors.text,
                                fontFamily: customization.font,
                              }}
                            >
                              🎤 5 Slots
                            </span>
                          </div>
                        </div>
                        {logo && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                            <img
                              src={logo}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <Divider className="opacity-20" />

                      {/* Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                            <span className="text-white">📍</span>
                          </div>
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{
                                color:
                                  customization.fontColor || themeColors.text,
                                fontFamily: customization.font,
                              }}
                            >
                              Nairobi, Kenya
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: customization.fontColor
                                  ? `${customization.fontColor}80`
                                  : themeColors.textMuted,
                                fontFamily: customization.font,
                              }}
                            >
                              15 Dec 2024 • 7:00 PM - 11:00 PM
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white">💰</span>
                          </div>
                          <div>
                            <p
                              className="text-xl font-bold"
                              style={{
                                color:
                                  customization.fontColor || themeColors.text,
                                fontFamily: customization.font,
                              }}
                            >
                              $2,500
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: customization.fontColor
                                  ? `${customization.fontColor}80`
                                  : themeColors.textMuted,
                                fontFamily: customization.font,
                              }}
                            >
                              Per performance • Negotiable
                            </p>
                          </div>
                        </div>
                      </div>

                      <Divider className="opacity-20" />

                      {/* Footer */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                            <img
                              src={
                                typeof altlogo === "string"
                                  ? altlogo
                                  : altlogo.src
                              }
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{
                                color:
                                  customization.fontColor || themeColors.text,
                                fontFamily: customization.font,
                              }}
                            >
                              Music Events Ltd
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: customization.fontColor
                                  ? `${customization.fontColor}80`
                                  : themeColors.textMuted,
                                fontFamily: customization.font,
                              }}
                            >
                              4.8 ★ • 120 bookings
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={cn(
                            "px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all",
                            customization.fontColor
                              ? `text-white border-0`
                              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white",
                          )}
                          style={{
                            backgroundColor:
                              customization.fontColor || undefined,
                            fontFamily: customization.font,
                          }}
                        >
                          Book Now
                        </Button>
                      </div>
                    </Box>
                  </div>

                  {/* Customization Summary */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border">
                      <h4
                        className={cn(
                          "text-lg font-bold mb-4",
                          themeColors.text,
                        )}
                      >
                        Design Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <MdFormatColorText className="w-5 h-5 text-blue-500" />
                            <span className={cn("text-sm", themeColors.text)}>
                              Font Color
                            </span>
                          </div>
                          {customization.fontColor ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border"
                                style={{
                                  backgroundColor: customization.fontColor,
                                }}
                              />
                              <span
                                className={cn(
                                  "text-sm font-mono",
                                  themeColors.text,
                                )}
                              >
                                {customization.fontColor}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={cn("text-sm", themeColors.textMuted)}
                            >
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <MdPalette className="w-5 h-5 text-green-500" />
                            <span className={cn("text-sm", themeColors.text)}>
                              Background
                            </span>
                          </div>
                          {customization.backgroundColor ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border"
                                style={{
                                  backgroundColor:
                                    customization.backgroundColor,
                                }}
                              />
                              <span
                                className={cn(
                                  "text-sm font-mono",
                                  themeColors.text,
                                )}
                              >
                                {customization.backgroundColor}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={cn("text-sm", themeColors.textMuted)}
                            >
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <BsFonts className="w-5 h-5 text-purple-500" />
                            <span className={cn("text-sm", themeColors.text)}>
                              Font Family
                            </span>
                          </div>
                          {customization.font ? (
                            <span
                              className="text-sm font-medium"
                              style={{ fontFamily: customization.font }}
                            >
                              {customization.font}
                            </span>
                          ) : (
                            <span
                              className={cn("text-sm", themeColors.textMuted)}
                            >
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <BsCameraFill className="w-5 h-5 text-orange-500" />
                            <span className={cn("text-sm", themeColors.text)}>
                              Logo
                            </span>
                          </div>
                          {logo ? (
                            <span
                              className={cn(
                                "text-sm text-green-600 dark:text-green-400",
                              )}
                            >
                              ✓ Uploaded
                            </span>
                          ) : (
                            <span
                              className={cn("text-sm", themeColors.textMuted)}
                            >
                              No logo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contrast Warning */}
                    {customization.fontColor &&
                      customization.backgroundColor && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm">!</span>
                            </div>
                            <div>
                              <h5
                                className={cn(
                                  "text-sm font-semibold mb-1",
                                  themeColors.text,
                                )}
                              >
                                Contrast Check
                              </h5>
                              <p
                                className={cn("text-xs", themeColors.textMuted)}
                              >
                                Ensure text is readable against the background
                                for better accessibility.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              className={cn(
                "border-amber-500 text-amber-600 hover:bg-amber-50",
                themeColors.border,
              )}
            >
              Reset All
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeModal}
                className={cn("px-6", themeColors.border, themeColors.hoverBg)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Apply customization
                  closeModal();
                }}
                className={cn(
                  "px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                  "text-white font-semibold shadow-lg hover:shadow-xl transition-all",
                )}
              >
                Apply Design
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCustomization;
