import { type Handler } from "aws-lambda";
import { renderEmail } from "./_lib/renderEmail";
import { sendEmail } from "./_lib/sendEmail";
import z from "zod";
import errorHandler from "./_lib/errorHandler";
import { fetchParameters } from "./_lib/fetchParameters";
import { CustomError } from "./_lib/logging/CustomError";

export const handler: Handler = async (event, context) => {
  try {
    const result = eventSchema.safeParse(event);
    if (!result.success) throw new CustomError("Invalid event", event);

    if (event.requestContext.http.method !== "POST")
      throw new Error("Bad request");

    const requestBody = JSON.parse(event.body);
    const body = postBodySchema.parse(requestBody);

    const parameters = await fetchParameters({
      // deepcode ignore HardcodedNonCryptoSecret: This is not the actual secret but a reference to the secret in the parameters store
      mailgunApiKey: "/email-function/mailgun-api-key",
    });

    const html = renderEmail(body);

    await sendEmail({
      html,
      mailgunApiKey: parameters.mailgunApiKey,
      to: body.to,
    });

    return {
      statusCode: 204,
    };
  } catch (error) {
    return errorHandler(error);
  }
};

const eventSchema = z.object({
  requestContext: z.object({
    http: z.object({
      method: z.string(),
    }),
  }),
  body: z.string(),
});

const postBodySchema = z.object({
  baseUrl: z.string().url(),
  contactEmailAddress: z.string().email(),
  token: z.string(),
  to: z.string().email(),
});
