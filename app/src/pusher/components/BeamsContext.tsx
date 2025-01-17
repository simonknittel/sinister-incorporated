"use client";

import dynamic from "next/dynamic";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const Client = dynamic(() => import("./Client").then((mod) => mod.Client), {
  ssr: false,
});

interface BeamsContext {
  interests: string[];
  setInterests: Dispatch<SetStateAction<string[]>>;
}

const BeamsContext = createContext<BeamsContext | undefined>(undefined);

type Props = Readonly<{
  children: ReactNode;
  instanceId?: string;
}>;

export const BeamsProvider = ({ children, instanceId }: Props) => {
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    const _interests = localStorage
      .getItem("notification_interests")
      ?.split(",")
      .filter(Boolean);

    if (_interests) {
      setInterests(_interests);
    }
  }, []);

  useEffect(() => {
    const _interests = interests.join(",");
    localStorage.setItem("notification_interests", _interests);
  }, [interests]);

  const value = useMemo(
    () => ({
      interests,
      setInterests,
    }),
    [interests, setInterests],
  );

  return (
    <BeamsContext.Provider value={value}>
      {children}
      {instanceId && <Client instanceId={instanceId} />}
    </BeamsContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useBeamsContext() {
  const context = useContext(BeamsContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
