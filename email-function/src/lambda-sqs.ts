import { SQSHandler } from "aws-lambda";
import z from "zod";
import { fetchParameters } from "./_lib/fetchParameters";
import { main } from "./_lib/main";
import { log } from "./_lib/logging";
import { serializeError } from "serialize-error";

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body || "");
      const requestBody = requestBodySchema.parse(body);

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
        messageId: record.messageId,
      });

      throw error;
    }
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
