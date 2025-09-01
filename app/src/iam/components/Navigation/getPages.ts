import type { Session } from "next-auth";

export const getPages = ({
  showRoleManage,
  showUserRead,
}: {
  showRoleManage: boolean | Session;
  showUserRead: boolean | Session;
}) => {
  const pages = [];

  if (showRoleManage) {
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

  if (showUserRead) {
    pages.push({
      name: "Benutzer",
      path: "/app/iam/users",
    });
  }

  return pages;
};
