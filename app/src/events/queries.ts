import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { cache } from "react";

export const getMyDiscordEventSubscriber = cache(async () => {
  const authentication = await requireAuthentication();

  return prisma.discordEventSubscriber.findUnique({
    where: {
      userId: authentication.session.user.id,
    },
  });
});
