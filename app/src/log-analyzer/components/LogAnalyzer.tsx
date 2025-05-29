/// <reference types="@types/wicg-file-system-access" />

"use client";

import Button from "@/common/components/Button";
import { formatDate } from "@/common/utils/formatDate";
import clsx from "clsx";
import { useState, useTransition, type MouseEventHandler } from "react";
import { FaSpinner } from "react-icons/fa";
import { FaFileArrowUp } from "react-icons/fa6";

const gridTemplateColumns = "128px 1fr 1fr 1fr 1fr 1fr";

interface Props {
  readonly className?: string;
}

export const LogAnalyzer = ({ className }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState<
    {
      isoDate: Date;
      target: string;
      zone: string;
      killer: string;
      weapon: string;
      damageType: string;
    }[]
  >([]);

  const handleFileSelect: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    window
      .showDirectoryPicker()
      .then((directoryHandle) => {
        if (!directoryHandle) return;

        startTransition(async () => {
          async function* getFilesRecursively(
            entry: FileSystemFileHandle | FileSystemDirectoryHandle,
          ): AsyncGenerator<File | null> {
            if (entry.kind === "file") {
              const file = await entry.getFile();
              if (file) yield file;
            } else if (entry.kind === "directory") {
              // TODO: Ignore subdirectories
              for await (const handle of entry.values()) {
                yield* getFilesRecursively(handle);
              }
            }
          }

          const files = [];

          for await (const fileHandle of getFilesRecursively(directoryHandle)) {
            if (!fileHandle) continue;
            if (!fileHandle.name.endsWith(".log")) continue;
            files.push(fileHandle);
          }

          // <2025-05-27T15:34:52.141Z> [Notice] <Actor Death> CActor::Kill: 'PU_Human-NineTails-Pilot-Male-Light_01_3864128940772' [3864128940772] in zone 'MISC_Prospector_PU_AI_NT_NonLethal_3864128940380' killed by 'ind3x' [202028778295] using 'KLWE_LaserRepeater_S5_3657139981503' [Class unknown] with damage type 'VehicleDestruction' from direction x: 0.000000, y: 0.000000, z: 0.000000 [Team_ActorTech][Actor]
          const regex =
            /^<(?<isoDate>[\d\-T:.Z]+)>(?:.+)CActor::Kill(?:.+)'(?<target>.*)'(?:.+)'(?<zone>.*)'(?:.+)'(?<killer>.*)'(?:.+)'(?<weapon>.*)'(?:.+)'(?<damageType>.*)'.+$/gm;

          const cutoffDateEnd = new Date();
          cutoffDateEnd.setHours(23, 59, 59, 999);
          const cutoffDateStart = new Date(cutoffDateEnd);
          cutoffDateStart.setDate(cutoffDateStart.getDate() - 7); // 7 days ago
          cutoffDateStart.setHours(0, 0, 0, 0);

          const slicedFiles = files.filter((file) => {
            const lastModified = new Date(file.lastModified);

            return (
              lastModified >= cutoffDateStart && lastModified <= cutoffDateEnd
            );
          });

          const sortedFiles = slicedFiles.sort(
            (a, b) => b.lastModified - a.lastModified,
          );

          setEntries([]);

          for (const file of sortedFiles) {
            const fileContent = await file.text();

            const matches = fileContent.matchAll(regex);

            for (const match of matches) {
              if (!match.groups) continue;

              const { isoDate, target, zone, killer, weapon, damageType } =
                match.groups;

              setEntries((prevEntries) => [
                ...prevEntries,
                {
                  isoDate: new Date(isoDate),
                  target,
                  zone,
                  killer,
                  weapon,
                  damageType,
                },
              ]);
            }
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className={clsx(className)}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 items-baseline justify-between">
        <h1 className="text-xl font-bold leading-tight">Log Analyzer</h1>

        <Button
          type="button"
          onClick={handleFileSelect}
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
      </div>

      {entries.length > 0 ? (
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
              {entries
                .toSorted((a, b) => b.isoDate.getTime() - a.isoDate.getTime())
                .map((entry, index) => (
                  <tr
                    key={index}
                    className="grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2"
                    style={{
                      gridTemplateColumns,
                    }}
                  >
                    <td>{formatDate(entry.isoDate)}</td>
                    <td className="truncate">{entry.target}</td>
                    <td className="truncate">{entry.killer}</td>
                    <td className="truncate">{entry.weapon}</td>
                    <td className="truncate">{entry.damageType}</td>
                    <td className="truncate">{entry.zone}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 p-8 background-secondary rounded-primary overflow-auto flex flex-col gap-2">
          <strong className="block font-bold">
            Wähle zuerst den Ordner mit deiner Star Citizen-Installation aus.
          </strong>

          <p>
            Keine Dateien werden auf den Server hochgeladen. Die Logs werden
            ausschließlich client-seitig im Browser ausgewertet.
          </p>

          <p>Es werden die Logs der letzten 7 Tage ausgewertet.</p>
        </div>
      )}
    </div>
  );
};
