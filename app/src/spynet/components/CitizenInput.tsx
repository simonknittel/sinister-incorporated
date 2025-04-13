"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import Button from "@/common/components/Button";
import { CitizenLink } from "@/common/components/CitizenLink";
import { SingleRole } from "@/common/components/SingleRole";
import { api } from "@/trpc/react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import type { Entity } from "@prisma/client";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { useRef, useState } from "react";
import { FaCheck, FaTrash, FaUsers } from "react-icons/fa";

type BaseProps = Readonly<{
  className?: string;
  name: string;
  disabled?: boolean;
  autoFocus?: boolean;
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
  autoFocus,
}: Props) => {
  const [query, setQuery] = useState("");

  const { isPending: isPendingAllCitizens, data: dataAllCitizens } =
    api.citizens.getAllCitizens.useQuery(undefined, {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const filteredCitizens =
    dataAllCitizens && query.trim()
      ? dataAllCitizens
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
        isPendingAllCitizens={isPendingAllCitizens}
        filteredCitizens={filteredCitizens}
        defaultValue={
          defaultValue
            ? (defaultValue
                .map((id) =>
                  dataAllCitizens?.find((citizen) => citizen.id === id),
                )
                .filter(Boolean) as Entity[])
            : undefined
        }
        autoFocus={autoFocus}
      />
    );
  return (
    <Single
      className={className}
      name={name}
      setQuery={setQuery}
      isPending={isPendingAllCitizens}
      filteredCitizens={filteredCitizens}
      disabled={disabled}
      defaultValue={
        defaultValue
          ? dataAllCitizens?.find((citizen) => citizen.id === defaultValue)
          : undefined
      }
      autoFocus={autoFocus}
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
  autoFocus?: boolean;
}>;

const Single = ({
  className,
  name,
  setQuery,
  isPending,
  filteredCitizens,
  defaultValue,
  disabled,
  autoFocus,
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
            autoFocus={autoFocus}
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
  isPendingAllCitizens: boolean;
  filteredCitizens: Entity[];
  defaultValue?: Entity[];
  autoFocus?: boolean;
}>;

const Multiple = ({
  className,
  name,
  query,
  setQuery,
  isPendingAllCitizens,
  filteredCitizens,
  defaultValue,
  autoFocus,
}: MultipleComponentProps) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Forbidden");

  const {
    isPending: isPendingCitizensGroupedByVisibleRoles,
    data: dataCitizensGroupedByVisibleRoles,
  } = api.citizens.getCitizensGroupedByVisibleRoles.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [selectedCitizens, setSelectedCitizens] = useState<Entity[]>(
    defaultValue || [],
  );

  const isPending =
    isPendingAllCitizens || isPendingCitizensGroupedByVisibleRoles;

  const handleSelectRole = (roleId: string) => {
    if (!dataCitizensGroupedByVisibleRoles) return;

    setSelectedCitizens(
      dataCitizensGroupedByVisibleRoles.get(roleId)?.citizens || [],
    );
  };
  const [isOpen, setIsOpen] = useState(false);

  const popoverPortalRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={clsx(className)}>
      <label className="block mb-1">Citizen (Handle)</label>

      {isPending ? (
        <div className="h-10 animate-pulse rounded bg-neutral-900" />
      ) : (
        <div className="flex gap-2">
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
              autoFocus={autoFocus}
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

          <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
              <Button
                type="button"
                title="Rolle auswählen"
                variant="secondary"
                iconOnly
                className="flex-none"
              >
                <FaUsers />
              </Button>
            </Popover.Trigger>

            {/* eslint-disable-next-line react-compiler/react-compiler */}
            <Popover.Portal container={popoverPortalRef.current}>
              <Popover.Content sideOffset={4} side="top">
                <div className="flex flex-col gap-2 p-4 rounded bg-neutral-800 border border-sinister-red-500 max-h-96 overflow-auto">
                  {dataCitizensGroupedByVisibleRoles
                    ? Array.from(dataCitizensGroupedByVisibleRoles.values())
                        .toSorted((a, b) =>
                          a.role.name.localeCompare(b.role.name),
                        )
                        .map(({ role }) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => handleSelectRole(role.id)}
                            className="group"
                          >
                            <SingleRole
                              role={role}
                              showPlaceholder
                              className="bg-transparent group-hover:bg-neutral-700/50 group-focus-visible:bg-neutral-700/50"
                            />
                          </button>
                        ))
                    : null}
                </div>

                <Popover.Arrow className="fill-neutral-800" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <div ref={popoverPortalRef} className="z-10" />
        </div>
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
