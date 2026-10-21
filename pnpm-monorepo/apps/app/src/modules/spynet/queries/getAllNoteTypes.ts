import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findNoteTypes } from "@sam-monorepo/application";
import { cache } from "react";

export const getAllNoteTypes = cache(
  withTrace("getAllNoteTypes", async () =>
    findNoteTypes(getApplicationContext()),
  ),
);
