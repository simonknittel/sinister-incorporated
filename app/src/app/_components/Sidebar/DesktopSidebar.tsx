import clsx from "clsx";
import Link from "next/link";
import { FaCog, FaHome, FaLock, FaTable, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { requireAuthentication } from "../../../lib/auth/server";
import { dedupedGetUnleashFlag } from "../../../lib/getUnleashFlag";
import { Chip } from "../Chip";
import { CmdKLoader } from "../CmdK/CmdKLoader";
import { Footer } from "../Footer";
import { Account } from "./Account";
import { RedBar } from "./RedBar";

export const DesktopSidebar = async () => {
  const authentication = await requireAuthentication();

  const showSpynet =
    authentication.authorize("citizen", "read") ||
    authentication.authorize("organization", "read");

  const showOperations =
    (await dedupedGetUnleashFlag("EnableOperations")) &&
    authentication.authorize("operation", "manage");

  const disableAlgolia =
    (await dedupedGetUnleashFlag("DisableAlgolia")) || false;

  return (
    <>
      {/* <GlobalAlert /> */}

      <div className="bg-neutral-800/50 flex flex-col justify-between rounded-2xl overflow-auto">
        <div>
          <Account />

          <div className="flex justify-evenly items-center mt-4">
            <CmdKLoader disableAlgolia={disableAlgolia} />

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

              {(authentication.authorize("orgFleet", "read") ||
                authentication.authorize("ship", "manage")) && (
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
            </ul>

            {authentication.authorize("citizen", "read") && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

                <ul>
                  {authentication.authorize("citizen", "read") && (
                    <>
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

                      <li>
                        <Link
                          href="/app/spynet/notes"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                        >
                          <FaTable />
                          Notizen
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/app/spynet/other"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 active:bg-neutral-700 rounded"
                        >
                          <FaTable />
                          Sonstige
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {(authentication.authorize("user", "read") ||
              authentication.authorize("role", "manage") ||
              authentication.authorize("classificationLevel", "manage") ||
              authentication.authorize("noteType", "manage") ||
              authentication.authorize("analytics", "manage") ||
              authentication.authorize(
                "manufacturersSeriesAndVariants",
                "manage",
              )) && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Admin</p>

                <ul>
                  {(authentication.authorize("noteType", "manage") ||
                    authentication.authorize("classificationLevel", "manage") ||
                    authentication.authorize("analytics", "manage")) && (
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

                  {authentication.authorize("role", "manage") && (
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

                  {authentication.authorize(
                    "manufacturersSeriesAndVariants",
                    "manage",
                  ) && (
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
                  {authentication.authorize("user", "read") && (
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

        <Footer className="px-8 pb-4 pt-0" />
      </div>
    </>
  );
};
