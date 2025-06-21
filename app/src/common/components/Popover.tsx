"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface Props {
  readonly trigger: ReactNode;
  readonly children: ReactNode;
  readonly childrenClassName?: string;
}

export const Popover = ({ trigger, children, childrenClassName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      setIsOpen,
    }),
    [setIsOpen],
  );

  return (
    <PopoverContext.Provider value={value}>
      <RadixPopover.Root open={isOpen} onOpenChange={setIsOpen}>
        <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>

        <RadixPopover.Portal>
          <RadixPopover.Content
            collisionPadding={{ left: 24, right: 24 }}
            className="z-10"
          >
            <div
              className={clsx(
                "bg-neutral-950 border border-neutral-700 p-4 rounded-secondary",
                childrenClassName,
              )}
            >
              {children}
            </div>

            <RadixPopover.Arrow className="fill-neutral-700" />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </PopoverContext.Provider>
  );
};

interface PopoverContextInterface {
  setIsOpen: (value: boolean) => void;
}

const PopoverContext = createContext<PopoverContextInterface | undefined>(
  undefined,
);

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function usePopover() {
  const context = useContext(PopoverContext);
  if (!context)
    throw new Error(
      "Provider for `usePopover()` is missing. Make sure to have a `<Popover> ... </Popover>` parent.",
    );
  return context;
}
