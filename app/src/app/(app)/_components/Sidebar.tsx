import { getServerSession } from "next-auth";
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
import { authorize } from "~/app/_utils/authorize";
import { authOptions } from "~/server/auth";
import Account from "./Account";

const Sidebar = async () => {
  const session = await getServerSession(authOptions);

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

            {authorize("view-events", session) && (
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

            {authorize("view-operations", session) && (
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

          {authorize(
            [
              "view-org-fleet",
              "add-ship",
              "edit-manufacturers-series-and-variants",
            ],
            session
          ) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Flotte</p>

              <ul>
                {authorize(["view-org-fleet"], session) && (
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

                {authorize("add-ship", session) && (
                  <li>
                    <Link
                      href="/my-ships"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <RiSpaceShipFill />
                      Meine Schiffe
                    </Link>
                  </li>
                )}

                {authorize(
                  "edit-manufacturers-series-and-variants",
                  session
                ) && (
                  <li>
                    <Link
                      href="/ships"
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

          {authorize("view-spynet", session) && (
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

                {authorize("spynet-settings", session) && (
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

          {authorize(
            ["view-logins", "edit-roles-and-permissions", "settings"],
            session
          ) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Admin</p>

              <ul>
                {authorize("view-logins", session) && (
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

                {authorize("edit-roles-and-permissions", session) && (
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

                {authorize("settings", session) && (
                  <li>
                    <Link
                      href="/settings"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                    >
                      <FaCog />
                      Settings
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
