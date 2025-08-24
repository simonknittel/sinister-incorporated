"use client";

import { useAction } from "@/actions/utils/useAction";
import { Button2 } from "@/common/components/Button2";
import { ImageUpload } from "@/common/components/ImageUpload";
import Note from "@/common/components/Note";
import type { Role, Upload } from "@prisma/client";
import clsx from "clsx";
import { useActionState, useId } from "react";
import { FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { deleteRole } from "../actions/deleteRole";
import { updateRoleName } from "../actions/updateRoleName";

interface Props {
  readonly className?: string;
  readonly role: Role & {
    icon: Upload | null;
  };
}

export const OverviewTab = ({ className, role }: Props) => {
  const [updateNameState, updateNameFormAction, updateNameIsPending] =
    useActionState(updateRoleName, null);
  const {
    state: deleteState,
    formAction: deleteFormAction,
    isPending: deleteIsPending,
  } = useAction(deleteRole);
  const nameInputId = useId();

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <form
        action={updateNameFormAction}
        className={clsx("rounded-primary bg-neutral-800/50 p-4", className)}
      >
        <input type="hidden" name="id" value={role.id} />

        <label className="font-bold">Name</label>
        <input
          name="name"
          defaultValue={role.name}
          id={nameInputId}
          className="p-2 rounded-secondary bg-neutral-900 w-full mt-2"
        />
        <Button2
          type="submit"
          disabled={updateNameIsPending}
          className="ml-auto mt-4"
        >
          {updateNameIsPending ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaSave />
          )}
          Speichern
        </Button2>

        {updateNameState && (
          <Note
            type={updateNameState.success ? "success" : "error"}
            message={
              updateNameState.success
                ? updateNameState.success
                : updateNameState.error
            }
            className={clsx("mt-4", {
              "animate-pulse": updateNameIsPending,
            })}
          />
        )}
      </form>

      <section
        className={clsx("rounded-primary bg-neutral-800/50 p-4", className)}
      >
        <h2 className="font-bold">Bilder</h2>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div>
            <label className="block font-bold">Icon</label>

            <ImageUpload
              resourceType="role"
              resourceId={role.id}
              resourceAttribute="iconId"
              imageId={role.icon?.id}
              imageMimeType={role.icon?.mimeType}
              width={128}
              height={128}
              className={clsx(
                "mt-2 size-32 border border-neutral-700 hover:border-neutral-500 text-neutral-500 hover:text-neutral-300 transition-colors group rounded-secondary",
                {
                  "after:content-['Bild_hochladen'] flex items-center justify-center":
                    !role.iconId,
                },
              )}
              imageClassName="size-32"
              pendingClassName="size-32"
            />

            <p className="mt-1 text-sm text-neutral-500">nur 1:1</p>
          </div>

          <div>
            <label className="block font-bold">Thumbnail</label>

            <ImageUpload
              resourceType="role"
              resourceId={role.id}
              resourceAttribute="thumbnailId"
              imageId={role.thumbnailId}
              width={228}
              height={128}
              className={clsx(
                "mt-2 w-[228px] h-32 border border-neutral-700 hover:border-neutral-500 text-neutral-500 hover:text-neutral-300 transition-colors group rounded-secondary",
                {
                  "after:content-['Bild_hochladen'] flex items-center justify-center":
                    !role.thumbnailId,
                },
              )}
              imageClassName="w-[228px] h-32"
              pendingClassName="w-[228px] h-32"
            />

            <p className="mt-1 text-sm text-neutral-500">
              beliebiges Seitenverhältnis
            </p>
          </div>
        </div>
      </section>

      <section
        className={clsx("rounded-primary bg-neutral-800/50 p-4", className)}
      >
        <form action={deleteFormAction}>
          <input type="hidden" name="id" value={role.id} />
          <Button2 type="submit" disabled={deleteIsPending}>
            {deleteIsPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaTrash />
            )}
            Löschen
          </Button2>

          {deleteState && "error" in deleteState && (
            <Note
              type="error"
              message={deleteState.error}
              className={clsx("mt-4", {
                "animate-pulse": updateNameIsPending,
              })}
            />
          )}
        </form>
      </section>
    </div>
  );
};
