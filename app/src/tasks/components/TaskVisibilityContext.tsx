"use client";

import type { Task } from "@prisma/client";
import { useLocalStorage } from "@uidotdev/usehooks";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useMemo,
} from "react";

interface TaskVisibilityContext {
  openItems: Task["id"][];
  open: (itemIds: Task["id"]) => void;
  close: (itemIds: Task["id"]) => void;
  closeAll: () => void;
  openAll: () => void;
}

const TaskVisibilityContext = createContext<TaskVisibilityContext | undefined>(
  undefined,
);

type Props = Readonly<{
  children: ReactNode;
  items: Pick<Task, "id">[];
}>;

export const TaskVisibilityProvider = ({ children, items }: Props) => {
  const [openItems, setOpenItems] = useLocalStorage<Task["id"][]>(
    "open_tasks",
    [],
  );

  const open = useCallback(
    (itemId: Task["id"]) => {
      setOpenItems((prev) => [...prev, itemId]);
    },
    [setOpenItems],
  );

  const openAll = useCallback(() => {
    const allItemIds = items.map((task) => task.id);

    startTransition(() => {
      setOpenItems(allItemIds);
    });
  }, [setOpenItems, items]);

  const close = useCallback(
    (itemId: Task["id"]) => {
      setOpenItems((prev) => prev.filter((id) => id !== itemId));
    },
    [setOpenItems],
  );

  const closeAll = useCallback(() => {
    startTransition(() => {
      setOpenItems([]);
    });
  }, [setOpenItems]);

  const value = useMemo(
    () => ({
      openItems,
      open,
      openAll,
      close,
      closeAll,
    }),
    [openItems, open, openAll, close, closeAll],
  );

  return (
    <TaskVisibilityContext.Provider value={value}>
      {children}
    </TaskVisibilityContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useTaskVisibility() {
  const context = useContext(TaskVisibilityContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}

type ToggleAll = Readonly<{
  className?: string;
}>;

export const ToggleAll = ({ className }: ToggleAll) => {
  const { openAll, closeAll } = useTaskVisibility();

  return (
    <div className={clsx("flex gap-2", className)}>
      <button
        onClick={openAll}
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 hover:underline focus-visible:underline"
      >
        Alle öffnen
      </button>
      /
      <button
        onClick={closeAll}
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 hover:underline focus-visible:underline"
      >
        schließen
      </button>
    </div>
  );
};
