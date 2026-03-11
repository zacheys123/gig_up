// components/SimpleSkillsInput.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleSkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  maxSkills?: number;
  className?: string;
  disabled?: boolean;
}

export const SimpleSkillsInput: React.FC<SimpleSkillsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Add a skill...",
  label = "Skills",
  error,
  maxSkills = 10,
  className,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxSkills) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label with counter */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-400" />
          {label}
        </label>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          value.length >= maxSkills 
            ? "bg-red-500/20 text-red-400"
            : "bg-gray-800 text-gray-400"
        )}>
          {value.length}/{maxSkills}
        </span>
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || value.length >= maxSkills}
          className={cn(
            "flex-1 px-4 py-2.5 bg-gray-800/50 border rounded-lg",
            "text-white placeholder:text-gray-600 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            error ? "border-red-500/50" : "border-gray-700",
            (disabled || value.length >= maxSkills) && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          onClick={addSkill}
          disabled={!inputValue.trim() || value.length >= maxSkills || disabled}
          className={cn(
            "px-4 py-2.5 rounded-lg transition-all",
            "bg-blue-500 text-white hover:bg-blue-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Skills tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <AnimatePresence mode="popLayout">
            {value.map((skill) => (
              <motion.div
                key={skill}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="group relative"
              >
                <span className="px-3 py-1.5 pr-8 rounded-full text-sm bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  {skill}
                </span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  disabled={disabled}
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1 mt-2"
        >
          <X className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
};