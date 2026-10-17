import { VariantStatus } from "@sam-monorepo/database/browser";
import * as z from "zod";

/** A variant of the ship catalog as the fleet tools give it */
export const shipVariantOutputSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  /** Null when nobody set the status of the variant */
  status: z.enum(VariantStatus).nullable(),
  series: z.strictObject({ id: z.string(), name: z.string() }),
  manufacturer: z.strictObject({
    id: z.string(),
    name: z.string(),
    logo: z
      .strictObject({ upload_id: z.string(), mime_type: z.string() })
      .nullable(),
  }),
  tags: z.array(
    z.strictObject({ id: z.string(), key: z.string(), value: z.string() }),
  ),
});
