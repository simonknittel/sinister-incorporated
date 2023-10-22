import { type Entity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import AddNoteSubmitSA from "./AddNoteSubmitSA";

const schema = zfd.formData({
  content: zfd.text(z.string().trim().min(1)),
  entityId: zfd.text(),
});

interface Props {
  entity: Entity;
}

const AddNoteSA = ({ entity }: Readonly<Props>) => {
  async function addNote(formData: FormData) {
    "use server";

    const authentication = await authenticateApi();
    authentication.authorizeApi([
      {
        resource: "note",
        operation: "create",
      },
    ]);

    const { content, entityId } = await schema.parseAsync(formData);

    await prisma.entityLog.create({
      data: {
        type: "note",
        content,
        submittedBy: {
          connect: {
            id: authentication.session.user.id,
          },
        },
        entity: {
          connect: {
            id: entityId,
          },
        },
      },
    });

    revalidatePath(`/spynet/entity/${entityId}`);

    // TODO: Add success and error handling
  }

  return (
    <form action={addNote} className="flex mt-4">
      <textarea
        className="p-2 rounded-l bg-neutral-800 flex-1"
        name="content"
        placeholder="Notiz hinzufügen ..."
        required
      />

      <input type="hidden" name="entityId" value={entity.id} required />

      <div>
        <AddNoteSubmitSA />
      </div>
    </form>
  );
};

export default AddNoteSA;
