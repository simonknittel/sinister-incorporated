"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

interface Props extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "tertiary" | null;
  colorScheme?: "sinister-red" | null;
  iconOnly?: boolean | null;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  function Button(props, ref) {
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
            "flex items-center justify-center rounded uppercase": true,
            "gap-4": ["primary", "secondary"].includes(variant || ""),
            "min-h-11 py-2 text-base font-bold": variant === "primary",
            "min-h-11 py-2 border text-base": variant === "secondary",
            "h-8 gap-2 text-xs": variant === "tertiary",
            "bg-sinister-red-500 text-neutral-50 enabled:hover:bg-sinister-red-300 enabled:active:bg-sinister-red-300":
              variant === "primary" && colorScheme === "sinister-red",
            "border-sinister-red-500 text-sinister-red-500 enabled:hover:border-sinister-red-300 enabled:active:border-sinister-red-300 enabled:hover:text-sinister-red-300 enabled:active:text-sinister-red-300":
              variant === "secondary" && colorScheme === "sinister-red",
            "text-sinister-red-500 enabled:hover:bg-sinisterborder-sinister-red-300 enabled:hover:text-sinister-red-300 enabled:active:text-sinister-red-300":
              variant === "tertiary" && colorScheme === "sinister-red",
            "w-11":
              iconOnly && ["primary", "secondary"].includes(variant || ""),
            "w-6": iconOnly && ["tertiary"].includes(variant || ""),
            "px-6":
              !iconOnly && ["primary", "secondary"].includes(variant || ""),
          },
          className,
        )}
        {...other}
        ref={ref}
      />
    );
  },
);

export default Button;
