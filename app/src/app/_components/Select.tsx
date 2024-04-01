"use client";

import clsx from "clsx";
import { forwardRef } from "react";

type Props = JSX.IntrinsicElements["select"];

export const Select = forwardRef<HTMLSelectElement, Props>(
  function Select(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <select
        className={clsx(className, "bg-neutral-900 rounded px-4 h-11 w-full")}
        ref={ref}
        {...rest}
      >
        {children}
      </select>
    );
  },
);
