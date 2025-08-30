import clsx from "clsx";
import type {
  ComponentProps,
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
} from "react";

type Props<E extends ElementType = "button"> = {
  readonly as?: E;
  readonly className?: string;
  readonly children?: ReactNode;
  readonly variant?: "primary" | "secondary";
  readonly colorSchema?:
    | "interaction"
    | "interactionMuted"
    | "discord"
    | "rsi"
    | null;
} & Omit<ComponentProps<E>, "as" | "className" | "children">;

export const Button2 = <E extends ElementType = "button">({
  as,
  className,
  children,
  variant = "primary",
  colorSchema = "interaction",
  ...otherProps
}: Props<E>) => {
  const Component = as ?? "button";

  return (
    <Component
      className={clsx(
        "flex items-center justify-center rounded-secondary disabled:grayscale disabled:opacity-50 gap-1 min-h-8 py-1 px-2 text-sm font-normal [&>svg]:text-xs",
        {
          "bg-interaction-500 text-neutral-50 enabled:hover:bg-interaction-300 enabled:focus-visible:outline outline-2 outline-offset-4 outline-interaction-700 enabled:active:bg-interaction-700 transition-colors":
            variant === "primary" && colorSchema === "interaction",
          "bg-transparent text-interaction-500 border border-interaction-500 border-solid enabled:hover:text-interaction-300 enabled:hover:border-interaction-300 enabled:focus-visible:outline outline-2 outline-offset-4 outline-interaction-700 enabled:active:text-interaction-700 enabled:active:border-interaction-700 transition-colors":
            variant === "secondary" && colorSchema === "interaction",
          "bg-transparent text-neutral-500 border border-neutral-500 border-solid enabled:hover:text-interaction-300 enabled:hover:border-interaction-300 enabled:focus-visible:outline outline-2 outline-offset-4 outline-interaction-700 enabled:active:text-interaction-700 enabled:active:border-interaction-700 transition-colors":
            variant === "secondary" && colorSchema === "interactionMuted",
          "bg-transparent text-neutral-500 border border-neutral-500 border-solid hover:text-neutral-300 hover:border-neutral-300 focus-visible:outline outline-2 outline-offset-4 outline-neutral-700 active:text-neutral-700 active:border-neutral-700 transition-colors":
            variant === "secondary" && colorSchema === "discord",
          "bg-transparent text-rsi-blue-200 border border-rsi-blue-200 border-solid hover:text-rsi-blue-100 hover:border-rsi-blue-100 focus-visible:outline outline-2 outline-offset-4 outline-rsi-blue-300 active:text-rsi-blue-300 active:border-rsi-blue-300 transition-colors":
            variant === "secondary" && colorSchema === "rsi",
        },
        className,
      )}
      {...(otherProps as ComponentPropsWithRef<E>)}
    >
      {children}
    </Component>
  );
};
