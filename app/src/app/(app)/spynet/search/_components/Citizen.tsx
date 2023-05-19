import Link from "next/link";
import { type CitizenHit } from "./Search";

interface Props {
  hit: CitizenHit;
}

const Citizen = ({ hit }: Props) => {
  return (
    <Link href={`/spynet/entity/${hit.objectID}`}>
      {hit.handles.length > 0 ? (
        <span className="flex gap-2 items-baseline">
          <p>{hit.handles[0]}</p>

          {hit.handles.length > 1 && (
            <p className="text-neutral-500 text-sm">
              {hit.handles.slice(1).join(", ")}
            </p>
          )}
        </span>
      ) : (
        <p className="italic text-neutral-500">Unbekannt</p>
      )}

      <span className="block text-sm text-neutral-500 mt-2">
        <p>Sinister ID: {hit.objectID}</p>
        <p>Spectrum ID: {hit.spectrumId}</p>
      </span>
    </Link>
  );
};

export default Citizen;
