"use client";

import { updateEventLineupOrder } from "@/events/actions/updateEventLineupOrder";
import type {
  Entity,
  Manufacturer,
  Series,
  Ship,
  Variant,
} from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import type { MouseEvent } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import toast from "react-hot-toast";
import { Position, type PositionType } from "../Position";

interface LineupOrderContext {
  positions: PositionType[];
  handleDragStart: (
    e: MouseEvent<HTMLButtonElement>,
    position: PositionType,
  ) => void;
  handleDragEnd: (
    e: MouseEvent<HTMLDivElement>,
    targetPosition: PositionType,
    order: "before" | "after" | "inside",
  ) => void;
  isDragging: PositionType | null;
}

const LineupOrderContext = createContext<LineupOrderContext | undefined>(
  undefined,
);

type Props = Readonly<{
  className?: string;
  positions: PositionType[];
  showManage?: boolean;
  variants: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
  myShips: Ship[];
  allEventCitizens: { citizen: Entity; ships: Ship[] }[];
  showActions?: boolean;
  showToggle?: boolean;
}>;

export const LineupOrderProvider = ({
  className,
  positions,
  showManage,
  variants,
  myShips,
  allEventCitizens,
  showActions,
  showToggle,
}: Props) => {
  const [isDragging, setIsDragging] = useState<PositionType | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleDragStart = useCallback(
    (e: MouseEvent<HTMLButtonElement>, position: PositionType) => {
      setIsDragging(position);
      document.addEventListener("mouseup", handleCancel, {
        once: true,
      });
    },
    [handleCancel],
  );

  const handleDragEnd = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      targetPosition: PositionType,
      order: "before" | "after" | "inside",
    ) => {
      startTransition(async () => {
        document.removeEventListener("mouseup", handleCancel);
        setIsDragging(null);

        if (!isDragging) return;
        if (targetPosition.id === isDragging.id) return;

        const clonedDraggedPosition = structuredClone(isDragging);
        const clonedPositions = structuredClone(positions);

        // Remove dragged position from old order
        outerLoop: for (const [index, position] of clonedPositions.entries()) {
          if (position.id === clonedDraggedPosition.id) {
            clonedPositions.splice(index, 1);
            break outerLoop;
          }

          if (position.childPositions) {
            for (const [
              index,
              childPosition,
            ] of position.childPositions.entries()) {
              if (childPosition.id === clonedDraggedPosition.id) {
                position.childPositions.splice(index, 1);
                break outerLoop;
              }

              if (childPosition.childPositions) {
                for (const [
                  index,
                  grandChildPosition,
                ] of childPosition.childPositions.entries()) {
                  if (grandChildPosition.id === clonedDraggedPosition.id) {
                    childPosition.childPositions.splice(index, 1);
                    break outerLoop;
                  }

                  if (grandChildPosition.childPositions) {
                    for (const [
                      index,
                      grandGrandChildPosition,
                    ] of grandChildPosition.childPositions.entries()) {
                      if (
                        grandGrandChildPosition.id === clonedDraggedPosition.id
                      ) {
                        grandChildPosition.childPositions.splice(index, 1);
                        break outerLoop;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Insert dragged position into new order
        if (order === "before") {
          outerLoop: for (const [
            index,
            position,
          ] of clonedPositions.entries()) {
            if (position.id === targetPosition.id) {
              clonedPositions.splice(index, 0, clonedDraggedPosition);
              clonedPositions.forEach(
                (position, index) => (position.order = index),
              );
              break outerLoop;
            }

            if (position.childPositions) {
              for (const [
                index,
                childPosition,
              ] of position.childPositions.entries()) {
                if (childPosition.id === targetPosition.id) {
                  position.childPositions.splice(
                    index,
                    0,
                    clonedDraggedPosition,
                  );
                  position.childPositions.forEach(
                    (position, index) => (position.order = index),
                  );
                  break outerLoop;
                }

                if (childPosition.childPositions) {
                  for (const [
                    index,
                    grandChildPosition,
                  ] of childPosition.childPositions.entries()) {
                    if (grandChildPosition.id === targetPosition.id) {
                      childPosition.childPositions.splice(
                        index,
                        0,
                        clonedDraggedPosition,
                      );
                      childPosition.childPositions.forEach(
                        (position, index) => (position.order = index),
                      );
                      break outerLoop;
                    }

                    if (grandChildPosition.childPositions) {
                      for (const [
                        index,
                        grandGrandChildPosition,
                      ] of grandChildPosition.childPositions.entries()) {
                        if (grandGrandChildPosition.id === targetPosition.id) {
                          grandChildPosition.childPositions.splice(
                            index,
                            0,
                            clonedDraggedPosition,
                          );
                          grandChildPosition.childPositions.forEach(
                            (position, index) => (position.order = index),
                          );
                          break outerLoop;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (order === "after") {
          outerLoop: for (const [
            index,
            position,
          ] of clonedPositions.entries()) {
            if (position.id === targetPosition.id) {
              clonedPositions.splice(index + 1, 0, clonedDraggedPosition);
              clonedPositions.forEach(
                (position, index) => (position.order = index),
              );
              break outerLoop;
            }

            if (position.childPositions) {
              for (const [
                index,
                childPosition,
              ] of position.childPositions.entries()) {
                if (childPosition.id === targetPosition.id) {
                  position.childPositions.splice(
                    index + 1,
                    0,
                    clonedDraggedPosition,
                  );
                  position.childPositions.forEach(
                    (position, index) => (position.order = index),
                  );
                  break outerLoop;
                }

                if (childPosition.childPositions) {
                  for (const [
                    index,
                    grandChildPosition,
                  ] of childPosition.childPositions.entries()) {
                    if (grandChildPosition.id === targetPosition.id) {
                      childPosition.childPositions.splice(
                        index + 1,
                        0,
                        clonedDraggedPosition,
                      );
                      childPosition.childPositions.forEach(
                        (position, index) => (position.order = index),
                      );
                      break outerLoop;
                    }

                    if (grandChildPosition.childPositions) {
                      for (const [
                        index,
                        grandGrandChildPosition,
                      ] of grandChildPosition.childPositions.entries()) {
                        if (grandGrandChildPosition.id === targetPosition.id) {
                          grandChildPosition.childPositions.splice(
                            index + 1,
                            0,
                            clonedDraggedPosition,
                          );
                          grandChildPosition.childPositions.forEach(
                            (position, index) => (position.order = index),
                          );
                          break outerLoop;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (order === "inside") {
          outerLoop: for (const [, position] of clonedPositions.entries()) {
            if (position.id === targetPosition.id) {
              if (!position.childPositions) position.childPositions = [];
              position.childPositions.splice(0, 0, clonedDraggedPosition);
              position.childPositions.forEach(
                (position, index) => (position.order = index),
              );
              break outerLoop;
            }

            if (position.childPositions) {
              for (const [
                ,
                childPosition,
              ] of position.childPositions.entries()) {
                if (childPosition.id === targetPosition.id) {
                  if (!childPosition.childPositions)
                    childPosition.childPositions = [];
                  childPosition.childPositions.splice(
                    0,
                    0,
                    clonedDraggedPosition,
                  );
                  childPosition.childPositions.forEach(
                    (position, index) => (position.order = index),
                  );
                  break outerLoop;
                }

                if (childPosition.childPositions) {
                  for (const [
                    ,
                    grandChildPosition,
                  ] of childPosition.childPositions.entries()) {
                    if (grandChildPosition.id === targetPosition.id) {
                      if (!grandChildPosition.childPositions)
                        grandChildPosition.childPositions = [];
                      grandChildPosition.childPositions.splice(
                        0,
                        0,
                        clonedDraggedPosition,
                      );
                      grandChildPosition.childPositions.forEach(
                        (position, index) => (position.order = index),
                      );
                      break outerLoop;
                    }
                  }
                }
              }
            }
          }
        }

        /**
         * Save to database
         */
        const formData = new FormData();
        formData.append("eventId", positions[0].eventId);
        formData.append(
          "order",
          JSON.stringify(
            clonedPositions.map((position) => ({
              id: position.id,
              order: position.order,
              childPositions: position.childPositions?.map((childPosition) => ({
                id: childPosition.id,
                order: childPosition.order,
                childPositions: childPosition.childPositions?.map(
                  (grandChildPosition) => ({
                    id: grandChildPosition.id,
                    order: grandChildPosition.order,
                    childPositions: grandChildPosition.childPositions?.map(
                      (greatGrandChildPosition) => ({
                        id: greatGrandChildPosition.id,
                        order: greatGrandChildPosition.order,
                      }),
                    ),
                  }),
                ),
              })),
            })),
          ),
        );

        try {
          const response = await updateEventLineupOrder(formData);

          if (response.error) {
            toast.error(response.error);
            console.error(response);
            return;
          }

          toast.success(response.success!);
        } catch (error) {
          unstable_rethrow(error);
          toast.error(
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
          );
          console.error(error);
        }
      });
    },
    [handleCancel, isDragging, positions],
  );

  const value = useMemo(
    () => ({
      positions,
      handleDragStart,
      handleDragEnd,
      isDragging,
    }),
    [positions, handleDragStart, handleDragEnd, isDragging],
  );

  return (
    <LineupOrderContext.Provider value={value}>
      <div
        className={clsx(
          {
            "animate-pulse cursor-wait pointer-events-none": isPending,
          },
          className,
        )}
      >
        {positions.map((position) => (
          <Position
            key={position.id}
            position={position}
            showManage={showManage}
            variants={variants}
            myShips={myShips}
            allEventCitizens={allEventCitizens}
            showActions={showActions}
            showToggle={showToggle}
            groupLevel={1}
            parentPositions={[]}
          />
        ))}
      </div>

      {/* {isDragging && <DragPlaceholder />} */}
    </LineupOrderContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useLineupOrder() {
  const context = useContext(LineupOrderContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
