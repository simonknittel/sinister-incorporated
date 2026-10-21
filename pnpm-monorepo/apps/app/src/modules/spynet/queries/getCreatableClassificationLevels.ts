import { getRequestActor } from "@/modules/application";
import { filterCreatableClassificationLevels } from "@sam-monorepo/application";
import { getAllClassificationLevels } from "./getAllClassificationLevels";

/**
 * The classification levels for which the user can create a note of the note
 * type
 */
export const getCreatableClassificationLevels = async (noteTypeId: string) =>
  filterCreatableClassificationLevels(
    await getRequestActor(),
    await getAllClassificationLevels(),
    noteTypeId,
  );
