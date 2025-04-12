"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { CitizenLink } from "@/common/components/CitizenLink";
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
import { FaCheck, FaTrash } from "react-icons/fa";

type BaseProps = Readonly<{
  className?: string;
  name: string;
  disabled?: boolean;
  autofocus?: boolean;
}>;

type SingleProps = BaseProps &
  Readonly<{
    multiple?: false;
    defaultValue?: Entity["id"];
  }>;

type MultipleProps = BaseProps &
  Readonly<{
    multiple: true;
    defaultValue?: Entity["id"][];
  }>;

type Props = SingleProps | MultipleProps;

export const CitizenInput = ({
  className,
  name,
  disabled,
  multiple,
  defaultValue,
  autofocus,
}: Props) => {
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

  if (multiple)
    return (
      <Multiple
        className={className}
        name={name}
        query={query}
        setQuery={setQuery}
        isPending={isPending}
        filteredCitizens={filteredCitizens}
        defaultValue={
          defaultValue
            ? (defaultValue
                .map((id) => allCitizens?.find((citizen) => citizen.id === id))
                .filter(Boolean) as Entity[])
            : undefined
        }
        autofocus={autofocus}
      />
    );
  return (
    <Single
      className={className}
      name={name}
      setQuery={setQuery}
      isPending={isPending}
      filteredCitizens={filteredCitizens}
      disabled={disabled}
      defaultValue={
        defaultValue
          ? allCitizens?.find((citizen) => citizen.id === defaultValue)
          : undefined
      }
      autofocus={autofocus}
    />
  );
};

type SingleComponentProps = Readonly<{
  className?: string;
  name: string;
  setQuery: (query: string) => void;
  isPending: boolean;
  filteredCitizens: Entity[];
  defaultValue?: Entity;
  disabled?: boolean;
  autofocus?: boolean;
}>;

const Single = ({
  className,
  name,
  setQuery,
  isPending,
  filteredCitizens,
  defaultValue,
  disabled,
  autofocus,
}: SingleComponentProps) => {
  const [selectedCitizen, setSelectedCitizen] = useState<Entity | null>(
    defaultValue || null,
  );

  return (
    <div className={clsx(className)}>
      <label className="block mb-1">Citizen (Handle)</label>

      {isPending ? (
        <div className="h-10 animate-pulse rounded bg-neutral-900" />
      ) : (
        <Combobox
          value={selectedCitizen}
          onChange={(citizen) => {
            setSelectedCitizen(citizen);
          }}
          onClose={() => setQuery("")}
        >
          <ComboboxInput
            autoFocus={autofocus}
            aria-label="Citizen"
            displayValue={(citizen: Entity) => citizen?.handle || ""}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded bg-neutral-900 py-2 pr-8 pl-2 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 disabled:opacity-50"
            disabled={disabled}
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

type MultipleComponentProps = Readonly<{
  className?: string;
  name: string;
  query: string;
  setQuery: (query: string) => void;
  isPending: boolean;
  filteredCitizens: Entity[];
  defaultValue?: Entity[];
  autofocus?: boolean;
}>;

const Multiple = ({
  className,
  name,
  query,
  setQuery,
  isPending,
  filteredCitizens,
  defaultValue,
  autofocus,
}: MultipleComponentProps) => {
  const [selectedCitizens, setSelectedCitizens] = useState<Entity[]>(
    defaultValue || [],
  );
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Forbidden");

  return (
    <div className={clsx(className)}>
      <label className="block mb-1">Citizen (Handle)</label>

      {isPending ? (
        <div className="h-10 animate-pulse rounded bg-neutral-900" />
      ) : (
        <Combobox
          multiple
          value={selectedCitizens}
          onChange={(citizens) => {
            setSelectedCitizens(citizens);
            setQuery("");
          }}
          onClose={() => setQuery("")}
        >
          <ComboboxInput
            autoFocus={autofocus}
            aria-label="Citizens"
            value={query}
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

      <p className="text-xs mt-1 text-gray-400">Mehrfachauswahl möglich</p>

      {selectedCitizens.length > 0 && (
        <ul className="mt-2 flex gap-x-3 gap-y-1 flex-wrap">
          {selectedCitizens.map((citizen) => (
            <li key={citizen.id} className="flex items-baseline gap-1">
              <CitizenLink citizen={citizen} />

              <button
                type="button"
                onClick={() =>
                  setSelectedCitizens((prev) =>
                    prev.filter((c) => c.id !== citizen.id),
                  )
                }
                title="Entfernen"
                className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300"
              >
                <FaTrash className="text-xs" />
              </button>

              <input
                key={citizen.id}
                type="hidden"
                name={`${name}[]`}
                value={citizen.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
