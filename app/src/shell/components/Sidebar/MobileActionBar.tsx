import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import clsx from "clsx";
import { AiFillAppstore, AiOutlineForm } from "react-icons/ai";
import { FaHome, FaLock, FaPiggyBank } from "react-icons/fa";
import { FaCodePullRequest, FaScaleBalanced } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdTaskAlt, MdWorkspaces } from "react-icons/md";
import { RiSpyFill } from "react-icons/ri";
import { TbMilitaryRank } from "react-icons/tb";
import { Footer } from "../Footer";
import { Account } from "./Account";
import { MobileActionBarFlyout } from "./MobileActionBarFlyout";
import { RedBar } from "./RedBar";
import { TasksBadge } from "./TasksBadge";

interface Props {
  readonly className?: string;
}

export const MobileActionBar = async ({ className }: Props) => {
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
  const [showPenaltyPoints, showSilc, showTasks] = await Promise.all([
    authentication.authorize("penaltyEntry", "create"),
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("task", "read"),
  ]);

  return (
    <div
      className={clsx(
        className,
        "fixed z-40 left-0 right-0 bottom-0 h-16 shadow bg-neutral-800",
      )}
    >
      <nav className="h-full">
        <ul className="h-full flex justify-evenly">
          <li className="h-full py-1">
            <Link
              href="/app"
              className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded-secondary"
            >
              <FaHome className="text-xl text-neutral-500" />
              <span className="text-xs">Dashboard</span>
            </Link>
          </li>

          {showTasks && (
            <li className="h-full py-1">
              <Link
                href="/app/tasks"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded-secondary"
              >
                <div className="flex">
                  <MdTaskAlt className="text-xl text-neutral-500" />
                  <TasksBadge className="scale-75" />
                </div>
                <span className="text-xs">Tasks</span>
              </Link>
            </li>
          )}

          {((await authentication.authorize("orgFleet", "read")) ||
            (await authentication.authorize("ship", "manage"))) && (
            <li className="h-full py-1">
              <Link
                href="/app/fleet"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded-secondary"
              >
                <MdWorkspaces className="text-xl text-neutral-500" />
                <span className="text-xs">Flotte</span>
              </Link>
            </li>
          )}

          {showCareer && (
            <li className="h-full py-1">
              <Link
                href="/app/career"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded-secondary"
              >
                <TbMilitaryRank className="text-xl text-neutral-500" />
                <span className="text-xs">Karriere</span>
              </Link>
            </li>
          )}

          <li className="h-full py-1">
            <MobileActionBarFlyout>
              <Account />

              <div className="p-4 relative" data-red-bar-container>
                <ul>
                  <li>
                    <Link
                      href="/app"
                      className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                    >
                      <FaHome className="text-neutral-500" />
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/app/apps"
                      className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                    >
                      <AiFillAppstore className="text-neutral-500" />
                      Apps
                    </Link>
                  </li>

                  {showTasks && (
                    <li>
                      <Link
                        href="/app/tasks"
                        className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                      >
                        <MdTaskAlt className="text-neutral-500" />
                        Tasks
                        <TasksBadge />
                      </Link>
                    </li>
                  )}

                  {showSpynet && (
                    <li>
                      <Link
                        href="/app/spynet"
                        className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                      >
                        <RiSpyFill className="text-neutral-500" />
                        Spynet
                      </Link>
                    </li>
                  )}

                  {((await authentication.authorize("orgFleet", "read")) ||
                    (await authentication.authorize("ship", "manage"))) && (
                    <li>
                      <Link
                        href="/app/fleet"
                        className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                      >
                        <MdWorkspaces className="text-neutral-500" />
                        Flotte
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      href="/app/documents"
                      className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                    >
                      <IoDocuments className="text-neutral-500" />
                      Dokumente
                    </Link>
                  </li>

                  {showCareer && (
                    <li>
                      <Link
                        href="/app/career"
                        className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                      >
                        <TbMilitaryRank className="text-neutral-500" />
                        Karriere
                      </Link>
                    </li>
                  )}

                  {showPenaltyPoints && (
                    <li>
                      <Link
                        href="/app/penalty-points"
                        className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                      >
                        <FaScaleBalanced className="text-neutral-500" />
                        Strafpunkte
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      href="/app/changelog"
                      className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                    >
                      <FaCodePullRequest className="text-neutral-500" />
                      Changelog
                    </Link>
                  </li>
                </ul>

                <div className="mt-4">
                  <p className="ml-4 text-neutral-500 mt-4">Economics</p>

                  <ul>
                    <li>
                      <Link
                        href="/app/silo-request"
                        className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                      >
                        <AiOutlineForm className="text-neutral-500" />
                        SILO-Anfrage
                      </Link>
                    </li>

                    {showSilc && (
                      <li>
                        <Link
                          href="/app/silc"
                          className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                        >
                          <FaPiggyBank className="text-neutral-500" />
                          SILC
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>

                {((await authentication.authorize("user", "read")) ||
                  (await authentication.authorize("role", "manage"))) && (
                  <div className="mt-4">
                    <p className="ml-4 text-neutral-500 mt-4">Admin</p>

                    <ul>
                      {((await authentication.authorize("role", "manage")) ||
                        (await authentication.authorize("user", "read"))) && (
                        <li>
                          <Link
                            href="/app/iam"
                            className="flex gap-2 items-center p-2 active:bg-neutral-700 rounded-secondary"
                          >
                            <FaLock className="text-neutral-500" />
                            IAM
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <RedBar />
              </div>

              <Footer className="px-8 pb-4 pt-0" />
            </MobileActionBarFlyout>
          </li>
        </ul>
      </nav>
    </div>
  );
};
