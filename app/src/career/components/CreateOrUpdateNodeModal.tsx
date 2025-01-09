import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import { Select } from "@/common/components/form/Select";
import { env } from "@/env";
import { createId } from "@paralleldrive/cuid2";
import { FlowNodeRoleImage, FlowNodeType, type Role } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { useId, useState, type FormEventHandler } from "react";
import { z } from "zod";
import { useFlowContext } from "./FlowContext";

export const roleSchema = z.object({
  id: z.string().cuid2(),
  nodeType: z.literal(FlowNodeType.ROLE),
  roleId: z.string(),
  roleImage: z.nativeEnum(FlowNodeRoleImage),
  backgroundColor: z.string(),
  backgroundTransparency: z.coerce.number().min(0).max(1),
});

export const schema = z.discriminatedUnion("nodeType", [
  roleSchema,
  // TODO: image
]);

type Props = Readonly<{
  className?: string;
  onRequestClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  initialData?: {
    id: string;
    type: FlowNodeType;
    roleId: Role["id"];
    roleImage: FlowNodeRoleImage;
    backgroundColor: string;
    backgroundTransparency: number;
  };
}>;

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
    initialData?.roleId || roles[0].id,
  );
  const [roleImage, setRoleImage] = useState<keyof typeof FlowNodeRoleImage>(
    initialData?.roleImage || FlowNodeRoleImage.ICON,
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
    >
      <h2 className="text-xl font-bold">
        Element {initialData ? "bearbeiten" : "hinzufügen"}
      </h2>

      <form onSubmit={onSubmit} className="mt-6">
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
            // {
            //   value: "image",
            //   label: "Bild",
            // },
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
            {roleImage === FlowNodeRoleImage.ICON && role && (
              <Image
                src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.iconId}`}
                alt=""
                width={128}
                height={128}
                className="mt-2 size-32 border border-neutral-700 rounded object-contain object-center"
              />
            )}
            {roleImage === FlowNodeRoleImage.THUMBNAIL && role && (
              <Image
                src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.thumbnailId}`}
                alt=""
                width={228}
                height={128}
                className="mt-2 w-[228px] h-32 border border-neutral-700 rounded object-contain object-center"
              />
            )}
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
