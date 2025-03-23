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

interface LineupVisibilityContext {
  openPositions: EventPosition["id"][];
  open: (positionIds: EventPosition["id"]) => void;
  close: (positionId: EventPosition["id"]) => void;
  closeAll: () => void;
  openAll: () => void;
}

const LineupVisibilityContext = createContext<
  LineupVisibilityContext | undefined
>(undefined);

type Props = Readonly<{
  children: ReactNode;
  positions: (EventPosition & {
    childPositions?: (EventPosition & {
      childPositions?: (EventPosition & {
        childPositions?: EventPosition[];
      })[];
    })[];
  })[];
}>;

export const LineupVisibilityProvider = ({ children, positions }: Props) => {
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
    const allPositionIds: EventPosition["id"][] = [];

    for (const position of positions) {
      allPositionIds.push(position.id);

      if (position.childPositions) {
        for (const childPosition of position.childPositions) {
          allPositionIds.push(childPosition.id);

          if (childPosition.childPositions) {
            for (const grandChildPosition of childPosition.childPositions) {
              allPositionIds.push(grandChildPosition.id);

              if (grandChildPosition.childPositions) {
                for (const greatGrandChildPosition of grandChildPosition.childPositions) {
                  allPositionIds.push(greatGrandChildPosition.id);
                }
              }
            }
          }
        }
      }
    }

    startTransition(() => {
      setOpenPositions(allPositionIds);
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

  return (
    <LineupVisibilityContext.Provider value={value}>
      {children}
    </LineupVisibilityContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useLineupVisibility() {
  const context = useContext(LineupVisibilityContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
