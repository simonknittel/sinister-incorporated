import clsx from "clsx";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
  href: string;
}>;

export const RSIButton = ({ className, href }: Props) => {
  return (
    <Link
      href={href}
      className={clsx(
        className,
        "inline-flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-rsi-blue-200 text-rsi-blue-200 hover:border-rsi-blue-100 active:border-rsi-blue-100 hover:text-rsi-blue-100 active:text-rsi-blue-100 px-6",
      )}
    >
      RSI <FaExternalLinkAlt />
    </Link>
  );
};
