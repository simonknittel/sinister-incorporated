"use client";

import clsx from "clsx";
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { FaEllipsisH, FaTimes } from "react-icons/fa";
import styles from "./Actions.module.css";
import Button from "./Button";

interface Props {
  children?: ReactNode;
}

const Actions = ({ children }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen((value) => !value)}
        variant="secondary"
        iconOnly={true}
      >
        {isOpen ? <FaTimes /> : <FaEllipsisH />}
      </Button>

      {isOpen && <Inner setIsOpen={setIsOpen}>{children}</Inner>}
    </div>
  );
};

export default Actions;

interface InnerProps {
  children?: ReactNode;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Inner = ({ children, setIsOpen }: InnerProps) => {
  // const ref = useClickAway(() => setIsOpen(false));

  return (
    <div
      className={clsx(
        "absolute top-0 right-[calc(100%+.5rem)] flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 border border-neutral-900 z-10",
        styles.actions,
      )}
      // ref={ref}
    >
      {children}
    </div>
  );
};
