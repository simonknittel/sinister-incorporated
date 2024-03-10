import Link from "next/link";
import {
  FaCog,
  FaHome,
  FaLock,
  FaSearch,
  FaTable,
  FaUsers,
} from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpaceShipFill, RiSwordFill } from "react-icons/ri";
import { requireAuthentication } from "~/_lib/auth/authenticateAndAuthorize";
import { Footer } from "~/app/_components/Footer";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";
import Account from "./Account";
import { Chip } from "./Chip";

const Sidebar = async () => {
  const authentication = await requireAuthentication();

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
                prefetch={false}
              >
                <FaHome />
                Dashboard
              </Link>
            </li>

            {authentication.authorize([
              {
                resource: "operation",
                operation: "manage",
              },
            ]) && (
              <li>
                <Link
                  href="/operations"
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
                href="/preview-channel"
                className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                prefetch={false}
              >
                <FaClock />
                Preview Channel
              </Link>
            </li> */}
          </ul>

          {authentication.authorize([
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
                {authentication.authorize([
                  {
                    resource: "orgFleet",
                    operation: "read",
                  },
                ]) && (
                  <li>
                    <Link
                      href="/fleet"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                      prefetch={false}
                    >
                      <MdWorkspaces />
                      Übersicht
                    </Link>
                  </li>
                )}

                {authentication.authorize([
                  {
                    resource: "ship",
                    operation: "manage",
                  },
                ]) && (
                  <li>
                    <Link
                      href="/fleet/my-ships"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                      prefetch={false}
                    >
                      <RiSpaceShipFill />
                      Meine Schiffe
                    </Link>
                  </li>
                )}

                {authentication.authorize([
                  {
                    resource: "manufacturersSeriesAndVariants",
                    operation: "manage",
                  },
                ]) && (
                  <li>
                    <Link
                      href="/fleet/settings"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                      prefetch={false}
                    >
                      <FaCog />
                      Einstellungen
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {authentication.authorize([
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
                {authentication.authorize([
                  {
                    resource: "citizen",
                    operation: "read",
                  },
                ]) && (
                  <>
                    <li>
                      {(await getUnleashFlag("DisableAlgolia")) ? (
                        <span className="flex gap-2 items-center p-4 rounded">
                          <span className="line-through text-neutral-500 flex gap-2 items-center">
                            <FaSearch />
                            Suche
                          </span>

                          <Chip>Deaktiviert</Chip>
                        </span>
                      ) : (
                        <Link
                          href="/spynet/search"
                          className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                          prefetch={false}
                        >
                          <FaSearch />
                          Suche
                        </Link>
                      )}
                    </li>

                    <li>
                      <Link
                        href="/spynet/citizen"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
                      >
                        <FaTable />
                        Citizen
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/spynet/notes"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
                      >
                        <FaTable />
                        Notizen
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/spynet/other"
                        className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                        prefetch={false}
                      >
                        <FaTable />
                        Sonstige
                      </Link>
                    </li>
                  </>
                )}

                {authentication.authorize([
                  {
                    resource: "noteType",
                    operation: "manage",
                  },
                ]) && (
                  <li>
                    <Link
                      href="/spynet/settings"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                      prefetch={false}
                    >
                      <FaCog />
                      Einstellungen
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {authentication.authorize([
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
                {authentication.authorize([
                  {
                    resource: "user",
                    operation: "read",
                  },
                ]) && (
                  <li>
                    <Link
                      href="/users"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                      prefetch={false}
                    >
                      <FaUsers />
                      Benutzer
                    </Link>
                  </li>
                )}

                {authentication.authorize([
                  {
                    resource: "role",
                    operation: "manage",
                  },
                ]) && (
                  <li>
                    <Link
                      href="/roles"
                      className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                      prefetch={false}
                    >
                      <FaLock />
                      Rollen
                    </Link>
                  </li>
                )}

                {authentication.authorize([
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
                      prefetch={false}
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

      <Footer className="px-8 py-4" />
    </div>
  );
};

export default Sidebar;
