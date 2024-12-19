import { useAuthentication } from "@/auth/client";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { FaCog, FaHome, FaLock, FaSearch, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill } from "react-icons/ri";
import "./CmdK.css";
import { SpynetSearchPage } from "./SpynetSearchPage";

type Props = Readonly<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  disableAlgolia: boolean;
}>;

export const CmdK = ({ open, setOpen, disableAlgolia }: Props) => {
  const authentication = useAuthentication();
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [pages, setPages] = useState<Array<string>>([]);

  useEffect(() => {
    const down: EventListener = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  if (!authentication) return null;

  const page = pages[pages.length - 1];

  const showSpynet =
    authentication.authorize("citizen", "read") ||
    authentication.authorize("organization", "read");

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      overlayClassName="cmdk"
      contentClassName="cmdk"
      onKeyDown={(e) => {
        if (pages.length === 0) return;

        if (e.key === "Escape") {
          e.preventDefault();
          setPages((pages) => pages.slice(0, -1));
          setSearch("");
        }
      }}
      shouldFilter={page !== "spynet-search"}
    >
      <Command.Input value={search} onValueChange={setSearch} placeholder="" />

      <Command.List>
        {!page && (
          <>
            <Command.Group heading="Dashboard">
              <Command.Item
                keywords={["Dashboard", "Startseite", "Homepage"]}
                onSelect={() => {
                  router.push("/app");
                  setOpen(false);
                  setSearch("");
                }}
              >
                <FaHome />
                Öffnen
              </Command.Item>
            </Command.Group>

            {(authentication.authorize("orgFleet", "read") ||
              authentication.authorize("ship", "manage")) && (
              <Command.Group heading="Flotte">
                <Command.Item
                  keywords={["Flotte", "Fleet", "Schiffe", "Ships", "Overview"]}
                  onSelect={() => {
                    router.push("/app/fleet");
                    setOpen(false);
                    setSearch("");
                  }}
                  value="fleet_overview"
                >
                  <MdWorkspaces />
                  Übersicht öffnen
                </Command.Item>
              </Command.Group>
            )}

            {showSpynet && (
              <Command.Group heading="Spynet">
                {!disableAlgolia && (
                  <Command.Item
                    keywords={["Spynet", "Search"]}
                    onSelect={() => {
                      setPages(() => [...pages, "spynet-search"]);
                      setSearch("");
                    }}
                  >
                    <FaSearch />
                    Suchen
                  </Command.Item>
                )}

                <Command.Item
                  keywords={["Spynet", "Overview"]}
                  onSelect={() => {
                    router.push("/app/spynet");
                    setOpen(false);
                    setSearch("");
                  }}
                  value="spynet_overview"
                >
                  <RiSpyFill />
                  Übersicht öffnen
                </Command.Item>

                <Command.Item
                  keywords={["Spynet"]}
                  onSelect={() => {
                    router.push(
                      `/app/spynet/entity/${authentication.session.entityId}`,
                    );
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <RiSpyFill />
                  Eigenes Profil öffnen
                </Command.Item>
              </Command.Group>
            )}

            {(authentication.authorize("user", "read") ||
              authentication.authorize("role", "manage") ||
              authentication.authorize("classificationLevel", "manage") ||
              authentication.authorize("noteType", "manage") ||
              authentication.authorize("analytics", "manage") ||
              authentication.authorize(
                "manufacturersSeriesAndVariants",
                "manage",
              )) && (
              <Command.Group heading="Admin">
                {(authentication.authorize("noteType", "manage") ||
                  authentication.authorize("classificationLevel", "manage") ||
                  authentication.authorize("analytics", "manage")) && (
                  <Command.Item
                    keywords={["Admin", "Settings"]}
                    onSelect={() => {
                      router.push("/app/settings");
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <FaCog />
                    Einstellungen öffnen
                  </Command.Item>
                )}

                {authentication.authorize("role", "manage") && (
                  <Command.Item
                    keywords={["Admin", "Berechtigungen"]}
                    onSelect={() => {
                      router.push("/app/roles");
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <FaLock />
                    Rollen öffnen
                  </Command.Item>
                )}

                {authentication.authorize(
                  "manufacturersSeriesAndVariants",
                  "manage",
                ) && (
                  <Command.Item
                    keywords={["Admin", "Ships"]}
                    onSelect={() => {
                      router.push("/app/fleet/settings/manufacturer");
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <FaCog />
                    Schiffe öffnen
                  </Command.Item>
                )}

                {authentication.authorize("user", "read") && (
                  <Command.Item
                    keywords={["Admin", "Users"]}
                    onSelect={() => {
                      router.push("/app/users");
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <FaUsers />
                    Benutzer öffnen
                  </Command.Item>
                )}
              </Command.Group>
            )}
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
      </Command.List>
    </Command.Dialog>
  );
};

export default CmdK;
