import clsx from "clsx";
import type { ComponentProps } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type Props = ComponentProps<"button"> &
  Readonly<{
    isOpen: boolean;
  }>;

export const AccordeonToggle = (props: Props) => {
  const { className, isOpen, ...rest } = props;

  return (
    <button
      type="button"
      title={isOpen ? "Details schließen" : "Details öffnen"}
      className={clsx(
        "flex-none p-3 flex items-center justify-center border-l border-white/10 hover:bg-neutral-800 rounded",
        className,
      )}
      {...rest}
    >
      {isOpen ? (
        <FaChevronUp className="text-sinister-red-500" />
      ) : (
        <FaChevronDown className="text-sinister-red-500" />
      )}
    </button>
  );
};
