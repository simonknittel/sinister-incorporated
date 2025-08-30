"use client";

import { App } from "@/apps/components/App";
import { AppGrid } from "@/apps/components/AppGrid";
import { RedactedApp } from "@/apps/components/RedactedApp";
import { useApps } from "@/apps/utils/useApps";
import { Link } from "@/common/components/Link";
import { useMouseEnterCounter } from "@/common/utils/useMouseEnterCounter";
import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";
import { useState } from "react";
import { AiFillAppstore } from "react-icons/ai";

interface Props {
  readonly className?: string;
}

export const Apps = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleMouseEnter, handleMouseLeave, reset } = useMouseEnterCounter(
    setIsOpen.bind(null, true),
    setIsOpen.bind(null, false),
  );

  const apps = useApps();
  if (!apps) return null;
  const { featuredApps, otherApps } = apps;

  const handleClick = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={setIsOpen}>
      <RadixPopover.Trigger asChild>
        <button
          className={clsx(
            "border-r border-neutral-700 rounded-l-primary hover:background-tertiary focus-visible:background-tertiary p-2 inline-flex items-center gap-1 h-full text-neutral-500",
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AiFillAppstore className="text-xl" />
          <span className="text-xs">Apps</span>
        </button>
      </RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          collisionPadding={{ left: 8, right: 8 }}
          className="z-10 w-64"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-neutral-950 border border-neutral-700 p-4 rounded-secondary relative">
            <p className="font-bold text-sm">Featured</p>

            <AppGrid variant="compact" className="mt-2">
              {featuredApps.map((app) =>
                app.redacted ? (
                  <RedactedApp key={app.name} variant="compact" />
                ) : (
                  <App
                    key={app.name}
                    name={app.name}
                    href={app.href}
                    imageSrc={app.imageSrc}
                    description={app.description}
                    variant="compact"
                    onClick={handleClick}
                  />
                ),
              )}
            </AppGrid>

            <p className="font-bold text-sm mt-4">Weitere</p>

            <AppGrid variant="compact" className="mt-2">
              {otherApps.map((app) =>
                app.redacted ? (
                  <RedactedApp key={app.name} variant="compact" />
                ) : (
                  <App
                    key={app.name}
                    name={app.name}
                    href={app.href}
                    imageSrc={app.imageSrc}
                    description={app.description}
                    variant="compact"
                    onClick={handleClick}
                  />
                ),
              )}
            </AppGrid>

            <div className="flex justify-center mt-4">
              <Link
                href="/app/apps"
                className="text-interaction-500 hover:underline focus-visible:underline text-sm"
                onClick={handleClick}
              >
                Alle Apps
              </Link>
            </div>
          </div>

          <div className="h-2 absolute left-0 right-0 bottom-full" />

          <RadixPopover.Arrow className="fill-neutral-700" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
