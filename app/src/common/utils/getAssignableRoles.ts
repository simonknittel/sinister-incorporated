import { requireAuthentication } from "@/auth/server";
import { getRoles } from "@/roles/queries";
import { cache } from "react";

export const getAssignableRoles = cache(async () => {
  const [authentication, allRoles] = await Promise.all([
    requireAuthentication(),
    getRoles(),
  ]);

  const assignableRoles = (
    await Promise.all(
      allRoles.map(async (role) => {
        let include = await authentication.authorize("otherRole", "read", [
          {
            key: "roleId",
            value: role.id,
          },
        ]);

        if (include) {
          include =
            (await authentication.authorize("otherRole", "assign", [
              {
                key: "roleId",
                value: role.id,
              },
            ])) ||
            (await authentication.authorize("otherRole", "dismiss", [
              {
                key: "roleId",
                value: role.id,
              },
            ]));
        }

        return {
          role,
          include,
        };
      }),
    )
  )
    .filter(({ include }) => include)
    .map(({ role }) => role)
    .sort((a, b) => a.name.localeCompare(b.name));

  return assignableRoles;
});
