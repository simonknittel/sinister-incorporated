import { authenticate } from "@/auth/server";
import { getPages } from "./getPages";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const [showRoleManage, showUserRead] = await Promise.all([
    authentication.authorize("role", "manage"),
    authentication.authorize("user", "read"),
  ]);

  return getPages({
    showRoleManage,
    showUserRead,
  });
};
