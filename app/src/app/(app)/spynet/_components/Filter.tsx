"use client";

import * as Popover from "@radix-ui/react-popover";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FaChevronDown } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  name: string;
  children?: ReactNode;
}

export const Filter = ({ name, children }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
    }),
    [isOpen, setIsOpen],
  );

  return (
    <FilterContext.Provider value={value}>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Button variant="secondary">
            <FaChevronDown /> {name}
          </Button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content sideOffset={4}>
            {children}

            <Popover.Arrow className="fill-neutral-800" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </FilterContext.Provider>
  );
};

interface FilterContextInterface {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const FilterContext = createContext<FilterContextInterface | undefined>(
  undefined,
);

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
