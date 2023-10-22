import { type NoteType } from "@prisma/client";
import ClassificationLevelFilter from "./ClassificationLevelFilter";
import ConfirmationStateFilter from "./ConfirmationStateFilter";
import NoteTypeFilterButton from "./NoteTypeFilter";
import { type Row } from "./Table";

interface Props {
  rows: Row[];
}

const Filters = ({ rows }: Props) => {
  const noteTypes = new Map<string, NoteType>();
  const classificationLevels = new Map<string, NoteType>();
  const confirmationStates = new Set<string>();

  for (const row of rows) {
    if (!noteTypes.has(row.noteType.id)) {
      noteTypes.set(row.noteType.id, row.noteType);
    }

    if (!classificationLevels.has(row.classificationLevel.id)) {
      classificationLevels.set(
        row.classificationLevel.id,
        row.classificationLevel,
      );
    }

    if (row.confirmationState) {
      confirmationStates.add(row.confirmationState);
    } else {
      confirmationStates.add("unconfirmed");
    }
  }

  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      {noteTypes.size > 0 && (
        <NoteTypeFilterButton noteTypes={Array.from(noteTypes.values())} />
      )}

      {classificationLevels.size > 0 && (
        <ClassificationLevelFilter
          classificationLevels={Array.from(classificationLevels.values())}
        />
      )}

      {confirmationStates.size > 0 && (
        <ConfirmationStateFilter
          confirmationStates={Array.from(confirmationStates)}
        />
      )}
    </div>
  );
};

export default Filters;
