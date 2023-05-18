"use client";

import { type Entity, type Role } from "@prisma/client";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface Props {
  entity: Entity;
  role: Role;
  checked?: boolean;
}

interface FormValues {
  checked: boolean;
}

const RoleCheckbox = ({ entity, role, checked }: Props) => {
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      checked,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  useEffect(() => {
    const subscription = watch((value) => {
      setIsLoading(true);

      fetch(`/api/spynet/entity/${entity.id}/log`, {
        method: "POST",
        body: JSON.stringify({
          type: value.checked ? "role-added" : "role-removed",
          content: role.id,
        }),
      })
        .then((response) => {
          if (response.ok) {
            toast.success("Erfolgreich geändert");
          } else {
            toast.error("Beim Ändern ist ein Fehler aufgetreten.");
          }
        })
        .catch((error) => {
          toast.error("Beim Ändern ist ein Fehler aufgetreten.");
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return () => subscription.unsubscribe();
  }, [watch("checked"), role.id]);

  return (
    <label className="group flex justify-center">
      <input
        type="checkbox"
        className="hidden peer"
        id={inputId}
        {...register("checked")}
        disabled={isLoading}
      />

      <span className="w-8 h-8 bg-neutral-700 rounded block cursor-pointer relative peer-checked:hidden">
        <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
      </span>

      <span className="w-8 h-8 bg-neutral-700 rounded hidden cursor-pointer relative peer-checked:block">
        <span className="absolute inset-1 rounded bg-green-500" />
      </span>
    </label>
  );
};

export default RoleCheckbox;
