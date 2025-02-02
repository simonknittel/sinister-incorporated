"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const CmdK = dynamic(() => import("./CmdK"), { ssr: false });

type Props = Readonly<{
  className?: string;
  disableAlgolia: boolean;
  showCitizenRead: boolean;
  showOrganizationRead: boolean;
  showOrgFleetRead: boolean;
  showShipManage: boolean;
  showUserRead: boolean;
  showRoleManage: boolean;
  showClassificationLevelManage: boolean;
  showNoteTypeManage: boolean;
  showAnalyticsManage: boolean;
  showManufacturersSeriesAndVariantsManage: boolean;
}>;

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
        <span className="px-2 py-1 rounded border border-neutral-800 group-hover:border-neutral-600 group-active:border-neutral-500">
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
