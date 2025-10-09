"use client";
import { useState } from "react";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiUserCheck,
  FiMusic,
} from "react-icons/fi";
import { experiences } from "@/data";
import { motion } from "framer-motion";

interface FilterState {
  roleType: string[];
  instrument: string[];
  experience: string[];
  clientOnly: boolean;
  musicianOnly: boolean;
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    roleType: [],
    instrument: [],
    experience: [],
    clientOnly: false,
    musicianOnly: false,
  });

  // Available filter options
  const roleTypes = ["instrumentalist", "vocalist", "dj", "mc"];
  const instruments = [
    "guitar",
    "piano",
    "drums",
    "bass",
    "violin",
    "saxophone",
    "trumpet",
  ];
  const experienceOptions = experiences().filter((exp) => exp.id !== 0);

  const toggleStringFilter = (
    category: "roleType" | "instrument" | "experience",
    value: string
  ) => {
    const newFilters = { ...activeFilters };
    const index = newFilters[category].indexOf(value);

    if (index === -1) {
      newFilters[category].push(value);
    } else {
      newFilters[category].splice(index, 1);
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleBooleanFilter = (
    category: "clientOnly" | "musicianOnly",
    value: boolean
  ) => {
    const newFilters = {
      ...activeFilters,
      [category]: value,
      // Ensure only one of clientOnly/musicianOnly can be true at a time
      ...(category === "clientOnly" && value ? { musicianOnly: false } : {}),
      ...(category === "musicianOnly" && value ? { clientOnly: false } : {}),
    };

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      roleType: [],
      instrument: [],
      experience: [],
      clientOnly: false,
      musicianOnly: false,
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm text-gray-700 hover:text-gray-900 ml-[100px] whitespace-nowrap"
      >
        <FiFilter className="text-gray-600" />
        <span className="font-medium">Filter Users</span>
        {Object.values(activeFilters).filter((v) =>
          Array.isArray(v) ? v.length > 0 : v === true
        ).length > 0 && (
          <span className="text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            {
              Object.values(activeFilters).filter((v) =>
                Array.isArray(v) ? v.length > 0 : v === true
              ).length
            }
          </span>
        )}
        <FiChevronDown
          className={`transition-transform text-gray-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ y: "-500px", opacity: 0 }}
          animate={{ y: ["70px", "50px", "30px", "50px", 0], opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          exit={{
            y: [0, "30px", "50px", "-200px"],
            opacity: 1,
            transition: { duration: 1, delay: 0.78 },
          }}
          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-medium text-gray-800">Filter Options</h3>
            <button
              onClick={clearFilters}
              className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700"
            >
              <FiX size={14} /> Clear all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Musicians Only Toggle */}
            <div className="p-4 border-b border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <FiMusic className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Musicians Only
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={activeFilters.musicianOnly}
                    onChange={() =>
                      toggleBooleanFilter(
                        "musicianOnly",
                        !activeFilters.musicianOnly
                      )
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${
                      activeFilters.musicianOnly ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      activeFilters.musicianOnly
                        ? "transform translate-x-4"
                        : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            {/* Clients Only Toggle */}
            <div className="p-4 border-b border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <FiUserCheck className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Clients Only
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={activeFilters.clientOnly}
                    onChange={() =>
                      toggleBooleanFilter(
                        "clientOnly",
                        !activeFilters.clientOnly
                      )
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${
                      activeFilters.clientOnly ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      activeFilters.clientOnly ? "transform translate-x-4" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            {/* Role Type Filter */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                Role Type
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {roleTypes.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleStringFilter("roleType", role)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      activeFilters.roleType.includes(role)
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "bg-white border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument Filter */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                Instruments
              </h4>
              <div className="flex flex-wrap gap-2">
                {instruments.map((instrument) => (
                  <button
                    key={instrument}
                    onClick={() => toggleStringFilter("instrument", instrument)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      activeFilters.instrument.includes(instrument)
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Filter */}
            <div className="p-4">
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                Experience Level
              </h4>
              <div className="space-y-2">
                {experienceOptions.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => toggleStringFilter("experience", exp.name)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeFilters.experience.includes(exp.name)
                        ? "bg-amber-100 border-amber-200 text-amber-800"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    } border`}
                  >
                    <span>{exp.val}</span>
                    {activeFilters.experience.includes(exp.name) && (
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilters;
