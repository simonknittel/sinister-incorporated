import { authenticate } from "@/auth/server";
import { items } from "./items";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("citizen", "read"),
    authentication.authorize("organization", "read"),
    authentication.authorize("citizen", "create"),
    authentication.authorize("organization", "create"),
    authentication.authorize("spynetActivity", "read"),
    authentication.authorize("spynetCitizen", "read"),
    authentication.authorize("spynetNotes", "read"),
    authentication.authorize("spynetOther", "read"),
  ]);

  return items(permissions);
};
