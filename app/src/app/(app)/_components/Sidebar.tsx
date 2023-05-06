import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
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
                href="/fleet"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
              >
                <RiSpaceShipFill />
                Flotte
              </Link>
            </li>
          </ul>

          {["leadership", "admin"].includes(session!.user.role) && (
            <div className="border-t-2 border-neutral-800 mt-4">
              <p className="p-4 text-neutral-500">Leitung</p>

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
            <div className="border-t-2 border-neutral-800 mt-4">
              <p className="p-4 text-neutral-500">Admin</p>

              <ul>
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
        </nav>
      </div>

      <footer className="px-8 py-4 text-center text-neutral-500">
        Sinister Incorporated
      </footer>
    </div>
  );
};

export default Sidebar;
