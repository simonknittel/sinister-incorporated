import { createId } from "@paralleldrive/cuid2";
import { EmailTemplate, type ApplicationContext } from "../context.js";

/** The link in the email is valid for one day */
const EMAIL_CONFIRMATION_TOKEN_LIFETIME_MILLISECONDS = 24 * 60 * 60 * 1000;

interface EmailConfirmationRecipient {
  readonly userId: string;
  readonly email: string;
}

/**
 * Saves a new confirmation token and requests the email with the link.
 * Gives false when the save or the request failed. Never throws, thus a
 * caller in the sign-in cannot stop it. The token never goes into a log.
 */
export const sendEmailConfirmation = async (
  context: ApplicationContext,
  { userId, email }: EmailConfirmationRecipient,
): Promise<boolean> => {
  try {
    // `confirmEmailWithToken` accepts only a cuid2 as the token
    const token = createId();

    await context.prisma.emailConfirmationToken.create({
      data: {
        token,
        email,
        userId,
        expires: new Date(
          context.now().getTime() +
            EMAIL_CONFIRMATION_TOKEN_LIFETIME_MILLISECONDS,
        ),
      },
    });

    await context.email.request({
      template: EmailTemplate.EmailConfirmation,
      messages: [
        {
          to: email,
          templateProps: {
            baseUrl: context.urls.issuer,
            host: context.urls.baseUrl.host,
            token,
          },
        },
      ],
    });

    return true;
  } catch (error) {
    context.log.error("Failed to request the confirmation email", {
      userId,
      error,
    });

    return false;
  }
};
