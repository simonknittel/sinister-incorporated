"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { Suspense, useState, type ComponentProps } from "react";

const CmdK = dynamic(() => import("./CmdK").then((mod) => mod.CmdK), {
  ssr: false,
});

interface Props extends Omit<ComponentProps<typeof CmdK>, "open" | "setOpen"> {
  readonly className?: string;
}

export const CmdKLoader = ({ className, ...cmdKProps }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={clsx(
          className,
          "hidden lg:block text-neutral-600 text-center text-sm hover:text-neutral-400 active:text-neutral-300 group",
        )}
        type="button"
        onClick={() => setOpen(true)}
      >
        Hotkey{" "}
        <span className="px-2 py-1 rounded-secondary border border-neutral-800 group-hover:border-neutral-600 group-active:border-neutral-500">
          Strg + K
        </span>
      </button>

      <Suspense>
        <CmdK open={open} setOpen={setOpen} {...cmdKProps} />
      </Suspense>
    </>
  );
};
