import type { Session } from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const items = (permissions: (boolean | Session)[]) => {
  const pages = [];

  pages.push({
    name: "Benachrichtigungen",
    path: "/app/account/notifications",
  });

  return pages;
};
