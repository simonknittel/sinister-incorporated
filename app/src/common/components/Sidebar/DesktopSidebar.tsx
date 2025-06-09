import { requireAuthentication } from "@/auth/server";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import {
  cloneElement,
  Suspense,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  FaCog,
  FaHome,
  FaLock,
  FaPiggyBank,
  FaTable,
  FaTools,
  FaUsers,
} from "react-icons/fa";
import { FaCodePullRequest, FaScaleBalanced } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdTaskAlt, MdWorkspaces } from "react-icons/md";
import { RiSpyFill } from "react-icons/ri";
import { RxActivityLog } from "react-icons/rx";
import { TbMilitaryRank } from "react-icons/tb";
import { CmdKLoader } from "../CmdK/CmdKLoader";
import { Footer } from "../Footer";
import { Link } from "../Link";
import { Account } from "./Account";
import { RedBar } from "./RedBar";
import { TasksBadge } from "./TasksBadge";

export const DesktopSidebar = async () => {
  const authentication = await requireAuthentication();

  const showSpynet =
    (await authentication.authorize("citizen", "read")) ||
    (await authentication.authorize("organization", "read"));
  const showCareer =
    (await authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "security",
      },
    ])) ||
    (await authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "economic",
      },
    ]));

  const [
    showShipManage,
    showOrgFleetRead,
    showCitizenRead,
    showUserRead,
    showOrganizationRead,
    showRoleManage,
    showClassificationLevelManage,
    showNoteTypeManage,
    showAnalyticsManage,
    showManufacturersSeriesAndVariantsManage,
    showPenaltyPoints,
    showSilc,
    showSpynetActivity,
    showTasks,
  ] = await Promise.all([
    authentication.authorize("ship", "manage"),
    authentication.authorize("orgFleet", "read"),
    authentication.authorize("citizen", "read"),
    authentication.authorize("user", "read"),
    authentication.authorize("organization", "read"),
    authentication.authorize("role", "manage"),
    authentication.authorize("classificationLevel", "manage"),
    authentication.authorize("noteType", "manage"),
    authentication.authorize("analytics", "manage"),
    authentication.authorize("manufacturersSeriesAndVariants", "manage"),
    authentication.authorize("penaltyEntry", "create"),
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("spynetActivity", "read"),
    authentication.authorize("task", "read"),
  ]);

  const showSpynetCitizen =
    showCitizenRead &&
    (await authentication.authorize("spynetCitizen", "read"));
  const showSpynetNotes =
    showCitizenRead && (await authentication.authorize("spynetNotes", "read"));
  const showSpynetOther =
    showCitizenRead && (await authentication.authorize("spynetOther", "read"));
  const showSpynetAdmin =
    showSpynetActivity ||
    showSpynetCitizen ||
    showSpynetNotes ||
    showSpynetOther;

  const disableAlgolia = (await getUnleashFlag("DisableAlgolia")) || false;

  return (
    <div className="overflow-auto pl-8 py-8">
      {/* <GlobalAlert /> */}

      <div className="background-secondary flex flex-col justify-between rounded-primary">
        <div>
          <Account />

          <div className="flex justify-evenly items-center mt-4">
            <CmdKLoader
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

            {/* <InstallPWA /> */}
          </div>

          <nav
            className="p-4 border-neutral-800 relative"
            data-red-bar-container
          >
            <ul>
              <NavigationItem href="/app" icon={<FaHome />}>
                Dashboard
              </NavigationItem>

              {showTasks && (
                <NavigationItem href="/app/tasks" icon={<MdTaskAlt />}>
                  Tasks
                  <Suspense>
                    <TasksBadge />
                  </Suspense>
                </NavigationItem>
              )}

              {showSpynet && (
                <NavigationItem href="/app/spynet" icon={<RiSpyFill />}>
                  Spynet
                </NavigationItem>
              )}

              {(showOrgFleetRead || showShipManage) && (
                <NavigationItem href="/app/fleet" icon={<MdWorkspaces />}>
                  Flotte
                </NavigationItem>
              )}

              <NavigationItem href="/app/documents" icon={<IoDocuments />}>
                Dokumente
              </NavigationItem>

              {showCareer && (
                <NavigationItem href="/app/career" icon={<TbMilitaryRank />}>
                  Karriere
                </NavigationItem>
              )}

              {showSilc && (
                <NavigationItem href="/app/silc" icon={<FaPiggyBank />}>
                  SILC
                </NavigationItem>
              )}

              {showPenaltyPoints && (
                <NavigationItem
                  href="/app/penalty-points"
                  icon={<FaScaleBalanced />}
                >
                  Strafpunkte
                </NavigationItem>
              )}

              <NavigationItem href="/app/tools" icon={<FaTools />}>
                Tools
              </NavigationItem>

              <NavigationItem
                href="/app/changelog"
                icon={<FaCodePullRequest />}
              >
                Changelog
              </NavigationItem>
            </ul>

            {showSpynetAdmin && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

                <ul>
                  {showSpynetActivity && (
                    <NavigationItem
                      href="/app/spynet/activity"
                      icon={<RxActivityLog />}
                    >
                      Aktivität
                    </NavigationItem>
                  )}

                  {showSpynetCitizen && (
                    <NavigationItem
                      href="/app/spynet/citizen"
                      icon={<FaTable />}
                    >
                      Citizen
                    </NavigationItem>
                  )}

                  {showSpynetNotes && (
                    <NavigationItem href="/app/spynet/notes" icon={<FaTable />}>
                      Notizen
                    </NavigationItem>
                  )}

                  {showSpynetOther && (
                    <NavigationItem href="/app/spynet/other" icon={<FaTable />}>
                      Sonstige
                    </NavigationItem>
                  )}
                </ul>
              </div>
            )}

            {(showUserRead ||
              showRoleManage ||
              showClassificationLevelManage ||
              showNoteTypeManage ||
              showAnalyticsManage ||
              showManufacturersSeriesAndVariantsManage) && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Admin</p>

                <ul>
                  {(showNoteTypeManage ||
                    showClassificationLevelManage ||
                    showAnalyticsManage) && (
                    <NavigationItem href="/app/settings" icon={<FaCog />}>
                      Einstellungen
                    </NavigationItem>
                  )}

                  {showRoleManage && (
                    <NavigationItem href="/app/roles" icon={<FaLock />}>
                      Rollen
                    </NavigationItem>
                  )}

                  {showManufacturersSeriesAndVariantsManage && (
                    <NavigationItem
                      href="/app/fleet/settings/manufacturer"
                      icon={<FaCog />}
                    >
                      Schiffe
                    </NavigationItem>
                  )}

                  {showUserRead && (
                    <NavigationItem href="/app/users" icon={<FaUsers />}>
                      Benutzer
                    </NavigationItem>
                  )}
                </ul>
              </div>
            )}

            <RedBar />
          </nav>
        </div>
      </div>

      <Footer className="px-8 py-4" />
    </div>
  );
};

interface NavigationItemProps {
  href: string;
  icon: ReactElement;
  children: ReactNode;
}

const NavigationItem = ({ href, icon, children }: NavigationItemProps) => {
  const _icon = cloneElement(icon, {
    // @ts-expect-error
    className: "text-neutral-500",
  });

  return (
    <li>
      <Link
        href={href}
        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
      >
        {_icon}
        {children}
      </Link>
    </li>
  );
};
