"use client";

import Button from "@/common/components/Button";
import clsx from "clsx";
import type { MouseEventHandler } from "react";
import { FaRegWindowRestore } from "react-icons/fa";
import type { IEntry } from "./Entry";
import styles from "./Entry.module.css";
import { useOverlay } from "./OverlayContext";
import { OverlayWindow } from "./OverlayWindow";
import { RSILink } from "./RSILink";

interface Props {
  readonly className?: string;
  readonly entries: IEntry[];
}

export const OverlayButton = ({ className, entries }: Props) => {
  const { isSupported, requestPipWindow, pipWindow, closePipWindow } =
    useOverlay();

  if (!isSupported) return null;

  const handleToggleOverlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (pipWindow) {
      closePipWindow();
    } else {
      void requestPipWindow();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleToggleOverlay}
        className={className}
      >
        <FaRegWindowRestore />
        Overlay
      </Button>

      {pipWindow && (
        <OverlayWindow pipWindow={pipWindow}>
          <section className="h-full background-primary text-text-primary p-2 flex flex-col gap-2">
            {entries
              // .filter((entry) => entry.isNew)
              .toSorted((a, b) => b.isoDate.getTime() - a.isoDate.getTime())
              .map((entry) => (
                <OverlayEntry key={entry.key} entry={entry} />
              ))}
          </section>
        </OverlayWindow>
      )}
    </>
  );
};

interface OverlayEntryProps {
  readonly entry: IEntry;
}

const OverlayEntry = ({ entry }: OverlayEntryProps) => {
  return (
    <div className={clsx("relative", styles.Row)}>
      <div className="whitespace-nowrap overflow-hidden">
        <div
          className="max-w-32 truncate inline-block align-middle"
          title={entry.killer}
        >
          <RSILink handle={entry.killer} />
        </div>

        <div className="inline-block p-2 align-middle">killed</div>

        <div
          className="max-w-32 truncate inline-block align-middle"
          title={entry.target}
        >
          <RSILink handle={entry.target} />
        </div>
      </div>

      <div
        className={clsx(
          "absolute left-0 top-0 bg-amber-500 text-black uppercase text-xs px-1 rounded-br-secondary",
          styles.New,
        )}
      >
        Neu
      </div>
    </div>
  );
};
