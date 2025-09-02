import { authenticate } from "@/auth/server";
import { items } from "./items";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("role", "manage"),
    authentication.authorize("user", "read"),
  ]);

  return items(permissions);
};
