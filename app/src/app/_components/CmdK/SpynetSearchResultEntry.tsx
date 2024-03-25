import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { type CitizenHit } from "../../(app)/spynet/search/_components/Search";

type Props = Readonly<{
  citizen: CitizenHit;
  onSelect?: () => void;
}>;

export const SpynetSearchResultEntry = ({ citizen, onSelect }: Props) => {
  const router = useRouter();

  return (
    <Command.Item
      onSelect={() => {
        router.push(`/spynet/entity/${citizen.objectID}`);
        onSelect?.();
      }}
      className="flex flex-col !gap-0 mt-2"
    >
      {citizen.handles && citizen.handles.length > 0 ? (
        <span className="flex gap-2 items-baseline w-full">
          <p>{citizen.handles[0]}</p>

          {citizen.handles.length > 1 && (
            <p className="text-neutral-500 text-sm">
              {citizen.handles.slice(1).join(", ")}
            </p>
          )}
        </span>
      ) : (
        <p className="italic text-neutral-500 w-full">Unbekannt</p>
      )}

      <span className="block text-sm text-neutral-500 w-full">
        {citizen.communityMonikers && citizen.communityMonikers.length > 0 && (
          <p>Community Monikers: {citizen.communityMonikers.join(", ")}</p>
        )}

        <p>Spectrum ID: {citizen.spectrumId}</p>

        {citizen.citizenIds && citizen.citizenIds.length > 0 && (
          <p>Citizen IDs: {citizen.citizenIds.join(", ")}</p>
        )}

        <p>Sinister ID: {citizen.objectID}</p>
      </span>
    </Command.Item>
  );
};
