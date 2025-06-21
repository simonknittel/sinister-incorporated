import { useAuthentication } from "@/auth/hooks/useAuthentication";
import clsx from "clsx";
import { Command } from "cmdk";
import { signOut } from "next-auth/react";
import {
  useEffect,
  useState,
  type Dispatch,
  type MouseEventHandler,
  type SetStateAction,
} from "react";
import {
  FaArrowLeft,
  FaCog,
  FaHome,
  FaLock,
  FaPiggyBank,
  FaTools,
  FaUsers,
} from "react-icons/fa";
import { FaCodePullRequest, FaScaleBalanced } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdTaskAlt, MdWorkspaces } from "react-icons/md";
import { RiLogoutCircleRLine, RiSpyFill } from "react-icons/ri";
import { TbMilitaryRank } from "react-icons/tb";
import "./CmdK.css";
import { CornerstoneImageBrowserPage } from "./CornerstoneImageBrowserPage";
import { CommandItem, LinkItem, PageItem } from "./Item";
import { SpynetSearchPage } from "./SpynetSearchPage";

interface Props {
  readonly open: boolean;
  readonly setOpen: Dispatch<SetStateAction<boolean>>;
  readonly disableAlgolia: boolean;
  readonly showCitizenRead: boolean;
  readonly showOrganizationRead: boolean;
  readonly showOrgFleetRead: boolean;
  readonly showShipManage: boolean;
  readonly showUserRead: boolean;
  readonly showRoleManage: boolean;
  readonly showClassificationLevelManage: boolean;
  readonly showNoteTypeManage: boolean;
  readonly showAnalyticsManage: boolean;
  readonly showManufacturersSeriesAndVariantsManage: boolean;
  readonly showTasks: boolean;
  readonly showCareer: boolean;
  readonly showSilc: boolean;
  readonly showPenaltyPoints: boolean;
  readonly showLogAnalyzer: boolean;
}

