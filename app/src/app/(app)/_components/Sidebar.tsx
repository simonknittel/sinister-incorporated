import Link from "next/link";
import {
  FaCalendarDay,
  FaCog,
  FaHome,
  FaLock,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiDashboardFill, RiSpaceShipFill, RiSwordFill } from "react-icons/ri";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
import Account from "./Account";

const Sidebar = async () => {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Account />

        <nav className="p-4 border-t-2 border-neutral-800">
          <ul>
            <li>
              <Link
                href="/dashboard"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
              >
                <FaHome />
                Dashboard
              </Link>
            </li>

            {(await authenticateAndAuthorize("view-events")) && (
              <li>
                <Link
                  href="/events"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                >
                  <FaCalendarDay />
                  Events
                </Link>
              </li>
            )}

            {(await authenticateAndAuthorize("view-operations")) && (
              <li>
                <Link
                  href="/operations"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                >
                  <RiSwordFill />
                  Operationen
                  <span
                    className="rounded bg-neutral-700 py-1 px-2 text-sm"
                    title="Proof of Concept"
                  >
                    PoC
                  </span>
                </Link>
              </li>
            )}
          </ul>

          {(await authenticateAndAuthorize([
            "view-org-fleet",
            "add-ship",
            "edit-manufacturers-series-and-variants",
          ])) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Flotte</p>

              <ul>
                {(await authenticateAndAuthorize(["view-org-fleet"])) && (
                  <li>
                    <Link
                      href="/fleet"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <MdWorkspaces />
                      Übersicht
                    </Link>
                  </li>
                )}

                {(await authenticateAndAuthorize("add-ship")) && (
                  <li>
                    <Link
                      href="/fleet/my-ships"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <RiSpaceShipFill />
                      Meine Schiffe
                    </Link>
                  </li>
                )}

                {(await authenticateAndAuthorize(
                  "edit-manufacturers-series-and-variants"
                )) && (
                  <li>
                    <Link
                      href="/fleet/settings"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <FaCog />
                      Einstellungen
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {(await authenticateAndAuthorize("view-spynet")) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

              <ul>
                <li>
                  <Link
                    href="/spynet"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  >
                    <RiDashboardFill />
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link
                    href="/spynet/search"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  >
                    <FaSearch />
                    Suche
                  </Link>
                </li>

                {(await authenticateAndAuthorize("spynet-settings")) && (
                  <li>
                    <Link
                      href="/spynet/settings"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <FaCog />
                      Einstellungen
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {(await authenticateAndAuthorize([
            "view-logins",
            "edit-roles-and-permissions",
            "edit-classification-levels",
            "disable-analytics",
          ])) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Admin</p>

              <ul>
                {(await authenticateAndAuthorize("view-logins")) && (
                  <li>
                    <Link
                      href="/logins"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <FaUsers />
                      Logins
                    </Link>
                  </li>
                )}

                {(await authenticateAndAuthorize(
                  "edit-roles-and-permissions"
                )) && (
                  <li>
                    <Link
                      href="/roles"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <FaLock />
                      Rollen und Berechtigungen
                    </Link>
                  </li>
                )}

                {(await authenticateAndAuthorize([
                  "edit-classification-levels",
                  "disable-analytics",
                ])) && (
                  <li>
                    <Link
                      href="/settings"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <FaCog />
                      Einstellungen
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </nav>
      </div>

      <footer className="px-8 py-4 text-center text-neutral-500">
        Sinister Incorporated
      </footer>
    </div>
  );
};

export default Sidebar;
