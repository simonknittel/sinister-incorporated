"use client";

import type { EventPosition } from "@prisma/client";
import { useLocalStorage } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useMemo,
} from "react";

interface LineupContext {
  openPositions: EventPosition["id"][];
  open: (positionIds: EventPosition["id"]) => void;
  close: (positionId: EventPosition["id"]) => void;
  closeAll: () => void;
  openAll: () => void;
}

const FlowContext = createContext<LineupContext | undefined>(undefined);

type Props = Readonly<{
  children: ReactNode;
  positions: EventPosition[];
}>;

export const LineupProvider = ({ children, positions }: Props) => {
  const [openPositions, setOpenPositions] = useLocalStorage<
    EventPosition["id"][]
  >(`open_positions`, []);

  const open = useCallback(
    (positionId: EventPosition["id"]) => {
      setOpenPositions((prev) => [...prev, positionId]);
    },
    [setOpenPositions],
  );

  const openAll = useCallback(() => {
    startTransition(() => {
      setOpenPositions(positions.map((position) => position.id));
    });
  }, [setOpenPositions, positions]);

  const close = useCallback(
    (positionId: EventPosition["id"]) => {
      setOpenPositions((prev) => prev.filter((id) => id !== positionId));
    },
    [setOpenPositions],
  );

  const closeAll = useCallback(() => {
    startTransition(() => {
      setOpenPositions([]);
    });
  }, [setOpenPositions]);

  const value = useMemo(
    () => ({
      openPositions,
      open,
      openAll,
      close,
      closeAll,
    }),
    [openPositions, open, openAll, close, closeAll],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useLineup() {
  const context = useContext(FlowContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
