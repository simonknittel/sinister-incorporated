"use client";

import { useAppsContext } from "@/apps/components/AppsContext";
import { AppTile } from "@/apps/components/AppTile";
import { AppTileGrid } from "@/apps/components/AppTileGrid";
import { RedactedAppTile } from "@/apps/components/RedactedAppTile";
import type { App, AppList } from "@/apps/utils/types";
import { Link } from "@/common/components/Link";
import { Popover, usePopover } from "@/common/components/Popover";
import clsx from "clsx";
import { AiFillAppstore } from "react-icons/ai";

interface Props {
  readonly className?: string;
}

export const Apps = ({ className }: Props) => {
  const { apps } = useAppsContext();
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
  apps: AppList;
}

const PopoverChildren = ({ apps }: PopoverChildrenProps) => {
  const { closePopover } = usePopover();

  const featured = apps
    .filter((app) => "featured" in app && app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const other = apps
    .filter((app) => !("featured" in app) || !app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <p className="font-bold text-sm text-center">Featured</p>

      <AppTileGrid variant="compact" className="mt-2">
        {featured.map((app) =>
          "redacted" in app && app.redacted ? (
            <RedactedAppTile key={app.name} variant="compact" />
          ) : (
            <AppTile
              key={app.name}
              app={app as App}
              variant="compact"
              onClick={closePopover}
            />
          ),
        )}
      </AppTileGrid>

      <p className="font-bold text-sm text-center mt-4">Weitere</p>

      <AppTileGrid variant="compact" className="mt-2">
        {other.map((app) =>
          "redacted" in app && app.redacted ? (
            <RedactedAppTile key={app.name} variant="compact" />
          ) : (
            <AppTile
              key={app.name}
              app={app as App}
              variant="compact"
              onClick={closePopover}
            />
          ),
        )}
      </AppTileGrid>

      <div className="flex justify-center">
        <Link
          href="/app/apps"
          className="text-interaction-500 hover:underline focus-visible:underline text-sm p-4 -mb-4"
          onClick={closePopover}
        >
          Alle Apps
        </Link>
      </div>
    </>
  );
};
