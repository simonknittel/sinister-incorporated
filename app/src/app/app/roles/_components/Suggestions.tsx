"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { RiBardFill } from "react-icons/ri";
import { api } from "../../../../trpc/react";
import Button from "../../../_components/Button";

type Props = Readonly<{
  className?: string;
  onClick?: (roleName: string) => void;
}>;

export const Suggestions = ({ className, onClick }: Props) => {
  const suggestions = api.ai.getRoleNameSuggestions.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <>
      <div className={clsx(className, "flex items-center gap-2")}>
        <p className="flex items-center font-bold gap-2">
          <RiBardFill /> Vorschläge
        </p>

        {suggestions.data?.prompt && (
          <div className="relative z-10">
            <Tooltip.Provider delayDuration={300}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button variant="tertiary" type="button">
                    <FaInfoCircle />
                  </Button>
                </Tooltip.Trigger>

                <Tooltip.Content
                  className="p-4 text-sm leading-tight max-w-[640px] select-none rounded bg-neutral-600 shadow-sm"
                  sideOffset={5}
                >
                  <p>
                    Diese Vorschläge wurden mit Hilfe von GPT-4 basierend auf
                    folgenden Prompts generiert:
                  </p>

                  <p className="mt-2">
                    <span className="font-bold">System:</span>{" "}
                    {suggestions.data.prompt.system}
                  </p>

                  <p className="mt-2">
                    <span className="font-bold">User:</span>{" "}
                    {suggestions.data.prompt.user}
                  </p>
                  <Tooltip.Arrow className="fill-neutral-600" />
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mt-2">
        {suggestions.data ? (
          <>
            {suggestions.data.roleNames.map((roleName) => (
              <button
                key={roleName}
                className={clsx(
                  "px-2 py-1 rounded bg-neutral-700 flex gap-2 items-center whitespace-nowrap enabled:hover:bg-neutral-600 transition-colors",
                  {
                    "animate-pulse": suggestions.isFetching,
                  },
                )}
                disabled={suggestions.isFetching}
                onClick={() => onClick?.(roleName)}
              >
                {roleName}
              </button>
            ))}

            <Button
              variant="tertiary"
              onClick={() => suggestions.refetch()}
              disabled={suggestions.isFetching}
            >
              <FiRefreshCcw
                className={clsx({
                  "animate-spin": suggestions.isFetching,
                })}
              />
              Weitere generieren
            </Button>
          </>
        ) : (
          <>
            <div className="w-[8rem] h-8 rounded bg-neutral-700 animate-pulse" />
            <div className="w-[12rem] h-8 rounded bg-neutral-700 animate-pulse" />
            <div className="w-[6rem] h-8 rounded bg-neutral-700 animate-pulse" />
            <div className="w-[6rem] h-8 rounded bg-neutral-700 animate-pulse" />
            <div className="w-[8rem] h-8 rounded bg-neutral-700 animate-pulse" />
          </>
        )}
      </div>
    </>
  );
};
