import Link from "next/link";
import { type CitizenHit } from "./Search";

interface Props {
  hit: CitizenHit;
}

const Citizen = ({ hit }: Props) => {
  return (
    <Link href={`/spynet/entity/${hit.objectID}`}>
      <span className="flex gap-2 items-baseline">
        <p>{hit.handles[0]}</p>

        {hit.handles.length > 1 && (
          <p className="text-neutral-500 text-sm">
            {hit.handles.slice(1).join(", ")}
          </p>
        )}
      </span>

      <span className="block text-sm text-neutral-500 mt-2">
        <p>Sinister ID: {hit.objectID}</p>
        <p>Spectrum ID: {hit.spectrumId}</p>
      </span>
    </Link>
  );
};

export default Citizen;
