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
    const exact32 = Number.isNaN(
      parseInt(formData.get("exact32") as string, 10),
    )
      ? null
      : parseInt(formData.get("exact32") as string, 10);
    const exact24 = Number.isNaN(
      parseInt(formData.get("exact24") as string, 10),
    )
      ? null
      : parseInt(formData.get("exact24") as string, 10);
    const exact16 = Number.isNaN(
      parseInt(formData.get("exact16") as string, 10),
    )
      ? null
      : parseInt(formData.get("exact16") as string, 10);
    const exact8 = Number.isNaN(parseInt(formData.get("exact8") as string, 10))
      ? null
      : parseInt(formData.get("exact8") as string, 10);
    const exact4 = Number.isNaN(parseInt(formData.get("exact4") as string, 10))
      ? null
      : parseInt(formData.get("exact4") as string, 10);
    const exact2 = Number.isNaN(parseInt(formData.get("exact2") as string, 10))
      ? null
      : parseInt(formData.get("exact2") as string, 10);
    const exact1 = Number.isNaN(parseInt(formData.get("exact1") as string, 10))
      ? null
      : parseInt(formData.get("exact1") as string, 10);

    let result32 = exact32 || 0;
    let result24 = exact24 || 0;
    let result16 = exact16 || 0;
    let result8 = exact8 || 0;
    let result4 = exact4 || 0;
    let result2 = exact2 || 0;
    let result1 = exact1 || 0;

    let leftover =
      totalScu -
      (result32 * 32 +
        result24 * 24 +
        result16 * 16 +
        result8 * 8 +
        result4 * 4 +
        result2 * 2 +
        result1);

    if (exact32 === null) {
      result32 = Math.floor(leftover / 32);
      leftover -= result32 * 32;
    }

    if (exact24 === null) {
      result24 = Math.floor(leftover / 24);
      leftover -= result24 * 24;
    }

    if (exact16 === null) {
      result16 = Math.floor(leftover / 16);
      leftover -= result16 * 16;
    }

    if (exact8 === null) {
      result8 = Math.floor(leftover / 8);
      leftover -= result8 * 8;
    }

    if (exact4 === null) {
      result4 = Math.floor(leftover / 4);
      leftover -= result4 * 4;
    }

    if (exact2 === null) {
      result2 = Math.floor(leftover / 2);
      leftover -= result2 * 2;
    }

    if (exact1 === null) {
      result1 = leftover;
      leftover -= result1;
    }

    setResult({
      result32,
      result24,
      result16,
      result8,
      result4,
      result2,
      result1,
      leftover: leftover,
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
            <NumberInput
              name="exact32"
              label="32er Container"
              hint="optional"
            />

            <NumberInput
              name="exact24"
              label="24er Container"
              hint="optional"
            />

            <NumberInput
              name="exact16"
              label="16er Container"
              hint="optional"
            />

            <NumberInput name="exact8" label="8er Container" hint="optional" />
          </div>

          <div className="flex-initial w-1/2 flex flex-col gap-4">
            <NumberInput name="exact4" label="4er Container" hint="optional" />

            <NumberInput name="exact2" label="2er Container" hint="optional" />

            <NumberInput name="exact1" label="1er Container" hint="optional" />
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
