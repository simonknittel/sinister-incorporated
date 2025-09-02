import type { Session } from "next-auth";

export const items = (permissions: (boolean | Session)[]) => {
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
