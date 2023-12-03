import { z } from "zod";
import { CustomError } from "./logging/CustomError";

export const fetchParameters = async <T extends Record<string, string>>(
  parameters: T
): Promise<T> => {
  if (!process.env.AWS_SESSION_TOKEN)
    throw new Error("Missing AWS_SESSION_TOKEN for fetching parameters store");

  const responses = await Promise.all(
    Object.entries(parameters).map(async ([key, name]) => {
      const uriEncodedParameterName = encodeURIComponent(name);

      const response = await fetch(
        `http://localhost:2773/systemsmanager/parameters/get?name=${uriEncodedParameterName}&withDecryption=true`,
        {
          headers: {
            "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN!,
          },
        }
      );

      if (!response.ok)
        throw new CustomError("Failed to fetch parameters store", {
          response: response.status,
          body: await response.text(),
        });

      const body = await response.json();
      const parameter = parameterSchema.parse(body);

      return [key, parameter.Parameter.Value];
    })
  );

  return Object.fromEntries(responses);
};

const parameterSchema = z.object({
  Parameter: z.object({
    Value: z.string(),
  }),
});
