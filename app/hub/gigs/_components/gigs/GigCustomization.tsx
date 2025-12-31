"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Box, CircularProgress, Divider } from "@mui/material";
import { BsCameraFill } from "react-icons/bs";
import { colors, fonts } from "@/utils";
import altlogo from "../../../../../public/assets/png/logo-no-background.png";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface CustomizationProps {
  fontColor: string;
  font: string;
  backgroundColor: string;
}

interface GigCustomizationProps {
  customization: CustomizationProps;
  setCustomization: React.Dispatch<React.SetStateAction<CustomizationProps>>;
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

  return (
    <div className="fixed inset-0 flex items-center z-50 justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Modal */}
      <div
        className={cn(
          "relative p-6 rounded-2xl shadow-2xl w-[90vw] max-w-md max-h-[90vh] border transition-all animate-slideUp overflow-hidden",
          themeColors.background,
          themeColors.border
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={cn("text-xl font-bold", themeColors.text)}>
            Customize Gig Card
          </h2>
          <button
            onClick={closeModal}
            className={cn(
              "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              themeColors.textMuted
            )}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {/* Font Selection */}
          <div>
            <label
              className={cn("block text-sm font-medium mb-2", themeColors.text)}
            >
              Font
            </label>
            <select
              value={customization.font}
              onChange={(e) =>
                setCustomization((prev) => ({ ...prev, font: e.target.value }))
              }
              className={cn(
                "w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all",
                themeColors.border,
                themeColors.background,
                themeColors.text
              )}
            >
              {fonts.map((font) => (
                <option
                  key={font}
                  value={font}
                  className="text-black dark:text-white"
                >
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Color Selection */}
          <div>
            <label
              className={cn("block text-sm font-medium mb-3", themeColors.text)}
            >
              Font Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.slice(0, 12).map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setCustomization((prev) => ({ ...prev, fontColor: color }))
                  }
                  className={`w-8 h-8 rounded-full transition-all border-2 shadow-md hover:scale-110 ${
                    customization.fontColor === color
                      ? "border-white dark:border-gray-900 ring-2 ring-orange-500"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Background Color Selection */}
          <div>
            <label
              className={cn("block text-sm font-medium mb-3", themeColors.text)}
            >
              Background Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.slice(12, 24).map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setCustomization((prev) => ({
                      ...prev,
                      backgroundColor: color,
                    }))
                  }
                  className={`w-8 h-8 rounded-full transition-all border-2 shadow-md hover:scale-110 ${
                    customization.backgroundColor === color
                      ? "border-white dark:border-gray-900 ring-2 ring-orange-500"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label
              className={cn("block text-sm font-medium mb-2", themeColors.text)}
            >
              Upload Logo
            </label>
            <div className="space-y-3">
              <label
                htmlFor="logo"
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-orange-500",
                  themeColors.border,
                  themeColors.hoverBg
                )}
              >
                {isUploading ? (
                  <>
                    <CircularProgress
                      size={20}
                      style={{ color: themeColors.primary }}
                    />
                    <span className={cn("text-sm", themeColors.text)}>
                      Uploading...
                    </span>
                  </>
                ) : (
                  <>
                    <BsCameraFill
                      className={cn("w-5 h-5", themeColors.textMuted)}
                    />
                    <span className={cn("text-sm", themeColors.text)}>
                      Click to upload logo
                    </span>
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border">
                    <img
                      src={logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={cn("text-sm", themeColors.textMuted)}>
                    Logo uploaded
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h3 className={cn("text-sm font-medium mb-3", themeColors.text)}>
              Live Preview
            </h3>
            <div
              className="p-6 rounded-xl border shadow-lg transition-all duration-300"
              style={{
                backgroundColor:
                  customization.backgroundColor || themeColors.background,
                borderColor: themeColors.border,
              }}
            >
              {!customization.fontColor &&
              !customization.font &&
              !customization.backgroundColor &&
              !logo ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                    <span className="text-white text-2xl">🎵</span>
                  </div>
                  <p className={cn("text-sm", themeColors.textMuted)}>
                    Customize above to see preview
                  </p>
                </div>
              ) : (
                <Box className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <h4
                        className="font-semibold"
                        style={{
                          color: customization.fontColor || themeColors.text,
                          fontFamily: customization.font,
                        }}
                      >
                        Awesome Gig Title
                      </h4>
                      <p
                        className="text-sm"
                        style={{
                          color:
                            customization.fontColor || themeColors.textMuted,
                          fontFamily: customization.font,
                        }}
                      >
                        Nairobi • 3 Dec 2024 • 7:00 PM
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={cn(
                        "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                        "text-white font-medium"
                      )}
                    >
                      Book Now
                    </Button>
                  </div>

                  <Divider className={themeColors.border} />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("text-sm font-medium", themeColors.text)}
                      >
                        KSh 15,000
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          themeColors.successBg,
                          themeColors.successText
                        )}
                      >
                        Available
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2">
                      <img
                        src={
                          logo ||
                          (typeof altlogo === "string" ? altlogo : altlogo.src)
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Box>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className={cn("flex-1", themeColors.border, themeColors.hoverBg)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Apply customization
                closeModal();
              }}
              className={cn(
                "flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                "text-white font-medium"
              )}
            >
              Apply Design
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCustomization;