export const CmdK = ({
  open,
  setOpen,
  disableAlgolia,
  showCitizenRead,
  showOrganizationRead,
  showOrgFleetRead,
  showShipManage,
  showUserRead,
  showRoleManage,
  showClassificationLevelManage,
  showNoteTypeManage,
  showAnalyticsManage,
  showManufacturersSeriesAndVariantsManage,
  showTasks,
  showCareer,
  showSilc,
  showPenaltyPoints,
  showLogAnalyzer,
}: Props) => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Forbidden");
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const handleBack: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setPages((pages) => pages.slice(0, -1));
  };

  const page = pages[pages.length - 1];

  const showSpynet = showCitizenRead || showOrganizationRead;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      overlayClassName="cmdk"
      contentClassName="cmdk"
      onKeyDown={(e) => {
        if (pages.length === 0) return;

        if (e.key === "Escape" || (e.key === "Backspace" && !search)) {
          e.preventDefault();
          setPages((pages) => pages.slice(0, -1));
        }
      }}
      shouldFilter={page !== "spynet-search"}
      label="Navigation"
    >
      <div className="relative">
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Suche ..."
          className={clsx("p-4", {
            "pl-10": pages.length > 0,
          })}
        />

        {pages.length > 0 && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-700/50 hover:bg-neutral-500/50 focus-visible:bg-neutral-500/50 focus-visible:outline-none p-1 rounded border border-neutral-700 text-xs"
            type="button"
            onClick={handleBack}
          >
            <FaArrowLeft />
          </button>
        )}
      </div>

      <Command.List>
        {!page && (
          <>
            <LinkItem
              label="Dashboard"
              keywords={["Dashboard", "Startseite", "Homepage"]}
              icon={<FaHome />}
              href="/app"
              setOpen={setOpen}
              setSearch={setSearch}
            />

            {showTasks && (
              <LinkItem
                label="Tasks"
                keywords={["Tasks", "Aufgaben", "Quests"]}
                icon={<MdTaskAlt />}
                href="/app/tasks"
                setOpen={setOpen}
                setSearch={setSearch}
              />
            )}

            {(showOrgFleetRead || showShipManage) && (
              <LinkItem
                label="Flotte"
                keywords={["Flotte", "Fleet", "Schiffe", "Ships", "Overview"]}
                icon={<MdWorkspaces />}
                href="/app/fleet"
                setOpen={setOpen}
                setSearch={setSearch}
              />
            )}

            <LinkItem
              label="Dokumente"
              keywords={["Dokumente", "Documents", "Dateien"]}
              icon={<IoDocuments />}
              href="/app/documents"
              setOpen={setOpen}
              setSearch={setSearch}
            />

            {showCareer && (
              <LinkItem
                label="Karriere"
                keywords={["Karriere", "Career", "Laufbahn"]}
                icon={<TbMilitaryRank />}
                href="/app/career"
                setOpen={setOpen}
                setSearch={setSearch}
              />
            )}

            {showSilc && (
              <LinkItem
                label="SILC"
                icon={<FaPiggyBank />}
                href="/app/silc"
                setOpen={setOpen}
                setSearch={setSearch}
              />
            )}

            {showPenaltyPoints && (
              <LinkItem
                label="Strafpunkte"
                keywords={["Strafpunkte", "Penalty Points"]}
                icon={<FaScaleBalanced />}
                href="/app/penalty-points"
                setOpen={setOpen}
                setSearch={setSearch}
              />
            )}

            <LinkItem
              label="Tools"
              icon={<FaTools />}
              href="/app/tools"
              setOpen={setOpen}
              setSearch={setSearch}
            />

            <PageItem
              label="Cornerstone Image Browser"
              icon={<FaTools />}
              section="Tools"
              setPages={() =>
                setPages((pages) => [...pages, "cornerstone-image-browser"])
              }
              setSearch={setSearch}
            />

            {showLogAnalyzer && (
              <LinkItem
                label="Log Analyzer"
                icon={<FaTools />}
                section="Tools"
                href="/app/tools/log-analyzer"
                setOpen={setOpen}
                setSearch={setSearch}
              />
            )}

            <LinkItem
              label="Dogfight Trainer"
              keywords={["Dogfight Trainer", "Asteroids"]}
              icon={<FaTools />}
              section="Tools"
              href="/dogfight-trainer"
              setOpen={setOpen}
              setSearch={setSearch}
            />

            <LinkItem
              label="Changelog"
              keywords={["Changelog", "Updates"]}
              icon={<FaCodePullRequest />}
              href="/app/changelog"
              setOpen={setOpen}
              setSearch={setSearch}
            />

            {showSpynet && (
              <>
                <LinkItem
                  label="Spynet"
                  icon={<RiSpyFill />}
                  href="/app/spynet"
                  setOpen={setOpen}
                  setSearch={setSearch}
                />

                <LinkItem
                  label="Mein Profil"
                  icon={<RiSpyFill />}
                  section="Spynet"
                  href={`/app/spynet/citizen/${authentication.session.entity.id}`}
                  setOpen={setOpen}
                  setSearch={setSearch}
                />

                {!disableAlgolia && (
                  <PageItem
                    label="Profil suchen"
                    icon={<RiSpyFill />}
                    section="Spynet"
                    setPages={() =>
                      setPages((pages) => [...pages, "spynet-search"])
                    }
                    setSearch={setSearch}
                  />
                )}
              </>
            )}

            {(showUserRead ||
              showRoleManage ||
              showClassificationLevelManage ||
              showNoteTypeManage ||
              showAnalyticsManage ||
              showManufacturersSeriesAndVariantsManage) && (
              <>
                {(showNoteTypeManage ||
                  showClassificationLevelManage ||
                  showAnalyticsManage) && (
                  <LinkItem
                    label="Notizarten- und Geheimhaltungsstufen"
                    icon={<FaCog />}
                    section="Admin"
                    href="/app/settings"
                    setOpen={setOpen}
                    setSearch={setSearch}
                  />
                )}

                {showRoleManage && (
                  <>
                    <LinkItem
                      label="Rollen"
                      keywords={["Berechtigungen", "Permissions"]}
                      icon={<FaLock />}
                      section="Admin"
                      href="/app/roles"
                      setOpen={setOpen}
                      setSearch={setSearch}
                    />
                    <LinkItem
                      label="Berechtigungsmatrix"
                      keywords={["Berechtigungen", "Permissions"]}
                      icon={<FaLock />}
                      section="Admin"
                      href="/app/roles/permission-matrix"
                      setOpen={setOpen}
                      setSearch={setSearch}
                    />
                  </>
                )}

                {showManufacturersSeriesAndVariantsManage && (
                  <LinkItem
                    label="Schiffe"
                    icon={<FaCog />}
                    section="Admin"
                    href="/app/fleet/settings/manufacturer"
                    setOpen={setOpen}
                    setSearch={setSearch}
                  />
                )}

                {showUserRead && (
                  <LinkItem
                    label="Benutzer"
                    keywords={["Users"]}
                    icon={<FaUsers />}
                    section="Admin"
                    href="/app/users"
                    setOpen={setOpen}
                    setSearch={setSearch}
                  />
                )}
              </>
            )}

            <CommandItem
              label="Abmelden"
              keywords={["Log out"]}
              icon={<RiLogoutCircleRLine />}
              onSelect={async () => {
                await signOut({
                  callbackUrl: "/",
                });
              }}
            />
          </>
        )}

        {page === "spynet-search" && (
          <SpynetSearchPage
            search={search}
            onSelect={() => {
              setOpen(false);
              setSearch("");
              setPages([]);
            }}
          />
        )}

        {page === "cornerstone-image-browser" && (
          <CornerstoneImageBrowserPage
            setOpen={setOpen}
            setSearch={setSearch}
          />
        )}
      </Command.List>
    </Command.Dialog>
  );
};
