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
import { RiSwordFill } from "react-icons/ri";
import { requireAuthentication } from "../../lib/auth/authenticateAndAuthorize";
import { getUnleashFlag } from "../../lib/getUnleashFlag";
import Account from "./Account";
import { Chip } from "./Chip";
import { CmdKLoader } from "./CmdK/CmdKLoader";
import { Footer } from "./Footer";

export const Sidebar = async () => {
  const authentication = await requireAuthentication();

  const showOperations =
    (await getUnleashFlag("EnableOperations")) &&
    authentication.authorize([
      {
        resource: "operation",
        operation: "manage",
      },
    ]);

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Account />

        <CmdKLoader className="hidden lg:block mt-4 mx-auto" />

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

            {showOperations && (
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

            {(authentication.authorize([
              {
                resource: "orgFleet",
                operation: "read",
              },
            ]) ||
              authentication.authorize([
                {
                  resource: "ship",
                  operation: "manage",
                },
              ])) && (
              <li>
                <Link
                  href="/fleet"
                  className="flex gap-2 items-center p-4 hover:bg-neutral-800 rounded"
                  prefetch={false}
                >
                  <MdWorkspaces />
                  Flotte
                </Link>
              </li>
            )}
          </ul>

          {authentication.authorize([
            {
              resource: "citizen",
              operation: "read",
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
              </ul>
            </div>
          )}

          {(authentication.authorize([
            {
              resource: "user",
              operation: "read",
            },
          ]) ||
            authentication.authorize([
              {
                resource: "role",
                operation: "manage",
              },
            ]) ||
            authentication.authorize([
              {
                resource: "classificationLevel",
                operation: "manage",
              },
            ]) ||
            authentication.authorize([
              {
                resource: "noteType",
                operation: "manage",
              },
            ]) ||
            authentication.authorize([
              {
                resource: "analytics",
                operation: "manage",
              },
            ]) ||
            authentication.authorize([
              {
                resource: "manufacturersSeriesAndVariants",
                operation: "manage",
              },
            ])) && (
            <div className="mt-4">
              <p className="ml-4 text-neutral-500 mt-4">Admin</p>

              <ul>
                {(authentication.authorize([
                  {
                    resource: "noteType",
                    operation: "manage",
                  },
                ]) ||
                  authentication.authorize([
                    {
                      resource: "classificationLevel",
                      operation: "manage",
                    },
                  ]) ||
                  authentication.authorize([
                    {
                      resource: "analytics",
                      operation: "manage",
                    },
                  ])) && (
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
                      Schiffe
                    </Link>
                  </li>
                )}
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
              </ul>
            </div>
          )}
        </nav>
      </div>

      <Footer className="px-8 py-4" />
    </div>
  );
};