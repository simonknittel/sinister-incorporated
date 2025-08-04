"use client";

import { NumberInput } from "@/common/components/form/NumberInput";
import { Tile } from "@/common/components/Tile";
import clsx from "clsx";
import { useRef, useState, type ChangeEventHandler } from "react";

interface Result {
  result32: number;
  result24: number;
  result16: number;
  result8: number;
  result4: number;
  result2: number;
  result1: number;
  leftover: number;
}

interface Props {
  readonly className?: string;
}

export const ContainerCalculator = ({ className }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleChange: ChangeEventHandler<HTMLFormElement> = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    const totalScu = parseInt(formData.get("totalScu") as string, 10) || 0;
    const max32 = Number.isNaN(parseInt(formData.get("max32") as string, 10))
      ? null
      : parseInt(formData.get("max32") as string, 10);
    const max24 = Number.isNaN(parseInt(formData.get("max24") as string, 10))
      ? null
      : parseInt(formData.get("max24") as string, 10);
    const max16 = Number.isNaN(parseInt(formData.get("max16") as string, 10))
      ? null
      : parseInt(formData.get("max16") as string, 10);
    const max8 = Number.isNaN(parseInt(formData.get("max8") as string, 10))
      ? null
      : parseInt(formData.get("max8") as string, 10);
    const max4 = Number.isNaN(parseInt(formData.get("max4") as string, 10))
      ? null
      : parseInt(formData.get("max4") as string, 10);
    const max2 = Number.isNaN(parseInt(formData.get("max2") as string, 10))
      ? null
      : parseInt(formData.get("max2") as string, 10);
    const max1 = Number.isNaN(parseInt(formData.get("max1") as string, 10))
      ? null
      : parseInt(formData.get("max1") as string, 10);

    const result32 =
      max32 !== null
        ? Math.min(Math.floor(totalScu / 32), max32)
        : Math.floor(totalScu / 32);
    const leftover32 = totalScu - result32 * 32;

    const result24 =
      max24 !== null
        ? Math.min(Math.floor(leftover32 / 24), max24)
        : Math.floor(leftover32 / 24);
    const leftover24 = leftover32 - result24 * 24;

    const result16 =
      max16 !== null
        ? Math.min(Math.floor(leftover24 / 16), max16)
        : Math.floor(leftover24 / 16);
    const leftover16 = leftover24 - result16 * 16;

    const result8 =
      max8 !== null
        ? Math.min(Math.floor(leftover16 / 8), max8)
        : Math.floor(leftover16 / 8);
    const leftover8 = leftover16 - result8 * 8;

    const result4 =
      max4 !== null
        ? Math.min(Math.floor(leftover8 / 4), max4)
        : Math.floor(leftover8 / 4);
    const leftover4 = leftover8 - result4 * 4;

    const result2 =
      max2 !== null
        ? Math.min(Math.floor(leftover4 / 2), max2)
        : Math.floor(leftover4 / 2);
    const leftover2 = leftover4 - result2 * 2;

    const result1 = max1 !== null ? Math.min(leftover2, max1) : leftover2;
    const leftover1 = leftover2 - result1;

    setResult({
      result32,
      result24,
      result16,
      result8,
      result4,
      result2,
      result1,
      leftover: leftover1,
    });
  };

  return (
    <Tile
      heading="Container Calculator"
      className={clsx("flex flex-col gap-4", className)}
    >
      <form ref={formRef} onChange={handleChange}>
        <h3 className="text-lg font-semibold">Angaben</h3>

        <NumberInput
          name="totalScu"
          label="Gesamt SCU"
          placeholder="0"
          required
          autoFocus
        />

        <div className="flex gap-4">
          <div className="flex-initial w-1/2 flex flex-col gap-4">
            <NumberInput name="max32" label="32er Container" hint="optional" />

            <NumberInput name="max24" label="24er Container" hint="optional" />

            <NumberInput name="max16" label="16er Container" hint="optional" />

            <NumberInput name="max8" label="8er Container" hint="optional" />
          </div>

          <div className="flex-initial w-1/2 flex flex-col gap-4">
            <NumberInput name="max4" label="4er Container" hint="optional" />

            <NumberInput name="max2" label="2er Container" hint="optional" />

            <NumberInput name="max1" label="1er Container" hint="optional" />
          </div>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold">Ergebnis</h3>

        {result ? (
          <ul className="list-disc pl-5">
            <li>32er Container: {result.result32}</li>
            <li>24er Container: {result.result24}</li>
            <li>16er Container: {result.result16}</li>
            <li>8er Container: {result.result8}</li>
            <li>4er Container: {result.result4}</li>
            <li>2er Container: {result.result2}</li>
            <li>1er Container: {result.result1}</li>
            <li>Verbleibend: {result.leftover}</li>
          </ul>
        ) : (
          <p className="text-gray-500">Bitte mind. Total SCU ausfüllen.</p>
        )}
      </div>
    </Tile>
  );
};
