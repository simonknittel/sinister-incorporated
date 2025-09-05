import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Command } from "cmdk";
import { signOut } from "next-auth/react";
import { AiFillAppstore, AiOutlineForm } from "react-icons/ai";
import { FaHome, FaLock, FaPiggyBank, FaTools, FaUser } from "react-icons/fa";
import { FaCodePullRequest, FaScaleBalanced } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdEvent, MdTaskAlt, MdWorkspaces } from "react-icons/md";
import { RiLogoutCircleRLine, RiSpyFill } from "react-icons/ri";
import { TbMilitaryRank } from "react-icons/tb";
import { useCmdKContext } from "./CmdKContext";
import { CornerstoneImageBrowserPage } from "./CornerstoneImageBrowserPage";
import { CommandItem, LinkItem, PageItem } from "./Item";
import { SpynetSearchPage } from "./SpynetSearchPage";

export const List = () => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Forbidden");

  const { setOpen, search, setSearch, pages, setPages, disableAlgolia } =
    useCmdKContext();

  const showCitizenRead = authentication.authorize("citizen", "read");
  const showOrganizationRead = authentication.authorize("organization", "read");
  const showOrgFleetRead = authentication.authorize("orgFleet", "read");
  const showShipManage = authentication.authorize("ship", "manage");
  const showUserRead = authentication.authorize("user", "read");
  const showRoleManage = authentication.authorize("role", "manage");
  const showTasks = authentication.authorize("task", "read");
  const showCareer =
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "security",
      },
    ]) ||
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "economic",
      },
    ]) ||
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "management",
      },
    ]) ||
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "team",
      },
    ]);
  const showSilc = authentication.authorize(
    "silcBalanceOfOtherCitizen",
    "read",
  );
  const showPenaltyPoints = authentication.authorize("penaltyEntry", "create");
  const showLogAnalyzer = authentication.authorize("logAnalyzer", "read");
  const eventRead = authentication.authorize("event", "read");

  const showSpynet = showCitizenRead || showOrganizationRead;
  const page = pages[pages.length - 1];

  return (
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

          <LinkItem
            label="Apps"
            icon={<AiFillAppstore />}
            href="/app/apps"
            setOpen={setOpen}
            setSearch={setSearch}
          />

          {eventRead && (
            <LinkItem
              label="Events"
              keywords={["Events", "Veranstaltungen"]}
              icon={<MdEvent />}
              href="/app/events"
              setOpen={setOpen}
              setSearch={setSearch}
            />
          )}

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

          <LinkItem
            label="SILO-Anfrage"
            icon={<AiOutlineForm />}
            href="/app/silo-request"
            setOpen={setOpen}
            setSearch={setSearch}
          />

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
            href="/app/dogfight-trainer"
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

          {(showUserRead || showRoleManage) && (
            <>
              {showRoleManage && (
                <>
                  <LinkItem
                    label="Rollen"
                    keywords={["Berechtigungen", "Permissions"]}
                    icon={<FaLock />}
                    section="IAM"
                    href="/app/iam/roles"
                    setOpen={setOpen}
                    setSearch={setSearch}
                  />
                  <LinkItem
                    label="Berechtigungsmatrix"
                    keywords={["Berechtigungen", "Permissions"]}
                    icon={<FaLock />}
                    section="IAM"
                    href="/app/iam/permission-matrix"
                    setOpen={setOpen}
                    setSearch={setSearch}
                  />
                </>
              )}

              {showUserRead && (
                <LinkItem
                  label="Benutzer"
                  keywords={["Users"]}
                  icon={<FaLock />}
                  section="IAM"
                  href="/app/iam/users"
                  setOpen={setOpen}
                  setSearch={setSearch}
                />
              )}
            </>
          )}

          <LinkItem
            label="Account"
            icon={<FaUser />}
            href="/app/account"
            setOpen={setOpen}
            setSearch={setSearch}
          />

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
        <CornerstoneImageBrowserPage setOpen={setOpen} setSearch={setSearch} />
      )}
    </Command.List>
  );
};
