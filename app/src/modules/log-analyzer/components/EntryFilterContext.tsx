"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { isNpc } from "../utils/isNpc";
import { EntryType, type IEntry } from "./Entry";

export enum EntryFilterKey {
  HideCorpses = "hideCorpses",
  HidePlayerKills = "hidePlayerKills",
  HideNpcKills = "hideNpcKills",
  HideJoinPu = "hideJoinPu",
}

interface EntryFilterContext {
  readonly entryFilters: Record<EntryFilterKey, boolean>;
  readonly setEntryFilters: (
    key: keyof EntryFilterContext["entryFilters"],
    value: boolean,
  ) => void;
  readonly entryFilterFn: (entry: IEntry) => boolean;
}

const EntryFilterContext = createContext<EntryFilterContext | undefined>(
  undefined,
);

interface ProviderProps {
  readonly children: ReactNode;
}

export const EntryFilterContextProvider = ({ children }: ProviderProps) => {
  const [entryFilters, _setEntryFilters] = useLocalStorage("entry_filters", {
    [EntryFilterKey.HideCorpses]: false,
    [EntryFilterKey.HidePlayerKills]: false,
    [EntryFilterKey.HideNpcKills]: false,
    [EntryFilterKey.HideJoinPu]: false,
  });

  const setEntryFilters = useCallback(
    (key: keyof typeof entryFilters, value: boolean) => {
      _setEntryFilters((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    [_setEntryFilters],
  );

  const entryFilterFn = useCallback(
    (entry: IEntry) => {
      if (
        entryFilters[EntryFilterKey.HideCorpses] &&
        entry.type === EntryType.Corpse
      )
        return false;

      if (
        entryFilters[EntryFilterKey.HidePlayerKills] &&
        entry.type === EntryType.Kill &&
        !isNpc(entry.target)
      )
        return false;

      if (
        entryFilters[EntryFilterKey.HideNpcKills] &&
        entry.type === EntryType.Kill &&
        isNpc(entry.target)
      )
        return false;

      if (
        entryFilters[EntryFilterKey.HideJoinPu] &&
        entry.type === EntryType.JoinPu
      )
        return false;

      return true;
    },
    [entryFilters],
  );

  const value = useMemo(
    () => ({
      entryFilters,
      setEntryFilters,
      entryFilterFn,
    }),
    [entryFilters, setEntryFilters, entryFilterFn],
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
