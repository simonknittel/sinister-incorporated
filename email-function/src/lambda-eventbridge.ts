import { EventBridgeHandler } from "aws-lambda";
import z from "zod";
import { fetchParameters } from "./_lib/fetchParameters";
import { main } from "./_lib/main";
import { log } from "./_lib/logging";
import { serializeError } from "serialize-error";

type DetailType = "EmailConfirmationRequested";
type Detail = {
  to: string;
  template: "emailConfirmation";
  templateProps: {
    baseUrl: string;
    token: string;
  };
  recipientsPublicKey?: string;
};
type Result = void;

export const handler: EventBridgeHandler<DetailType, Detail, Result> = async (event) => {
  try {
    const requestBody = requestBodySchema.parse(event.detail);

    const parameters = await fetchParameters({
      // deepcode ignore HardcodedNonCryptoSecret: This is not the actual secret but a reference to the secret in the parameters store
      mailgunApiKey: "/email-function/mailgun-api-key",
    });

    await main({
      ...parameters,
      ...requestBody,
    });
  } catch (error) {
    log.error("errorHandler", {
      error: serializeError(error),
    });

    throw error;
  }
};

const requestBodySchema = z.object({
  to: z.string().email(),
  template: z.literal("emailConfirmation"),
  templateProps: z.object({
    baseUrl: z.string().url(),
    token: z.string(),
  }),
  recipientsPublicKey: z.string().optional(),
});
