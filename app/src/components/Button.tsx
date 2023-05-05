"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

interface Props extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "tertiary" | null;
  colorScheme?: "sinister-red" | null;
  iconOnly?: boolean | null;
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  props,
  ref
) {
  const {
    variant = "primary",
    colorScheme = "sinister-red",
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
          "bg-sinister-red-500 text-base text-neutral-50 hover:bg-sinister-red-300 active:bg-sinister-red-300":
            variant === "primary" && colorScheme === "sinister-red",
          "border-sinister-red-300 text-sinister-red-500 hover:border-sinister-red-500 active:border-sinister-red-500":
            variant === "secondary" && colorScheme === "sinister-red",
          "text-sinister-red-500 hover:bg-sinisterborder-sinister-red-300 active:bg-sinister-red-300":
            variant === "tertiary" && colorScheme === "sinister-red",
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
