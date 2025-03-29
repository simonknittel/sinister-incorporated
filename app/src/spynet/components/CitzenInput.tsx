"use client";

import { api } from "@/trpc/react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import type { Entity } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
  name: string;
}>;

export const CitizenInput = ({ className, name }: Props) => {
  const [selectedCitizen, setSelectedCitizen] = useState<Entity | null>(null);
  const [query, setQuery] = useState("");

  const { isPending, data: allCitizens } = api.citizens.getAllCitizens.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const filteredCitizens =
    allCitizens && query.trim()
      ? allCitizens
          .filter((citizen) =>
            citizen.handle!.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .sort((a, b) => a.handle!.localeCompare(b.handle!))
          .slice(0, 10)
      : [];

  return (
    <div className={clsx(className)}>
      <label className="block">Citizen (Handle)</label>

      {isPending ? (
        <div className="h-10 animate-pulse rounded bg-neutral-900" />
      ) : (
        <Combobox
          value={selectedCitizen}
          onChange={setSelectedCitizen}
          onClose={() => setQuery("")}
        >
          <ComboboxInput
            aria-label="Assignee"
            displayValue={(citizen: Entity) => citizen?.handle || ""}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded bg-neutral-900 py-2 pr-8 pl-2 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          />

          <ComboboxOptions
            anchor="bottom"
            className="w-[var(--input-width)] rounded-b border border-sinister-red-500 bg-black p-1 [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50"
          >
            {filteredCitizens.map((citizen) => (
              <ComboboxOption
                key={citizen.id}
                value={citizen}
                className="group flex cursor-pointer items-center gap-2 rounded py-1 px-2 select-none data-[focus]:bg-white/20"
              >
                <FaCheck className="invisible group-data-[selected]:visible text-sm text-sinister-red-500" />

                <div className="text-white text-sm">{citizen.handle!}</div>

                <div className="text-xs text-neutral-500">{citizen.id}</div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      )}

      {selectedCitizen && (
        <input type="hidden" name={name} value={selectedCitizen.id} />
      )}
    </div>
  );
};
