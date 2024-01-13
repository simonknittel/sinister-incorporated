"use client";

import clsx from "clsx";
import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface Props {
  className?: string;
  children?: ReactNode;
}

export const RequestConfirmationEmailButton = ({
  className,
  children,
}: Readonly<Props>) => {
  const { pending } = useFormStatus();

  return (
    <button
      className={clsx(className, "underline", {
        "opacity-50 cursor-not-allowed": pending,
      })}
      disabled={pending}
    >
      {children}
    </button>
  );
};
