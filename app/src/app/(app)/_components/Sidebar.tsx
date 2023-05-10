import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaCalendarDay, FaCog, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpaceShipFill } from "react-icons/ri";
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
          </ul>

          <ul>
            <li>
              <Link
                href="/my-ships"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
              >
                <RiSpaceShipFill />
                Meine Schiffe
              </Link>
            </li>
          </ul>

          <ul>
            <li>
              <Link
                href="/fleet"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
              >
                <MdWorkspaces />
                Flotte
              </Link>
            </li>
          </ul>

          {["leadership", "admin"].includes(session!.user.role) && (
            <div className="border-t-2 border-neutral-800 mt-4">
              <p className="p-4 text-neutral-500 mt-4">Leitung</p>

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

                <li>
                  <Link
                    href="/ships"
                    className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  >
                    <RiSpaceShipFill />
                    Schiffe
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {["admin"].includes(session!.user.role) && (
            <div className="border-t-2 border-neutral-800 mt-4">
              <p className="p-4 text-neutral-500 mt-4">Admin</p>

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
