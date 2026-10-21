import { getApplicationContext, getRequestActor } from "@/modules/application";
import { findCreatableClassificationLevels } from "@sam-monorepo/application";
import type { NoteType } from "@sam-monorepo/database/client";
import { cache } from "react";

export const getCreatableClassificationLevelsDeduped = cache(
  async (noteTypeId: NoteType["id"]) =>
    findCreatableClassificationLevels(
      getApplicationContext(),
      await getRequestActor(),
      { noteTypeId },
    ),
);
