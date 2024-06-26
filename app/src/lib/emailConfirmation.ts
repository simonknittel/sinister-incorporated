import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "../env.mjs";
import { prisma } from "../server/db";
import { dedupedGetUnleashFlag } from "./getUnleashFlag";
import { log } from "./logging";
import { sendEmailV2 } from "./sendEmail";

export const requestEmailConfirmation = async (
  userId: string,
  userEmail: string,
) => {
  if (await dedupedGetUnleashFlag("DisableConfirmationEmail")) return;

  const emailConfirmationToken = createId();

  await prisma.emailConfirmationToken.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.emailConfirmationToken.create({
    data: {
      userId,
      token: emailConfirmationToken,
      email: userEmail,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    },
  });

  await sendEmailV2("emailConfirmation", [
    {
      to: userEmail,
      templateProps: {
        baseUrl: env.BASE_URL,
        host: env.HOST,
        token: emailConfirmationToken,
      },
    },
  ]);
};

export const requiresEmailConfirmation = async (session: Session) => {
  if (await dedupedGetUnleashFlag("DisableConfirmedEmailRequirement"))
    return false;

  if (
    session.user.role === "admin" &&
    cookies().get("enableAdmin")?.value === "enableAdmin"
  )
    return false;

  return true;
};

export const requireConfirmedEmailForPage = async (session: Session) => {
  if (!(await requiresEmailConfirmation(session))) return;

  if (!session.user.emailVerified) {
    await log.info("Unauthenticated request to page", {
      // TODO: Add request path
      userId: session.user.id,
      reason: "Unconfirmed email",
    });

    redirect("/email-confirmation");
  }
};

export const requireConfirmedEmailForApi = async (session: Session) => {
  if (!(await requiresEmailConfirmation(session))) return;

  if (!session.user.emailVerified) {
    await log.info("Unauthenticated request to API", {
      // TODO: Add request path
      userId: session.user.id,
      reason: "Unconfirmed email",
    });

    throw new Error("Unauthorized");
  }
};

export const requireConfirmedEmailForAction = async (session: Session) => {
  if (!(await requiresEmailConfirmation(session))) return;

  if (!session.user.emailVerified) {
    await log.info("Unauthenticated request to action", {
      // TODO: Add action name
      userId: session.user.id,
      reason: "Unconfirmed email",
    });

    throw new Error("Unauthorized");
  }
};

export const requireConfirmedEmailForTrpc = async (session: Session) => {
  if (!(await requiresEmailConfirmation(session))) return;

  if (!session.user.emailVerified) {
    await log.info("Unauthenticated request to tRPC", {
      userId: session.user.id,
      reason: "Unconfirmed email",
    });
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};
