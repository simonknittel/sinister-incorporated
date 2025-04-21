import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import { Select } from "@/common/components/form/Select";
import { env } from "@/env";
import { createId } from "@paralleldrive/cuid2";
import {
  FlowNodeMarkdownPosition,
  FlowNodeRoleImage,
  FlowNodeType,
  type Role,
} from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { useId, useState, type FormEventHandler } from "react";
import { z } from "zod";
import { useFlowContext } from "./FlowContext";
import { markdownSchema } from "./nodes/markdownSchema";
import { roleSchema } from "./nodes/roleSchema";

export const schema = z.discriminatedUnion("nodeType", [
  roleSchema,
  markdownSchema,
]);

interface Props {
  readonly className?: string;
  readonly onRequestClose: () => void;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly initialData?: {
    id: string;
    backgroundColor: string;
    backgroundTransparency: number;
  } & (
    | {
        type: typeof FlowNodeType.ROLE;
        roleId: Role["id"];
        roleImage: FlowNodeRoleImage;
      }
    | {
        type: typeof FlowNodeType.MARKDOWN;
        markdown: string;
        markdownPosition: FlowNodeMarkdownPosition;
      }
  );
}

export const CreateOrUpdateNodeModal = ({
  className,
  onRequestClose,
  onSubmit,
  initialData,
}: Props) => {
  const { roles } = useFlowContext();
  const [nodeType, setNodeType] = useState<string>(
    initialData?.type || FlowNodeType.ROLE,
  );
  const [roleId, setRoleId] = useState<Role["id"]>(
    (initialData?.type === FlowNodeType.ROLE && initialData?.roleId) ||
      roles[0].id,
  );
  const [roleImage, setRoleImage] = useState<keyof typeof FlowNodeRoleImage>(
    (initialData?.type === FlowNodeType.ROLE && initialData?.roleImage) ||
      FlowNodeRoleImage.ICON,
  );
  const [markdownPosition, setMarkdownPosition] = useState<
    keyof typeof FlowNodeMarkdownPosition
  >(
    (initialData?.type === FlowNodeType.MARKDOWN &&
      initialData?.markdownPosition) ||
      FlowNodeMarkdownPosition.LEFT,
  );
  const roleInputId = useId();
  const backgroundColorInputId = useId();
  const backgroundTransparencyInputId = useId();

  const role = roles.find((role) => role.id === roleId);

  return (
    <Modal
      isOpen={true}
      onRequestClose={onRequestClose}
      className={clsx("w-[480px]", className)}
      heading={<h2>Element {initialData ? "bearbeiten" : "hinzufügen"}</h2>}
    >
      <form onSubmit={onSubmit}>
        <input
          name="id"
          type="hidden"
          defaultValue={initialData?.id || createId()}
        />

        <p>Typ</p>
        <RadioGroup
          name="nodeType"
          items={[
            {
              value: FlowNodeType.ROLE,
              label: "Rolle",
            },
            {
              value: FlowNodeType.MARKDOWN,
              label: "Markdown",
            },
          ]}
          value={nodeType}
          onChange={setNodeType}
          className="mt-2"
        />

        {nodeType === FlowNodeType.ROLE && (
          <>
            <label htmlFor={roleInputId} className="mt-6 block">
              Rolle
            </label>
            <Select
              name="roleId"
              className="mt-2"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>

            <p className="mt-6">Bild</p>
            <RadioGroup
              name="roleImage"
              items={[
                {
                  value: FlowNodeRoleImage.ICON,
                  label: "Icon",
                },
                {
                  value: FlowNodeRoleImage.THUMBNAIL,
                  label: "Thumbnail",
                },
              ]}
              value={roleImage}
              // @ts-expect-error Don't know how to fix this
              onChange={setRoleImage}
              className="mt-2"
            />
            {roleImage === FlowNodeRoleImage.ICON && role?.icon && (
              <Image
                src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.icon.id}`}
                alt=""
                width={128}
                height={128}
                className="mt-2 size-32 border border-neutral-700 rounded object-contain object-center"
                unoptimized={["image/svg+xml", "image/gif"].includes(
                  role.icon.mimeType,
                )}
              />
            )}
            {roleImage === FlowNodeRoleImage.THUMBNAIL && role?.thumbnail && (
              <Image
                src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.thumbnail.id}`}
                alt=""
                width={228}
                height={128}
                className="mt-2 w-[228px] h-32 border border-neutral-700 rounded object-contain object-center"
                unoptimized={["image/svg+xml", "image/gif"].includes(
                  role.thumbnail.mimeType,
                )}
              />
            )}
          </>
        )}

        {nodeType === FlowNodeType.MARKDOWN && (
          <>
            <label htmlFor={roleInputId} className="mt-6 block">
              Markdown
            </label>
            <textarea
              name="markdown"
              className="mt-2 w-full h-64 p-2 rounded-l bg-neutral-900"
              defaultValue={
                initialData?.type === FlowNodeType.MARKDOWN
                  ? initialData.markdown
                  : ""
              }
            ></textarea>

            <p className="mt-6">Position</p>
            <RadioGroup
              name="markdownPosition"
              items={[
                {
                  value: FlowNodeMarkdownPosition.LEFT,
                  label: "linksbündig",
                },
                {
                  value: FlowNodeMarkdownPosition.CENTER,
                  label: "zentriert",
                },
                {
                  value: FlowNodeMarkdownPosition.RIGHT,
                  label: "rechtsbündig",
                },
              ]}
              value={markdownPosition}
              // @ts-expect-error Don't know how to fix this
              onChange={setMarkdownPosition}
              className="mt-2"
            />
          </>
        )}

        <label htmlFor={backgroundColorInputId} className="mt-6 block">
          Hintergrundfarbe
        </label>
        <div className="flex gap-4 items-center mt-2">
          <input
            type="color"
            name="backgroundColor"
            id={backgroundColorInputId}
            defaultValue={initialData?.backgroundColor || "#262626"}
          />

          <div className="flex gap-1 items-baseline">
            <Select
              name="backgroundTransparency"
              id={backgroundTransparencyInputId}
              defaultValue={
                initialData?.backgroundTransparency.toString() || "1"
              }
            >
              <option value="0">0%</option>
              <option value="0.25">25%</option>
              <option value="0.5">50%</option>
              <option value="0.75">75%</option>
              <option value="1">100%</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button type="submit">Speichern</Button>
        </div>
      </form>
    </Modal>
  );
};
