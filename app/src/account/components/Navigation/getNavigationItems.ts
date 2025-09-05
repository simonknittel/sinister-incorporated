import { authenticate } from "@/auth/server";
import { items } from "./items";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions: boolean[] = await Promise.all([]);

  return items(permissions);
};
