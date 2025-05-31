"use client";

import clsx from "clsx";
import { type InputHTMLAttributes, type ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  hideLabel?: boolean;
  yesLabel?: ReactNode;
  noLabel?: ReactNode;
  labelClassName?: string;
}

export const YesNoCheckbox = (props: Props) => {
  const {
    className,
    hideLabel = false,
    yesLabel = "Ja",
    noLabel = "Nein",
    labelClassName,
    ...rest
  } = props;

  return (
    <label
      className={clsx(
        "group inline-flex justify-center gap-2 items-center align-middle",
        {
          "opacity-50 pointer-events-none": props.disabled,
          "cursor-pointer": !props.disabled,
        },
      )}
    >
      <input
        type="checkbox"
        className={clsx("hidden peer", className)}
        {...rest}
      />

      <span className="flex-none size-8 bg-neutral-700 rounded block relative peer-checked:hidden">
        <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
      </span>

      <span className="flex-none size-8 bg-neutral-700 rounded hidden relative peer-checked:block">
        <span className="absolute inset-1 rounded bg-green-500" />
      </span>

      {!hideLabel && (
        <>
          <span
            className={clsx("w-8 block peer-checked:hidden", labelClassName)}
          >
            {noLabel}
          </span>
          <span
            className={clsx("w-8 hidden peer-checked:block", labelClassName)}
          >
            {yesLabel}
          </span>
        </>
      )}
    </label>
  );
};

export default YesNoCheckbox;
