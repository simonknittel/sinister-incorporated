"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { items } from "./items";

export const useNavigationItems = () => {
  const authentication = useAuthentication();
  if (!authentication) return null;

  const permissions = [
    authentication.authorize("citizen", "read"),
    authentication.authorize("organization", "read"),
    authentication.authorize("citizen", "create"),
    authentication.authorize("organization", "create"),
    authentication.authorize("spynetActivity", "read"),
    authentication.authorize("spynetCitizen", "read"),
    authentication.authorize("spynetNotes", "read"),
    authentication.authorize("spynetOther", "read"),
  ];

  return items(permissions);
};
