"use client";

import clsx from "clsx";
import { FiRefreshCcw } from "react-icons/fi";
import { RiBardFill } from "react-icons/ri";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";

type Props = Readonly<{
  className?: string;
}>;

export const Suggestions = ({ className }: Props) => {
  const suggestions = api.ai.getRoleNameSuggestions.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <>
      <p className={clsx(className, "flex items-center font-bold gap-2")}>
        <RiBardFill /> Vorschläge
      </p>

      <div className="flex gap-2 flex-wrap mt-2">
        {suggestions.data ? (
          <>
            {suggestions.data.map((suggestion) => (
              <button
                key={suggestion}
                className={clsx(
                  "px-2 py-1 rounded bg-neutral-700 flex gap-2 items-center whitespace-nowrap hover:bg-neutral-600 transition-colors",
                  {
                    "animate-pulse": suggestions.isFetching,
                  },
                )}
                disabled={suggestions.isFetching}
              >
                {suggestion}
              </button>
            ))}

            <Button
              type="button"
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
          </>
        )}
      </div>
    </>
  );
};
