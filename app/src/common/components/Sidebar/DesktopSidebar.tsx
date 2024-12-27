import { requireAuthentication } from "@/auth/server";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import clsx from "clsx";
import Link from "next/link";
import { FaCog, FaHome, FaLock, FaTable, FaUsers } from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { TbMilitaryRank } from "react-icons/tb";
import { Chip } from "../Chip";
import { CmdKLoader } from "../CmdK/CmdKLoader";
import { Footer } from "../Footer";
import { Account } from "./Account";
import { RedBar } from "./RedBar";

export const DesktopSidebar = async () => {
  const authentication = await requireAuthentication();
  const showSpynet =
    (await authentication.authorize("citizen", "read")) ||
    (await authentication.authorize("organization", "read"));
  const showOperations =
    (await dedupedGetUnleashFlag("EnableOperations")) &&
    (await authentication.authorize("operation", "manage"));
  const showDocuments =
    (await authentication.authorize(
      "documentIntroductionCompendium",
      "read",
    )) || (await authentication.authorize("documentAllianceManifest", "read"));
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
  const showCareerRead = await authentication.authorize("career", "read");
  const showSpynetCitizen =
    showCitizenRead &&
    (await authentication.authorize("spynetCitizen", "read"));
  const showSpynetNotes =
    showCitizenRead && (await authentication.authorize("spynetNotes", "read"));
  const showSpynetOther =
    showCitizenRead && (await authentication.authorize("spynetOther", "read"));

  const disableAlgolia =
    (await dedupedGetUnleashFlag("DisableAlgolia")) || false;

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
                  <FaHome />
                  Dashboard
                </Link>
              </li>

              {showSpynet && (
                <li>
                  <Link
                    href="/app/spynet"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <RiSpyFill />
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
                    <RiSwordFill />
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
                <FaClock />
                Preview Channel
              </Link>
            </li> */}

              {(showOrgFleetRead || showShipManage) && (
                <li>
                  <Link
                    href="/app/fleet"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <MdWorkspaces />
                    Flotte
                  </Link>
                </li>
              )}

              {showDocuments && (
                <li>
                  <Link
                    href="/app/documents"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <IoDocuments />
                    Dokumente
                  </Link>
                </li>
              )}

              {showCareerRead && (
                <li>
                  <Link
                    href="/app/career"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                  >
                    <TbMilitaryRank />
                    Karriere
                    <Chip title="Proof of Concept">PoC</Chip>
                  </Link>
                </li>
              )}
            </ul>

            {(showSpynetCitizen || showSpynetNotes || showSpynetOther) && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

                <ul>
                  {showSpynetCitizen && (
                    <li>
                      <Link
                        href="/app/spynet/citizen"
                        className={clsx(
                          "flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded",
                          // {
                          //   "before:w-[2px] before:h-[2em] before:bg-sinister-red-500 before:absolute before:left-0 relative before:rounded bg-neutral-800":
                          //     true,
                          // },
                        )}
                      >
                        <FaTable />
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
                        <FaTable />
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
                        <FaTable />
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
                        <FaCog />
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
                        <FaLock />
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
                        <FaCog />
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
                        <FaUsers />
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
