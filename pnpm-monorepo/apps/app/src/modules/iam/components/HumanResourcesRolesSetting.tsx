import { Tile } from "@/modules/common/components/Tile";
import { getHumanResourcesRoleIds } from "../queries/getHumanResourcesRoleIds";
import { HumanResourcesRolesSettingClient } from "./HumanResourcesRolesSettingClient";

export const HumanResourcesRolesSetting = async () => {
  const humanResourcesRoleIds = await getHumanResourcesRoleIds();

  return (
    <Tile heading="Human Resources">
      <p className="mb-4 text-sm text-neutral-400">
        Diese Rollen gelten als Human Resources. Neue Mitglieder sehen auf der
        Freigabe-Seite die Handles der Personen mit diesen Rollen. Es erscheinen
        nur Personen, die sich anmelden können und das höchste Level der Rolle
        erreicht haben.
      </p>

      <HumanResourcesRolesSettingClient
        defaultRoleIds={humanResourcesRoleIds}
      />
    </Tile>
  );
};
