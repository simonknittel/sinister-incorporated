import clsx from "clsx";
import Image from "next/image";
import NextLink from "next/link";
import type { ComponentProps } from "react";

interface Props {
  readonly className?: string;
  readonly name: string;
  readonly href: string;
  readonly imageSrc: ComponentProps<typeof Image>["src"];
  readonly description?: string;
}

export const App = ({
  className,
  name,
  href,
  imageSrc,
  description,
}: Props) => {
  return (
    <NextLink
      href={href}
      className={clsx(
        "block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group",
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={`Screenshot der ${name} App`}
        priority
        className="aspect-video object-cover object-top grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition"
      />

      <div className="p-2 sm:p-4 flex flex-col gap-2">
        <h2 className="font-bold">{name}</h2>

        {description && (
          <p className="text-xs text-neutral-400">{description}</p>
        )}
      </div>
    </NextLink>
  );
};
