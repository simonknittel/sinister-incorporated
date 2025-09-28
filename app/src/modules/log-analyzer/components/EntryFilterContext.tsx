"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { isNpc } from "../utils/isNpc";
import type { IEntry } from "./Entry";

interface EntryFilterContext {
  isHideCorpsesEnabled: boolean;
  setIsHideCorpsesEnabled: (value: boolean) => void;
  isHideNpcsEnabled: boolean;
  setIsHideNpcsEnabled: (value: boolean) => void;
  entryFilterFn: (entry: IEntry) => boolean;
}

const EntryFilterContext = createContext<EntryFilterContext | undefined>(
  undefined,
);

interface ProviderProps {
  readonly children: ReactNode;
}

export const EntryFilterContextProvider = ({ children }: ProviderProps) => {
  const [isHideCorpsesEnabled, setIsHideCorpsesEnabled] = useLocalStorage(
    "is_hide_corpses_enabled",
    false,
  );

  const [isHideNpcsEnabled, setIsHideNpcsEnabled] = useLocalStorage(
    "is_hide_npcs_enabled",
    false,
  );

  const entryFilterFn = useCallback(
    (entry: IEntry) => {
      if (isHideCorpsesEnabled && entry.type === "corpse") return false;

      if (isHideNpcsEnabled && entry.type === "kill" && isNpc(entry.target))
        return false;

      return true;
    },
    [isHideCorpsesEnabled, isHideNpcsEnabled],
  );

  const value = useMemo(
    () => ({
      isHideCorpsesEnabled,
      setIsHideCorpsesEnabled,
      isHideNpcsEnabled,
      setIsHideNpcsEnabled,
      entryFilterFn,
    }),
    [
      isHideCorpsesEnabled,
      setIsHideCorpsesEnabled,
      isHideNpcsEnabled,
      setIsHideNpcsEnabled,
      entryFilterFn,
    ],
  );

  return (
    <EntryFilterContext.Provider value={value}>
      {children}
    </EntryFilterContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useEntryFilterContext() {
  const context = useContext(EntryFilterContext);
  if (!context) throw new Error("Context provider is missing!");
  return context;
}
