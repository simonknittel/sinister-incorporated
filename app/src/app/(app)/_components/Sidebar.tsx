import Link from "next/link";
import {
  FaCalendarDay,
  FaCog,
  FaHome,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiDashboardFill, RiSpaceShipFill, RiSwordFill } from "react-icons/ri";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import Account from "./Account";

const Sidebar = async () => {
  const authentication = await authenticate();

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Account />

        <nav className="p-4 border-neutral-800">
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

            {authentication &&
              authentication.authorize([
                {
                  resource: "event",
                  operation: "read",
                },
              ]) && (
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

            {authentication &&
              authentication.authorize([
                {
                  resource: "operation",
                  operation: "manage",
                },
              ]) && (
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

          {authentication &&
            authentication.authorize([
              {
                resource: "orgFleet",
                operation: "read",
              },
              {
                resource: "ship",
                operation: "manage",
              },
              {
                resource: "manufacturersSeriesAndVariants",
                operation: "manage",
              },
            ]) && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Flotte</p>

                <ul>
                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "orgFleet",
                        operation: "read",
                      },
                    ]) && (
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

                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "ship",
                        operation: "manage",
                      },
                    ]) && (
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

                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "manufacturersSeriesAndVariants",
                        operation: "manage",
                      },
                    ]) && (
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

          {authentication &&
            authentication.authorize([
              {
                resource: "citizen",
                operation: "read",
              },
              {
                resource: "noteType",
                operation: "manage",
              },
            ]) && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

                <ul>
                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "citizen",
                        operation: "read",
                      },
                    ]) && (
                      <>
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
                      </>
                    )}

                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "noteType",
                        operation: "manage",
                      },
                    ]) && (
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

          {authentication &&
            authentication.authorize([
              {
                resource: "user",
                operation: "read",
              },
              {
                resource: "role",
                operation: "manage",
              },
              {
                resource: "classificationLevel",
                operation: "manage",
              },
              {
                resource: "analytics",
                operation: "manage",
              },
            ]) && (
              <div className="mt-4">
                <p className="ml-4 text-neutral-500 mt-4">Admin</p>

                <ul>
                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "user",
                        operation: "read",
                      },
                    ]) && (
                      <li>
                        <Link
                          href="/users"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        >
                          <FaUsers />
                          Benutzer
                        </Link>
                      </li>
                    )}

                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "role",
                        operation: "manage",
                      },
                    ]) && (
                      <li>
                        <Link
                          href="/settings"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        >
                          <FaCog />
                          Rollen
                        </Link>
                      </li>
                    )}

                  {authentication &&
                    authentication.authorize([
                      {
                        resource: "classificationLevel",
                        operation: "manage",
                      },
                      {
                        resource: "analytics",
                        operation: "manage",
                      },
                    ]) && (
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
