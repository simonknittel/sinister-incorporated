import { cache } from "react";
import { prisma } from "../../server/db";

const getAllNoteTypes = cache(async () => {
  return prisma.noteType.findMany({
    orderBy: {
      name: "asc",
    },
  });
});

export default getAllNoteTypes;
