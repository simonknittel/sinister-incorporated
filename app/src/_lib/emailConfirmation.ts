import { createId } from "@paralleldrive/cuid2";
import { type Session } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { sendEmail } from "./email";

export const requestEmailConfirmation = async (
  userId: string,
  userEmail: string,
) => {
  if (await getUnleashFlag("DisableConfirmationEmail")) return;

  const emailConfirmationToken = createId();

  await prisma.emailConfirmationToken.deleteMany({
    where: {
      userId: userId,
    },
  });

  await prisma.emailConfirmationToken.create({
    data: {
      userId: userId,
      token: emailConfirmationToken,
      email: userEmail,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    },
  });

  await sendEmail(userEmail, "emailConfirmation", {
    baseUrl: env.HOST,
    token: emailConfirmationToken,
  });
};

export const requiresEmailConfirmation = async (session: Session) => {
  if (await getUnleashFlag("DisableConfirmedEmailRequirement")) return false;

  if (
    session.user.role === "admin" &&
    !(cookies().get("disableAdmin")?.value === "disableAdmin")
  )
    return false;

  return true;
};

export const validateConfirmedEmailForPage = async (session: Session) => {
  if (!(await requiresEmailConfirmation(session))) return;
  if (!session.user.emailVerified) redirect("/email-confirmation");
};
