"use client";

import type { Role, Upload } from "@prisma/client";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

interface FlowContext {
  roles: (Role & {
    icon: Upload | null;
    thumbnail: Upload | null;
  })[];
  isUpdating: boolean;
}

const FlowContext = createContext<FlowContext | undefined>(undefined);

type Props = Readonly<{
  children: ReactNode;
  roles: (Role & {
    icon: Upload | null;
    thumbnail: Upload | null;
  })[];
  isUpdating: boolean;
}>;

export const FlowProvider = ({ children, roles, isUpdating }: Props) => {
  const value = useMemo(
    () => ({
      roles,
      isUpdating,
    }),
    [roles, isUpdating],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useFlowContext() {
  const context = useContext(FlowContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
