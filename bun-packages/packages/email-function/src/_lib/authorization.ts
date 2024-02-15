import { z } from "zod";
import { fetchParameters } from "./fetchParameters";

export const authenticate = async (event) => {
  const result = eventSchema.safeParse(event);
  if (!result.success) throw new Error("Unauthorized");

  const authParameters = await fetchParameters({
    // deepcode ignore HardcodedNonCryptoSecret: This is not the actual secret but a reference to the secret in the parameters store
    apiKey: "/email-function/api-key",
  });

  if (result.data.headers.authorization !== `Bearer ${authParameters.apiKey}`)
    throw new Error("Unauthorized");
};

const eventSchema = z.object({
  headers: z.object({
    authorization: z.string(),
  }),
});
