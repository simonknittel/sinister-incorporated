import Link from "next/link";
import { FaCog, FaHome, FaLock, FaTable, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { requireAuthentication } from "../../lib/auth/server";
import { getUnleashFlag } from "../../lib/getUnleashFlag";
import Account from "./Account";
import { Chip } from "./Chip";
import { CmdKLoader } from "./CmdK/CmdKLoader";
import { Footer } from "./Footer";

export const Sidebar = async () => {
  const authentication = await requireAuthentication();

  const showSpynet =
    authentication.authorize("citizen", "read") ||
    authentication.authorize("organization", "read");

  const showOperations =
    (await getUnleashFlag("EnableOperations")) &&
    authentication.authorize("operation", "manage");

  const disableAlgolia = await getUnleashFlag("DisableAlgolia");

  return (
    <>
      {/* <GlobalAlert /> */}

      <div className="bg-neutral-800/80 lg:bg-neutral-800/50 backdrop-blur lg:backdrop-blur-none shadow flex flex-col justify-between lg:rounded-2xl overflow-auto">
        <div>
          <Account />

          <CmdKLoader
            disableAlgolia={disableAlgolia}
            className="hidden lg:block mt-4 mx-auto"
          />

          <nav className="p-4 border-neutral-800">
            <ul>
              <li>
                <Link
                  href="/app"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  prefetch={false}
                >
                  <FaHome />
                  Dashboard
                </Link>
              </li>

              {showSpynet && (
                <li>
                  <Link
                    href="/app/spynet"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    prefetch={false}
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
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    prefetch={false}
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
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                prefetch={false}
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
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    prefetch={false}
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
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                          prefetch={false}
                        >
                          <FaTable />
                          Citizen
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/app/spynet/notes"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                          prefetch={false}
                        >
                          <FaTable />
                          Notizen
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/app/spynet/other"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                          prefetch={false}
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
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
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
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
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
                        href="/app/fleet/settings"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
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
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
                      >
                        <FaUsers />
                        Benutzer
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </nav>
        </div>

        <Footer className="px-8 pb-4 pt-0" />
      </div>
    </>
  );
};
