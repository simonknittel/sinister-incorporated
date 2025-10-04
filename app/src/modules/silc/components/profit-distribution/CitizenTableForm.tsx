"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { unstable_rethrow } from "next/navigation";
import type { ChangeEventHandler, ReactNode } from "react";
import toast from "react-hot-toast";
import { updateParticipantAttribute } from "../../actions/updateParticipantAttribute";

interface Props {
  readonly children: ReactNode;
  readonly className?: string;
}

export const CitizenTableForm = ({ children, className }: Props) => {
  const t = useTranslations();

  const handleChange: ChangeEventHandler<HTMLFormElement> = (event) => {
    const input = event.target as unknown as HTMLInputElement;
    const [attribute, participantId] = input.name.split("_");
    const checked = input.checked ? "true" : "";

    const formData = new FormData();
    formData.set("attribute", attribute);
    formData.set("participantId", participantId);
    formData.set("checked", checked);

    updateParticipantAttribute(formData)
      .then((response) => {
        if ("error" in response) {
          toast.error(response.error);
          console.error(response);
          return response;
        }

        toast.success(response.success);
      })
      .catch((error) => {
        unstable_rethrow(error);
        toast.error(t("Common.internalServerError"));
        console.error(error);
      });
  };

  return (
    <form onChange={handleChange} className={clsx(className)}>
      {children}
    </form>
  );
};
