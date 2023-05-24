"use client";

import { type UseFormRegisterReturn } from "react-hook-form";

interface Props {
  register: UseFormRegisterReturn;
}

const YesNoCheckbox = ({ register }: Props) => {
  return (
    <label className="group inline-flex justify-center gap-2 items-center">
      <input type="checkbox" className="hidden peer" {...register} />

      <span className="w-8 h-8 bg-neutral-700 rounded block cursor-pointer relative peer-checked:hidden">
        <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
      </span>

      <span className="w-8 h-8 bg-neutral-700 rounded hidden cursor-pointer relative peer-checked:block">
        <span className="absolute inset-1 rounded bg-green-500" />
      </span>

      <span className="w-16 block peer-checked:hidden">Nein</span>
      <span className="w-16 hidden peer-checked:block">Ja</span>
    </label>
  );
};

export default YesNoCheckbox;
