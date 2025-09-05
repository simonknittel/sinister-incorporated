"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { items } from "./items";

export const useNavigationItems = () => {
  const authentication = useAuthentication();
  if (!authentication) return null;

  const permissions = [
    authentication.authorize("orgFleet", "read"),
    authentication.authorize("ship", "manage"),
    authentication.authorize("manufacturersSeriesAndVariants", "manage"),
  ];

  return items(permissions);
};
