"use client";

import type { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

interface FlowContext {
  roles: Role[];
}

const FlowContext = createContext<FlowContext | undefined>(undefined);

interface Props {
  children: ReactNode;
  roles: Role[];
}

export const FlowProvider = ({ children, roles }: Readonly<Props>) => {
  const [_roles] = useState(roles);

  const value = useMemo(
    () => ({
      roles: _roles,
    }),
    [_roles],
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
