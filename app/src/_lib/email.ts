import { env } from "~/env.mjs";
import { type EmailConfirmationProps } from "../../../emails/emails/EmailConfirmation";
import { CustomError } from "./logging/CustomError";

export const sendEmail = async (
  to: string,
  template: "emailConfirmation",
  templateProps: EmailConfirmationProps,
) => {
  if (!env.EMAIL_FUNCTION_ENDPOINT)
    throw new Error("EMAIL_FUNCTION_ENDPOINT is not set");

  const response = await fetch(env.EMAIL_FUNCTION_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      to,
      template,
      templateProps,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();

    throw new CustomError("Email Function failed", {
      responseStatus: response.status,
      responseBody: body,
    });
  }
};
