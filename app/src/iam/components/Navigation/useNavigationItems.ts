"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { items } from "./items";

export const useNavigationItems = () => {
  const authentication = useAuthentication();
  if (!authentication) return null;

  const permissions = [
    authentication.authorize("role", "manage"),
    authentication.authorize("user", "read"),
  ];

  return items(permissions);
};
