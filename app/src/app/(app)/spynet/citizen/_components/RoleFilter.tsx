"use client";

import { type Role } from "@prisma/client";
import * as Popover from "@radix-ui/react-popover";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const RoleFilter = ({ roles }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      values: (searchParams.get("filters")?.split(",") || []).filter(
        (filter) => {
          if (filter.startsWith("role-")) return true;
          return false;
        },
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

    data.values.forEach((filter) => {
      filters.push(filter);
    });

    newSearchParams.set("filters", filters.join(","));

    router.push(`${pathname}?${newSearchParams.toString()}`);

    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary">
          <FaChevronDown /> Rollen
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content sideOffset={4}>
          <form
            className={
              "flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 max-h-96 overflow-auto"
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

          <Popover.Arrow className="fill-neutral-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default RoleFilter;
