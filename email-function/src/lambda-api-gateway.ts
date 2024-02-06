import { APIGatewayProxyHandler } from "aws-lambda";
import z from "zod";
import { errorHandler } from "./_lib/errorHandler";
import { fetchParameters } from "./_lib/fetchParameters";
import { main } from "./_lib/main";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "");
    const requestBody = requestBodySchema.parse(body);

    const parameters = await fetchParameters({
      // deepcode ignore HardcodedNonCryptoSecret: This is not the actual secret but a reference to the secret in the parameters store
      mailgunApiKey: "/email-function/mailgun-api-key",
    });

    await main({
      ...parameters,
      ...requestBody,
    });

    return {
      statusCode: 204,
      body: "",
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
  recipientsPublicKey: z.string().optional(),
});
