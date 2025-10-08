"use client";
import React, { useCallback } from "react";
import { debounce } from "lodash";
import { searchFunc } from "@/utils";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useUserStore } from "@/app/stores";

const SearchInput = () => {
  const { searchQuery, setSearchQuery } = useUserStore();
  const { users } = useAllUsers();

  const handleInputChange = useCallback(
    debounce((value: string) => setSearchQuery(value), 100),
    []
  );

  return (
    <input
      autoComplete="off"
      onChange={(ev) => handleInputChange(ev.target.value)}
      value={searchQuery}
      className="w-full bg-transparent text-orange-200 px-3 placeholder-gray-500 focus:outline-none text-sm md:text-base font-medium tracking-wide"
      id="search"
      type="text"
      data-autofocus
      placeholder="Find anyone/username/instrument..."
      required
      onKeyDown={() => searchFunc(users || [], searchQuery)}
    />
  );
};

export default SearchInput; // Fixed: Using default export
