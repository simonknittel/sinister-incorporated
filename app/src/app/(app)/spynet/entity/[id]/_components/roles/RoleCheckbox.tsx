"use client";

import { type Entity, type Role } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";
import useAuthentication from "~/app/_lib/auth/useAuthentication";

interface Props {
  entity: Entity;
  role: Role;
  checked?: boolean;
}

interface FormValues {
  checked: boolean;
}

const RoleCheckbox = ({ entity, role, checked = false }: Props) => {
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      checked,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const authentication = useAuthentication();

  let disabled = false;

  if (
    checked &&
    (!authentication ||
      !authentication.authorize([
        {
          resource: "otherRole",
          operation: "dismiss",
        },
      ]))
  )
    disabled = true;

  if (
    !checked &&
    (!authentication ||
      !authentication.authorize([
        {
          resource: "otherRole",
          operation: "assign",
        },
      ]))
  )
    disabled = true;

  useEffect(() => {
    const subscription = watch((value) => {
      if (disabled) return;

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
            toast.success("Erfolgreich gespeichert");
          } else {
            toast.error("Beim Speichern ist ein Fehler aufgetreten.");
          }
        })
        .catch((error) => {
          toast.error("Beim Speichern ist ein Fehler aufgetreten.");
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return () => subscription.unsubscribe();
  }, [watch("checked"), role.id, disabled]);

  return (
    <YesNoCheckbox
      register={register("checked", {
        disabled: isLoading || disabled,
      })}
    />
  );
};

export default RoleCheckbox;
