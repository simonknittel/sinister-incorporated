"use client";

import { useClickAway } from "@uidotdev/usehooks";
import clsx from "clsx";
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { FaEllipsisH, FaTimes } from "react-icons/fa";
import Button from "~/app/_components/Button";
import styles from "./Actions.module.css";

interface Props {
  children?: ReactNode;
}

const Actions = ({ children }: Props) => {
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
  const ref = useClickAway(() => setIsOpen(false));

  return (
    <div
      className={clsx(
        "absolute top-[calc(100%+.5rem)] right-0 flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 border border-neutral-900 z-10",
        styles.actions
      )}
      ref={ref}
    >
      {children}
    </div>
  );
};
