import { Link } from "@/common/components/Link";
import clsx from "clsx";
import { AiFillAppstore } from "react-icons/ai";

interface Props {
  readonly className?: string;
}

export const Apps = ({ className }: Props) => {
  return (
    <Link
      href="/app/apps"
      className={clsx(
        "border-r border-neutral-700 rounded-l-primary hover:background-tertiary focus-visible:background-tertiary p-2 inline-flex items-center gap-1 h-full text-neutral-500",
        className,
      )}
    >
      <AiFillAppstore className="text-xl" />
      <span className="text-xs">Apps</span>
    </Link>
  );
};
