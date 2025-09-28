/// <reference types="@types/wicg-file-system-access" />

"use client";

import Button from "@/modules/common/components/Button";
import { Button2 } from "@/modules/common/components/Button2";
import YesNoCheckbox from "@/modules/common/components/form/YesNoCheckbox";
import { Tooltip } from "@/modules/common/components/Tooltip";
import { useLocalStorage } from "@uidotdev/usehooks";
import clsx from "clsx";
import { get, set } from "idb-keyval";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEventHandler,
} from "react";
import { FaInfoCircle, FaSpinner } from "react-icons/fa";
import { FaFileArrowUp } from "react-icons/fa6";
import { TfiReload } from "react-icons/tfi";
import { getFilesRecursively } from "../utils/getFilesRecursively";
import { LOG_ANALYZER_PATTERNS } from "../utils/LOG_ANALYZER_PATTERNS";
import { Entry, type IEntry } from "./Entry";
import { useEntryFilterContext } from "./EntryFilterContext";
import { EntryFilters } from "./EntryFilters";
import { Introduction } from "./Introduction";
import { OverlayButton } from "./OverlayButton";
import { OverlayProvider } from "./OverlayContext";

export const gridTemplateColumns = "144px 1fr 1fr 1fr 1fr 1fr";

interface Props {
  readonly className?: string;
  readonly crashLogAnalyzer?: boolean;
}

