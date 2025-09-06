import { authenticate } from "@/auth/server";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("role", "manage"),
    authentication.authorize("user", "read"),
  ]);

  const pages = [];

  if (permissions[0]) {
    pages.push(
      {
        name: "Rollen",
        path: "/app/iam/roles",
      },
      {
        name: "Berechtigungsmatrix",
        path: "/app/iam/permission-matrix",
      },
    );
  }

  if (permissions[1]) {
    pages.push({
      name: "Benutzer",
      path: "/app/iam/users",
    });
  }

  return pages;
};
