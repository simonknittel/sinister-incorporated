import clsx from "clsx";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "./Link";

interface Props {
  readonly className?: string;
  readonly href: string;
}

export const RSIButton = ({ className, href }: Props) => {
  return (
    <Link
      href={href}
      className={clsx(
        className,
        "inline-flex items-center justify-center gap-2 rounded uppercase h-11 border text-base border-rsi-blue-200 text-rsi-blue-200 hover:border-rsi-blue-100 active:border-rsi-blue-100 hover:text-rsi-blue-100 active:text-rsi-blue-100 px-6",
      )}
      rel="noreferrer"
    >
      RSI <FaExternalLinkAlt />
    </Link>
  );
};
