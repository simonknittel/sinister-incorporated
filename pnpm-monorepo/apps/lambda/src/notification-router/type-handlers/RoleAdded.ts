import {
  findRoleAddedRecipient,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Citizen, type Role } from "@sam-monorepo/database";
import { publishNotifications } from "../publish";

interface Payload {
  citizenId: Citizen["id"];
  roleId: Role["id"];
}

export const RoleAddedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findRoleAddedRecipient(context, {
    citizenId: payload.citizenId,
    roleId: payload.roleId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "role_added" as const,
      payload: { roleId: result.role.id, roleName: result.role.name },
      title: "Neue Rolle",
      body: `Dir wurde eine neue Rolle zugewiesen: ${result.role.name}`,
    })),
  );
};
