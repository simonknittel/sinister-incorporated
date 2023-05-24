"use client";

import clsx from "clsx";
import { type ReactNode } from "react";
import { type UseFormRegisterReturn } from "react-hook-form";

interface Props {
  register: UseFormRegisterReturn;
  children?: ReactNode;
  id?: string;
  className?: string;
}

const Select = ({ register, id, children, className }: Props) => {
  return (
    <select
      id={id}
      {...register}
      className={clsx(className, "bg-neutral-900 rounded px-4 h-11 w-full")}
    >
      {children}
    </select>
  );
};

export default Select;
