import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import { Select } from "@/common/components/form/Select";
import { FlowNodeRoleImage, type Role } from "@prisma/client";
import clsx from "clsx";
import { useId, useState, type FormEventHandler } from "react";

type Props = Readonly<{
  className?: string;
  onRequestClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  roles: Role[];
}>;

export const CreateNodeModal = ({
  className,
  onRequestClose,
  onSubmit,
  roles,
}: Props) => {
  const [nodeType, setNodeType] = useState("role");
  const [roleImage, setRoleImage] = useState<keyof typeof FlowNodeRoleImage>(
    FlowNodeRoleImage.ICON,
  );
  const roleInputId = useId();
  const backgroundColorInputId = useId();
  const backgroundTransparencyInputId = useId();

  return (
    <Modal
      isOpen={true}
      onRequestClose={onRequestClose}
      className={clsx("w-[480px]", className)}
    >
      <h2 className="text-xl font-bold">Element hinzufügen</h2>

      <form onSubmit={onSubmit} className="mt-6">
        <p>Typ</p>
        <RadioGroup
          name="nodeType"
          items={[
            {
              value: "role",
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

        {nodeType === "role" && (
          <>
            <label htmlFor={roleInputId} className="mt-6 block">
              Rolle
            </label>
            <Select name="roleId" className="mt-2">
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
            defaultValue="#262626"
          />

          <div className="flex gap-1 items-baseline">
            <Select
              name="backgroundTransparency"
              id={backgroundTransparencyInputId}
              defaultValue="1"
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
          <Button type="submit">Hinzufügen</Button>
        </div>
      </form>
    </Modal>
  );
};
