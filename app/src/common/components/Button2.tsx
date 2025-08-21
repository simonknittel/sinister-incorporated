import clsx from "clsx";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"button"> {
  readonly className?: string;
  readonly variant?: "primary" | "secondary";
  readonly colorSchema?: "interaction" | null;
}

export const Button2 = ({
  className,
  children,
  variant = "primary",
  colorSchema = "interaction",
  ...otherProps
}: Props) => {
  return (
    <button
      className={clsx(
        "flex items-center justify-center rounded-secondary disabled:grayscale disabled:opacity-50 gap-1 min-h-8 py-1 px-2 text-sm font-normal",
        {
          "bg-interaction-500 text-neutral-50 enabled:hover:bg-interaction-300 enabled:focus-visible:outline outline-2 outline-offset-4 outline-interaction-700 enabled:active:bg-interaction-700 transition-colors":
            variant === "primary" && colorSchema === "interaction",
          "bg-transparent text-interaction-500 border border-interaction-500 border-solid enabled:hover:text-interaction-300 enabled:hover:border-interaction-300 enabled:focus-visible:outline outline-2 outline-offset-4 outline-interaction-700 enabled:active:text-interaction-700 enabled:active:border-interaction-700 transition-colors":
            variant === "secondary" && colorSchema === "interaction",
        },
        className,
      )}
      {...otherProps}
    >
      {children}
    </button>
  );
};
