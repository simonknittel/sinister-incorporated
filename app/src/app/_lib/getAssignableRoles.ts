import { cache } from "react";
import { authenticate } from "../../_lib/auth/authenticateAndAuthorize";
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
        authentication.authorize([
          {
            resource: "otherRole",
            operation: "read",
            attributes: [
              {
                key: "roleId",
                value: role.id,
              },
            ],
          },
        ])
      );
    })
    .filter((role) => {
      return (
        authentication &&
        (authentication.authorize([
          {
            resource: "otherRole",
            operation: "assign",
            attributes: [
              {
                key: "roleId",
                value: role.id,
              },
            ],
          },
        ]) ||
          authentication.authorize([
            {
              resource: "otherRole",
              operation: "dismiss",
              attributes: [
                {
                  key: "roleId",
                  value: role.id,
                },
              ],
            },
          ]))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return assignableRoles;
});
