import { type Handler } from "aws-lambda";
import z from "zod";
import errorHandler from "./_lib/errorHandler";
import { fetchParameters } from "./_lib/fetchParameters";
import { CustomError } from "./_lib/logging/CustomError";
import { foo } from "./_lib/foo";
import { authenticate } from "./_lib/authorization";

export const handler: Handler = async (event) => {
  try {
    await authenticate(event);

    const result = eventSchema.safeParse(event);
    if (!result.success) throw new CustomError("Invalid event", { event });

    if (result.data.requestContext.http.method !== "POST")
      throw new Error("Bad request");

    const requestBody = JSON.parse(result.data.body);
    const body = postBodySchema.parse(requestBody);

    const parameters = await fetchParameters({
      // deepcode ignore HardcodedNonCryptoSecret: This is not the actual secret but a reference to the secret in the parameters store
      mailgunApiKey: "/email-function/mailgun-api-key",
    });

    await foo({
      ...parameters,
      ...body,
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
  to: z.string().email(),
  template: z.literal("emailConfirmation"),
  templateProps: z.object({
    baseUrl: z.string().url(),
    token: z.string(),
  }),
});
