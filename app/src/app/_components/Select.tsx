"use client";

import clsx from "clsx";
import { forwardRef } from "react";

type Props = JSX.IntrinsicElements["select"];

const Select = forwardRef<HTMLSelectElement, Props>(
  function Select(props, ref) {
    return (
      <select
        className={clsx(
          props.className,
          "bg-neutral-900 rounded px-4 h-11 w-full",
        )}
        ref={ref}
        {...props}
      >
        {props.children}
      </select>
    );
  },
);

export default Select;
