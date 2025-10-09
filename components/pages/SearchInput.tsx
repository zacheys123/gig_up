"use client";
import React, { useCallback } from "react";
import { debounce } from "lodash";
import { searchFunc } from "@/utils";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useUserStore } from "@/app/stores";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const SearchInput = () => {
  const { searchQuery, setSearchQuery } = useUserStore();
  const { users } = useAllUsers();
  const { colors } = useThemeColors();

  const handleInputChange = useCallback(
    debounce((value: string) => setSearchQuery(value), 100),
    []
  );

  return (
    <input
      autoComplete="off"
      onChange={(ev) => handleInputChange(ev.target.value)}
      value={searchQuery}
      className={cn(
        "w-full bg-transparent px-3 placeholder-gray-500 focus:outline-none",
        "text-sm md:text-base font-medium tracking-wide",
        colors.text
      )}
      id="search"
      type="text"
      data-autofocus
      placeholder="Find anyone/username/instrument..."
      required
      onKeyDown={() => searchFunc(users || [], searchQuery)}
    />
  );
};

export default SearchInput;
