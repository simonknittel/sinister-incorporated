"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { getPages } from "./getPages";

export const useNavigationItems = () => {
  const authentication = useAuthentication();
  if (!authentication) return null;

  const showRoleManage = authentication.authorize("role", "manage");
  const showUserRead = authentication.authorize("user", "read");

  return getPages({
    showRoleManage,
    showUserRead,
  });
};
