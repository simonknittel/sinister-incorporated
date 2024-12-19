import { prisma } from "@/db";
import { cache } from "react";

const getAllNoteTypes = cache(async () => {
  return prisma.noteType.findMany({
    orderBy: {
      name: "asc",
    },
  });
});

export default getAllNoteTypes;
