import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import {
  cloneElement,
  Suspense,
  type ReactElement,
  type ReactNode,
} from "react";
import { AiOutlineForm } from "react-icons/ai";
import { FaCog, FaHome, FaLock, FaPiggyBank } from "react-icons/fa";
import { FaCodePullRequest, FaScaleBalanced } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdTaskAlt, MdWorkspaces } from "react-icons/md";
import { RiSpyFill } from "react-icons/ri";
import { TbMilitaryRank } from "react-icons/tb";
import { Footer } from "../Footer";
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
    showUserRead,
    showRoleManage,
    showClassificationLevelManage,
    showNoteTypeManage,
    showAnalyticsManage,
    showPenaltyPoints,
    showSilc,
    showTasks,
  ] = await Promise.all([
    authentication.authorize("ship", "manage"),
    authentication.authorize("orgFleet", "read"),
    authentication.authorize("user", "read"),
    authentication.authorize("role", "manage"),
    authentication.authorize("classificationLevel", "manage"),
    authentication.authorize("noteType", "manage"),
    authentication.authorize("analytics", "manage"),
    authentication.authorize("penaltyEntry", "create"),
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("task", "read"),
  ]);

  return (
    <div className="overflow-auto pl-2 py-2 pt-16">
      {/* <GlobalAlert /> */}

      <div className="background-secondary flex flex-col justify-between rounded-primary">
        <div>
          <div className="flex justify-center items-center mt-4 px-8 group-data-[navigation-collapsed]/navigation:px-0">
            <CollapseToggle />
          </div>

          <nav
            className="p-2 border-neutral-800 relative"
            data-red-bar-container
          >
            <ul>
              <NavigationItem href="/app" label="Dashboard" icon={<FaHome />} />

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
                href="/app/silo-request"
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

            {(showUserRead ||
              showRoleManage ||
              showClassificationLevelManage ||
              showNoteTypeManage ||
              showAnalyticsManage) && (
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

                {(showRoleManage || showUserRead) && (
                  <NavigationItem
                    href="/app/iam"
                    label="IAM"
                    icon={<FaLock />}
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
