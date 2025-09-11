"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { AppList, ExternalApp } from "../utils/types";

interface AppsContext {
  readonly apps: AppList | null;
  readonly externalApps: ExternalApp[];
}

const AppsContext = createContext<AppsContext | undefined>(undefined);

interface Props {
  readonly apps: AppList | null;
  readonly externalApps: ExternalApp[];
  readonly children: ReactNode;
}

export const AppsContextProvider = ({
  apps,
  externalApps,
  children,
}: Props) => {
  const value = useMemo(
    () => ({
      apps,
      externalApps,
    }),
    [apps, externalApps],
  );

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useAppsContext() {
  const context = useContext(AppsContext);
  if (!context) throw new Error("[AppsContext] Provider is missing!");
  return context;
}
