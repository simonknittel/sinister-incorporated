"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

interface Props extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "tertiary" | null;
  colorScheme?: "sky" | "red" | null;
  iconOnly?: boolean | null;
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  props,
  ref
) {
  const {
    variant = "primary",
    colorScheme = "sky",
    iconOnly,
    className,
    ...other
  } = props;

  return (
    <button
      className={clsx(
        {
          "flex items-center justify-center gap-4 rounded uppercase": true,
          "h-11 text-base font-bold": variant === "primary",
          "h-11 border text-base": variant === "secondary",
          "h-8 text-xs": variant === "tertiary",
          "bg-sky-500 text-base text-slate-50 hover:bg-sky-600 active:bg-sky-700":
            variant === "primary" && colorScheme === "sky",
          "border-sky-800 text-sky-500 hover:bg-sky-800 active:bg-sky-900":
            variant === "secondary" && colorScheme === "sky",
          "text-sky-500 hover:bg-sky-800 active:bg-sky-900":
            variant === "tertiary" && colorScheme === "sky",
          "bg-red-500 text-slate-50 hover:bg-red-600 active:bg-red-700":
            variant === "primary" && colorScheme === "red",
          "border-red-800 text-red-500 hover:bg-red-800 active:bg-red-900":
            variant === "secondary" && colorScheme === "red",
          "text-red-500 hover:bg-red-800 active:bg-red-900":
            variant === "tertiary" && colorScheme === "red",
          "w-11": iconOnly,
          "px-6": !iconOnly,
        },
        className
      )}
      {...other}
      ref={ref}
    />
  );
});

export default Button;
