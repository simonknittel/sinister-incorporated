import { type Role } from "@prisma/client";
import clsx from "clsx";
import { useFormContext, useWatch } from "react-hook-form";
import { FaPlus, FaTrash } from "react-icons/fa";
import Button from "~/app/_components/Button";
import { type FormValues } from "../../../../../../_lib/auth/FormValues";

interface Props {
  className?: string;
  roles: Role[];
}

const RoleSection = ({ className, roles }: Props) => {
  const { register, setValue, getValues } = useFormContext<FormValues>();
  const rules = useWatch<FormValues, "otherRole">({ name: "otherRole" });

  const handleCreate = () => {
    const rules = getValues("otherRole");

    setValue("otherRole", [
      ...(rules || []),
      {
        roleId: "",
        operation: "",
      },
    ]);
  };

  const handleDelete = (indexToRemove: number) => {
    const rules = getValues("otherRole");

    setValue(
      "otherRole",
      rules.filter((rule, index) => index !== indexToRemove)
    );
  };

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Diese Rolle kann folgende Rollen ...</h4>

      <div className="border-2 border-neutral-700 p-4 rounded mt-2">
        <div className="grid grid-cols-3 gap-2 font-bold">
          <span>Rolle</span>
          <span>Aktion</span>
        </div>

        {rules && rules.length > 0 ? (
          rules.map((rule, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mt-2">
              <select
                {...register(`otherRole.${index}.roleId`, { required: true })}
                className="bg-neutral-900 rounded px-4 h-11"
              >
                <option disabled value="">
                  Auswählen ...
                </option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              <select
                {...register(`otherRole.${index}.operation`, {
                  required: true,
                })}
                className="bg-neutral-900 rounded px-4 h-11"
              >
                <option disabled value="">
                  Auswählen ...
                </option>

                <option value="read">Sehen</option>

                <option value="assign">Vergeben</option>
              </select>

              <div className="flex items-center justify-end">
                <Button
                  variant="tertiary"
                  onClick={() => handleDelete(index)}
                  type="button"
                >
                  <FaTrash /> Löschen
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-neutral-500 italic mt-2">
            Bisher gibt es keine Regeln.
          </p>
        )}

        <Button variant="tertiary" onClick={handleCreate} type="button">
          <FaPlus /> Regel erstellen
        </Button>
      </div>
    </div>
  );
};

export default RoleSection;
