"use client";

import clsx from "clsx";
import { type ComponentProps } from "react";

type Props = ComponentProps<"input">;

const YesNoCheckbox = (props: Props) => {
  return (
    <label
      className={clsx("group inline-flex justify-center gap-2 items-center", {
        "opacity-50 pointer-events-none": props.disabled,
        "cursor-pointer": !props.disabled,
      })}
    >
      <input type="checkbox" className="hidden peer" {...props} />

      <span className="w-8 h-8 bg-neutral-700 rounded block relative peer-checked:hidden">
        <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
      </span>

      <span className="w-8 h-8 bg-neutral-700 rounded hidden relative peer-checked:block">
        <span className="absolute inset-1 rounded bg-green-500" />
      </span>

      <span className="w-8 block peer-checked:hidden">Nein</span>
      <span className="w-8 hidden peer-checked:block">Ja</span>
    </label>
  );
};

export default YesNoCheckbox;
