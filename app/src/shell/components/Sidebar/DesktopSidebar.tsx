import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import {
  cloneElement,
  Suspense,
  type ReactElement,
  type ReactNode,
} from "react";
import { AiFillAppstore, AiOutlineForm } from "react-icons/ai";
import {
  FaCog,
  FaHome,
  FaLock,
  FaPiggyBank,
  FaTable,
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
import { Account } from "./Account";
import { CollapseToggle } from "./CollapseToggle";
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
    ])) ||
    (await authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "management",
      },
    ])) ||
    (await authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "team",
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
    showLogAnalyzer,
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
    authentication.authorize("logAnalyzer", "read"),
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

  const [disableAlgolia = false, topBarEnabled = false] = await Promise.all([
    getUnleashFlag("DisableAlgolia"),
    getUnleashFlag("EnableTopBar"),
  ]);

  return (
    <div className="overflow-auto pl-2 py-2 group-data-[top-bar-enabled]/top-bar:pt-16">
      {/* <GlobalAlert /> */}

      <div className="background-secondary flex flex-col justify-between rounded-primary">
        <div>
          {!topBarEnabled && <Account isInDesktopSidebar />}

          <div className="flex justify-between items-center mt-4 px-8 group-data-[navigation-collapsed]/navigation:px-0 group-data-[navigation-collapsed]/navigation:justify-center">
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
              showTasks={showTasks}
              showCareer={showCareer}
              showSilc={showSilc}
              showPenaltyPoints={showPenaltyPoints}
              showLogAnalyzer={showLogAnalyzer}
              className="group-data-[navigation-collapsed]/navigation:hidden"
            />

            {/* <InstallPWA /> */}
            <CollapseToggle />
          </div>

          <nav
            className="p-2 border-neutral-800 relative"
            data-red-bar-container
          >
            <ul>
              <NavigationItem href="/app" label="Dashboard" icon={<FaHome />} />

              <NavigationItem
                href="/app/apps"
                label="Apps"
                icon={<AiFillAppstore />}
              />

              {showTasks && (
                <NavigationItem
                  href="/app/tasks"
                  label="Tasks"
                  icon={<MdTaskAlt />}
                >
                  <Suspense>
                    <TasksBadge isInDesktopSidebar />
                  </Suspense>
                </NavigationItem>
              )}

              {showSpynet && (
                <NavigationItem
                  href="/app/spynet"
                  label="Spynet"
                  icon={<RiSpyFill />}
                />
              )}

              {(showOrgFleetRead || showShipManage) && (
                <NavigationItem
                  href="/app/fleet"
                  label="Flotte"
                  icon={<MdWorkspaces />}
                />
              )}

              <NavigationItem
                href="/app/documents"
                label="Dokumente"
                icon={<IoDocuments />}
              />

              {showCareer && (
                <NavigationItem
                  href="/app/career"
                  label="Karriere"
                  icon={<TbMilitaryRank />}
                />
              )}

              {showPenaltyPoints && (
                <NavigationItem
                  href="/app/penalty-points"
                  icon={<FaScaleBalanced />}
                  label="Strafpunkte"
                />
              )}

              <NavigationItem
                href="/app/changelog"
                label="Changelog"
                icon={<FaCodePullRequest />}
              />
            </ul>

            <NavigationSection heading="Economics">
              <NavigationItem
                href="https://forms.gle/mNnrAA6mHF3sh3mm9"
                label="SILO-Anfrage"
                icon={<AiOutlineForm />}
              />

              {showSilc && (
                <NavigationItem
                  href="/app/silc"
                  label="SILC"
                  icon={<FaPiggyBank />}
                />
              )}
            </NavigationSection>

            {showSpynetAdmin && (
              <NavigationSection heading="Spynet">
                {showSpynetActivity && (
                  <NavigationItem
                    href="/app/spynet/activity"
                    label="Aktivität"
                    icon={<RxActivityLog />}
                  />
                )}

                {showSpynetCitizen && (
                  <NavigationItem
                    href="/app/spynet/citizen"
                    label="Citizen"
                    icon={<FaTable />}
                  />
                )}

                {showSpynetNotes && (
                  <NavigationItem
                    href="/app/spynet/notes"
                    label="Notizen"
                    icon={<FaTable />}
                  />
                )}

                {showSpynetOther && (
                  <NavigationItem
                    href="/app/spynet/other"
                    label="Sonstige"
                    icon={<FaTable />}
                  />
                )}
              </NavigationSection>
            )}

            {(showUserRead ||
              showRoleManage ||
              showClassificationLevelManage ||
              showNoteTypeManage ||
              showAnalyticsManage ||
              showManufacturersSeriesAndVariantsManage) && (
              <NavigationSection heading="Admin">
                {(showNoteTypeManage ||
                  showClassificationLevelManage ||
                  showAnalyticsManage) && (
                  <NavigationItem
                    href="/app/settings"
                    label="Einstellungen"
                    icon={<FaCog />}
                  />
                )}

                {showRoleManage && (
                  <NavigationItem
                    href="/app/roles"
                    label="Rollen"
                    icon={<FaLock />}
                  />
                )}

                {showManufacturersSeriesAndVariantsManage && (
                  <NavigationItem
                    href="/app/fleet/settings/manufacturer"
                    label="Schiffe"
                    icon={<FaCog />}
                  />
                )}

                {showUserRead && (
                  <NavigationItem
                    href="/app/users"
                    label="Benutzer"
                    icon={<FaUsers />}
                  />
                )}
              </NavigationSection>
            )}

            <RedBar />
          </nav>
        </div>
      </div>

      <Footer className="p-2 group-data-[navigation-collapsed]/navigation:hidden" />
    </div>
  );
};

interface NavigationItemProps {
  href: string;
  icon: ReactElement;
  label: string;
  children?: ReactNode;
}

const NavigationItem = ({
  href,
  icon,
  label,
  children,
}: NavigationItemProps) => {
  const _icon = cloneElement(icon, {
    // @ts-expect-error
    className: "text-neutral-500",
  });

  return (
    <li>
      <Link
        href={href}
        className="flex gap-2 items-center px-4 py-2 hover:bg-neutral-800 active:bg-neutral-700 rounded-secondary relative"
        title={label}
      >
        {_icon}

        <div className="group-data-[navigation-collapsed]/navigation:hidden">
          {label}
        </div>

        {children}
      </Link>
    </li>
  );
};

interface NavigationSectionProps {
  heading: ReactNode;
  children: ReactNode;
}

const NavigationSection = ({ heading, children }: NavigationSectionProps) => {
  return (
    <div className="mt-4 group-data-[navigation-collapsed]/navigation:mt-0">
      <p className="ml-4 text-neutral-500 mt-4 group-data-[navigation-collapsed]/navigation:hidden">
        {heading}
      </p>

      <div className="hidden group-data-[navigation-collapsed]/navigation:block h-[1px] bg-neutral-500 my-2" />

      <ul>{children}</ul>
    </div>
  );
};
