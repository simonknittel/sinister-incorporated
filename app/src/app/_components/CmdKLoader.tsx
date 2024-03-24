"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const CmdK = dynamic(() => import("./CmdK"), { ssr: false });

type Props = Readonly<{
  className?: string;
}>;

export const CmdKLoader = ({ className }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={clsx(
          className,
          "hidden lg:block text-neutral-600 text-center text-sm hover:text-neutral-400 group",
        )}
        type="button"
        onClick={() => setOpen(true)}
      >
        Hotkey{" "}
        <span className="px-2 py-1 rounded border border-neutral-800 group-hover:border-neutral-600">
          Strg + K
        </span>
      </button>

      <Suspense>
        <CmdK open={open} setOpen={setOpen} />
      </Suspense>
    </>
  );
};
