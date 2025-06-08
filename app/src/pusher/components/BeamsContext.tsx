"use client";

import type { User } from "@prisma/client";
import dynamic from "next/dynamic";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const BeamsClient = dynamic(
  () => import("./BeamsClient").then((mod) => mod.BeamsClient),
  {
    ssr: false,
  },
);

interface BeamsContext {
  interests?: string[];
  setInterests: Dispatch<SetStateAction<string[] | undefined>>;
}

const BeamsContext = createContext<BeamsContext | undefined>(undefined);

interface Props {
  readonly children: ReactNode;
  readonly instanceId?: string;
  readonly userId: User["id"];
}

export const BeamsProvider = ({ children, instanceId, userId }: Props) => {
  const [interests, setInterests] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    const _interests = localStorage
      .getItem("notification_interests")
      ?.split(",")
      .filter(Boolean);

    setInterests(_interests ?? []);
  }, []);

  useEffect(() => {
    if (interests === undefined) return;
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
      {instanceId && <BeamsClient instanceId={instanceId} userId={userId} />}
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
