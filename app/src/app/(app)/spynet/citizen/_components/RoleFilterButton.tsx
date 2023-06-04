"use client";

import { type Role } from "@prisma/client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaChevronDown, FaSave } from "react-icons/fa";
import Button from "~/app/_components/Button";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";
import { env } from "~/env.mjs";

interface FormValues {
  values: string[];
}

interface Props {
  roles: Role[];
}

const RoleFilterButton = ({ roles }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen((value) => !value)} variant="secondary">
        <FaChevronDown /> Rollen
      </Button>

      {isOpen && (
        <Inner roles={roles} onRequestClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default RoleFilterButton;

interface InnerProps {
  roles: Role[];
  onRequestClose?: () => void;
}

const Inner = ({ roles, onRequestClose }: InnerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      values: (searchParams.get("filters")?.split(",") || []).filter(
        (filter) => {
          if (filter.startsWith("role-")) return true;
          return false;
        }
      ),
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    let filters = newSearchParams.get("filters")?.split(",") || [];
    filters = filters.filter((filter) => {
      if (filter === "") return false;
      if (filter.startsWith("role-")) return false;
      return true;
    });
    console.log(filters);

    data.values.forEach((filter) => {
      filters.push(filter);
    });

    newSearchParams.set("filters", filters.join(","));

    router.push(`/spynet/citizen?${newSearchParams.toString()}`);

    onRequestClose?.();
  };

  return (
    <form
      className={
        "absolute top-[calc(100%+.5rem)] left-0 flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 border border-neutral-900 z-10 max-h-96 overflow-auto"
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      {roles.map((role) => (
        <div
          key={role.id}
          className="flex justify-between items-center w-full gap-4"
        >
          <label className="flex gap-2 items-center whitespace-nowrap">
            {role.imageId && (
              <div className="aspect-square w-6 h-6 flex items-center justify-center rounded overflow-hidden">
                <Image
                  src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.imageId}`}
                  alt=""
                  width={24}
                  height={24}
                  className="max-w-full max-h-full"
                />
              </div>
            )}

            {role.name}
          </label>

          <YesNoCheckbox
            register={register("values")}
            id={role.id}
            value={`role-${role.id}`}
          />
        </div>
      ))}

      <div className="flex justify-end w-full">
        <Button variant="primary">
          <FaSave /> Speichern
        </Button>
      </div>
    </form>
  );
};
