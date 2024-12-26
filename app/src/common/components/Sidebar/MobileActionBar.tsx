import { requireAuthentication } from "@/auth/server";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import clsx from "clsx";
import Link from "next/link";
import { FaCog, FaHome, FaLock, FaTable, FaUsers } from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { TbMilitaryRank } from "react-icons/tb";
import { Chip } from "../Chip";
import { Footer } from "../Footer";
import { Account } from "./Account";
import { MobileActionBarFlyout } from "./MobileActionBarFlyout";
import { RedBar } from "./RedBar";

type Props = Readonly<{
  className?: string;
}>;

export const MobileActionBar = async ({ className }: Props) => {
  const authentication = await requireAuthentication();

  const showSpynet =
    (await authentication.authorize("citizen", "read")) ||
    (await authentication.authorize("organization", "read"));
  const showOperations =
    (await dedupedGetUnleashFlag("EnableOperations")) &&
    (await authentication.authorize("operation", "manage"));
  const showDocuments =
    (await authentication.authorize(
      "documentIntroductionCompendium",
      "read",
    )) || (await authentication.authorize("documentAllianceManifest", "read"));
  const showCareerRead = await authentication.authorize("career", "read");

  return (
    <div
      className={clsx(
        className,
        "fixed z-40 left-0 right-0 bottom-0 h-16 shadow bg-neutral-800",
      )}
    >
      <nav className="h-full">
        <ul className="h-full flex justify-evenly">
          <li className="h-full py-1">
            <Link
              href="/app"
              className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
            >
              <FaHome className="text-xl" />
              <span className="text-xs">Dashboard</span>
            </Link>
          </li>

          {showSpynet && (
            <li className="h-full py-1">
              <Link
                href="/app/spynet"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
              >
                <RiSpyFill className="text-xl" />
                <span className="text-xs">Spynet</span>
              </Link>
            </li>
          )}

          {showOperations && (
            <li className="h-full py-1">
              <Link
                href="/app/operations"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
              >
                <RiSwordFill className="text-xl" />
                <span className="text-xs">Operationen</span>
                <Chip title="Proof of Concept">PoC</Chip>
              </Link>
            </li>
          )}

          {((await authentication.authorize("orgFleet", "read")) ||
            (await authentication.authorize("ship", "manage"))) && (
            <li className="h-full py-1">
              <Link
                href="/app/fleet"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
              >
                <MdWorkspaces className="text-xl" />
                <span className="text-xs">Flotte</span>
              </Link>
            </li>
          )}

          {showDocuments && (
            <li className="h-full py-1">
              <Link
                href="/app/documents"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
              >
                <IoDocuments className="text-xl" />
                <span className="text-xs">Dokumente</span>
              </Link>
            </li>
          )}

          {showCareerRead && (
            <li className="h-full py-1">
              <Link
                href="/app/documents"
                className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
              >
                <TbMilitaryRank className="text-xl" />
                <span className="text-xs">Karriere</span>
              </Link>
            </li>
          )}

          <li className="h-full py-1">
            <MobileActionBarFlyout>
              <Account />

              {/* <div className="flex justify-evenly items-center mt-4">
                <InstallPWA />
              </div> */}

              <div className="p-4 relative" data-red-bar-container>
                <ul>
                  <li>
                    <Link
                      href="/app"
                      className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                    >
                      <FaHome />
                      Dashboard
                    </Link>
                  </li>

                  {showSpynet && (
                    <li>
                      <Link
                        href="/app/spynet"
                        className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
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
                        className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
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
                className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
              >
                <FaClock />
                Preview Channel
              </Link>
            </li> */}

                  {((await authentication.authorize("orgFleet", "read")) ||
                    (await authentication.authorize("ship", "manage"))) && (
                    <li>
                      <Link
                        href="/app/fleet"
                        className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                      >
                        <MdWorkspaces />
                        Flotte
                      </Link>
                    </li>
                  )}

                  {showDocuments && (
                    <li>
                      <Link
                        href="/app/documents"
                        className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                      >
                        <IoDocuments />
                        Dokumente
                      </Link>
                    </li>
                  )}

                  {showCareerRead && (
                    <li>
                      <Link
                        href="/app/documents"
                        className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                      >
                        <TbMilitaryRank />
                        Karriere
                        <Chip title="Proof of Concept">PoC</Chip>
                      </Link>
                    </li>
                  )}
                </ul>

                {(await authentication.authorize("citizen", "read")) && (
                  <div className="mt-4">
                    <p className="ml-4 text-neutral-500 mt-4">Spynet</p>

                    <ul>
                      {(await authentication.authorize("citizen", "read")) && (
                        <>
                          <li>
                            <Link
                              href="/app/spynet/citizen"
                              className={clsx(
                                "flex gap-2 items-center p-4 active:bg-neutral-700 rounded",
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
                              className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                            >
                              <FaTable />
                              Notizen
                            </Link>
                          </li>

                          <li>
                            <Link
                              href="/app/spynet/other"
                              className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
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

                {((await authentication.authorize("user", "read")) ||
                  (await authentication.authorize("role", "manage")) ||
                  (await authentication.authorize(
                    "classificationLevel",
                    "manage",
                  )) ||
                  (await authentication.authorize("noteType", "manage")) ||
                  (await authentication.authorize("analytics", "manage")) ||
                  (await authentication.authorize(
                    "manufacturersSeriesAndVariants",
                    "manage",
                  ))) && (
                  <div className="mt-4">
                    <p className="ml-4 text-neutral-500 mt-4">Admin</p>

                    <ul>
                      {((await authentication.authorize(
                        "noteType",
                        "manage",
                      )) ||
                        (await authentication.authorize(
                          "classificationLevel",
                          "manage",
                        )) ||
                        (await authentication.authorize(
                          "analytics",
                          "manage",
                        ))) && (
                        <li>
                          <Link
                            href="/app/settings"
                            className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                          >
                            <FaCog />
                            Einstellungen
                          </Link>
                        </li>
                      )}

                      {(await authentication.authorize("role", "manage")) && (
                        <li>
                          <Link
                            href="/app/roles"
                            className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                          >
                            <FaLock />
                            Rollen
                          </Link>
                        </li>
                      )}

                      {(await authentication.authorize(
                        "manufacturersSeriesAndVariants",
                        "manage",
                      )) && (
                        <li>
                          <Link
                            href="/app/fleet/settings/manufacturer"
                            className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
                          >
                            <FaCog />
                            Schiffe
                          </Link>
                        </li>
                      )}
                      {(await authentication.authorize("user", "read")) && (
                        <li>
                          <Link
                            href="/app/users"
                            className="flex gap-2 items-center p-4 active:bg-neutral-700 rounded"
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
              </div>

              <Footer className="px-8 pb-4 pt-0" />
            </MobileActionBarFlyout>
          </li>
        </ul>
      </nav>
    </div>
  );
};
