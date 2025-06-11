"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const CmdK = dynamic(() => import("./CmdK"), { ssr: false });

interface Props {
  readonly className?: string;
  readonly disableAlgolia: boolean;
  readonly showCitizenRead: boolean;
  readonly showOrganizationRead: boolean;
  readonly showOrgFleetRead: boolean;
  readonly showShipManage: boolean;
  readonly showUserRead: boolean;
  readonly showRoleManage: boolean;
  readonly showClassificationLevelManage: boolean;
  readonly showNoteTypeManage: boolean;
  readonly showAnalyticsManage: boolean;
  readonly showManufacturersSeriesAndVariantsManage: boolean;
}

export const CmdKLoader = ({
  className,
  disableAlgolia,
  showCitizenRead,
  showOrganizationRead,
  showOrgFleetRead,
  showShipManage,
  showUserRead,
  showRoleManage,
  showClassificationLevelManage,
  showNoteTypeManage,
  showAnalyticsManage,
  showManufacturersSeriesAndVariantsManage,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={clsx(
          className,
          "hidden lg:block text-neutral-600 text-center text-sm hover:text-neutral-400 active:text-neutral-300 group",
        )}
        type="button"
        onClick={() => setOpen(true)}
      >
        Hotkey{" "}
        <span className="px-2 py-1 rounded-secondary border border-neutral-800 group-hover:border-neutral-600 group-active:border-neutral-500">
          Strg + K
        </span>
      </button>

      <Suspense>
        <CmdK
          open={open}
          setOpen={setOpen}
          disableAlgolia={disableAlgolia}
          showCitizenRead={showCitizenRead}
          showOrganizationRead={showOrganizationRead}
          showOrgFleetRead={showOrgFleetRead}
          showShipManage={showShipManage}
          showUserRead={showUserRead}
          showRoleManage={showRoleManage}
          showClassificationLevelManage={showClassificationLevelManage}
          showNoteTypeManage={showNoteTypeManage}
          showAnalyticsManage={showAnalyticsManage}
          showManufacturersSeriesAndVariantsManage={
            showManufacturersSeriesAndVariantsManage
          }
        />
      </Suspense>
    </>
  );
};
