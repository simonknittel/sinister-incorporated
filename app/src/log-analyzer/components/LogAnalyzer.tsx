/// <reference types="@types/wicg-file-system-access" />

"use client";

import Button from "@/common/components/Button";
import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import { Tooltip } from "@/common/components/Tooltip";
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
import { Entry, type IEntry } from "./Entry";
import { OverlayButton } from "./OverlayButton";
import { OverlayProvider } from "./OverlayContext";

export const gridTemplateColumns = "144px 1fr 1fr 1fr 1fr 1fr";

async function* getFilesRecursively(
  entry: FileSystemFileHandle | FileSystemDirectoryHandle,
): AsyncGenerator<File | null> {
  if (entry.kind === "file") {
    try {
      const file = await entry.getFile();
      if (file) yield file;
    } catch (error) {
      console.error(`[Log Analyzer] Error getting file: ${entry.name}`, error);
      yield null;
    }
  } else if (entry.kind === "directory") {
    // TODO: Ignore subdirectories
    for await (const handle of entry.values()) {
      yield* getFilesRecursively(handle);
    }
  }
}

// <2025-05-27T15:34:52.141Z> [Notice] <Actor Death> CActor::Kill: 'PU_Human-NineTails-Pilot-Male-Light_01_3864128940772' [3864128940772] in zone 'MISC_Prospector_PU_AI_NT_NonLethal_3864128940380' killed by 'ind3x' [202028778295] using 'KLWE_LaserRepeater_S5_3657139981503' [Class unknown] with damage type 'VehicleDestruction' from direction x: 0.000000, y: 0.000000, z: 0.000000 [Team_ActorTech][Actor]
const killRegex =
  /^<(?<isoDate>[\d\-T:.Z]+)>.+CActor::Kill.+'(?<target>.*)'.+'(?<zone>.*)'.+'(?<killer>.*)'.+'(?<weapon>.*)'.+'(?<damageType>.*)'.+$/gm;

// <2025-05-28T22:14:04.694Z> [Notice] <[ActorState] Corpse> [ACTOR STATE][SSCActorStateCVars::LogCorpse] Player 'Test' <remote client>: Running corpsify for corpse. [Team_ActorFeatures][Actor]
const corpseRegex =
  /^<(?<isoDate>[\d\-T:.Z]+)>.+'(?<target>.*)'.+Running corpsify.+$/gm;

// <2025-05-28T22:13:34.556Z> [Notice] <[ActorState] Corpse> [ACTOR STATE][SSCActorStateCVars::LogCorpse] Player 'Test' <remote client>: IsCorpseEnabled: Yes, there is no local inventory. [Team_ActorFeatures][Actor]
// This runs multiple times for some corpses, so we don't use it.
// const corpse2Regex =
//   /^<(?<isoDate>[\d\-T:.Z]+)>.+LogCorpse.+'(?<target>.*)'.+$/gm;

interface Props {
  readonly className?: string;
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
  const [isHideCorpsesEnabled, setIsHideCorpsesEnabled] = useLocalStorage(
    "is_hide_corpses_enabled",
    false,
  );

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
            const killMatches = fileContent.matchAll(killRegex);

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

            const corpseMatches = fileContent.matchAll(corpseRegex);

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

  const handleManualRefresh = () => {
    parseLogs(true);
  };

  return (
    <div className={clsx(className)}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 items-baseline justify-between">
        <h1 className="text-xl font-bold leading-tight">Log Analyzer</h1>

        <div>
          <Button
            type="button"
            onClick={handleNewDirectorySelect}
            variant="primary"
            disabled={isPending}
            className="lg:ml-auto"
          >
            {isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaFileArrowUp />
            )}
            Ordner auswählen
          </Button>

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
          <div className="mt-4 background-secondary rounded-primary px-8 py-4 flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={handleManualRefresh}
            >
              {isPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <TfiReload />
              )}
              Aktualisieren
            </Button>

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
                entries={Array.from(
                  entries.values().filter((entry) => {
                    if (isHideCorpsesEnabled && entry.type === "corpse")
                      return false;
                    return true;
                  }),
                )}
              />
            </OverlayProvider>

            <YesNoCheckbox
              yesLabel="Leichen ausblenden"
              noLabel="Leichen ausblenden"
              labelClassName="w-auto"
              checked={isHideCorpsesEnabled}
              onChange={(e) => setIsHideCorpsesEnabled(e.target.checked)}
            />
          </div>

          <div className="mt-4 p-8 background-secondary rounded-primary overflow-auto">
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
                  .filter((entry) => {
                    if (isHideCorpsesEnabled && entry.type === "corpse")
                      return false;
                    return true;
                  })
                  .map((entry) => (
                    <Entry key={entry.key} entry={entry} />
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="mt-4 p-8 background-secondary rounded-primary overflow-auto flex flex-col gap-2">
          <p className="text-neutral-500">Anleitung</p>
          <p>Wähle den Ordner mit deiner Star Citizen-Installation aus.</p>

          <p className="text-neutral-500 mt-4">Info</p>
          <p>
            Keine Dateien werden auf den Server hochgeladen. Die Logs werden
            ausschließlich client-seitig im Browser ausgewertet.
          </p>

          <p>Es werden die Logs der letzten 7 Tage ausgewertet.</p>

          <p className="text-neutral-500 mt-4">Voraussetzungen</p>
          <p>
            Aktuell werden nur in Google Chrome und Microsoft Edge unterstützt.
          </p>
          <p>
            Die Star Citizen-Installation darf nicht unter{" "}
            <span className="italic font-mono">C:\Program Files</span> liegen.
          </p>
          <p>
            Für das Overlay muss der Star Citizen Window Mode auf entweder
            Borderless oder Windowed gestellt sein.
          </p>
          <p>Nein, das Overlay kann nicht transparent gemacht werden.</p>
        </div>
      )}
    </div>
  );
};
