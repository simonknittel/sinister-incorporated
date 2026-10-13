import { Tile } from "@/modules/common/components/Tile";
import { getVisibleRoles } from "@/modules/roles/utils/getRoles";
import { getHumanResourcesRoleIds } from "../queries/getHumanResourcesRoleIds";
import { HumanResourcesRolesSettingClient } from "./HumanResourcesRolesSettingClient";

export const HumanResourcesRolesSetting = async () => {
  const [roles, humanResourcesRoleIds] = await Promise.all([
    getVisibleRoles(),
    getHumanResourcesRoleIds(),
  ]);

  return (
    <Tile heading="Human Resources">
      <p className="mb-4 text-sm text-neutral-400">
        Diese Rollen gelten als Human Resources. Neue Mitglieder sehen auf der
        Freigabe-Seite die Handles der Personen mit diesen Rollen. Es erscheinen
        nur Personen, die sich anmelden können und das volle Level der Rolle
        erreicht haben.
      </p>

      <HumanResourcesRolesSettingClient
        roles={roles}
        defaultRoleIds={humanResourcesRoleIds}
      />
    </Tile>
  );
};
