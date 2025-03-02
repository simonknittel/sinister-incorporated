import { requireAuthentication } from "@/auth/server";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
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
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { RxActivityLog } from "react-icons/rx";
import { TbMilitaryRank } from "react-icons/tb";
import { Chip } from "../Chip";
import { CmdKLoader } from "../CmdK/CmdKLoader";
import { Footer } from "../Footer";
import { Link } from "../Link";
import { Account } from "./Account";
import { RedBar } from "./RedBar";

export const DesktopSidebar = async () => {
  const authentication = await requireAuthentication();
  const showSpynet =
    (await authentication.authorize("citizen", "read")) ||
    (await authentication.authorize("organization", "read"));
  const showOperations =
    (await getUnleashFlag("EnableOperations")) &&
    (await authentication.authorize("operation", "manage"));
  const showShipManage = await authentication.authorize("ship", "manage");
  const showOrgFleetRead = await authentication.authorize("orgFleet", "read");
  const showCitizenRead = await authentication.authorize("citizen", "read");
  const showUserRead = await authentication.authorize("user", "read");
  const showOrganizationRead = await authentication.authorize(
    "organization",
    "read",
  );
  const showRoleManage = await authentication.authorize("role", "manage");
  const showClassificationLevelManage = await authentication.authorize(
    "classificationLevel",
    "manage",
  );
  const showNoteTypeManage = await authentication.authorize(
    "noteType",
    "manage",
  );
  const showAnalyticsManage = await authentication.authorize(
    "analytics",
    "manage",
  );
  const showManufacturersSeriesAndVariantsManage =
    await authentication.authorize("manufacturersSeriesAndVariants", "manage");
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
  const showSpynetActivity = await authentication.authorize(
    "spynetActivity",
    "read",
  );
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
  const showPenaltyPoints = await authentication.authorize(
    "penaltyEntry",
    "create",
  );
  const showSilc = await authentication.authorize(
    "silcBalanceOfOtherCitizen",
    "read",
  );

  const disableAlgolia = (await getUnleashFlag("DisableAlgolia")) || false;

  return (
    <>
      {/* <GlobalAlert /> */}

      <div className="bg-neutral-800/50 flex flex-col justify-between rounded-2xl overflow-auto">
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
              <li>
                <Link
                  href="/app"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                >
                  <FaHome className="text-neutral-500" />
                  Dashboard
                </Link>
              </li>

              {showSpynet && (
                <li>
                  <Link
                    href="/app/spynet"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <RiSpyFill className="text-neutral-500" />
                    Spynet
                  </Link>
                </li>
              )}

              {showOperations && (
                <li>
                  <Link
                    href="/app/operations"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <RiSwordFill className="text-neutral-500" />
                    Operationen
                    <Chip title="Proof of Concept">PoC</Chip>
                  </Link>
                </li>
              )}

              {/* <li>
              <Link
                href="/app/preview-channel"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
              >
                <FaClock className="text-neutral-500" />
                Preview Channel
              </Link>
            </li> */}

              {(showOrgFleetRead || showShipManage) && (
                <li>
                  <Link
                    href="/app/fleet"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <MdWorkspaces className="text-neutral-500" />
                    Flotte
                  </Link>
                </li>
              )}

              <li>
                <Link
                  href="/app/documents"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                >
                  <IoDocuments className="text-neutral-500" />
                  Dokumente
                </Link>
              </li>

              {showCareer && (
                <li>
                  <Link
                    href="/app/career"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <TbMilitaryRank className="text-neutral-500" />
                    Karriere
                  </Link>
                </li>
              )}

              {showSilc && (
                <li>
                  <Link
                    href="/app/silc"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <FaPiggyBank className="text-neutral-500" />
                    SILC
                  </Link>
                </li>
              )}

              {showPenaltyPoints && (
                <li>
                  <Link
                    href="/app/penalty-points"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <FaScaleBalanced className="text-neutral-500" />
                    Strafpunkte
                  </Link>
                </li>
              )}

              <li>
                <Link
                  href="/app/changelog"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                >
                  <FaCodePullRequest className="text-neutral-500" />
                  Changelog
                </Link>
              </li>
            </ul>

            {showSpynetAdmin && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

                <ul>
                  {showSpynetActivity && (
                    <li>
                      <Link
                        href="/app/spynet/activity"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <RxActivityLog className="text-neutral-500" />
                        Aktivität
                      </Link>
                    </li>
                  )}

                  {showSpynetCitizen && (
                    <li>
                      <Link
                        href="/app/spynet/citizen"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaTable className="text-neutral-500" />
                        Citizen
                      </Link>
                    </li>
                  )}

                  {showSpynetNotes && (
                    <li>
                      <Link
                        href="/app/spynet/notes"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaTable className="text-neutral-500" />
                        Notizen
                      </Link>
                    </li>
                  )}

                  {showSpynetOther && (
                    <li>
                      <Link
                        href="/app/spynet/other"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaTable className="text-neutral-500" />
                        Sonstige
                      </Link>
                    </li>
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
                    <li>
                      <Link
                        href="/app/settings"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaCog className="text-neutral-500" />
                        Einstellungen
                      </Link>
                    </li>
                  )}

                  {showRoleManage && (
                    <li>
                      <Link
                        href="/app/roles"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaLock className="text-neutral-500" />
                        Rollen
                      </Link>
                    </li>
                  )}

                  {showManufacturersSeriesAndVariantsManage && (
                    <li>
                      <Link
                        href="/app/fleet/settings/manufacturer"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaCog className="text-neutral-500" />
                        Schiffe
                      </Link>
                    </li>
                  )}
                  {showUserRead && (
                    <li>
                      <Link
                        href="/app/users"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                      >
                        <FaUsers className="text-neutral-500" />
                        Benutzer
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <RedBar />
          </nav>
        </div>
      </div>

      <Footer className="px-8 py-4" />
    </>
  );
};
