import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaCalendarDay, FaCog, FaSearch, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiDashboardFill, RiSpaceShipFill, RiSwordFill } from "react-icons/ri";
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
                href="/events"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
              >
                <FaCalendarDay />
                Events
              </Link>
            </li>

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
          </ul>

          <div className="mt-4">
            <p className="ml-4 text-neutral-500 mt-4">Flotte</p>

            <ul>
              <li>
                <Link
                  href="/fleet"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                >
                  <MdWorkspaces />
                  Übersicht
                </Link>
              </li>

              <li>
                <Link
                  href="/my-ships"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                >
                  <RiSpaceShipFill />
                  Meine Schiffe
                </Link>
              </li>

              <li>
                <Link
                  href="/ships"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                >
                  <FaCog />
                  Hersteller, Serien und Varianten
                </Link>
              </li>
            </ul>
          </div>

          {["leadership", "admin"].includes(session!.user.role) && (
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
              </ul>
            </div>
          )}

          {["leadership", "admin"].includes(session!.user.role) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Leitung</p>

              <ul>
                <li>
                  <Link
                    href="/users"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  >
                    <FaUsers />
                    Mitglieder
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {["admin"].includes(session!.user.role) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Admin</p>

              <ul>
                <li>
                  <Link
                    href="/settings"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  >
                    <FaCog />
                    Settings
                  </Link>
                </li>
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
