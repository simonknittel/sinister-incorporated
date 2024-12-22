import { authenticate } from "@/auth/server";
import { cache } from "react";
import getAllRoles from "./cached/getAllRoles";

export const getAssignableRoles = cache(async () => {
  const [authentication, allRoles] = await Promise.all([
    authenticate(),
    getAllRoles(),
  ]);

  const assignableRoles = allRoles
    .filter((role) => {
      return (
        authentication &&
        authentication.authorize("otherRole", "read", [
          {
            key: "roleId",
            value: role.id,
          },
        ])
      );
    })
    .filter((role) => {
      return (
        authentication &&
        (authentication.authorize("otherRole", "assign", [
          {
            key: "roleId",
            value: role.id,
          },
        ]) ||
          authentication.authorize("otherRole", "dismiss", [
            {
              key: "roleId",
              value: role.id,
            },
          ]))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return assignableRoles;
});
