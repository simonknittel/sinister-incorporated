import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findClassificationLevels } from "@sam-monorepo/application";
import { cache } from "react";

export const getAllClassificationLevels = cache(
  withTrace("getAllClassificationLevels", async () =>
    findClassificationLevels(getApplicationContext()),
  ),
);
