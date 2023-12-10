import { type Handler } from "aws-lambda";
import z from "zod";
import errorHandler from "./_lib/errorHandler";
import { fetchParameters } from "./_lib/fetchParameters";
import { foo } from "./_lib/foo";

export const handler: Handler = async (event) => {
  try {
    const requestBody = requestBodySchema.parse(event);

    const parameters = await fetchParameters({
      // deepcode ignore HardcodedNonCryptoSecret: This is not the actual secret but a reference to the secret in the parameters store
      mailgunApiKey: "/email-function/mailgun-api-key",
    });

    await foo({
      ...parameters,
      ...requestBody,
    });

    return {
      statusCode: 204,
    };
  } catch (error) {
    return errorHandler(error);
  }
};

const requestBodySchema = z.object({
  to: z.string().email(),
  template: z.literal("emailConfirmation"),
  templateProps: z.object({
    baseUrl: z.string().url(),
    token: z.string(),
  }),
});
