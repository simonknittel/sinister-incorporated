import * as RadixUiTooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import type { ReactNode } from "react";

type Props = Readonly<{
  className?: string;
  contentClassName?: string;
  triggerChildren: ReactNode;
  children: ReactNode;
}>;

export const Tooltip = ({
  className,
  contentClassName,
  triggerChildren,
  children,
}: Props) => {
  return (
    <RadixUiTooltip.Provider delayDuration={0}>
      <RadixUiTooltip.Root>
        <RadixUiTooltip.Trigger
          type="button"
          className={clsx(
            "text-sinister-red-500 hover:text-sinister-red-300 cursor-help",
            className,
          )}
        >
          {triggerChildren}
        </RadixUiTooltip.Trigger>

        <RadixUiTooltip.Content
          className={clsx(
            "p-2 text-sm leading-tight max-w-[320px] select-none rounded bg-neutral-600 text-white font-normal",
            contentClassName,
          )}
          sideOffset={5}
        >
          {children}
          <RadixUiTooltip.Arrow className="fill-neutral-600" />
        </RadixUiTooltip.Content>
      </RadixUiTooltip.Root>
    </RadixUiTooltip.Provider>
  );
};
