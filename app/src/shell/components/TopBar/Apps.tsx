"use client";

import { App } from "@/apps/components/App";
import { AppGrid } from "@/apps/components/AppGrid";
import { RedactedApp } from "@/apps/components/RedactedApp";
import { useApps } from "@/apps/utils/useApps";
import { Link } from "@/common/components/Link";
import { Popover, usePopover } from "@/common/components/Popover";
import clsx from "clsx";
import { AiFillAppstore } from "react-icons/ai";

interface Props {
  readonly className?: string;
}

export const Apps = ({ className }: Props) => {
  const apps = useApps();
  if (!apps) return null;

  return (
    <Popover
      trigger={
        <button
          className={clsx(
            "border-r border-neutral-700 rounded-l-primary hover:background-tertiary focus-visible:background-tertiary p-2 inline-flex items-center gap-1 h-full text-neutral-500",
            className,
          )}
        >
          <AiFillAppstore className="text-xl" />
          <span className="text-xs">Apps</span>
        </button>
      }
      enableHover
      childrenClassName="w-64"
    >
      <PopoverChildren apps={apps} />
    </Popover>
  );
};

interface PopoverChildrenProps {
  apps: NonNullable<Awaited<ReturnType<typeof useApps>>>;
}

const PopoverChildren = ({ apps }: PopoverChildrenProps) => {
  const { closePopover } = usePopover();

  return (
    <>
      <p className="font-bold text-sm text-center">Featured</p>

      <AppGrid variant="compact" className="mt-2">
        {apps.featured.map((app) =>
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
              onClick={closePopover}
            />
          ),
        )}
      </AppGrid>

      <p className="font-bold text-sm text-center mt-4">Weitere</p>

      <AppGrid variant="compact" className="mt-2">
        {apps.other.map((app) =>
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
              onClick={closePopover}
            />
          ),
        )}
      </AppGrid>

      <div className="flex justify-center mt-4">
        <Link
          href="/app/apps"
          className="text-interaction-500 hover:underline focus-visible:underline text-sm"
          onClick={closePopover}
        >
          Alle Apps
        </Link>
      </div>
    </>
  );
};
