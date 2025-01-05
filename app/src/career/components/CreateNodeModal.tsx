import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import { Select } from "@/common/components/form/Select";
import type { Role } from "@prisma/client";
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
  const roleInputId = useId();

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
          </>
        )}

        <div className="flex justify-end mt-8">
          <Button type="submit">Hinzufügen</Button>
        </div>
      </form>
    </Modal>
  );
};
