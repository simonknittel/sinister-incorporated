import { Badge } from "@/modules/common/components/Badge";
import clsx from "clsx";
import Image from "next/image";
import NextLink from "next/link";
import type { App } from "../utils/types";

interface Props {
  readonly className?: string;
  readonly app: App;
  readonly variant?: "default" | "compact";
  readonly onClick?: () => void;
}

export const AppTile = ({
  className,
  app,
  variant = "default",
  onClick,
}: Props) => {
  if (variant === "compact") {
    return (
      <NextLink
        href={app.href}
        className={clsx(
          "block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs",
          className,
        )}
        onClick={onClick}
      >
        {app.name}
      </NextLink>
    );
  }

  return (
    <NextLink
      href={app.href}
      className={clsx(
        "flex flex-col hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group",
        className,
      )}
    >
      <Image
        src={app.imageSrc}
        alt={`Screenshot der ${app.name} App`}
        priority
        className="aspect-video object-cover object-top grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition flex-initial"
      />

      <div className="p-2 sm:p-4 flex flex-col gap-2 flex-1">
        <h2 className="font-bold">{app.name}</h2>

        {app.description && (
          <p className="text-xs text-neutral-400 flex-1">{app.description}</p>
        )}

        {app.tags?.length && (
          <div className="flex flex-wrap gap-[2px]">
            {app.tags.map((tag) => (
              <Badge
                key={tag}
                label="Tag"
                value={tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag}
                className="text-xs"
              />
            ))}
          </div>
        )}
      </div>
    </NextLink>
  );
};
