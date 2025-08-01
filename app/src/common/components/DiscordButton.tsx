import clsx from "clsx";
import { FaDiscord } from "react-icons/fa";
import { Link } from "./Link";

interface Props {
  readonly className?: string;
  readonly path: string;
}

export const DiscordButton = ({ className, path }: Props) => {
  const href = `https://discord.com/${path}`;
  // const urlScheme = `discord://-/${path}`;

  return (
    <Link
      href={href}
      className={clsx(
        className,
        "inline-flex items-center justify-center gap-2 rounded-secondary uppercase h-11 border text-base border-neutral-500 text-neutral-500 hover:border-neutral-300 active:border-neutral-300 hover:text-neutral-300 active:text-neutral-300 px-6",
      )}
      rel="noreferrer"
    >
      <FaDiscord />
      Discord
    </Link>
  );
};