export const LogAnalyzer = ({ className }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState<Map<string, IEntry>>(new Map());
  const directoryHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const liveModeIntervalRef = useRef<number | null>(null);
  const [isLiveModeEnabled, setIsLiveModeEnabled] = useLocalStorage(
    "is_live_mode_enabled",
    false,
  );
  const { entryFilterFn } = useEntryFilterContext();

  const parseLogs = useCallback((isNew = false) => {
    startTransition(async () => {
      if (!directoryHandleRef.current) return;

      const files = [];

      for await (const fileHandle of getFilesRecursively(
        directoryHandleRef.current,
      )) {
        if (!fileHandle) continue;
        if (!fileHandle.name.endsWith(".log")) continue;
        files.push(fileHandle);
      }

      const cutoffDateEnd = new Date();
      cutoffDateEnd.setHours(23, 59, 59, 999);
      const cutoffDateStart = new Date(cutoffDateEnd);
      cutoffDateStart.setDate(cutoffDateStart.getDate() - 7); // 7 days ago
      cutoffDateStart.setHours(0, 0, 0, 0);

      const slicedFiles = files.filter((file) => {
        const lastModified = new Date(file.lastModified);
        return lastModified >= cutoffDateStart && lastModified <= cutoffDateEnd;
      });

      try {
        const fileContents = await Promise.all(
          slicedFiles.map((file) => file.text()),
        );

        setEntries((previousEntries) => {
          const newEntries = new Map<string, IEntry>(previousEntries);

          for (const fileContent of fileContents) {
            const killMatches = fileContent.matchAll(
              LOG_ANALYZER_PATTERNS.kill,
            );
            for (const match of killMatches) {
              if (!match.groups) continue;

              const { isoDate, target, zone, killer, weapon, damageType } =
                match.groups;
              const date = new Date(isoDate);
              const key = `${date.getTime()}_${target}`;

              if (newEntries.has(key)) continue;

              newEntries.set(key, {
                key,
                isoDate: date,
                isNew,
                type: "kill",
                target,
                zone,
                killer,
                weapon,
                damageType,
              });
            }

            const corpseMatches = fileContent.matchAll(
              LOG_ANALYZER_PATTERNS.corpse,
            );
            for (const match of corpseMatches) {
              if (!match.groups) continue;

              const { isoDate, target } = match.groups;
              const date = new Date(isoDate);
              const key = `${date.getTime()}_${target}`;

              if (newEntries.has(key)) continue;

              newEntries.set(key, {
                key,
                isoDate: date,
                isNew,
                type: "corpse",
                target,
              });
            }

            const joinPUMatches = fileContent.matchAll(
              LOG_ANALYZER_PATTERNS.joinPU,
            );
            for (const match of joinPUMatches) {
              if (!match.groups) continue;

              const { isoDate, shard } = match.groups;
              const date = new Date(isoDate);
              const key = `${date.getTime()}_${shard}`;

              if (newEntries.has(key)) continue;

              newEntries.set(key, {
                key,
                isoDate: date,
                isNew,
                type: "join_pu",
                shard,
              });
            }
          }

          return newEntries;
        });
      } catch (error) {
        console.error("[Log Analyzer] Error reading files:", error);
      }
    });
  }, []);

  useEffect(() => {
    if (isLiveModeEnabled) {
      liveModeIntervalRef.current = window.setInterval(() => {
        parseLogs(true);
      }, 10_000);
    } else {
      if (liveModeIntervalRef.current) {
        window.clearInterval(liveModeIntervalRef.current);
        liveModeIntervalRef.current = null;
      }
    }

    return () => {
      if (liveModeIntervalRef.current) {
        window.clearInterval(liveModeIntervalRef.current);
        liveModeIntervalRef.current = null;
      }
    };
  }, [isLiveModeEnabled, parseLogs]);

  const handlePreviousDirectorySelect: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();

    get("directory_handle")
      .then(
        async (
          existingDirectoryHandle: FileSystemDirectoryHandle | undefined,
        ) => {
          if (existingDirectoryHandle) {
            const permissionState =
              await existingDirectoryHandle.requestPermission();
            if (permissionState === "granted") {
              directoryHandleRef.current = existingDirectoryHandle;
              parseLogs();
              return;
            }
          }

          const newDirectoryHandle = await window.showDirectoryPicker();
          if (!newDirectoryHandle) return;
          directoryHandleRef.current = newDirectoryHandle;
          parseLogs();
          await set("directory_handle", newDirectoryHandle);
        },
      )
      .catch((error) => {
        console.error(
          "[Log Analyzer] Error retrieving or selecting directory handle:",
          error,
        );
      });
  };

  const handleNewDirectorySelect: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();

    window
      .showDirectoryPicker()
      .then(async (newDirectoryHandle) => {
        if (!newDirectoryHandle) return;
        directoryHandleRef.current = newDirectoryHandle;
        parseLogs();
        await set("directory_handle", newDirectoryHandle);
      })
      .catch((error) => {
        console.error("[Log Analyzer] Error selecting directory:", error);
      });
  };

  return (
    <div className={clsx(className)}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 items-baseline justify-end">
        <div>
          <Button2
            type="button"
            onClick={handleNewDirectorySelect}
            disabled={isPending}
            className="lg:ml-auto"
          >
            {isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaFileArrowUp />
            )}
            Ordner auswählen
          </Button2>

          <Button
            type="button"
            onClick={handlePreviousDirectorySelect}
            variant="tertiary"
            disabled={isPending}
            className="lg:ml-auto"
          >
            Letzten Ordner verwenden
          </Button>
        </div>
      </div>

      {entries.size > 0 ? (
        <>
          <div className="mt-1 background-secondary rounded-primary p-2 flex items-center gap-4">
            <Button2
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => parseLogs(true)}
            >
              {isPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <TfiReload />
              )}
              Aktualisieren
            </Button2>

            <YesNoCheckbox
              yesLabel={
                <span className="flex items-center gap-2">
                  Automatisch aktualisieren
                  <Tooltip triggerChildren={<FaInfoCircle />}>
                    <p>Aktualisiert die Logs alle 10 Sekunden.</p>
                    <p className="mt-1">
                      Neue Einträge werden für 60 Sekunden hervorgehoben.
                    </p>
                  </Tooltip>
                </span>
              }
              noLabel={
                <span className="flex items-center gap-2">
                  Automatisch aktualisieren
                  <Tooltip triggerChildren={<FaInfoCircle />}>
                    <p>Aktualisiert die Logs alle 10 Sekunden.</p>
                    <p className="mt-1">
                      Neue Einträge werden für 30 Sekunden hervorgehoben.
                    </p>
                  </Tooltip>
                </span>
              }
              labelClassName="w-auto"
              checked={isLiveModeEnabled}
              onChange={(e) => setIsLiveModeEnabled(e.target.checked)}
            />

            <OverlayProvider>
              <OverlayButton
                entries={Array.from(entries.values().filter(entryFilterFn))}
              />
            </OverlayProvider>

            <EntryFilters />
          </div>

          <div className="mt-[2px] p-4 background-secondary rounded-primary overflow-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr
                  className="grid items-center gap-4 text-left text-neutral-500"
                  style={{
                    gridTemplateColumns,
                  }}
                >
                  <th className="whitespace-nowrap">Datum</th>
                  <th className="whitespace-nowrap">Ziel</th>
                  <th className="whitespace-nowrap">Killer</th>
                  <th className="whitespace-nowrap">Waffe</th>
                  <th className="whitespace-nowrap">Schadensart</th>
                  <th className="whitespace-nowrap">Ort</th>
                </tr>
              </thead>

              <tbody>
                {Array.from(entries.values())
                  .toSorted((a, b) => b.isoDate.getTime() - a.isoDate.getTime())
                  .filter(entryFilterFn)
                  .map((entry) => (
                    <Entry key={entry.key} entry={entry} />
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Introduction className="mt-1" />
      )}
    </div>
  );
};
