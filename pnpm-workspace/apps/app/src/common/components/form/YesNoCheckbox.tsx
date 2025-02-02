"use client";

import clsx from "clsx";
import { type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  hideLabel?: boolean;
};

const YesNoCheckbox = (props: Props) => {
  const { className, hideLabel = false, ...rest } = props;

  return (
    <label
      className={clsx("group inline-flex justify-center gap-2 items-center", {
        "opacity-50 pointer-events-none": props.disabled,
        "cursor-pointer": !props.disabled,
      })}
    >
      <input
        type="checkbox"
        className={clsx("hidden peer", className)}
        {...rest}
      />

      <span className="w-8 h-8 bg-neutral-700 rounded block relative peer-checked:hidden">
        <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
      </span>

      <span className="w-8 h-8 bg-neutral-700 rounded hidden relative peer-checked:block">
        <span className="absolute inset-1 rounded bg-green-500" />
      </span>

      {!hideLabel && (
        <>
          <span className="w-8 block peer-checked:hidden">Nein</span>
          <span className="w-8 hidden peer-checked:block">Ja</span>
        </>
      )}
    </label>
  );
};

export default YesNoCheckbox;
